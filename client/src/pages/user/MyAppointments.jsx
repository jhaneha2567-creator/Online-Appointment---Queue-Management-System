import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import StatusBadge from '../../components/common/StatusBadge'
import ConfirmModal from '../../components/common/ConfirmModal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { appointmentsAPI, servicesAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

const fmt = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

export default function MyAppointments() {
  const navigate = useNavigate()
  const toast = useToast()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    appointmentsAPI.getAll().then(res => setAppointments(res.data)).catch(console.error).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleCancel = async () => {
    setCancelLoading(true)
    try {
      await appointmentsAPI.cancel(cancelTarget.id)
      toast.success('Appointment cancelled successfully')
      setCancelTarget(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel')
    } finally {
      setCancelLoading(false)
    }
  }

  const filtered = appointments.filter(a => {
    const matchStatus = !statusFilter || a.status === statusFilter
    const matchSearch = !search || a.id.toLowerCase().includes(search.toLowerCase()) || a.service.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <AppLayout title="My Appointments">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>My Appointments</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 3 }}>{appointments.length} total appointments</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/appointments/book')}>+ Book New</button>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <div className="search-bar" style={{ flex: 1, maxWidth: 300 }}>
          <span>🔍</span>
          <input placeholder="Search by ID or service…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['Scheduled', 'Waiting', 'In Progress', 'Completed', 'Cancelled'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? <LoadingSpinner text="Loading appointments…" /> : filtered.length === 0 ? (
        <EmptyState icon="📅" title="No appointments found" message="Book your first appointment to get started"
          action={<button className="btn btn-primary" onClick={() => navigate('/appointments/book')}>Book Appointment</button>} />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Queue No.</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(apt => (
                <tr key={apt.id}>
                  <td><span style={{ fontWeight: 600, color: 'var(--primary)' }}>{apt.id}</span></td>
                  <td>{apt.service}</td>
                  <td>{fmt(apt.date)}</td>
                  <td>{apt.time}</td>
                  <td>{apt.queueNumber ? <span style={{ fontWeight: 600 }}>{apt.queueNumber}</span> : <span style={{ color: 'var(--gray-400)' }}>—</span>}</td>
                  <td><StatusBadge status={apt.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/appointments/${apt.id}`)}>View</button>
                      {(apt.status === 'Scheduled') && (
                        <>
                          <button className="btn btn-outline btn-sm" onClick={() => navigate(`/appointments/${apt.id}?reschedule=1`)}>Reschedule</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setCancelTarget(apt)}>Cancel</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {cancelTarget && (
        <ConfirmModal
          title="Cancel Appointment"
          message={`Are you sure you want to cancel appointment ${cancelTarget.id} for ${cancelTarget.service} on ${fmt(cancelTarget.date)}? This action cannot be undone.`}
          confirmText="Cancel Appointment"
          onConfirm={handleCancel}
          onCancel={() => setCancelTarget(null)}
          loading={cancelLoading}
        />
      )}
    </AppLayout>
  )
}
