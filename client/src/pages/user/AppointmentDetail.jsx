import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import StatusBadge from '../../components/common/StatusBadge'
import ConfirmModal from '../../components/common/ConfirmModal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { appointmentsAPI, servicesAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

const fmt = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'
const fmtShort = (iso) => iso ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

export default function AppointmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const [apt, setApt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCancel, setShowCancel] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [showReschedule, setShowReschedule] = useState(searchParams.get('reschedule') === '1')
  const [slots, setSlots] = useState([])
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' })
  const [rescheduleLoading, setRescheduleLoading] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    appointmentsAPI.getById(id)
      .then(res => setApt(res.data))
      .catch(() => navigate('/appointments'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (rescheduleForm.date && apt) {
      setLoadingSlots(true)
      appointmentsAPI.getSlots({ date: rescheduleForm.date, serviceId: apt.serviceId })
        .then(res => setSlots(res.data.slots || []))
        .catch(() => setSlots([]))
        .finally(() => setLoadingSlots(false))
    }
  }, [rescheduleForm.date])

  const handleCancel = async () => {
    setCancelLoading(true)
    try {
      await appointmentsAPI.cancel(id)
      toast.success('Appointment cancelled')
      setShowCancel(false)
      setApt(prev => ({ ...prev, status: 'Cancelled' }))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel')
    } finally {
      setCancelLoading(false)
    }
  }

  const handleReschedule = async () => {
    if (!rescheduleForm.date || !rescheduleForm.time) { toast.error('Select date and time'); return }
    setRescheduleLoading(true)
    try {
      const res = await appointmentsAPI.update(id, rescheduleForm)
      toast.success('Appointment rescheduled successfully')
      setApt(res.data)
      setShowReschedule(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reschedule')
    } finally {
      setRescheduleLoading(false)
    }
  }

  if (loading) return <AppLayout title="Appointment Details"><LoadingSpinner text="Loading…" /></AppLayout>
  if (!apt) return null

  const canModify = apt.status === 'Scheduled'

  return (
    <AppLayout title="Appointment Details">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/appointments')}>← Back</button>
          <div style={{ display: 'flex', gap: 8 }}>
            {canModify && <>
              <button className="btn btn-outline btn-sm" onClick={() => setShowReschedule(true)}>Reschedule</button>
              <button className="btn btn-danger btn-sm" onClick={() => setShowCancel(true)}>Cancel</button>
            </>}
          </div>
        </div>

        <div className="card card-body" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700 }}>{apt.service}</h1>
              <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 14, marginTop: 4 }}>{apt.id}</p>
            </div>
            <StatusBadge status={apt.status} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: '📆 Appointment Date', value: fmt(apt.date) },
              { label: '🕐 Time', value: apt.time },
              { label: '🔢 Queue Number', value: apt.queueNumber || 'Not assigned yet' },
              { label: '📝 Reason', value: apt.reason || 'Not specified' },
              { label: '📅 Booked On', value: fmtShort(apt.createdAt) },
              { label: '🔄 Last Updated', value: fmtShort(apt.updatedAt) },
            ].map(row => (
              <div key={row.label} style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 8 }}>
                <p style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 4 }}>{row.label}</p>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{row.value}</p>
              </div>
            ))}
          </div>

          {apt.queueNumber && apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
            <div style={{ marginTop: 16, padding: 16, background: 'var(--primary-light)', borderRadius: 10, textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 4 }}>Your Queue Number</p>
              <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{apt.queueNumber}</div>
              <button className="btn btn-outline btn-sm" style={{ marginTop: 10 }} onClick={() => navigate('/queue/track')}>Track Live →</button>
            </div>
          )}
        </div>

        {apt.status === 'Completed' && (
          <div className="alert alert-success">✅ This appointment has been completed. Thank you for visiting us!</div>
        )}
        {apt.status === 'Cancelled' && (
          <div className="alert alert-error">❌ This appointment was cancelled.</div>
        )}
      </div>

      {showCancel && (
        <ConfirmModal
          title="Cancel Appointment"
          message={`Cancel ${apt.id} for ${apt.service} on ${fmt(apt.date)}? This cannot be undone.`}
          confirmText="Yes, Cancel"
          onConfirm={handleCancel}
          onCancel={() => setShowCancel(false)}
          loading={cancelLoading}
        />
      )}

      {showReschedule && (
        <div className="modal-overlay" onClick={() => setShowReschedule(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reschedule Appointment</h2>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setShowReschedule(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">New Date *</label>
                <input className="form-control" type="date" min={today}
                  value={rescheduleForm.date} onChange={e => setRescheduleForm(p => ({ ...p, date: e.target.value, time: '' }))} />
              </div>
              {rescheduleForm.date && (
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: 8 }}>New Time Slot *</label>
                  {loadingSlots ? <LoadingSpinner size={24} /> : slots.length === 0 ? (
                    <div className="alert alert-warning">No slots available.</div>
                  ) : (
                    <div className="slot-grid">
                      {slots.map(slot => (
                        <button key={slot.time}
                          className={`slot-btn ${!slot.available ? 'unavailable' : rescheduleForm.time === slot.time ? 'selected' : 'available'}`}
                          onClick={() => slot.available && setRescheduleForm(p => ({ ...p, time: slot.time }))}
                          disabled={!slot.available}>
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowReschedule(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleReschedule} disabled={!rescheduleForm.date || !rescheduleForm.time || rescheduleLoading}>
                {rescheduleLoading ? 'Saving…' : 'Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
