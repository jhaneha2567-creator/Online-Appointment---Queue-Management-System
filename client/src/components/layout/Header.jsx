import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { notificationsAPI } from '../../services/api'

export default function Header({ onMenuClick, title }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    notificationsAPI.getAll()
      .then(res => setUnread(res.data.filter(n => !n.read).length))
      .catch(() => {})
    const interval = setInterval(() => {
      notificationsAPI.getAll()
        .then(res => setUnread(res.data.filter(n => !n.read).length))
        .catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="top-header">
      <div className="flex items-center gap-3">
        <button className="btn btn-secondary btn-icon" onClick={onMenuClick} style={{ display: 'none' }} id="menu-btn">
          ☰
        </button>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-800)' }}>{title || 'Dashboard'}</h2>
          <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="btn btn-secondary btn-icon"
          onClick={() => navigate('/notifications')}
          style={{ position: 'relative' }}
          title="Notifications"
        >
          🔔
          {unread > 0 && (
            <span className="notif-count" style={{ position: 'absolute', top: -4, right: -4, fontSize: 9, padding: '1px 4px' }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
          <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
            {user?.name?.[0] || 'U'}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)' }}>{user?.name}</span>
        </div>
      </div>
    </header>
  )
}
