import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { Bot, LoaderCircle, SendHorizontal, Sparkles, Trash2, User } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { McpAppHost } from "@/components/mcp-app-host"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  getMcpChatDefaults,
  sendChatMessage,
  type ChatMessagePayload,
  type ChatRole,
  type McpAppPayload,
} from "@/lib/chat-api"
import { useT } from "@/lib/i18n"
import {
  clearActiveMcpServersCustomization,
  getActiveMcpServers,
  getStoredMcpServers,
  setActiveMcpServers,
} from "@/lib/mcp-servers"

type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  createdAt: number
  mcpApp?: McpAppPayload
}

const AGENT_API_DEFAULT_PATH = "/api/agent/chat"

function createMessage(role: ChatRole, content: string, mcpApp?: McpAppPayload): ChatMessage {
  return {
    id: `${role}-${crypto.randomUUID()}`,
    role,
    content,
    createdAt: Date.now(),
    mcpApp,
  }
}

function toPayload(messages: ChatMessage[]): ChatMessagePayload[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }))
}

function formatMessageTime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp)
}

export default function HomePage() {
  const { t } = useT()
  const mcpDefaults = useMemo(() => getMcpChatDefaults(), [])
  const [conversationId, setConversationId] = useState<string | undefined>(mcpDefaults.conversationId)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage("assistant", t.home.welcomeAssistant),
  ])
  const [availableMcpServers, setAvailableMcpServers] = useState<string[]>(() => getStoredMcpServers())
  const [activeMcpServers, setActiveMcpServersState] = useState<string[]>(() => getActiveMcpServers())
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const quickPrompts = useMemo(() => t.home.quickPromptIdeas, [t.home.quickPromptIdeas])

  const mutation = useMutation({
    mutationFn: async (payload: { prompt: string; history: ChatMessagePayload[]; conversationId?: string }) =>
      sendChatMessage(
        {
          message: payload.prompt,
          messages: payload.history,
          conversationId: payload.conversationId,
          mcpServers: activeMcpServers,
        },
      ),
    onSuccess: (result) => {
      setMessages((prev) => [...prev, createMessage("assistant", result.reply, result.mcpApp)])
      setConversationId(result.conversationId ?? conversationId)
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : t.home.toast.apiError
      toast.error(errorMessage)
    },
  })

  useEffect(() => {
    setMessages([createMessage("assistant", t.home.welcomeAssistant)])
    setConversationId(mcpDefaults.conversationId)
    setInput(mcpDefaults.initialPrompt ?? "")
  }, [mcpDefaults.conversationId, mcpDefaults.initialPrompt, t.home.welcomeAssistant])

  useEffect(() => {
    const configured = getStoredMcpServers()
    const active = getActiveMcpServers()
    setAvailableMcpServers(configured)
    setActiveMcpServersState(active)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, mutation.isPending])

  function submitMessage(prompt: string): void {
    const normalizedPrompt = prompt.trim()

    if (!normalizedPrompt || mutation.isPending) {
      return
    }

    const userMessage = createMessage("user", normalizedPrompt)
    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setInput("")
    mutation.mutate({
      prompt: normalizedPrompt,
      history: toPayload(nextMessages),
      conversationId,
    })
  }

  function resetChat(): void {
    setMessages([createMessage("assistant", t.home.welcomeAssistant)])
    setConversationId(undefined)
    setInput("")
    mutation.reset()
  }

  function toggleMcpServer(server: string): void {
    const next = activeMcpServers.includes(server)
      ? activeMcpServers.filter((value) => value !== server)
      : [...activeMcpServers, server]

    const saved = setActiveMcpServers(next)
    setActiveMcpServersState(saved)
  }

  function selectAllMcpServers(): void {
    const saved = setActiveMcpServers(availableMcpServers)
    setActiveMcpServersState(saved)
  }

  function clearMcpServers(): void {
    const saved = setActiveMcpServers([])
    setActiveMcpServersState(saved)
  }

  function useDefaultMcpRouting(): void {
    clearActiveMcpServersCustomization()
    const configured = getStoredMcpServers()
    setAvailableMcpServers(configured)
    setActiveMcpServersState(configured)
  }

  return (
    <div className="h-full p-4 md:p-6">
      <div className="mx-auto grid h-full w-full max-w-7xl grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <Card className="h-full">
          <CardHeader className="border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>{t.home.heading}</CardTitle>
                <CardDescription>{t.home.subHeading}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${mutation.isPending ? "bg-amber-500" : "bg-emerald-500"}`} />
                  {mutation.isPending ? t.home.statusTyping : t.home.statusReady}
                </Badge>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={resetChat}
                  className="gap-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  {t.home.newChat}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 min-h-0 flex-col">
            <ScrollArea className="h-full pr-3">
              <div className="space-y-4 pb-3">
                {messages.length === 0 && (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{t.home.emptyTitle}</p>
                    <p>{t.home.emptyDescription}</p>
                  </div>
                )}

                {messages.map((message) => {
                  const isUser = message.role === "user"
                  const hasMcpApp = Boolean(message.mcpApp)

                  const messageContainerClassName = isUser
                    ? "max-w-[85%] md:max-w-[75%]"
                    : hasMcpApp
                      ? "w-[75%] max-w-none"
                      : "max-w-[85%] md:max-w-[75%]"

                  return (
                    <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`${messageContainerClassName} rounded-xl border px-3 py-2 ${
                          isUser
                            ? "border-primary/20 bg-primary text-primary-foreground"
                            : "border-border bg-muted/50"
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wide opacity-80">
                          {isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                          <span>{isUser ? "You" : "Agent"}</span>
                          <span>·</span>
                          <time>{formatMessageTime(message.createdAt)}</time>
                        </div>
                        {!message.mcpApp && (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                        )}
                        {!isUser && message.mcpApp && <McpAppHost app={message.mcpApp} />}
                      </div>
                    </div>
                  )
                })}

                {mutation.isPending && (
                  <div className="flex justify-start">
                    <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      {t.home.sending}
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="mr-1 inline-flex items-center text-xs text-muted-foreground">
                <Sparkles className="mr-1 h-3 w-3" />
                {t.home.quickPrompts}
              </span>
              {quickPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => submitMessage(prompt)}
                  disabled={mutation.isPending}
                >
                  {prompt}
                </Button>
              ))}
            </div>
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    submitMessage(input)
                  }
                }}
                placeholder={t.home.inputPlaceholder}
                className="min-h-18"
                disabled={mutation.isPending}
              />
              <Button
                type="button"
                onClick={() => submitMessage(input)}
                disabled={mutation.isPending || input.trim().length === 0}
                className="gap-1.5"
              >
                {mutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
                {mutation.isPending ? t.home.sending : t.home.send}
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card className="h-fit">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-sm">{t.home.apiHintTitle}</CardTitle>
            <CardDescription>{t.home.apiHintDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">VITE_AGENT_API_URL</span>
            </p>
            <p>{import.meta.env.VITE_AGENT_API_URL || AGENT_API_DEFAULT_PATH}</p>

            <div className="pt-3">
              <p className="mb-1 font-medium text-foreground">MCP routing</p>
              <p className="mb-2 text-xs text-muted-foreground">Select active servers for this chat session.</p>

              {availableMcpServers.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No configured MCP servers. <Link className="underline" to="/mcp">Configure endpoints</Link>
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" className="h-6 text-[11px]" onClick={selectAllMcpServers}>
                      All
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="h-6 text-[11px]" onClick={clearMcpServers}>
                      None
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="h-6 text-[11px]" onClick={useDefaultMcpRouting}>
                      Default
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="h-6 text-[11px]" asChild>
                      <Link to="/mcp">Manage</Link>
                    </Button>
                  </div>

                  {availableMcpServers.map((server) => {
                    const checked = activeMcpServers.includes(server)
                    return (
                      <label key={server} className="flex cursor-pointer items-center gap-2 rounded border border-border px-2 py-1">
                        <input type="checkbox" checked={checked} onChange={() => toggleMcpServer(server)} />
                        <span className="truncate text-[11px] text-foreground">{server}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}