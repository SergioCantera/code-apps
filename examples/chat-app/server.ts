/// <reference types="node" />

import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import process from "process"
import { z } from "zod"
import { RESOURCE_MIME_TYPE, registerAppResource, registerAppTool } from "@modelcontextprotocol/ext-apps/server"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const server = new McpServer({
  name: "chat-app-mcp",
  version: "1.0.0",
})

const resourceUri = "ui://chat-app/mcp-app.html"

function splitCsv(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function toOrigin(urlValue: string): string | null {
  try {
    const parsed = new URL(urlValue)
    return parsed.origin
  } catch {
    return null
  }
}

function getConnectDomains(): string[] {
  const domains = new Set<string>()

  const agentApiUrl = process.env.VITE_AGENT_API_URL
  if (agentApiUrl && !agentApiUrl.startsWith("/")) {
    const origin = toOrigin(agentApiUrl)
    if (origin) {
      domains.add(origin)
    }
  }

  for (const serverUrl of splitCsv(process.env.VITE_MCP_SERVERS)) {
    const origin = toOrigin(serverUrl)
    if (origin) {
      domains.add(origin)
    }
  }

  return [...domains]
}

registerAppTool(
  server,
  "open-chat-app",
  {
    title: "Open Chat App",
    description: "Render the chat-app UI inline as an MCP App.",
    inputSchema: {
      initialPrompt: z.string().optional().describe("Optional prompt prefilled in the chat input."),
      conversationId: z.string().optional().describe("Optional conversation identifier."),
      agentApiUrl: z.string().url().optional().describe("Override API URL for this render."),
    },
    _meta: {
      ui: {
        resourceUri,
      },
    },
  },
  async (args) => {
    return {
      content: [{ type: "text", text: "Opening chat app UI." }],
      structuredContent: {
        initialPrompt: args.initialPrompt,
        conversationId: args.conversationId,
        agentApiUrl: args.agentApiUrl,
      },
    }
  },
)

registerAppResource(server, "Chat App UI", resourceUri, {
  mimeType: RESOURCE_MIME_TYPE,
  _meta: {
    ui: {
      csp: {
        connectDomains: getConnectDomains(),
      },
    },
  },
}, async () => {
    const html = await fs.readFile(path.resolve(__dirname, "dist-mcp", "mcp-app.html"), "utf-8")

    return {
      contents: [{ uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html }],
    }
  }
)

const transport = new StdioServerTransport()
await server.connect(transport)
