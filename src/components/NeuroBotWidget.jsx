import { useRef, useState, useEffect } from 'react'
import { api, extractErrorMessage } from '../api/client.js'

export default function NeuroBotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Ask me anything about your projects - e.g. \"What's pending in Sprint 3?\" or \"Which bugs are critical?\"" },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open])

  async function send(e) {
    e.preventDefault()
    const question = input.trim()
    if (!question || sending) return

    setMessages((prev) => [...prev, { role: 'user', text: question }])
    setInput('')
    setSending(true)

    try {
      const res = await api.post('/api/bot/ask', { question })
      setMessages((prev) => [...prev, { role: 'bot', text: res.data.answer }])
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'bot', text: extractErrorMessage(err), error: true }])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="neurobot-root">
      {open && (
        <div className="neurobot-panel card">
          <div className="neurobot-panel-header">
            <span>NeuroBot</span>
            <button className="neurobot-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
          </div>

          <div className="neurobot-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`neurobot-bubble ${m.role === 'user' ? 'neurobot-bubble-user' : 'neurobot-bubble-bot'} ${m.error ? 'neurobot-bubble-error' : ''}`}>
                {m.text}
              </div>
            ))}
            {sending && (
              <div className="neurobot-bubble neurobot-bubble-bot neurobot-bubble-typing">
                <span></span><span></span><span></span>
              </div>
            )}
          </div>

          <form onSubmit={send} className="neurobot-input-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your projects…"
              className="field-input"
              disabled={sending}
            />
            <button type="submit" disabled={sending || !input.trim()} className="btn btn-primary">
              Send
            </button>
          </form>
        </div>
      )}

      <button
        className="neurobot-launcher"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close NeuroBot' : 'Open NeuroBot'}
      >
        {open ? '×' : 'AI'}
      </button>
    </div>
  )
}