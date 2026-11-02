import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts'
import AppLayout from '../../components/layout/AppLayout'
import StatCard from '../../components/common/StatCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { dashboardAPI } from '../../services/api'

export default function AdminReports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.adminReports().then(res => setData(res.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <AppLayout title="Reports"><LoadingSpinner text="Loading reports…" /></AppLayout>

  const { summary, monthly, byService } = data || {}

  const serviceColors = ['#3B82F6', '#06B6D4', '#10B981', '#8B5CF6', '#F59E0B']

  return (
    <AppLayout title="Reports">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Reports & Analytics</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 3 }}>Overview of clinic performance metrics</p>
      </div>

      {/* Summary stats */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <StatCard icon="📅" label="Total Appointments" value={summary?.total} color="#0EA5E9" bg="#E0F2FE" />
        <StatCard icon="✅" label="Completed" value={summary?.completed} color="#10B981" bg="#D1FAE5" />
        <StatCard icon="❌" label="Cancelled" value={summary?.cancelled} color="#EF4444" bg="#FEE2E2" />
        <StatCard icon="📊" label="Completion Rate" value={`${summary?.completionRate}%`} color="#8B5CF6" bg="#EDE9FE" />
        <StatCard icon="🚫" label="Cancellation Rate" value={`${summary?.cancellationRate}%`} color="#F59E0B" bg="#FEF3C7" />
        <StatCard icon="🔢" label="Queue Served" value={summary?.totalQueueServed} color="#0D9488" bg="#CCFBF1" />
      </div>

      {/* Most popular */}
      {summary?.mostPopularService && (
        <div className="alert alert-info" style={{ marginBottom: 24 }}>
          🏆 Most popular service: <strong>{summary.mostPopularService}</strong>
        </div>
      )}

      <div className="two-col" style={{ marginBottom: 24 }}>
        {/* Monthly trend */}
        <div className="card card-body">
          <h3 style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Monthly Appointment Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" fontSize={10} />
              <YAxis fontSize={10} allowDecimals={false} />
              <Tooltip />
              <Legend iconSize={10} />
              <Bar dataKey="total" name="Total" fill="#0EA5E9" radius={[4,4,0,0]} />
              <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4,4,0,0]} />
              <Bar dataKey="cancelled" name="Cancelled" fill="#EF4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By service pie */}
        <div className="card card-body">
          <h3 style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Appointments by Service</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byService} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={85} paddingAngle={3}>
                {byService?.map((entry, i) => <Cell key={entry.name} fill={entry.color || serviceColors[i % serviceColors.length]} />)}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Service breakdown table */}
      <div className="card">
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--gray-100)' }}>
          <h3 style={{ fontWeight: 600, fontSize: 15 }}>Service-wise Breakdown</h3>
        </div>
        <div className="table-wrap" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Total</th>
                <th>Completed</th>
                <th>Cancelled</th>
                <th>Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {byService?.map(s => (
                <tr key={s.name}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                      {s.name}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{s.total}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 500 }}>{s.completed}</td>
                  <td style={{ color: 'var(--danger)', fontWeight: 500 }}>{s.cancelled}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar" style={{ flex: 1, maxWidth: 100 }}>
                        <div className="progress-fill" style={{ width: `${s.total > 0 ? Math.round(s.completed / s.total * 100) : 0}%`, background: 'var(--success)' }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)' }}>
                        {s.total > 0 ? Math.round(s.completed / s.total * 100) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  )
}
