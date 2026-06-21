const MCP_SERVERS_STORAGE_KEY = "mcp_servers"
const MCP_ACTIVE_SERVERS_STORAGE_KEY = "mcp_active_servers"
const MCP_ACTIVE_SERVERS_CUSTOMIZED_KEY = "mcp_active_servers_customized"

function normalizeMcpServerUrl(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return undefined
    }

    return parsed.toString().replace(/\/$/, "")
  } catch {
    return undefined
  }
}

export function getStoredMcpServers(): string[] {
  if (typeof window === "undefined") {
    return []
  }

  const raw = window.localStorage.getItem(MCP_SERVERS_STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map((value) => (typeof value === "string" ? normalizeMcpServerUrl(value) : undefined))
      .filter((value): value is string => Boolean(value))
  } catch {
    return []
  }
}

export function setStoredMcpServers(servers: string[]): string[] {
  const previousServers = getStoredMcpServers()
  const normalized = Array.from(
    new Set(
      servers
        .map((value) => normalizeMcpServerUrl(value))
        .filter((value): value is string => Boolean(value)),
    ),
  )

  if (typeof window !== "undefined") {
    window.localStorage.setItem(MCP_SERVERS_STORAGE_KEY, JSON.stringify(normalized))

    const activeRaw = getStoredActiveMcpServersRaw()
    const nextActive = activeRaw
      ? normalized.filter((url) => activeRaw.includes(url) || !previousServers.includes(url))
      : normalized

    window.localStorage.setItem(MCP_ACTIVE_SERVERS_STORAGE_KEY, JSON.stringify(nextActive))
  }

  return normalized
}

export function tryNormalizeMcpServerUrl(value: string): string | undefined {
  return normalizeMcpServerUrl(value)
}

function getStoredActiveMcpServersRaw(): string[] | undefined {
  if (typeof window === "undefined") {
    return undefined
  }

  const raw = window.localStorage.getItem(MCP_ACTIVE_SERVERS_STORAGE_KEY)
  if (!raw) {
    return undefined
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return undefined
    }

    return parsed
      .map((value) => (typeof value === "string" ? normalizeMcpServerUrl(value) : undefined))
      .filter((value): value is string => Boolean(value))
  } catch {
    return undefined
  }
}

export function getActiveMcpServers(): string[] {
  const configured = getStoredMcpServers()
  const isCustomized = typeof window !== "undefined" && window.localStorage.getItem(MCP_ACTIVE_SERVERS_CUSTOMIZED_KEY) === "1"

  if (!isCustomized) {
    return configured
  }

  const activeRaw = getStoredActiveMcpServersRaw()

  if (!activeRaw) {
    return configured
  }

  return configured.filter((url) => activeRaw.includes(url))
}

export function setActiveMcpServers(servers: string[]): string[] {
  const configured = getStoredMcpServers()
  const normalized = Array.from(
    new Set(
      servers
        .map((value) => normalizeMcpServerUrl(value))
        .filter((value): value is string => typeof value === "string")
        .filter((value) => configured.includes(value)),
    ),
  )

  if (typeof window !== "undefined") {
    window.localStorage.setItem(MCP_ACTIVE_SERVERS_STORAGE_KEY, JSON.stringify(normalized))
    window.localStorage.setItem(MCP_ACTIVE_SERVERS_CUSTOMIZED_KEY, "1")
  }

  return normalized
}

export function clearActiveMcpServersCustomization(): void {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(MCP_ACTIVE_SERVERS_CUSTOMIZED_KEY)
}
