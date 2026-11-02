import React, { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { notificationsAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

const typeIcon = { success: '✅', warning: '⚠️', info: 'ℹ️', error: '❌' }
const typeBg = { success: 'var(--success-light)', warning: 'var(--warning-light)', info: 'var(--primary-light)', error: 'var(--danger-light)' }
const fmtTime = (iso) => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function Notifications() {
  const toast = useToast()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    notificationsAPI.getAll().then(res => setNotifications(res.data)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const markRead = async (id) => {
    await notificationsAPI.markRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = async () => {
    await notificationsAPI.markAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('All notifications marked as read')
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) return <AppLayout title="Notifications"><LoadingSpinner text="Loading…" /></AppLayout>

  return (
    <AppLayout title="Notifications">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>Notifications</h1>
            {unreadCount > 0 && <p style={{ color: 'var(--primary)', fontSize: 13, marginTop: 3 }}>{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={markAllRead}>✓ Mark All Read</button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState icon="🔔" title="No notifications" message="You'll see appointment updates and queue alerts here" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                style={{
                  display: 'flex', gap: 14, padding: '14px 18px',
                  background: n.read ? '#fff' : typeBg[n.type] || 'var(--primary-light)',
                  borderRadius: 12, border: `1px solid ${n.read ? 'var(--gray-100)' : 'transparent'}`,
                  cursor: n.read ? 'default' : 'pointer', transition: 'all 0.15s',
                  boxShadow: n.read ? 'none' : 'var(--shadow-sm)'
                }}
              >
                <div style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{typeIcon[n.type]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <p style={{ fontWeight: n.read ? 500 : 700, fontSize: 14, color: 'var(--gray-900)' }}>{n.title}</p>
                    {!n.read && <div className="notif-dot" style={{ flexShrink: 0, marginTop: 5 }} />}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 4, lineHeight: 1.5 }}>{n.message}</p>
                  <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 6 }}>{fmtTime(n.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
