import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { servicesAPI, queueAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function JoinQueue() {
  const navigate = useNavigate()
  const toast = useToast()
  const [services, setServices] = useState([])
  const [myQueue, setMyQueue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [selectedService, setSelectedService] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([servicesAPI.getActive(), queueAPI.getMyQueue()])
      .then(([svc, q]) => { setServices(svc.data); if (q.data.inQueue) setMyQueue(q.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleJoin = async () => {
    if (!selectedService) { setError('Please select a service.'); return }
    setError('')
    setJoining(true)
    try {
      const res = await queueAPI.join({ serviceId: selectedService })
      toast.success(`Joined queue! Your number is ${res.data.entry.queueNumber}`)
      setMyQueue({ inQueue: true, entry: res.data.entry, position: res.data.position, estimatedWait: res.data.estimatedWait })
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to join queue'
      if (err.response?.data?.entry) {
        setMyQueue({ inQueue: true, entry: err.response.data.entry })
      }
      toast.error(msg)
    } finally {
      setJoining(false)
    }
  }

  if (loading) return <AppLayout title="Join Queue"><LoadingSpinner text="Loading…" /></AppLayout>

  return (
    <AppLayout title="Join Queue">
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        {myQueue?.inQueue ? (
          <div style={{ textAlign: 'center' }}>
            <div className="card card-body" style={{ marginBottom: 16 }}>
              <div className="now-serving-badge" style={{ justifyContent: 'center', marginBottom: 20 }}>
                ✓ YOU ARE IN THE QUEUE
              </div>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 8 }}>Your Queue Number</p>
              <div className="queue-number-display">{myQueue.entry?.queueNumber}</div>
              <p style={{ color: 'var(--gray-600)', marginTop: 12, fontWeight: 500 }}>{myQueue.entry?.service}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 20 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--warning)' }}>{myQueue.position ?? '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Position</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--teal)' }}>{myQueue.estimatedWait ?? '—'} min</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Est. Wait</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/queue/track')}>📡 Track Live</button>
              <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>← Dashboard</button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700 }}>Join Walk-In Queue</h1>
              <p style={{ color: 'var(--gray-500)', marginTop: 4, fontSize: 14 }}>
                No appointment? Join the walk-in queue and we'll serve you in order.
              </p>
            </div>

            <div className="card card-body" style={{ marginBottom: 16 }}>
              <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Select Service</h3>
              {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>⚠ {error}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {services.map(s => (
                  <label key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                    border: `2px solid ${selectedService === s.id ? 'var(--primary)' : 'var(--gray-200)'}`,
                    borderRadius: 10, cursor: 'pointer', background: selectedService === s.id ? 'var(--primary-light)' : '#fff', transition: 'all 0.15s'
                  }}>
                    <input type="radio" name="service" value={s.id} checked={selectedService === s.id}
                      onChange={() => setSelectedService(s.id)} style={{ display: 'none' }} />
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: s.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🩺</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>⏱ Approx. {s.duration} mins</p>
                    </div>
                    {selectedService === s.id && <span style={{ color: 'var(--primary)', fontSize: 18 }}>✓</span>}
                  </label>
                ))}
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }}
                onClick={handleJoin} disabled={joining || !selectedService}>
                {joining ? 'Joining…' : '🔢 Join Queue Now'}
              </button>
            </div>

            <div className="card card-body" style={{ background: 'var(--primary-light)', border: '1px solid #BAE6FD' }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-dark)', marginBottom: 8 }}>ℹ How it works</h4>
              <ul style={{ paddingLeft: 18, color: 'var(--gray-600)', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Select your service and join the queue</li>
                <li>You'll get a unique queue number</li>
                <li>Wait for your number to be called</li>
                <li>Track your position on the live queue screen</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
