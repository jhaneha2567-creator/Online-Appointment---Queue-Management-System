import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { servicesAPI, appointmentsAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function BookAppointment() {
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState(1)
  const [services, setServices] = useState([])
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ serviceId: '', date: '', time: '', reason: '' })

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    servicesAPI.getActive().then(res => setServices(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (form.date && form.serviceId) {
      setLoadingSlots(true)
      setForm(p => ({ ...p, time: '' }))
      appointmentsAPI.getSlots({ date: form.date, serviceId: form.serviceId })
        .then(res => setSlots(res.data.slots || []))
        .catch(() => setSlots([]))
        .finally(() => setLoadingSlots(false))
    }
  }, [form.date, form.serviceId])

  const selectedService = services.find(s => s.id === form.serviceId)

  const handleSubmit = async () => {
    if (!form.serviceId || !form.date || !form.time) { setError('Please fill all required fields.'); return }
    setError('')
    setLoadingSubmit(true)
    try {
      const res = await appointmentsAPI.create(form)
      toast.success(`Appointment ${res.data.id} booked successfully!`)
      navigate('/appointments')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book appointment.')
    } finally {
      setLoadingSubmit(false)
    }
  }

  return (
    <AppLayout title="Book Appointment">
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Progress steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
          {['Select Service', 'Choose Date & Time', 'Confirm'].map((label, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: i < 2 ? 0 : 1 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 14, transition: 'all 0.2s',
                  background: step > i + 1 ? 'var(--success)' : step === i + 1 ? 'var(--primary)' : 'var(--gray-200)',
                  color: step >= i + 1 ? '#fff' : 'var(--gray-500)',
                }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 11, marginTop: 4, color: step === i + 1 ? 'var(--primary)' : 'var(--gray-400)', fontWeight: step === i + 1 ? 600 : 400, whiteSpace: 'nowrap' }}>{label}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? 'var(--success)' : 'var(--gray-200)', margin: '0 8px', marginBottom: 20 }} />}
            </React.Fragment>
          ))}
        </div>

        <div className="card card-body">
          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠ {error}</div>}

          {/* Step 1: Service */}
          {step === 1 && (
            <div>
              <h2 style={{ fontWeight: 700, marginBottom: 6 }}>Select a Service</h2>
              <p style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 20 }}>Choose the type of consultation you need</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 12 }}>
                {services.map(s => (
                  <div key={s.id}
                    onClick={() => setForm(p => ({ ...p, serviceId: s.id }))}
                    style={{
                      padding: 18, borderRadius: 10, border: `2px solid ${form.serviceId === s.id ? s.color : 'var(--gray-200)'}`,
                      cursor: 'pointer', background: form.serviceId === s.id ? s.color + '15' : '#fff', transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 11, background: s.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 22 }}>🩺</span>
                    </div>
                    <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-900)', marginBottom: 4 }}>{s.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--gray-500)' }}>⏱ {s.duration} mins</p>
                    {s.description && <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>{s.description}</p>}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button className="btn btn-primary" disabled={!form.serviceId} onClick={() => setStep(2)}>Next →</button>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div>
              <h2 style={{ fontWeight: 700, marginBottom: 6 }}>Choose Date & Time</h2>
              <p style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 20 }}>Select a date and available time slot</p>
              <div className="form-grid" style={{ marginBottom: 20 }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input className="form-control" type="date" min={today} value={form.date}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Reason (optional)</label>
                  <input className="form-control" placeholder="Brief description…" value={form.reason}
                    onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} />
                </div>
              </div>

              {form.date && (
                <div>
                  <label className="form-label" style={{ display: 'block', marginBottom: 10 }}>Available Slots *</label>
                  {loadingSlots ? (
                    <LoadingSpinner size={24} text="Loading slots…" />
                  ) : slots.length === 0 ? (
                    <div className="alert alert-warning">No slots available for this date.</div>
                  ) : (
                    <div className="slot-grid">
                      {slots.map(slot => (
                        <button key={slot.time}
                          className={`slot-btn ${!slot.available ? 'unavailable' : form.time === slot.time ? 'selected' : 'available'}`}
                          onClick={() => slot.available && setForm(p => ({ ...p, time: slot.time }))}
                          disabled={!slot.available}
                        >
                          {slot.time}
                          {!slot.available && <div style={{ fontSize: 10, marginTop: 2 }}>Full</div>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" disabled={!form.date || !form.time} onClick={() => setStep(3)}>Next →</button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div>
              <h2 style={{ fontWeight: 700, marginBottom: 6 }}>Confirm Appointment</h2>
              <p style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 24 }}>Review your booking details before confirming</p>
              <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                {[
                  { label: 'Service', value: selectedService?.name },
                  { label: 'Duration', value: `${selectedService?.duration} minutes` },
                  { label: 'Date', value: form.date ? new Date(form.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                  { label: 'Time', value: form.time },
                  { label: 'Reason', value: form.reason || 'Not specified' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <span style={{ fontSize: 13, color: 'var(--gray-500)', flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="alert alert-info" style={{ marginBottom: 20 }}>
                ℹ Your queue number will be assigned on the day of your appointment.
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn btn-secondary" onClick={() => setStep(2)} disabled={loadingSubmit}>← Back</button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={loadingSubmit}>
                  {loadingSubmit ? 'Booking…' : '✓ Confirm Booking'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
