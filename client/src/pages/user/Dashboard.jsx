import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import StatCard from '../../components/common/StatCard'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { dashboardAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function UserDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.userDashboard()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <AppLayout title="Dashboard"><LoadingSpinner text="Loading dashboard…" /></AppLayout>

  const { upcoming, myQueue, queuePosition, estimatedWait, stats, recentNotifications } = data || {}

  return (
    <AppLayout title="Dashboard">
      {/* Welcome */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)' }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>Here's an overview of your health appointments</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard icon="📅" label="Total Appointments" value={stats?.total ?? 0} color="#0EA5E9" bg="#E0F2FE" />
        <StatCard icon="✅" label="Completed" value={stats?.completed ?? 0} color="#10B981" bg="#D1FAE5" />
        <StatCard icon="❌" label="Cancelled" value={stats?.cancelled ?? 0} color="#EF4444" bg="#FEE2E2" />
        <StatCard icon="🗓️" label="Upcoming" value={stats?.upcoming ?? 0} color="#8B5CF6" bg="#EDE9FE" />
      </div>

      <div className="two-col" style={{ marginBottom: 24 }}>
        {/* Upcoming appointment */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px 12px' }}>
            <h3 style={{ fontWeight: 600, fontSize: 15 }}>📅 Next Appointment</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/appointments')}>View All</button>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            {upcoming ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: '16px', background: 'var(--primary-light)', borderRadius: 10, borderLeft: '4px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>{upcoming.service}</p>
                      <p style={{ color: 'var(--gray-600)', fontSize: 13, marginTop: 3 }}>{upcoming.id}</p>
                    </div>
                    <StatusBadge status={upcoming.status} />
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>📆 {fmt(upcoming.date)}</span>
                    <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>🕐 {upcoming.time}</span>
                  </div>
                  {upcoming.reason && <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 8 }}>{upcoming.reason}</p>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/appointments/${upcoming.id}`)}>View Details</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/appointments')}>Reschedule</button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--gray-400)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
                <p style={{ fontWeight: 500, color: 'var(--gray-600)', marginBottom: 4 }}>No upcoming appointments</p>
                <p style={{ fontSize: 12 }}>Book one to get started</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={() => navigate('/appointments/book')}>Book Now</button>
              </div>
            )}
          </div>
        </div>

        {/* Queue status */}
        <div className="card">
          <div className="card-header" style={{ padding: '18px 22px 12px' }}>
            <h3 style={{ fontWeight: 600, fontSize: 15 }}>🔢 Today's Queue Status</h3>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            {myQueue ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Your Queue Number</p>
                <div className="queue-number-display">{myQueue.queueNumber}</div>
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 24 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--warning)' }}>{queuePosition}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Position</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--teal)' }}>{estimatedWait}m</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Est. Wait</div>
                  </div>
                </div>
                <StatusBadge status={myQueue.status} />
                <div style={{ marginTop: 14 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => navigate('/queue/track')}>Live Track →</button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--gray-400)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔢</div>
                <p style={{ fontWeight: 500, color: 'var(--gray-600)', marginBottom: 4 }}>Not in queue today</p>
                <p style={{ fontSize: 12 }}>Join the walk-in queue if you're here</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={() => navigate('/queue')}>Join Queue</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="two-col">
        {/* Quick actions */}
        <div className="card card-body">
          <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>⚡ Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { icon: '📅', label: 'Book Appointment', path: '/appointments/book', color: 'var(--primary)', bg: 'var(--primary-light)' },
              { icon: '🔢', label: 'Join Queue', path: '/queue', color: 'var(--teal)', bg: 'var(--teal-light)' },
              { icon: '📋', label: 'My Appointments', path: '/appointments', color: '#8B5CF6', bg: '#EDE9FE' },
              { icon: '📡', label: 'Track Queue', path: '/queue/track', color: 'var(--warning)', bg: 'var(--warning-light)' },
            ].map(a => (
              <button key={a.path} onClick={() => navigate(a.path)}
                style={{
                  padding: '14px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: a.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  transition: 'all 0.15s', fontFamily: 'inherit'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <span style={{ fontSize: 22 }}>{a.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: a.color }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent notifications */}
        <div className="card card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 600, fontSize: 15 }}>🔔 Recent Notifications</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/notifications')}>See All</button>
          </div>
          {recentNotifications?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentNotifications.map(n => (
                <div key={n.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: n.type === 'success' ? 'var(--success-light)' : n.type === 'warning' ? 'var(--warning-light)' : 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                    {n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : 'ℹ️'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: 'var(--gray-800)', lineHeight: 1.4 }}>{n.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <div className="notif-dot" />}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--gray-400)' }}>
              <div style={{ fontSize: 32 }}>🔔</div>
              <p style={{ fontSize: 12, marginTop: 8 }}>No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
