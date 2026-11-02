import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import { queueAPI } from '../../services/api'

const REFRESH_INTERVAL = 5000

export default function TrackQueue() {
  const navigate = useNavigate()
  const [queueData, setQueueData] = useState(null)
  const [myQueue, setMyQueue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  const refresh = useCallback(() => {
    Promise.all([queueAPI.getQueue(), queueAPI.getMyQueue()])
      .then(([q, my]) => {
        setQueueData(q.data)
        setMyQueue(my.data)
        setLastUpdated(new Date())
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [refresh])

  if (loading) return <AppLayout title="Live Queue Tracker"><LoadingSpinner text="Loading queue…" /></AppLayout>

  const { nowServing, waiting, completed } = queueData || {}
  const isInQueue = myQueue?.inQueue

  return (
    <AppLayout title="Live Queue Tracker">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>Live Queue Tracker</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 3 }}>
              Auto-refreshes every {REFRESH_INTERVAL / 1000}s
              {lastUpdated && ` · Last updated: ${lastUpdated.toLocaleTimeString()}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={refresh}>🔄 Refresh</button>
            {!isInQueue && <button className="btn btn-primary btn-sm" onClick={() => navigate('/queue')}>+ Join Queue</button>}
          </div>
        </div>

        {/* Now Serving */}
        <div className="card card-body" style={{ marginBottom: 20, background: 'linear-gradient(135deg, #0F172A, #0C4A6E)', color: '#fff' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="now-serving-badge" style={{ justifyContent: 'center', marginBottom: 16 }}>
              <span style={{ animation: 'pulse 2s infinite' }}>●</span> NOW SERVING
            </div>
            {nowServing ? (
              <>
                <div style={{ fontSize: 80, fontWeight: 900, color: '#38BDF8', lineHeight: 1, letterSpacing: -2 }}>
                  {nowServing.queueNumber}
                </div>
                <p style={{ color: '#94A3B8', marginTop: 10, fontSize: 14 }}>{nowServing.service}</p>
              </>
            ) : (
              <div style={{ fontSize: 20, fontWeight: 600, color: '#94A3B8', padding: '20px 0' }}>
                No one being served right now
              </div>
            )}
          </div>
        </div>

        {/* My status */}
        {isInQueue && (
          <div className="card card-body" style={{ marginBottom: 20, borderLeft: '4px solid var(--primary)' }}>
            <h3 style={{ fontWeight: 600, marginBottom: 16, color: 'var(--primary)' }}>📡 Your Status</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px,1fr))', gap: 12 }}>
              <div style={{ textAlign: 'center', padding: 12, background: 'var(--primary-light)', borderRadius: 10 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>{myQueue.entry?.queueNumber}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 3 }}>Your Number</div>
              </div>
              <div style={{ textAlign: 'center', padding: 12, background: 'var(--warning-light)', borderRadius: 10 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--warning)' }}>{myQueue.peopleAhead}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 3 }}>People Ahead</div>
              </div>
              <div style={{ textAlign: 'center', padding: 12, background: 'var(--teal-light)', borderRadius: 10 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--teal)' }}>{myQueue.estimatedWait}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 3 }}>Min Wait</div>
              </div>
              <div style={{ textAlign: 'center', padding: 12, background: 'var(--success-light)', borderRadius: 10 }}>
                <StatusBadge status={myQueue.entry?.status} />
                <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 6 }}>Status</div>
              </div>
            </div>
            {myQueue.entry?.status === 'In Progress' && (
              <div className="alert alert-success" style={{ marginTop: 14 }}>
                🎉 It's your turn! Please proceed to the service counter.
              </div>
            )}
          </div>
        )}

        <div className="two-col">
          {/* Waiting list */}
          <div className="card">
            <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 600, fontSize: 14 }}>⏳ Waiting ({waiting?.length || 0})</h3>
            </div>
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 360, overflowY: 'auto' }}>
              {waiting?.length > 0 ? waiting.map((entry, idx) => (
                <div key={entry.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 8, background: isInQueue && myQueue.entry?.id === entry.id ? 'var(--primary-light)' : idx === 0 ? 'var(--success-light)' : 'var(--gray-50)',
                  border: isInQueue && myQueue.entry?.id === entry.id ? '2px solid var(--primary)' : '1px solid transparent'
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: idx === 0 ? 'var(--success)' : 'var(--gray-200)', color: idx === 0 ? '#fff' : 'var(--gray-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--gray-900)' }}>{entry.queueNumber}</p>
                    <p style={{ fontSize: 11, color: 'var(--gray-500)' }}>{entry.service}</p>
                  </div>
                  {isInQueue && myQueue.entry?.id === entry.id && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', background: 'rgba(14,165,233,0.1)', padding: '2px 8px', borderRadius: 10 }}>YOU</span>
                  )}
                  <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{entry.estimatedWait}m</span>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--gray-400)' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  <p style={{ fontSize: 13 }}>Queue is empty</p>
                </div>
              )}
            </div>
          </div>

          {/* Completed */}
          <div className="card">
            <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--gray-100)' }}>
              <h3 style={{ fontWeight: 600, fontSize: 14 }}>✅ Completed Today ({completed?.length || 0})</h3>
            </div>
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 360, overflowY: 'auto' }}>
              {completed?.length > 0 ? completed.slice().reverse().map(entry => (
                <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: 'var(--gray-50)', opacity: 0.7 }}>
                  <div style={{ fontSize: 18 }}>✅</div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--gray-700)' }}>{entry.queueNumber}</p>
                    <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>{entry.service}</p>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--gray-400)' }}>
                  <p style={{ fontSize: 13 }}>No completed entries yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
