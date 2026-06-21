import type { IncomingMessage, ServerResponse } from "node:http"
import type { Plugin } from "vite"
import { Client } from "@modelcontextprotocol/sdk/client"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"

type ChatRole = "user" | "assistant"

type ChatMessagePayload = {
  role: ChatRole
  content: string
}

type MockChatRequest = {
  message?: string
  messages?: ChatMessagePayload[]
  conversationId?: string
  mcpServers?: string[]
}

type MockAgentApiPluginOptions = {
  githubModelsApiToken?: string
  githubModel?: string
  githubModelsApiUrl?: string
  mcpServers?: string[]
}

type McpAppPayload = {
  resourceUri: string
  html: string
  toolName: string
  toolResultText?: string
  toolInput?: Record<string, unknown>
}

type McpToolBinding = {
  publicName: string
  serverUrl: string
  originalName: string
  description?: string
  inputSchema?: Record<string, unknown>
  call: (args: unknown) => Promise<{ text: string; app?: McpAppPayload }>
}

type McpServerDiagnostic = {
  serverUrl: string
  status: "ok" | "error"
  toolNames: string[]
  error?: string
}

type OpenAiToolCall = {
  id: string
  type: "function"
  function: {
    name: string
    arguments: string
  }
}

const DEFAULT_GITHUB_MODELS_API_URL = "https://models.github.ai/inference/chat/completions"
const MAX_TOOL_ROUNDS = 4
const MCP_CONNECT_TIMEOUT_MS = 5000
const MCP_TOOLS_TIMEOUT_MS = 6000
const MCP_TOOL_CALL_TIMEOUT_MS = 12000
const MCP_DISCOVERY_TIMEOUT_MS = 12000
const LLM_REQUEST_TIMEOUT_MS = 25000
const MAX_LLM_MESSAGES = 14
const MAX_LLM_CONTENT_CHARS = 2500
const MAX_TOOL_RESULT_CHARS_FOR_MODEL = 3000
const MAX_TOOL_DEFINITIONS = 32
const MAX_TOOL_DESCRIPTION_CHARS = 180

function truncateText(value: string, maxChars: number): string {
  if (value.length <= maxChars) {
    return value
  }

  return `${value.slice(0, maxChars)}\n...[truncated]`
}

function compactMessagesForModel(messages: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  const sliced = messages.slice(-MAX_LLM_MESSAGES)

  return sliced.map((entry) => {
    const cloned: Record<string, unknown> = { ...entry }
    if (typeof cloned.content === "string") {
      cloned.content = truncateText(cloned.content, MAX_LLM_CONTENT_CHARS)
    }
    return cloned
  })
}

function compactSchema(value: unknown, depth = 0): unknown {
  if (!isRecord(value)) {
    return value
  }

  if (depth >= 3) {
    return { type: value.type ?? "object" }
  }

  const next: Record<string, unknown> = {}
  if (typeof value.type === "string") {
    next.type = value.type
  }

  if (isRecord(value.properties)) {
    const entries = Object.entries(value.properties).slice(0, 20)
    next.properties = Object.fromEntries(entries.map(([key, property]) => [key, compactSchema(property, depth + 1)]))
  }

  if (Array.isArray(value.required)) {
    next.required = value.required.filter((item): item is string => typeof item === "string").slice(0, 20)
  }

  if (isRecord(value.items)) {
    next.items = compactSchema(value.items, depth + 1)
  }

  return next
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

async function testMcpServerConnection(serverUrl: string): Promise<{ ok: boolean; toolsCount?: number; error?: string }> {
  try {
    const client = new Client({ name: "chat-app-mcp-test", version: "1.0.0" })
    const transport = new StreamableHTTPClientTransport(new URL(serverUrl))
    await withTimeout(client.connect(transport), MCP_CONNECT_TIMEOUT_MS, `MCP connect (${serverUrl})`)

    const toolsResult = await withTimeout(client.listTools(), MCP_TOOLS_TIMEOUT_MS, `MCP listTools (${serverUrl})`)
    const toolsCount = Array.isArray(toolsResult.tools) ? toolsResult.tools.length : 0

    return {
      ok: true,
      toolsCount,
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown MCP connection error",
    }
  }
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.statusCode = statusCode
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(payload))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Uint8Array[] = []

  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
  }

  if (chunks.length === 0) {
    return {}
  }

  const rawBody = Buffer.concat(chunks).toString("utf8")

  try {
    return JSON.parse(rawBody) as unknown
  } catch {
    return {}
  }
}

function getMessageHistory(body: MockChatRequest): ChatMessagePayload[] {
  if (!Array.isArray(body.messages)) {
    return []
  }

  return body.messages.filter(
    (entry): entry is ChatMessagePayload =>
      isRecord(entry) &&
      (entry.role === "user" || entry.role === "assistant") &&
      typeof entry.content === "string",
  )
}

