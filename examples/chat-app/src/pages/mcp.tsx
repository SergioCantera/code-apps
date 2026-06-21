import { useState } from "react"
import { CheckCircle2, LoaderCircle, Plus, Trash2, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getStoredMcpServers, setStoredMcpServers, tryNormalizeMcpServerUrl } from "@/lib/mcp-servers"
import { useT } from "@/lib/i18n"

export default function McpPage() {
  const { t } = useT()
  const [endpointInput, setEndpointInput] = useState("")
  const [servers, setServers] = useState<string[]>(() => getStoredMcpServers())
  const [statuses, setStatuses] = useState<Record<string, { state: "idle" | "testing" | "ok" | "error"; message?: string }>>({})
  const [testingAll, setTestingAll] = useState(false)

  function addEndpoint(): void {
    const normalized = tryNormalizeMcpServerUrl(endpointInput)
    if (!normalized) {
      toast.error(t.mcp.invalidUrl)
      return
    }

    const next = setStoredMcpServers([...servers, normalized])
    setServers(next)
    setEndpointInput("")
    toast.success(t.mcp.saved)
  }

  function removeEndpoint(server: string): void {
    const next = setStoredMcpServers(servers.filter((value) => value !== server))
    setServers(next)
    setStatuses((prev) => {
      const clone = { ...prev }
      delete clone[server]
      return clone
    })
    toast.success(t.mcp.saved)
  }

  async function testEndpoint(server: string): Promise<void> {
    setStatuses((prev) => ({
      ...prev,
      [server]: { state: "testing", message: t.mcp.testing },
    }))

    try {
      const response = await fetch("/api/mcp/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ serverUrl: server }),
      })

      const payload = (await response.json()) as { ok?: boolean; toolsCount?: number; error?: string }

      if (!response.ok || !payload.ok) {
        setStatuses((prev) => ({
          ...prev,
          [server]: {
            state: "error",
            message: payload.error || t.mcp.connectionFailed,
          },
        }))
        return
      }

      setStatuses((prev) => ({
        ...prev,
        [server]: {
          state: "ok",
          message: `${t.mcp.toolsDetected}: ${payload.toolsCount ?? 0}`,
        },
      }))
    } catch (error) {
      setStatuses((prev) => ({
        ...prev,
        [server]: {
          state: "error",
          message: error instanceof Error ? error.message : t.mcp.connectionFailed,
        },
      }))
    }
  }

  async function testAllEndpoints(): Promise<void> {
    if (servers.length === 0 || testingAll) {
      return
    }

    setTestingAll(true)
    await Promise.all(servers.map((server) => testEndpoint(server)))
    setTestingAll(false)
  }

  return (
    <div className="h-full p-4 md:p-6">
      <div className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle>{t.mcp.heading}</CardTitle>
            <CardDescription>{t.mcp.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-end">
              <div className="flex-1 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{t.mcp.endpointLabel}</p>
                <Input
                  value={endpointInput}
                  onChange={(event) => setEndpointInput(event.target.value)}
                  placeholder={t.mcp.endpointPlaceholder}
                />
              </div>
              <Button type="button" variant="outline" onClick={() => void testAllEndpoints()} className="gap-1.5" disabled={servers.length === 0 || testingAll}>
                {testingAll ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {testingAll ? t.mcp.testingAll : t.mcp.testAll}
              </Button>
              <Button type="button" onClick={addEndpoint} className="gap-1.5">
                <Plus className="h-4 w-4" />
                {t.mcp.addEndpoint}
              </Button>
            </div>

            {servers.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">{t.mcp.empty}</div>
            ) : (
              <div className="space-y-2">
                {servers.map((server) => (
                  <div
                    key={server}
                    className="rounded-lg border border-border px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm">{server}</p>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => void testEndpoint(server)}
                          disabled={statuses[server]?.state === "testing"}
                        >
                          {statuses[server]?.state === "testing" ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          {statuses[server]?.state === "testing" ? t.mcp.testing : t.mcp.testConnection}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => removeEndpoint(server)}
                        >
                          <Trash2 className="h-4 w-4" />
                          {t.mcp.remove}
                        </Button>
                      </div>
                    </div>
                    {statuses[server] && statuses[server].state !== "idle" && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        {statuses[server].state === "ok" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        ) : statuses[server].state === "error" ? (
                          <XCircle className="h-3.5 w-3.5 text-red-500" />
                        ) : (
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        )}
                        <span>{statuses[server].message}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
