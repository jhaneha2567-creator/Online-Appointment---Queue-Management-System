import React from 'react'

const map = {
  'Scheduled':   'badge-scheduled',
  'Waiting':     'badge-waiting',
  'In Progress': 'badge-in-progress',
  'Completed':   'badge-completed',
  'Cancelled':   'badge-cancelled',
  'Active':      'badge-active',
  'Inactive':    'badge-inactive',
}

const dots = {
  'Scheduled': '●', 'Waiting': '●', 'In Progress': '●',
  'Completed': '●', 'Cancelled': '●', 'Active': '●', 'Inactive': '●',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${map[status] || 'badge-scheduled'}`}>
      {dots[status]} {status}
    </span>
  )
}
