'use client'

import { useState, useRef, useEffect } from 'react'
import Message from './Message'
import { parseRecommendations, extractPreRecommendationText } from '../lib/parser'

const QUESTION_ESTIMATES = { min: 10, max: 15 }

export default function ChatInterface({ name, profileData, initialMessage, onComplete }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: initialMessage },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [questionCount, setQuestionCount] = useState(0)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
  }, [input])

  // Progress: estimate based on question count
  const progress = Math.min(
    questionCount / QUESTION_ESTIMATES.max,
    0.95
  )

  async function sendMessage(e) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return

    const isFirst = messages.length === 1 // Only the initial assistant message
    const newMessages = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)
    setStreamingContent('')
    setQuestionCount((c) => c + 1)

    // Build conversation history for API (excluding the streaming placeholder)
    const apiMessages = newMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    // Prepend profile context if available
    if (profileData && isFirst) {
      apiMessages[0] = {
        role: 'user',
        content: `[RETURNING USER PROFILE]\n${JSON.stringify(profileData, null, 2)}\n\n[CURRENT MESSAGE]\n${text}`,
      }
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, isFirst }),
      })

      if (res.status === 429) {
        const data = await res.json()
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.error || 'Daily limit reached.' },
        ])
        setIsLoading(false)
        return
      }

      if (!res.ok) throw new Error('API error')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setStreamingContent(accumulated)
      }

      // Check if response contains recommendations
      const recs = parseRecommendations(accumulated)
      if (recs) {
        const preText = extractPreRecommendationText(accumulated)
        if (preText) {
          setMessages((prev) => [...prev, { role: 'assistant', content: preText }])
        }
        setStreamingContent('')
        setIsLoading(false)
        onComplete(recs, newMessages)
        return
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: accumulated }])
      setStreamingContent('')
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
        },
      ])
      setStreamingContent('')
    }

    setIsLoading(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxWidth: '720px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px 12px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ marginBottom: '10px' }}>
          <span style={{ fontWeight: '600', fontSize: '15px' }}>
            Finding your business, {name}
          </span>
        </div>
        {/* Progress bar */}
        <div
          style={{
            height: '3px',
            background: 'var(--border)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress * 100}%`,
              background: 'var(--accent)',
              borderRadius: '2px',
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 20px',
        }}
      >
        {messages.map((msg, i) => (
          <Message key={i} role={msg.role} content={msg.content} />
        ))}
        {streamingContent && (
          <Message role="assistant" content={streamingContent} isStreaming />
        )}
        {isLoading && !streamingContent && (
          <div style={{ display: 'flex', gap: '4px', padding: '8px 0 8px 4px' }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--text-muted)',
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg)',
        }}
      >
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer..."
            rows={1}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text)',
              fontSize: '15px',
              resize: 'none',
              outline: 'none',
              lineHeight: '1.5',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{
              padding: '12px 20px',
              background: input.trim() && !isLoading ? 'var(--accent)' : 'var(--border)',
              color: input.trim() && !isLoading ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '15px',
              fontWeight: '600',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Send
          </button>
        </form>
        <p
          style={{
            marginTop: '8px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}
        >
          Enter to send · Shift+Enter for new line
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
