'use client'

import { useState, useRef } from 'react'

export default function WelcomeScreen({ onStart }) {
  const [name, setName] = useState('')
  const [profileData, setProfileData] = useState(null)
  const [profileFileName, setProfileFileName] = useState('')
  const fileInputRef = useRef(null)

  function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        setProfileData(data)
        setProfileFileName(file.name)
        if (data.name && !name) setName(data.name)
      } catch {
        alert('Invalid profile file. Please upload a valid JSON profile.')
      }
    }
    reader.readAsText(file)
  }

  function handleStart(e) {
    e.preventDefault()
    if (!name.trim()) return
    onStart({ name: name.trim(), profileData })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent)',
              marginBottom: '20px',
              fontSize: '24px',
            }}
          >
            💡
          </div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: '10px',
              letterSpacing: '-0.5px',
            }}
          >
            Find your business
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6' }}>
            A short AI interview that finds business ideas based on your actual skills,
            resources, and unfair advantages — not generic advice.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleStart}>
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="name"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
              }}
            >
              Your name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First name is fine"
              autoFocus
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text)',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Profile upload */}
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
              }}
            >
              Previous profile{' '}
              <span style={{ fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>
                (optional)
              </span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg-input)',
                border: `1px dashed ${profileData ? 'var(--success)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                color: profileData ? 'var(--success)' : 'var(--text-muted)',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'border-color 0.2s',
              }}
            >
              <span>{profileData ? '✓' : '+'}</span>
              <span>
                {profileData
                  ? `Loaded: ${profileFileName}`
                  : 'Upload last year\'s profile to pick up where you left off'}
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            style={{
              width: '100%',
              padding: '14px',
              background: name.trim() ? 'var(--accent)' : 'var(--border)',
              color: name.trim() ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '16px',
              fontWeight: '600',
              cursor: name.trim() ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s, transform 0.1s',
            }}
            onMouseEnter={(e) => {
              if (name.trim()) e.target.style.background = 'var(--accent-hover)'
            }}
            onMouseLeave={(e) => {
              if (name.trim()) e.target.style.background = 'var(--accent)'
            }}
          >
            Start the interview →
          </button>
        </form>

        <p
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--text-muted)',
          }}
        >
          10–15 questions · ~15 minutes · No signup required
        </p>
      </div>
    </div>
  )
}
