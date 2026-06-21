import { useEffect, useMemo, useRef, useState } from "react"
import { AppBridge, PostMessageTransport } from "@modelcontextprotocol/ext-apps/app-bridge"
import type { McpAppPayload } from "@/lib/chat-api"

type McpAppHostProps = {
  app: McpAppPayload
}

const DEFAULT_IFRAME_SANDBOX =
  "allow-scripts allow-forms allow-modals allow-popups allow-downloads"

function normalizeToolResultForUi(raw: string | undefined): string {
  const value = raw?.trim()
  if (!value) {
    return "{}"
  }

  try {
    JSON.parse(value)
    return value
  } catch {
    return JSON.stringify({ text: value })
  }
}

function getTheme(): "light" | "dark" {
  if (typeof document === "undefined") {
    return "light"
  }

  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

export function McpAppHost({ app }: McpAppHostProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const bridgeRef = useRef<AppBridge | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")

  const source = useMemo(() => app.html, [app.html])

  useEffect(() => {
    let cancelled = false

    const connect = async () => {
      const frameWindow = iframeRef.current?.contentWindow
      if (!frameWindow) {
        return
      }

      const bridge = new AppBridge(
        null,
        {
          name: "chat-app-host",
          version: "1.0.0",
        },
        {
          openLinks: {},
          downloadFile: {},
          message: {
            text: {},
          },
          logging: {},
          serverTools: {},
        },
        {
          hostContext: {
            theme: getTheme(),
          },
        },
      )

      bridge.onopenlink = async ({ url }) => {
        window.open(url, "_blank", "noopener,noreferrer")
        return {}
      }

      bridge.onrequestdisplaymode = async () => ({ mode: "inline" })

      bridge.onmessage = async () => {
        // No-op for now. We surface app state through the chat transcript.
        return {}
      }

      const transport = new PostMessageTransport(frameWindow, frameWindow)
      await bridge.connect(transport)

      await bridge.sendToolInput({
        arguments: app.toolInput ?? {},
      })

      await bridge.sendToolResult({
        content: [
          {
            type: "text",
            text: normalizeToolResultForUi(app.toolResultText),
          },
        ],
      })

      if (!cancelled) {
        bridgeRef.current = bridge
        setStatus("ready")
      }
    }

    const onLoad = () => {
      void connect().catch(() => {
        if (!cancelled) {
          setStatus("error")
        }
      })
    }

    const frame = iframeRef.current
    if (!frame) {
      return
    }

    frame.addEventListener("load", onLoad)

    return () => {
      cancelled = true
      frame.removeEventListener("load", onLoad)

      if (bridgeRef.current) {
        void bridgeRef.current.close().catch(() => undefined)
      }
      bridgeRef.current = null
    }
  }, [app.resourceUri, app.toolInput, app.toolName])

  return (
    <div className="mt-3 overflow-hidden rounded-md border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-2 text-xs text-muted-foreground">
        <span>MCP App</span>
        <span>{status === "ready" ? "ready" : status === "error" ? "error" : "loading"}</span>
      </div>
      <iframe
        ref={iframeRef}
        title={`mcp-app-${app.toolName}`}
        srcDoc={source}
        sandbox={DEFAULT_IFRAME_SANDBOX}
        className="h-105 w-full bg-background"
      />
    </div>
  )
}
