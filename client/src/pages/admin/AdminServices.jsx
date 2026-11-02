import React, { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import ConfirmModal from '../../components/common/ConfirmModal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { servicesAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'

const COLORS = ['#3B82F6', '#06B6D4', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899']

function ServiceModal({ service, onClose, onSave }) {
  const [form, setForm] = useState(service || { name: '', duration: 30, description: '', color: '#3B82F6', active: true })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!form.name || !form.duration) { setError('Name and duration are required.'); return }
    setLoading(true)
    try { await onSave(form) } catch (err) { setError(err.response?.data?.error || 'Failed to save'); setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{service ? 'Edit Service' : 'Add Service'}</h2>
          <button className="btn btn-secondary btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Service Name *</label>
            <input className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. General Consultation" />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Duration (minutes) *</label>
              <input className="form-control" type="number" min="5" max="120" value={form.duration}
                onChange={e => setForm(p => ({ ...p, duration: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                {COLORS.map(c => (
                  <div key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                    style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '3px solid #fff' : '3px solid transparent', outline: form.color === c ? `2px solid ${c}` : 'none', transition: 'all 0.15s' }} />
                ))}
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows={2} value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description…" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="active" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} />
            <label htmlFor="active" style={{ fontSize: 14, cursor: 'pointer' }}>Active (visible for booking)</label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving…' : service ? 'Update Service' : 'Add Service'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminServices() {
  const toast = useToast()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'add' | service object
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = () => {
    servicesAPI.getAll().then(res => setServices(res.data)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleSave = async (form) => {
    if (modal && modal.id) {
      await servicesAPI.update(modal.id, form)
      toast.success('Service updated')
    } else {
      await servicesAPI.create(form)
      toast.success('Service added')
    }
    setModal(null)
    load()
  }

  const handleToggle = async (svc) => {
    await servicesAPI.update(svc.id, { active: !svc.active })
    toast.success(`Service ${!svc.active ? 'activated' : 'disabled'}`)
    load()
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await servicesAPI.delete(deleteTarget.id)
      toast.success('Service deleted')
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) return <AppLayout title="Services"><LoadingSpinner text="Loading…" /></AppLayout>

  return (
    <AppLayout title="Services">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Services</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 3 }}>{services.length} services configured</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>+ Add Service</button>
      </div>

      {services.length === 0 ? (
        <EmptyState icon="🏥" title="No services yet" message="Add your first service to get started"
          action={<button className="btn btn-primary" onClick={() => setModal('add')}>Add Service</button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 16 }}>
          {services.map(svc => (
            <div key={svc.id} className="card card-body" style={{ opacity: svc.active ? 1 : 0.65 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: svc.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🩺</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15 }}>{svc.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>{svc.id}</p>
                  </div>
                </div>
                <span className={`badge ${svc.active ? 'badge-active' : 'badge-inactive'}`}>{svc.active ? 'Active' : 'Inactive'}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: 14 }}>{svc.description || 'No description'}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>⏱ {svc.duration} minutes</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setModal(svc)}>Edit</button>
                  <button className={`btn btn-sm ${svc.active ? 'btn-warning' : 'btn-success'}`} onClick={() => handleToggle(svc)}>
                    {svc.active ? 'Disable' : 'Enable'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(svc)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ServiceModal
          service={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Service"
          message={`Delete "${deleteTarget.name}"? This cannot be undone.`}
          confirmText="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </AppLayout>
  )
}
