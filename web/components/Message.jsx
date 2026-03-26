'use client'

export default function Message({ role, content, isStreaming }) {
  const isAssistant = role === 'assistant'

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isAssistant ? 'flex-start' : 'flex-end',
        marginBottom: '16px',
      }}
    >
      <div
        style={{
          maxWidth: '80%',
          padding: '12px 16px',
          borderRadius: isAssistant ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
          background: isAssistant ? 'var(--bg-card)' : 'var(--accent)',
          color: 'var(--text)',
          border: isAssistant ? '1px solid var(--border)' : 'none',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {content}
        {isStreaming && (
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '14px',
              background: 'var(--text-muted)',
              marginLeft: '2px',
              verticalAlign: 'text-bottom',
              animation: 'blink 1s step-end infinite',
            }}
          />
        )}
      </div>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
