import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.username || !form.password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    try {
      const user = await login(form.username, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role) => {
    setForm({ username: role, password: '123' })
    setError('')
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0F172A 0%, #0C4A6E 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      {/* Background decorations */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(14,165,233,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(13,148,136,0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, background: 'var(--primary)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>🏥</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 6 }}>QueueCare</h1>
          <p style={{ color: '#94A3B8', fontSize: 14 }}>Online Appointment & Queue Management</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: 'var(--gray-900)' }}>Sign In</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 24 }}>Enter your credentials to continue</p>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-control"
                type="text"
                placeholder="Enter username"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-control"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', fontSize: 16 }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 4, padding: '11px', fontSize: 15, justifyContent: 'center' }}>
              {loading ? 'Signing in…' : '🔐 Sign In'}
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <div className="card" style={{ marginTop: 16, padding: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Demo Credentials
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { role: 'admin', label: 'Admin', icon: '👑', color: 'var(--primary)' },
              { role: 'user', label: 'Patient', icon: '👤', color: 'var(--teal)' },
            ].map(d => (
              <button key={d.role} onClick={() => fillDemo(d.role)}
                style={{
                  padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--gray-200)',
                  background: 'var(--gray-50)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = d.color; e.currentTarget.style.background = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.background = 'var(--gray-50)' }}
              >
                <div style={{ fontSize: 18, marginBottom: 4 }}>{d.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{d.label}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 1 }}>
                  {d.role} / 123
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
