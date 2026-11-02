import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)', flexDirection: 'column', gap: 16, padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 80 }}>🔍</div>
      <h1 style={{ fontSize: 48, fontWeight: 800, color: 'var(--gray-900)' }}>404</h1>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--gray-700)' }}>Page Not Found</h2>
      <p style={{ color: 'var(--gray-500)', maxWidth: 360 }}>The page you're looking for doesn't exist or you don't have permission to view it.</p>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>← Go Back</button>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>🏠 Home</button>
      </div>
    </div>
  )
}
