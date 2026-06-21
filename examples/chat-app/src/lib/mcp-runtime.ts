import {
  App as McpApp,
  PostMessageTransport,
} from "@modelcontextprotocol/ext-apps"

type RuntimeMode = "standalone" | "mcp"

type McpRuntimeContext = {
  mode: RuntimeMode
  input?: Record<string, unknown>
}

declare global {
  interface Window {
    __MCP_APP_CONTEXT__?: McpRuntimeContext
  }
}

const MCP_HOST_TIMEOUT_MS = 1200

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function applyDocumentTheme(theme: unknown): void {
  if (theme !== "light" && theme !== "dark") {
    return
  }

  const root = document.documentElement
  root.dataset.theme = theme
  root.style.colorScheme = theme
  root.classList.remove("light", "dark")
  root.classList.add(theme)
}

function applyHostStyleVariables(styleVariables: unknown): void {
  if (!isRecord(styleVariables)) {
    return
  }

  const root = document.documentElement
  for (const [key, value] of Object.entries(styleVariables)) {
    if (typeof value === "string") {
      root.style.setProperty(key, value)
    }
  }
}

function applyHostFonts(fontCss: unknown): void {
  if (typeof fontCss !== "string" || fontCss.trim().length === 0) {
    return
  }

  const styleId = "mcp-host-fonts"
  let styleElement = document.getElementById(styleId)

  if (!(styleElement instanceof HTMLStyleElement)) {
    styleElement = document.createElement("style")
    styleElement.id = styleId
    document.head.appendChild(styleElement)
  }

  styleElement.textContent = fontCss
}

function resolveMcpInput(payload: unknown): Record<string, unknown> {
  if (!isRecord(payload)) {
    return {}
  }

  const args = payload.arguments
  if (isRecord(args)) {
    return args
  }

  const structured = payload.structuredContent
  if (isRecord(structured)) {
    return structured
  }

  return {}
}

function applyHostInsets(safeAreaInsets: unknown): void {
  if (!isRecord(safeAreaInsets)) {
    return
  }

  const top = Number(safeAreaInsets.top ?? 0)
  const right = Number(safeAreaInsets.right ?? 0)
  const bottom = Number(safeAreaInsets.bottom ?? 0)
  const left = Number(safeAreaInsets.left ?? 0)

  document.body.style.padding = `${top}px ${right}px ${bottom}px ${left}px`
}

function isMcpHostEnvironment(): boolean {
  return window.location.origin === "null" || window.parent !== window
}

export async function initializeMcpRuntime(): Promise<McpRuntimeContext> {
  if (!isMcpHostEnvironment()) {
    const context: McpRuntimeContext = { mode: "standalone" }
    window.__MCP_APP_CONTEXT__ = context
    return context
  }

  const app = new McpApp({ name: "chat-app", version: "1.0.0" })

  let resolveInput: (value: Record<string, unknown>) => void = () => {}
  const inputPromise = new Promise<Record<string, unknown>>((resolve) => {
    resolveInput = resolve
  })

  app.ontoolinput = (input) => {
    resolveInput(resolveMcpInput(input))
  }

  app.ontoolresult = (result) => {
    resolveInput(resolveMcpInput(result))
  }

  app.onhostcontextchanged = (context) => {
    if (context.theme) {
      applyDocumentTheme(context.theme)
    }

    const hostStyles = isRecord((context as Record<string, unknown>).styles)
      ? ((context as Record<string, unknown>).styles as Record<string, unknown>)
      : undefined

    if (hostStyles && isRecord(hostStyles.variables)) {
      applyHostStyleVariables(hostStyles.variables)
    }

    const css = hostStyles && isRecord(hostStyles.css) ? hostStyles.css : undefined
    if (css && typeof css.fonts === "string") {
      applyHostFonts(css.fonts)
    }

    if (context.safeAreaInsets) {
      applyHostInsets(context.safeAreaInsets)
    }
  }

  app.onteardown = async () => {
    return {}
  }

  await app.connect(new PostMessageTransport(window, window.parent))

  const input = await Promise.race([
    inputPromise,
    new Promise<Record<string, unknown>>((resolve) => {
      setTimeout(() => resolve({}), MCP_HOST_TIMEOUT_MS)
    }),
  ])

  const context: McpRuntimeContext = {
    mode: "mcp",
    input,
  }

  window.__MCP_APP_CONTEXT__ = context
  return context
}
