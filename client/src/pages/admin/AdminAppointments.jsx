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
const STATUSES = ['Scheduled', 'Waiting', 'In Progress', 'Completed', 'Cancelled']

export default function AdminAppointments() {
  const navigate = useNavigate()
  const toast = useToast()
  const [appointments, setAppointments] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [statusModal, setStatusModal] = useState(null)
  const [filters, setFilters] = useState({ search: '', status: '', date: '', service: '' })

  const load = () => {
    setLoading(true)
    Promise.all([appointmentsAPI.getAll(), servicesAPI.getAll()])
      .then(([a, s]) => { setAppointments(a.data); setServices(s.data) })
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleCancel = async () => {
    setCancelLoading(true)
    try {
      await appointmentsAPI.cancel(cancelTarget.id)
      toast.success('Appointment cancelled')
      setCancelTarget(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel')
    } finally {
      setCancelLoading(false)
    }
  }

  const handleStatusChange = async (apt, newStatus) => {
    try {
      await appointmentsAPI.update(apt.id, { status: newStatus })
      toast.success(`Status updated to ${newStatus}`)
      setStatusModal(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update')
    }
  }

  const filtered = appointments.filter(a => {
    const q = filters.search.toLowerCase()
    return (
      (!q || a.id.toLowerCase().includes(q) || a.service.toLowerCase().includes(q)) &&
      (!filters.status || a.status === filters.status) &&
      (!filters.date || a.date === filters.date) &&
      (!filters.service || a.serviceId === filters.service)
    )
  })

  return (
    <AppLayout title="Appointments">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>All Appointments</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 3 }}>{appointments.length} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <div className="search-bar" style={{ flex: 1, maxWidth: 280 }}>
          <span>🔍</span>
          <input placeholder="Search ID or service…" value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} />
        </div>
        <select className="form-control" style={{ width: 150 }} value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input className="form-control" type="date" style={{ width: 160 }} value={filters.date} onChange={e => setFilters(p => ({ ...p, date: e.target.value }))} />
        <select className="form-control" style={{ width: 170 }} value={filters.service} onChange={e => setFilters(p => ({ ...p, service: e.target.value }))}>
          <option value="">All Services</option>
          {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {(filters.search || filters.status || filters.date || filters.service) && (
          <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ search: '', status: '', date: '', service: '' })}>Clear</button>
        )}
      </div>

      {loading ? <LoadingSpinner text="Loading…" /> : filtered.length === 0 ? (
        <EmptyState icon="📅" title="No appointments found" message="Try adjusting your filters" />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Queue #</th>
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
                  <td>{apt.queueNumber || <span style={{ color: 'var(--gray-400)' }}>—</span>}</td>
                  <td><StatusBadge status={apt.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setStatusModal(apt)}>Status</button>
                      {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                        <button className="btn btn-danger btn-sm" onClick={() => setCancelTarget(apt)}>Cancel</button>
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
          message={`Cancel ${cancelTarget.id} (${cancelTarget.service}) on ${fmt(cancelTarget.date)}?`}
          confirmText="Cancel Appointment"
          onConfirm={handleCancel}
          onCancel={() => setCancelTarget(null)}
          loading={cancelLoading}
        />
      )}

      {statusModal && (
        <div className="modal-overlay" onClick={() => setStatusModal(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Status</h2>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setStatusModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--gray-600)', fontSize: 13, marginBottom: 14 }}>
                Appointment: <strong>{statusModal.id}</strong> — {statusModal.service}
              </p>
              <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 10 }}>Current: <StatusBadge status={statusModal.status} /></p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {STATUSES.filter(s => s !== statusModal.status).map(s => (
                  <button key={s} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}
                    onClick={() => handleStatusChange(statusModal, s)}>
                    Set to: <StatusBadge status={s} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
