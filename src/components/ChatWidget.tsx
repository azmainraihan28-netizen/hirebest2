import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

type Msg = { role: 'user' | 'assistant'; content: string }

const STORAGE_KEY = 'hirebest.chat.history.v1'
const SESSION_KEY = 'hirebest.chat.session.v1'
const GREETING: Msg = {
  role: 'assistant',
  content: "Hi 👋 I'm HireBest's assistant. Ask me anything about pricing, features, or how screening works.",
}

function loadHistory(): Msg[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [GREETING]
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {}
  return [GREETING]
}

function getSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_KEY)
    if (existing) return existing
    const id: string = (crypto as any)?.randomUUID?.() ?? `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(SESSION_KEY, id)
    return id
  } catch {
    return `sess-${Date.now()}`
  }
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>(() => (typeof window !== 'undefined' ? loadHistory() : [GREETING]))
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-16))) } catch {}
  }, [messages])

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
        inputRef.current?.focus()
      })
    }
  }, [open, messages, sending])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  async function send() {
    const text = input.trim()
    if (!text || sending) return
    setError(null)
    setInput('')
    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next)
    setSending(true)
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.filter(m => m !== GREETING).slice(-8),
          sessionId: getSessionId(),
        }),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) {
        setError(r.status === 429 ? 'You\'ve hit the message limit. Try again in an hour.' : (data.error || 'Something went wrong.'))
      } else if (data.reply) {
        setMessages([...next, { role: 'assistant', content: data.reply }])
      } else {
        setError('Empty reply. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  function reset() {
    setMessages([GREETING])
    setError(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  const springOpen = reduce
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 260, damping: 26, mass: 0.9 }

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            key="bubble"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={springOpen}
            onClick={() => setOpen(true)}
            aria-label="Open chat with HireBest assistant"
            className="fixed bottom-5 right-5 z-45 rounded-full text-white shadow-lg"
            style={{
              zIndex: 45,
              background: 'linear-gradient(180deg, #3b82f6, #2563eb)',
              boxShadow: '0 10px 30px rgba(59,130,246,0.35)',
              padding: '14px',
            }}
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={springOpen}
            role="dialog"
            aria-label="HireBest support chat"
            className="fixed card flex flex-col overflow-hidden"
            style={{
              zIndex: 45,
              right: '1rem',
              bottom: '1rem',
              width: 'min(380px, calc(100vw - 2rem))',
              height: 'min(560px, calc(100vh - 2rem))',
              background: 'var(--color-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-fg)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold">HireBest Assistant</div>
                  <div className="text-xs" style={{ color: 'var(--color-muted)' }}>Usually replies instantly</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={reset}
                  className="text-xs px-2 py-1 rounded hover:opacity-80"
                  style={{ color: 'var(--color-muted)' }}
                  aria-label="Clear conversation"
                >
                  Clear
                </button>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="p-1 rounded hover:opacity-80"
                  style={{ color: 'var(--color-muted)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {messages.map((m, i) => (
                <Bubble key={i} role={m.role} content={m.content} />
              ))}
              {sending && <TypingBubble />}
              {error && (
                <div
                  className="text-xs px-3 py-2 rounded-md"
                  style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  {error}
                </div>
              )}
            </div>

            <form
              onSubmit={e => { e.preventDefault(); send() }}
              className="p-3 border-t flex items-center gap-2"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about pricing, features, integrations…"
                disabled={sending}
                className="flex-1 text-sm px-3 py-2 rounded-md outline-none"
                style={{
                  background: 'var(--color-bg-2)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-fg)',
                }}
                maxLength={1000}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label="Send"
                className="rounded-md px-3 py-2 text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(180deg, #3b82f6, #2563eb)' }}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Bubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[85%] text-sm px-3 py-2 rounded-2xl whitespace-pre-wrap leading-relaxed"
        style={
          isUser
            ? { background: 'linear-gradient(180deg, #3b82f6, #2563eb)', color: 'white', borderBottomRightRadius: 6 }
            : {
                background: 'var(--color-bg-2)',
                color: 'var(--color-fg)',
                border: '1px solid var(--color-border)',
                borderBottomLeftRadius: 6,
              }
        }
      >
        {content}
      </div>
    </div>
  )
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div
        className="px-3 py-2 rounded-2xl flex items-center gap-1"
        style={{
          background: 'var(--color-bg-2)',
          border: '1px solid var(--color-border)',
          borderBottomLeftRadius: 6,
        }}
      >
        <Dot delay={0} />
        <Dot delay={0.15} />
        <Dot delay={0.3} />
      </div>
    </div>
  )
}

function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      style={{
        width: 6,
        height: 6,
        borderRadius: 999,
        background: 'var(--color-muted)',
        display: 'inline-block',
      }}
      animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 0.9, repeat: Infinity, delay }}
    />
  )
}
