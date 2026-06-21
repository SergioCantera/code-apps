import { getStoredMcpServers } from "@/lib/mcp-servers"

export type ChatRole = "user" | "assistant"

export type ChatMessagePayload = {
  role: ChatRole
  content: string
}

export type SendChatMessageRequest = {
  message: string
  messages: ChatMessagePayload[]
  conversationId?: string
  mcpServers?: string[]
}

export type McpAppPayload = {
  resourceUri: string
  html: string
  toolName: string
  toolResultText?: string
  toolInput?: Record<string, unknown>
}

export type SendChatMessageResponse = {
  reply: string
  conversationId?: string
  raw: unknown
  mcpApp?: McpAppPayload
}

type AnyRecord = Record<string, unknown>

const DEFAULT_AGENT_API_PATH = "/api/agent/chat"
const DEFAULT_GITHUB_MODELS_API_URL = "https://models.github.ai/inference/chat/completions"

const AGENT_API_URL = import.meta.env.VITE_AGENT_API_URL?.trim()
const GITHUB_MODELS_API_URL =
  import.meta.env.VITE_GITHUB_MODELS_API_URL?.trim() || DEFAULT_GITHUB_MODELS_API_URL
const GITHUB_MODELS_TOKEN = import.meta.env.VITE_GITHUB_MODELS_API_TOKEN?.trim()
const GITHUB_MODELS_MODEL = import.meta.env.VITE_LLM_MODEL?.trim()
const GITHUB_MODELS_DIRECT =
  import.meta.env.VITE_GITHUB_MODELS_DIRECT === "true" ||
  import.meta.env.VITE_GITHUB_MODELS_DIRECT === "1"

type McpRuntimeInput = {
  agentApiUrl?: string
  initialPrompt?: string
  conversationId?: string
}

function getMcpInput(): McpRuntimeInput {
  if (typeof window === "undefined") {
    return {}
  }

  const context = window.__MCP_APP_CONTEXT__
  if (!context || context.mode !== "mcp") {
    return {}
  }

  if (!isRecord(context.input)) {
    return {}
  }

  return {
    agentApiUrl: getNonEmptyString(context.input.agentApiUrl),
    initialPrompt: getNonEmptyString(context.input.initialPrompt),
    conversationId: getNonEmptyString(context.input.conversationId),
  }
}

function resolveAgentApiUrl(): string {
  const mcpAgentApiUrl = getMcpInput().agentApiUrl
  return mcpAgentApiUrl ?? AGENT_API_URL ?? DEFAULT_AGENT_API_PATH
}

function resolveGithubModelVariants(model: string): string[] {
  const variants = new Set<string>()
  variants.add(model)

  if (model.includes(".mini")) {
    variants.add(model.replace(".mini", "-mini"))
  }

  if (model.includes("-mini")) {
    variants.add(model.replace("-mini", ".mini"))
  }

  return [...variants]
}

function shouldUseGithubModels(): boolean {
  // Browser direct mode is opt-in. By default, use backend /api/agent/chat.
  if (!GITHUB_MODELS_DIRECT || AGENT_API_URL) {
    return false
  }

  return Boolean(GITHUB_MODELS_TOKEN && GITHUB_MODELS_MODEL)
}