function sanitizeToolName(value: string): string {
  const sanitized = value.replace(/[^a-zA-Z0-9_-]/g, "_")
  return sanitized.length > 0 ? sanitized : "tool"
}

function stringifyUnknown(value: unknown): string {
  if (typeof value === "string") {
    return value
  }

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function stringifyMcpToolResult(result: unknown): string {
  if (!isRecord(result)) {
    return stringifyUnknown(result)
  }

  const content = result.content
  if (Array.isArray(content)) {
    const parts = content
      .map((item) => {
        if (!isRecord(item)) {
          return stringifyUnknown(item)
        }

        if (item.type === "text" && typeof item.text === "string") {
          return item.text
        }

        if (item.type === "resource" && isRecord(item.resource) && typeof item.resource.text === "string") {
          return item.resource.text
        }

        return stringifyUnknown(item)
      })
      .filter((part) => part.trim().length > 0)

    if (parts.length > 0) {
      return parts.join("\n")
    }
  }

  if ("structuredContent" in result) {
    return stringifyUnknown(result.structuredContent)
  }

  return stringifyUnknown(result)
}

function getToolUiResourceUri(tool: unknown): string | undefined {
  if (!isRecord(tool) || !isRecord(tool._meta)) {
    return undefined
  }

  const nestedUi = isRecord(tool._meta.ui) ? tool._meta.ui : undefined
  if (nestedUi && typeof nestedUi.resourceUri === "string") {
    return nestedUi.resourceUri
  }

  const legacyUri = tool._meta["ui/resourceUri"]
  if (typeof legacyUri === "string") {
    return legacyUri
  }

  return undefined
}

async function readMcpAppHtml(client: Client, resourceUri: string): Promise<string | undefined> {
  try {
    const resource = await withTimeout(
      client.readResource({ uri: resourceUri }),
      MCP_TOOL_CALL_TIMEOUT_MS,
      `MCP readResource (${resourceUri})`,
    )
    const contents = Array.isArray(resource.contents) ? resource.contents : []

    for (const entry of contents) {
      if (typeof entry === "object" && entry !== null && "text" in entry && typeof entry.text === "string" && entry.text.trim().length > 0) {
        return entry.text
      }
    }

    return undefined
  } catch {
    return undefined
  }
}

function parseToolArguments(raw: string): unknown {
  if (!raw.trim()) {
    return {}
  }

  try {
    return JSON.parse(raw) as unknown
  } catch {
    return { value: raw }
  }
}

function parseToolCalls(message: unknown): OpenAiToolCall[] {
  if (!isRecord(message) || !Array.isArray(message.tool_calls)) {
    return []
  }

  return message.tool_calls.filter(
    (toolCall): toolCall is OpenAiToolCall =>
      isRecord(toolCall) &&
      toolCall.type === "function" &&
      typeof toolCall.id === "string" &&
      isRecord(toolCall.function) &&
      typeof toolCall.function.name === "string" &&
      typeof toolCall.function.arguments === "string",
  )
}

async function createMcpToolBindings(
  serverUrls: string[],
): Promise<{ bindings: McpToolBinding[]; diagnostics: McpServerDiagnostic[] }> {
  const bindings: McpToolBinding[] = []
  const diagnostics: McpServerDiagnostic[] = []
  const usedNames = new Set<string>()

  await Promise.all(
    serverUrls.map(async (serverUrl, index) => {
      try {
        const client = new Client({ name: "chat-app-dev-bridge", version: "1.0.0" })
        const transport = new StreamableHTTPClientTransport(new URL(serverUrl))
        await withTimeout(client.connect(transport), MCP_CONNECT_TIMEOUT_MS, `MCP connect (${serverUrl})`)

        const toolsResult = await withTimeout(client.listTools(), MCP_TOOLS_TIMEOUT_MS, `MCP listTools (${serverUrl})`)
        const tools = Array.isArray(toolsResult.tools) ? toolsResult.tools : []

        diagnostics.push({
          serverUrl,
          status: "ok",
          toolNames: tools.map((tool) => tool.name),
        })

        for (const tool of tools) {
          const baseName = `mcp_${index + 1}__${sanitizeToolName(tool.name)}`
          let publicName = baseName
          let suffix = 2

          while (usedNames.has(publicName)) {
            publicName = `${baseName}_${suffix}`
            suffix += 1
          }
          usedNames.add(publicName)

          bindings.push({
            publicName,
            serverUrl,
            originalName: tool.name,
            description: tool.description,
            inputSchema: isRecord(tool.inputSchema) ? tool.inputSchema : undefined,
            call: async (args: unknown) => {
              const result = await withTimeout(
                client.callTool({
                  name: tool.name,
                  arguments: isRecord(args) ? args : {},
                }),
                MCP_TOOL_CALL_TIMEOUT_MS,
                `MCP callTool (${serverUrl} :: ${tool.name})`,
              )

              const text = stringifyMcpToolResult(result)
              const resourceUri = getToolUiResourceUri(tool)

              if (!resourceUri) {
                return { text }
              }

              const html = await readMcpAppHtml(client, resourceUri)
              if (!html) {
                return { text }
              }

              return {
                text,
                app: {
                  resourceUri,
                  html,
                  toolName: tool.name,
                  toolResultText: text,
                  toolInput: isRecord(args) ? args : {},
                },
              }
            },
          })
        }
      } catch (error) {
        diagnostics.push({
          serverUrl,
          status: "error",
          toolNames: [],
          error: error instanceof Error ? error.message : "Unknown MCP discovery error",
        })
      }
    }),
  )

  return { bindings, diagnostics }
}

function buildToolDefinitions(bindings: McpToolBinding[], compact = false): Array<Record<string, unknown>> {
  const limitedBindings = bindings.slice(0, MAX_TOOL_DEFINITIONS)

  return limitedBindings.map((binding) => ({
    type: "function",
    function: {
      name: binding.publicName,
      description: truncateText(
        binding.description ?? `MCP tool ${binding.originalName} from ${binding.serverUrl}`,
        MAX_TOOL_DESCRIPTION_CHARS,
      ),
      parameters: compact
        ? compactSchema(
            binding.inputSchema ?? {
              type: "object",
              properties: {},
            },
          )
        : binding.inputSchema ?? {
        type: "object",
        properties: {},
      },
    },
  }))
}

async function sendViaGithubModelsWithMcp(
  body: MockChatRequest,
  options: MockAgentApiPluginOptions,
): Promise<{ reply: string; raw: unknown; toolCalls: number; mcpApp?: McpAppPayload; mcpDiagnostics: McpServerDiagnostic[] }> {
  const token = options.githubModelsApiToken?.trim()
  const model = options.githubModel?.trim()

  if (!token || !model) {
    throw new Error("Missing GitHub Models configuration")
  }

  const apiUrl = options.githubModelsApiUrl?.trim() || DEFAULT_GITHUB_MODELS_API_URL
  const requestMcpServers = Array.isArray(body.mcpServers)
    ? body.mcpServers.filter((value): value is string => typeof value === "string")
    : []

  const mcpServersSource = requestMcpServers.length > 0 ? requestMcpServers : (options.mcpServers ?? [])
  const mcpServers = mcpServersSource.map((value) => value.trim()).filter(Boolean)
  const discoveryResult = await withTimeout(
    createMcpToolBindings(mcpServers),
    MCP_DISCOVERY_TIMEOUT_MS,
    "MCP discovery",
  )
  const toolBindings = discoveryResult.bindings
  const mcpDiagnostics = discoveryResult.diagnostics
  const toolDefinitions = buildToolDefinitions(toolBindings)
  const compactToolDefinitions = buildToolDefinitions(toolBindings, true)
  const history = getMessageHistory(body)
  const latestUserPrompt = getLatestUserMessage(body)

  const messages: Array<Record<string, unknown>> =
    history.length > 0
      ? history.map((entry) => ({ role: entry.role, content: entry.content }))
      : [{ role: "user", content: latestUserPrompt }]

  let accumulatedToolCalls = 0
  let lastPayload: unknown = null
  let lastMcpApp: McpAppPayload | undefined
  let useCompactModelPayload = false

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const modelMessages = useCompactModelPayload ? compactMessagesForModel(messages) : messages
    const modelTools = useCompactModelPayload ? compactToolDefinitions : toolDefinitions

    const response = await withTimeout(
      fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          model,
          messages: modelMessages,
          tools: modelTools.length > 0 ? modelTools : undefined,
          tool_choice: modelTools.length > 0 ? "auto" : undefined,
        }),
      }),
      LLM_REQUEST_TIMEOUT_MS,
      `LLM request round ${round + 1}`,
    )

    if (response.status === 413 && !useCompactModelPayload) {
      useCompactModelPayload = true
      round -= 1
      continue
    }

    if (!response.ok) {
      throw new Error(`GitHub Models API error: ${response.status}`)
    }

    const payload = (await response.json()) as unknown
    lastPayload = payload

    const firstChoice =
      isRecord(payload) && Array.isArray(payload.choices) && payload.choices.length > 0 && isRecord(payload.choices[0])
        ? payload.choices[0]
        : undefined
    const assistantMessage = firstChoice && isRecord(firstChoice.message) ? firstChoice.message : undefined

    if (!assistantMessage) {
      throw new Error("GitHub Models response missing assistant message")
    }

    const toolCalls = parseToolCalls(assistantMessage)
    if (toolCalls.length === 0) {
      const content =
        typeof assistantMessage.content === "string" && assistantMessage.content.trim().length > 0
          ? assistantMessage.content
          : "No se pudo generar una respuesta del modelo."

      return {
        reply: content,
        raw: lastPayload,
        toolCalls: accumulatedToolCalls,
        mcpApp: lastMcpApp,
        mcpDiagnostics,
      }
    }

    accumulatedToolCalls += toolCalls.length

    messages.push({
      role: "assistant",
      content: typeof assistantMessage.content === "string" ? assistantMessage.content : "",
      tool_calls: toolCalls,
    })

    for (const toolCall of toolCalls) {
      const binding = toolBindings.find((entry) => entry.publicName === toolCall.function.name)
      if (!binding) {
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: `Tool not found: ${toolCall.function.name}`,
        })
        continue
      }

      try {
        const args = parseToolArguments(toolCall.function.arguments)
        const toolResult = await binding.call(args)
        if (toolResult.app) {
          lastMcpApp = toolResult.app
        }
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: truncateText(toolResult.text, MAX_TOOL_RESULT_CHARS_FOR_MODEL),
        })
      } catch (error) {
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: `Tool execution error: ${error instanceof Error ? error.message : "unknown"}`,
        })
      }
    }
  }

  throw new Error("GitHub Models reached max tool rounds without final response")
}

