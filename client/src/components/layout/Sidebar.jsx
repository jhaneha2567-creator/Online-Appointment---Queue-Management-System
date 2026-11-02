import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

const userNav = [
  { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
  { icon: '📅', label: 'Book Appointment', path: '/appointments/book' },
  { icon: '📋', label: 'My Appointments', path: '/appointments' },
  { icon: '🔢', label: 'Join Queue', path: '/queue' },
  { icon: '📡', label: 'Track Queue', path: '/queue/track' },
  { icon: '🔔', label: 'Notifications', path: '/notifications' },
]

const adminNav = [
  { icon: '📊', label: 'Dashboard', path: '/admin/dashboard' },
  { icon: '📅', label: 'Appointments', path: '/admin/appointments' },
  { icon: '🔢', label: 'Queue Management', path: '/admin/queue' },
  { icon: '🗓️', label: 'Schedule', path: '/admin/schedule' },
  { icon: '🏥', label: 'Services', path: '/admin/services' },
  { icon: '📈', label: 'Reports', path: '/admin/reports' },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout, isAdmin } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const navItems = isAdmin ? adminNav : userNav

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const handleNav = (path) => {
    navigate(path)
    if (onClose) onClose()
  }

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">🏥</div>
        <div>
          <div className="logo-text">QueueCare</div>
          <div className="logo-sub">{isAdmin ? 'Admin Panel' : 'Patient Portal'}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {navItems.map(item => (
          <button
            key={item.path}
            className={`nav-item${location.pathname === item.path || location.pathname.startsWith(item.path + '/') ? ' active' : ''}`}
            onClick={() => handleNav(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info-sidebar">
          <div className="user-avatar">{user?.name?.[0] || 'U'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="uname truncate">{user?.name}</div>
            <div className="urole">{user?.role}</div>
          </div>
        </div>
        <button className="nav-item" onClick={handleLogout} style={{ color: '#F87171' }}>
          <span className="nav-icon">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  )
}
