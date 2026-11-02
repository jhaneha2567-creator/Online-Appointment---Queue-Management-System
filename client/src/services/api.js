import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 10000 })

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global response error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

// Services
export const servicesAPI = {
  getAll: () => api.get('/services'),
  getActive: () => api.get('/services/active'),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
}

// Appointments
export const appointmentsAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  cancel: (id) => api.put(`/appointments/${id}`, { status: 'Cancelled' }),
  delete: (id) => api.delete(`/appointments/${id}`),
  getSlots: (params) => api.get('/appointments/slots', { params }),
}

// Queue
export const queueAPI = {
  getQueue: () => api.get('/queue'),
  getMyQueue: () => api.get('/queue/my'),
  join: (data) => api.post('/queue/join', data),
  callNext: () => api.post('/queue/next'),
  updateEntry: (id, data) => api.put(`/queue/${id}`, data),
  remove: (id) => api.delete(`/queue/${id}`),
}

// Notifications
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
}

// Schedule
export const scheduleAPI = {
  get: () => api.get('/schedule'),
  update: (data) => api.put('/schedule', data),
}

// Dashboard
export const dashboardAPI = {
  adminDashboard: () => api.get('/admin/dashboard'),
  adminReports: () => api.get('/admin/reports'),
  userDashboard: () => api.get('/user/dashboard'),
}
