"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { cn } from "@/lib/utils"
import { X, Send, Bot, Sparkles, RotateCcw, AlertCircle } from "lucide-react"
import { useAIChatContext } from "@/lib/ai-chat-context"
import { getFriendlyErrorMessage } from "@/lib/api"

export function AIChatButton() {
  const { courseTitle, lessonTitle } = useAIChatContext()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, setMessages, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { courseTitle, lessonTitle },
    }),
  })

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || status !== "ready") return
    sendMessage({ text: input })
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex flex-col w-[340px] h-[480px] rounded-2xl shadow-2xl border bg-background overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-primary">
            <div className="size-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Bot className="size-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">StageAI Tuteur</p>
              <p className="text-[10px] text-white/70 truncate">
                {courseTitle ? courseTitle : "Posez vos questions"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([])}
                className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/15 transition-colors"
                title="Effacer la conversation"
              >
                <RotateCcw className="size-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/15 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Bonjour ! Je suis StageAI</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {courseTitle
                      ? `Je suis ici pour vous aider avec "${courseTitle}". Posez-moi vos questions !`
                      : "Votre tuteur IA personnel. Posez-moi n'importe quelle question sur vos formations."}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 w-full mt-1">
                  {["Explique-moi ce concept", "Donne-moi un exemple", "Quels sont les prérequis ?"].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        sendMessage({ text: s })
                      }}
                      className="text-xs text-left px-3 py-2 rounded-xl border bg-muted/40 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "assistant" && (
                  <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="size-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}
                >
                  {msg.parts.map((part, i) =>
                    part.type === "text" ? (
                      <span key={i} className="whitespace-pre-wrap">
                        {part.text}
                      </span>
                    ) : null
                  )}
                </div>
              </div>
            ))}

            {status === "submitted" && (
              <div className="flex gap-2 justify-start">
                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="size-3.5 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2">
                  <div className="flex gap-1 items-center h-4">
                    <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                    <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                    <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3">
            {error && (
              <div className="mb-2 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                <span>
                  {getFriendlyErrorMessage(
                    error,
                    "Le tuteur IA est momentanément indisponible. Veuillez réessayer dans un instant.",
                  )}
                </span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question..."
                rows={1}
                className="flex-1 resize-none rounded-xl border bg-muted/40 px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary max-h-20 leading-relaxed"
                style={{ minHeight: "36px" }}
              />
              <button
                type="submit"
                disabled={!input.trim() || status !== "ready"}
                className="size-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="size-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-5 right-5 z-50 size-14 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-200",
          open ? "bg-foreground text-background" : "bg-primary text-primary-foreground hover:scale-105"
        )}
        aria-label="Ouvrir le tuteur IA"
      >
        {open ? <X className="size-5" /> : <Bot className="size-6" />}
        {!open && messages.length === 0 && (
          <span className="absolute -top-1 -right-1 size-4 rounded-full bg-chart-3 flex items-center justify-center">
            <Sparkles className="size-2.5 text-white" />
          </span>
        )}
      </button>
    </>
  )
}
