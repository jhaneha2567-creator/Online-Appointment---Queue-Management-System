import React from 'react'

export default function StatCard({ icon, label, value, color = '#0EA5E9', bg = '#E0F2FE', trend }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg, color }}>
        <span>{icon}</span>
      </div>
      <div className="stat-info">
        <h3>{value ?? '—'}</h3>
        <p>{label}</p>
        {trend !== undefined && (
          <span style={{ fontSize: 11, color: trend >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: 2, display: 'block' }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from yesterday
          </span>
        )}
      </div>
    </div>
  )
}
