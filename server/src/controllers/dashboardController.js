const { readJSON } = require('../utils/fileHelper');

// GET /api/admin/dashboard
const getAdminDashboard = (req, res) => {
  const appointments = readJSON('appointments.json');
  const queue = readJSON('queue.json');
  const services = readJSON('services.json');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter((a) => a.date === todayStr);
  const todayQueue = queue.filter((q) => q.date === todayStr);

  const stats = {
    todayAppointments: todayApts.length,
    waitingCustomers: todayQueue.filter((q) => q.status === 'Waiting').length,
    completedToday: todayApts.filter((a) => a.status === 'Completed').length +
      todayQueue.filter((q) => q.status === 'Completed').length,
    cancelledAppointments: appointments.filter((a) => a.status === 'Cancelled').length,
    totalCustomers: new Set(appointments.map((a) => a.userId)).size,
    totalAppointments: appointments.length,
  };

  // Appointment status breakdown (all time)
  const statusBreakdown = {
    Scheduled: appointments.filter((a) => a.status === 'Scheduled').length,
    Waiting: appointments.filter((a) => a.status === 'Waiting').length,
    'In Progress': appointments.filter((a) => a.status === 'In Progress').length,
    Completed: appointments.filter((a) => a.status === 'Completed').length,
    Cancelled: appointments.filter((a) => a.status === 'Cancelled').length,
  };

  // By service
  const byService = services.map((s) => ({
    name: s.name,
    count: appointments.filter((a) => a.serviceId === s.id).length,
    color: s.color,
  }));

  // Last 7 days daily count
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    last7Days.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: appointments.filter((a) => a.date === ds).length,
    });
  }

  res.json({ stats, statusBreakdown, byService, last7Days });
};

// GET /api/admin/reports
const getReports = (req, res) => {
  const appointments = readJSON('appointments.json');
  const queue = readJSON('queue.json');
  const services = readJSON('services.json');

  const total = appointments.length;
  const completed = appointments.filter((a) => a.status === 'Completed').length;
  const cancelled = appointments.filter((a) => a.status === 'Cancelled').length;

  const cancellationRate = total > 0 ? ((cancelled / total) * 100).toFixed(1) : '0.0';
  const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';

  // Most popular service
  const serviceCounts = {};
  appointments.forEach((a) => {
    serviceCounts[a.service] = (serviceCounts[a.service] || 0) + 1;
  });
  const mostPopular = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0];

  // Monthly breakdown (last 6 months)
  const monthly = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthly.push({
      month,
      total: appointments.filter((a) => a.date && a.date.startsWith(monthStr)).length,
      completed: appointments.filter((a) => a.date && a.date.startsWith(monthStr) && a.status === 'Completed').length,
      cancelled: appointments.filter((a) => a.date && a.date.startsWith(monthStr) && a.status === 'Cancelled').length,
    });
  }

  // By service
  const byService = services.map((s) => ({
    name: s.name,
    total: appointments.filter((a) => a.serviceId === s.id).length,
    completed: appointments.filter((a) => a.serviceId === s.id && a.status === 'Completed').length,
    cancelled: appointments.filter((a) => a.serviceId === s.id && a.status === 'Cancelled').length,
    color: s.color,
  }));

  res.json({
    summary: {
      total,
      completed,
      cancelled,
      cancellationRate,
      completionRate,
      mostPopularService: mostPopular ? mostPopular[0] : 'N/A',
      totalQueueServed: queue.filter((q) => q.status === 'Completed').length,
    },
    monthly,
    byService,
  });
};

// GET /api/user/dashboard
const getUserDashboard = (req, res) => {
  const appointments = readJSON('appointments.json');
  const queue = readJSON('queue.json');
  const notifications = readJSON('notifications.json');

  const userId = req.user.id;
  const todayStr = new Date().toISOString().split('T')[0];
  const userApts = appointments.filter((a) => a.userId === userId);

  // Upcoming appointments
  const upcoming = userApts
    .filter((a) => a.date >= todayStr && a.status === 'Scheduled')
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))[0] || null;

  // Today's queue
  const myQueue = queue.find(
    (q) => q.userId === userId && q.date === todayStr && q.status !== 'Completed' && q.status !== 'Removed'
  );

  let queuePosition = null;
  let estimatedWait = null;
  if (myQueue) {
    const todayWaiting = queue
      .filter((q) => q.date === todayStr && q.status === 'Waiting')
      .sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt));
    const idx = todayWaiting.findIndex((q) => q.id === myQueue.id);
    const schedule = readJSON('schedule.json');
    queuePosition = myQueue.status === 'In Progress' ? 0 : idx + 1;
    estimatedWait = myQueue.status === 'In Progress' ? 0 : idx * (schedule.averageServiceTime || 5);
  }

  const stats = {
    total: userApts.length,
    completed: userApts.filter((a) => a.status === 'Completed').length,
    cancelled: userApts.filter((a) => a.status === 'Cancelled').length,
    upcoming: userApts.filter((a) => a.date >= todayStr && a.status === 'Scheduled').length,
  };

  const recentNotifs = notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  res.json({ upcoming, myQueue, queuePosition, estimatedWait, stats, recentNotifications: recentNotifs });
};

module.exports = { getAdminDashboard, getReports, getUserDashboard };