async function sendViaGithubModels(
  request: SendChatMessageRequest,
  signal?: AbortSignal,
): Promise<SendChatMessageResponse> {
  if (!GITHUB_MODELS_TOKEN || !GITHUB_MODELS_MODEL) {
    throw new Error("Missing GitHub Models configuration")
  }

  const modelVariants = resolveGithubModelVariants(GITHUB_MODELS_MODEL)
  let lastError: Error | undefined

  for (const model of modelVariants) {
    const response = await fetch(GITHUB_MODELS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GITHUB_MODELS_TOKEN}`,
      },
      body: JSON.stringify({
        model,
        messages: request.messages,
      }),
      signal,
    })

    if (!response.ok) {
      const message = `GitHub Models API error: ${response.status}`

      // Try alternate model id only for invalid request style errors.
      if (response.status === 400 && model !== modelVariants[modelVariants.length - 1]) {
        lastError = new Error(message)
        continue
      }

      throw new Error(message)
    }

    const payload = (await response.json()) as unknown
    const reply = extractReply(payload)

    if (!reply) {
      throw new Error("GitHub Models response does not contain a valid assistant reply")
    }

    return {
      reply,
      conversationId: extractConversationId(payload),
      raw: payload,
    }
  }

  throw lastError ?? new Error("Unable to call GitHub Models")
}

export function getMcpChatDefaults(): Pick<McpRuntimeInput, "initialPrompt" | "conversationId"> {
  const { initialPrompt, conversationId } = getMcpInput()
  return { initialPrompt, conversationId }
}

function isRecord(value: unknown): value is AnyRecord {
  return typeof value === "object" && value !== null
}

function getNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function extractFromCommonKeys(record: AnyRecord): string | undefined {
  const candidateKeys = ["reply", "message", "output", "content", "text", "answer"]

  for (const key of candidateKeys) {
    const value = getNonEmptyString(record[key])
    if (value) {
      return value
    }
  }

  return undefined
}

function extractReply(payload: unknown): string | undefined {
  if (!isRecord(payload)) {
    return undefined
  }

  const topLevelReply = extractFromCommonKeys(payload)
  if (topLevelReply) {
    return topLevelReply
  }

  const response = payload.response
  if (isRecord(response)) {
    const nestedReply = extractFromCommonKeys(response)
    if (nestedReply) {
      return nestedReply
    }
  }

  const choices = payload.choices
  if (Array.isArray(choices) && choices.length > 0 && isRecord(choices[0])) {
    const firstChoice = choices[0]
    const directText = extractFromCommonKeys(firstChoice)
    if (directText) {
      return directText
    }

    const message = firstChoice.message
    if (isRecord(message)) {
      const messageText = extractFromCommonKeys(message)
      if (messageText) {
        return messageText
      }
    }
  }

  return undefined
}

function extractConversationId(payload: unknown): string | undefined {
  if (!isRecord(payload)) {
    return undefined
  }

  return (
    getNonEmptyString(payload.conversationId) ||
    getNonEmptyString(payload.threadId) ||
    getNonEmptyString(payload.sessionId)
  )
}

function extractMcpApp(payload: unknown): McpAppPayload | undefined {
  if (!isRecord(payload) || !isRecord(payload.mcpApp)) {
    return undefined
  }

  const resourceUri = getNonEmptyString(payload.mcpApp.resourceUri)
  const html = getNonEmptyString(payload.mcpApp.html)
  const toolName = getNonEmptyString(payload.mcpApp.toolName)
  const toolResultText = getNonEmptyString(payload.mcpApp.toolResultText)

  if (!resourceUri || !html || !toolName) {
    return undefined
  }

  const toolInput = isRecord(payload.mcpApp.toolInput) ? payload.mcpApp.toolInput : undefined

  return {
    resourceUri,
    html,
    toolName,
    toolResultText,
    toolInput,
  }
}

export async function sendChatMessage(
  request: SendChatMessageRequest,
  signal?: AbortSignal,
): Promise<SendChatMessageResponse> {
  if (shouldUseGithubModels()) {
    return sendViaGithubModels(request, signal)
  }

  const response = await fetch(resolveAgentApiUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...request,
      mcpServers: request.mcpServers ?? getStoredMcpServers(),
    }),
    signal,
  })

  if (!response.ok) {
    throw new Error(`Agent API error: ${response.status}`)
  }

  const payload = (await response.json()) as unknown
  const reply = extractReply(payload)

  if (!reply) {
    throw new Error("Agent API response does not contain a valid assistant reply")
  }

  return {
    reply,
    conversationId: extractConversationId(payload),
    raw: payload,
    mcpApp: extractMcpApp(payload),
  }
}
