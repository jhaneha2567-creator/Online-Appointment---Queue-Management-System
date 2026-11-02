import React, { useEffect, useState, useCallback } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import StatusBadge from '../../components/common/StatusBadge'
import ConfirmModal from '../../components/common/ConfirmModal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { queueAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

const REFRESH = 6000

export default function AdminQueue() {
  const toast = useToast()
  const [queueData, setQueueData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [callLoading, setCallLoading] = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [removeLoading, setRemoveLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  const refresh = useCallback(() => {
    queueAPI.getQueue()
      .then(res => { setQueueData(res.data); setLastUpdated(new Date()) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refresh()
    const t = setInterval(refresh, REFRESH)
    return () => clearInterval(t)
  }, [refresh])

  const handleCallNext = async () => {
    setCallLoading(true)
    try {
      const res = await queueAPI.callNext()
      toast.success(res.data.message || 'Called next customer')
      refresh()
    } catch (err) {
      toast.error(err.response?.data?.error || 'No customers waiting')
    } finally {
      setCallLoading(false)
    }
  }

  const handleMarkComplete = async (entry) => {
    try {
      await queueAPI.updateEntry(entry.id, { status: 'Completed' })
      toast.success(`${entry.queueNumber} marked as completed`)
      refresh()
    } catch (err) {
      toast.error('Failed to update')
    }
  }

  const handleRecall = async (entry) => {
    try {
      await queueAPI.updateEntry(entry.id, { status: 'In Progress' })
      toast.success(`${entry.queueNumber} recalled`)
      refresh()
    } catch (err) {
      toast.error('Failed to recall')
    }
  }

  const handleRemove = async () => {
    setRemoveLoading(true)
    try {
      await queueAPI.remove(removeTarget.id)
      toast.success(`${removeTarget.queueNumber} removed from queue`)
      setRemoveTarget(null)
      refresh()
    } catch (err) {
      toast.error('Failed to remove')
    } finally {
      setRemoveLoading(false)
    }
  }

  if (loading) return <AppLayout title="Queue Management"><LoadingSpinner text="Loading queue…" /></AppLayout>

  const { nowServing, waiting, completed, totalToday } = queueData || {}

  return (
    <AppLayout title="Queue Management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Queue Management</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 3 }}>
            Auto-refreshes · {lastUpdated && `Updated: ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={refresh}>🔄 Refresh</button>
          <button className="btn btn-primary" onClick={handleCallNext} disabled={callLoading}>
            {callLoading ? 'Calling…' : '▶ Call Next Customer'}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Today', value: totalToday || 0, color: '#0EA5E9', bg: '#E0F2FE' },
          { label: 'Waiting', value: waiting?.length || 0, color: '#F59E0B', bg: '#FEF3C7' },
          { label: 'Completed', value: completed?.length || 0, color: '#10B981', bg: '#D1FAE5' },
          { label: 'In Service', value: nowServing ? 1 : 0, color: '#6366F1', bg: '#EEF2FF' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Now serving */}
      <div style={{ marginBottom: 20, background: 'linear-gradient(135deg, #0F172A, #0C4A6E)', borderRadius: 16, padding: '24px 28px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="now-serving-badge" style={{ marginBottom: 12 }}>● NOW SERVING</div>
          {nowServing ? (
            <>
              <div style={{ fontSize: 64, fontWeight: 900, color: '#38BDF8', lineHeight: 1, letterSpacing: -2 }}>{nowServing.queueNumber}</div>
              <p style={{ color: '#94A3B8', marginTop: 8 }}>{nowServing.service}</p>
            </>
          ) : (
            <div style={{ fontSize: 20, fontWeight: 600, color: '#94A3B8' }}>Queue is idle</div>
          )}
        </div>
        {nowServing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-success" onClick={() => handleMarkComplete(nowServing)}>✅ Mark Completed</button>
            <button className="btn btn-warning" onClick={() => handleRecall(nowServing)}>🔄 Recall</button>
            <button className="btn btn-danger" onClick={() => setRemoveTarget(nowServing)}>✕ Remove</button>
          </div>
        )}
      </div>

      <div className="two-col">
        {/* Waiting queue */}
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)' }}>
            <h3 style={{ fontWeight: 600, fontSize: 15 }}>⏳ Waiting Queue ({waiting?.length || 0})</h3>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {waiting?.length > 0 ? waiting.map((entry, idx) => (
              <div key={entry.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                borderRadius: 10, background: idx === 0 ? '#F0FDF4' : 'var(--gray-50)',
                border: `1px solid ${idx === 0 ? '#6EE7B7' : 'var(--gray-200)'}`,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: idx === 0 ? 'var(--success)' : 'var(--gray-200)', color: idx === 0 ? '#fff' : 'var(--gray-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 16 }}>{entry.queueNumber}</p>
                  <p style={{ fontSize: 11, color: 'var(--gray-500)' }}>{entry.service}</p>
                </div>
                <div style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 500 }}>{entry.estimatedWait}m</div>
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => setRemoveTarget(entry)} title="Remove">✕</button>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--gray-400)' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
                <p>No customers waiting</p>
              </div>
            )}
          </div>
        </div>

        {/* Completed today */}
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)' }}>
            <h3 style={{ fontWeight: 600, fontSize: 15 }}>✅ Completed Today ({completed?.length || 0})</h3>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
            {completed?.length > 0 ? completed.slice().reverse().map(entry => (
              <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, background: 'var(--success-light)', opacity: 0.85 }}>
                <span style={{ fontSize: 18 }}>✅</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--gray-700)' }}>{entry.queueNumber}</p>
                  <p style={{ fontSize: 11, color: 'var(--gray-500)' }}>{entry.service}</p>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--gray-400)' }}>
                <p style={{ fontSize: 13 }}>No completed entries yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {removeTarget && (
        <ConfirmModal
          title="Remove from Queue"
          message={`Remove ${removeTarget.queueNumber} (${removeTarget.service}) from the queue?`}
          confirmText="Remove"
          onConfirm={handleRemove}
          onCancel={() => setRemoveTarget(null)}
          loading={removeLoading}
        />
      )}
    </AppLayout>
  )
}
