import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts'
import AppLayout from '../../components/layout/AppLayout'
import StatCard from '../../components/common/StatCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { dashboardAPI } from '../../services/api'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.adminDashboard().then(res => setData(res.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <AppLayout title="Admin Dashboard"><LoadingSpinner text="Loading dashboard…" /></AppLayout>

  const { stats, statusBreakdown, byService, last7Days } = data || {}

  const statusData = Object.entries(statusBreakdown || {}).map(([name, value]) => ({ name, value }))
  const statusColors = { Scheduled: '#0EA5E9', Waiting: '#F59E0B', 'In Progress': '#6366F1', Completed: '#10B981', Cancelled: '#EF4444' }

  return (
    <AppLayout title="Admin Dashboard">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--gray-500)', marginTop: 4, fontSize: 13 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <StatCard icon="📅" label="Today's Appointments" value={stats?.todayAppointments} color="#0EA5E9" bg="#E0F2FE" />
        <StatCard icon="⏳" label="Waiting Customers" value={stats?.waitingCustomers} color="#F59E0B" bg="#FEF3C7" />
        <StatCard icon="✅" label="Completed Today" value={stats?.completedToday} color="#10B981" bg="#D1FAE5" />
        <StatCard icon="❌" label="Cancelled" value={stats?.cancelledAppointments} color="#EF4444" bg="#FEE2E2" />
        <StatCard icon="👥" label="Total Customers" value={stats?.totalCustomers} color="#8B5CF6" bg="#EDE9FE" />
        <StatCard icon="📊" label="Total Appointments" value={stats?.totalAppointments} color="#0D9488" bg="#CCFBF1" />
      </div>

      <div className="two-col" style={{ marginBottom: 24 }}>
        {/* Appointment status pie */}
        <div className="card card-body">
          <h3 style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Appointment Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={statusColors[entry.name] || '#94A3B8'} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
              <Legend iconType="circle" iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Appointments by service */}
        <div className="card card-body">
          <h3 style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Appointments by Service</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byService} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" fontSize={11} />
              <YAxis type="category" dataKey="name" fontSize={11} width={110} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {byService?.map(entry => <Cell key={entry.name} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Last 7 days */}
      <div className="card card-body" style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Appointments — Last 7 Days</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={last7Days}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="date" fontSize={11} />
            <YAxis fontSize={11} allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#0EA5E9" strokeWidth={2.5} dot={{ fill: '#0EA5E9', r: 4 }} name="Appointments" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Quick nav */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 12 }}>
        {[
          { icon: '📅', label: 'Manage Appointments', path: '/admin/appointments', color: '#0EA5E9', bg: '#E0F2FE' },
          { icon: '🔢', label: 'Queue Management', path: '/admin/queue', color: '#10B981', bg: '#D1FAE5' },
          { icon: '🗓️', label: 'Schedule', path: '/admin/schedule', color: '#F59E0B', bg: '#FEF3C7' },
          { icon: '🏥', label: 'Services', path: '/admin/services', color: '#8B5CF6', bg: '#EDE9FE' },
          { icon: '📈', label: 'Reports', path: '/admin/reports', color: '#0D9488', bg: '#CCFBF1' },
        ].map(item => (
          <button key={item.path} onClick={() => navigate(item.path)}
            style={{ padding: '16px', borderRadius: 12, border: 'none', background: item.bg, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, fontFamily: 'inherit', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: item.color }}>{item.label}</span>
          </button>
        ))}
      </div>
    </AppLayout>
  )
}
