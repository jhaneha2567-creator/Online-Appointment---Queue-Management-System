import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ProtectedRoute, PublicRoute } from './components/common/ProtectedRoute'

// Public
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'

// User
import UserDashboard from './pages/user/Dashboard'
import BookAppointment from './pages/user/BookAppointment'
import MyAppointments from './pages/user/MyAppointments'
import AppointmentDetail from './pages/user/AppointmentDetail'
import JoinQueue from './pages/user/JoinQueue'
import TrackQueue from './pages/user/TrackQueue'
import Notifications from './pages/user/Notifications'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAppointments from './pages/admin/AdminAppointments'
import AdminQueue from './pages/admin/AdminQueue'
import AdminServices from './pages/admin/AdminServices'
import AdminSchedule from './pages/admin/AdminSchedule'
import AdminReports from './pages/admin/AdminReports'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

            {/* User routes */}
            <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
            <Route path="/appointments/book" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
            <Route path="/appointments/:id" element={<ProtectedRoute><AppointmentDetail /></ProtectedRoute>} />
            <Route path="/queue" element={<ProtectedRoute><JoinQueue /></ProtectedRoute>} />
            <Route path="/queue/track" element={<ProtectedRoute><TrackQueue /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/appointments" element={<ProtectedRoute adminOnly><AdminAppointments /></ProtectedRoute>} />
            <Route path="/admin/queue" element={<ProtectedRoute adminOnly><AdminQueue /></ProtectedRoute>} />
            <Route path="/admin/services" element={<ProtectedRoute adminOnly><AdminServices /></ProtectedRoute>} />
            <Route path="/admin/schedule" element={<ProtectedRoute adminOnly><AdminSchedule /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute adminOnly><AdminReports /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