function getLatestUserMessage(body: MockChatRequest): string {
  if (typeof body.message === "string" && body.message.trim().length > 0) {
    return body.message.trim()
  }

  const lastUserMessage = body.messages
    ?.slice()
    .reverse()
    .find((entry) => entry.role === "user" && entry.content.trim().length > 0)

  return lastUserMessage?.content.trim() ?? ""
}

function generateMockReply(message: string): string {
  if (!message) {
    return "No recibí contenido. Escribe un prompt para probar el flujo del chat."
  }

  const normalized = message.toLowerCase()

  if (normalized.includes("hola") || normalized.includes("hello")) {
    return "Hola. Este es el mock local activo de /api/agent/chat. Tu frontend está enviando y recibiendo correctamente."
  }

  if (normalized.includes("resumen") || normalized.includes("summary")) {
    return "Resumen mock: 1) Mensaje recibido. 2) Pipeline del chat operativo. 3) Listo para conectar un backend LLM real."
  }

  return [
    "Respuesta mock del agente:",
    `- Prompt recibido: ${message}`,
    "- Estado: integración frontend correcta.",
    "- Próximo paso: apuntar VITE_AGENT_API_URL a tu API real.",
  ].join("\n")
}

export function mockAgentApiPlugin(options: MockAgentApiPluginOptions = {}): Plugin {
  return {
    name: "mock-agent-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/mcp/test", async (req, res) => {
        if (req.method !== "POST") {
          sendJson(res, 405, { error: "Method not allowed" })
          return
        }

        const body = (await readJsonBody(req)) as Record<string, unknown>
        const serverUrl = typeof body.serverUrl === "string" ? body.serverUrl.trim() : ""

        try {
          const parsed = new URL(serverUrl)
          if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            sendJson(res, 400, { ok: false, error: "Invalid protocol. Only http/https are supported." })
            return
          }
        } catch {
          sendJson(res, 400, { ok: false, error: "Invalid MCP server URL." })
          return
        }

        const result = await testMcpServerConnection(serverUrl)
        sendJson(res, result.ok ? 200 : 502, result)
      })

      server.middlewares.use("/api/agent/chat", async (req, res) => {
        if (req.method !== "POST") {
          sendJson(res, 405, { error: "Method not allowed" })
          return
        }

        const body = (await readJsonBody(req)) as MockChatRequest
        const conversationId = body.conversationId ?? `mock-${Date.now()}`

        try {
          const canUseGithubModels =
            typeof options.githubModelsApiToken === "string" &&
            options.githubModelsApiToken.trim().length > 0 &&
            typeof options.githubModel === "string" &&
            options.githubModel.trim().length > 0

          if (canUseGithubModels) {
            const result = await sendViaGithubModelsWithMcp(body, options)
            sendJson(res, 200, {
              reply: result.reply,
              conversationId,
              provider: "github-models+mcp-bridge",
              toolCalls: result.toolCalls,
              mcpApp: result.mcpApp,
              mcpDiagnostics: result.mcpDiagnostics,
              createdAt: new Date().toISOString(),
              raw: result.raw,
            })
            return
          }

          const userMessage = getLatestUserMessage(body)
          const reply = generateMockReply(userMessage)
          sendJson(res, 200, {
            reply,
            conversationId,
            provider: "local-mock",
            createdAt: new Date().toISOString(),
          })
        } catch (error) {
          sendJson(res, 500, {
            error: error instanceof Error ? error.message : "unknown error",
          })
        }
      })
    },
  }
}
