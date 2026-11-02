import React, { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { scheduleAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function AdminSchedule() {
  const toast = useToast()
  const [schedule, setSchedule] = useState(null)
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    scheduleAPI.get()
      .then(res => { setSchedule(res.data); setForm(res.data) })
      .finally(() => setLoading(false))
  }, [])

  const toggleDay = (day) => {
    setForm(p => ({
      ...p,
      workingDays: p.workingDays.includes(day)
        ? p.workingDays.filter(d => d !== day)
        : [...p.workingDays, day]
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await scheduleAPI.update(form)
      setSchedule(res.data)
      toast.success('Schedule updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save schedule')
    } finally {
      setSaving(false)
    }
  }

  // Generate preview slots
  const generateSlots = () => {
    if (!form) return []
    const slots = []
    const [oh, om] = form.openingTime.split(':').map(Number)
    const [ch, cm] = form.closingTime.split(':').map(Number)
    let cur = oh * 60 + om
    const end = ch * 60 + cm
    while (cur + form.slotDuration <= end) {
      const h = Math.floor(cur / 60), m = cur % 60
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
      cur += form.slotDuration
    }
    return slots
  }

  if (loading || !form) return <AppLayout title="Schedule"><LoadingSpinner text="Loading schedule…" /></AppLayout>

  const previewSlots = generateSlots()

  return (
    <AppLayout title="Schedule Management">
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>Schedule Management</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 3 }}>Configure working hours and appointment slots</p>
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : '💾 Save Changes'}
          </button>
        </div>

        <div className="two-col" style={{ marginBottom: 20 }}>
          {/* Working days */}
          <div className="card card-body">
            <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>📅 Working Days</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ALL_DAYS.map(day => (
                <label key={day} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 12px', borderRadius: 8, background: form.workingDays.includes(day) ? 'var(--primary-light)' : 'var(--gray-50)', border: `1.5px solid ${form.workingDays.includes(day) ? 'var(--primary)' : 'var(--gray-200)'}`, transition: 'all 0.15s' }}>
                  <input type="checkbox" checked={form.workingDays.includes(day)} onChange={() => toggleDay(day)} />
                  <span style={{ fontSize: 13, fontWeight: form.workingDays.includes(day) ? 600 : 400 }}>{day}</span>
                  {form.workingDays.includes(day) && <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--primary)' }}>✓ Working</span>}
                </label>
              ))}
            </div>
          </div>

          {/* Time & slot config */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card card-body">
              <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>⏰ Working Hours</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Opening Time</label>
                  <input className="form-control" type="time" value={form.openingTime}
                    onChange={e => setForm(p => ({ ...p, openingTime: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Closing Time</label>
                  <input className="form-control" type="time" value={form.closingTime}
                    onChange={e => setForm(p => ({ ...p, closingTime: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="card card-body">
              <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>⚙ Slot Configuration</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Slot Duration (minutes)</label>
                  <select className="form-control" value={form.slotDuration}
                    onChange={e => setForm(p => ({ ...p, slotDuration: parseInt(e.target.value) }))}>
                    {[15, 20, 30, 45, 60].map(v => <option key={v} value={v}>{v} minutes</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Max Appointments Per Slot</label>
                  <input className="form-control" type="number" min="1" max="10" value={form.maxAppointmentsPerSlot}
                    onChange={e => setForm(p => ({ ...p, maxAppointmentsPerSlot: parseInt(e.target.value) || 1 }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Avg. Service Time (minutes)</label>
                  <input className="form-control" type="number" min="1" max="60" value={form.averageServiceTime}
                    onChange={e => setForm(p => ({ ...p, averageServiceTime: parseInt(e.target.value) || 5 }))} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slot preview */}
        <div className="card card-body">
          <h3 style={{ fontWeight: 600, marginBottom: 6, fontSize: 15 }}>👁 Slot Preview ({previewSlots.length} slots/day)</h3>
          <p style={{ color: 'var(--gray-500)', fontSize: 12, marginBottom: 16 }}>Based on your current configuration</p>
          {previewSlots.length > 0 ? (
            <div className="slot-grid">
              {previewSlots.map(slot => (
                <div key={slot} className="slot-btn available" style={{ background: 'var(--primary-light)', borderColor: 'var(--primary)', color: 'var(--primary-dark)', cursor: 'default' }}>{slot}</div>
              ))}
            </div>
          ) : (
            <div className="alert alert-warning">No valid slots with current configuration. Check your opening/closing times and slot duration.</div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
