import React from 'react'

export default function LoadingSpinner({ size = 36, text }) {
  return (
    <div className="loading-wrap" style={{ flexDirection: 'column', gap: 12 }}>
      <div className="spinner" style={{ width: size, height: size }} />
      {text && <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>{text}</p>}
    </div>
  )
}
