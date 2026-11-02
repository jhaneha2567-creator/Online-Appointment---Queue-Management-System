const { readJSON, addRecord, updateRecord, findRecord } = require('../utils/fileHelper');
const { generateAppointmentId } = require('../utils/idGenerator');
const { createNotification } = require('../utils/notificationHelper');

// GET /api/appointments - user sees own, admin sees all
const getAppointments = (req, res) => {
  const appointments = readJSON('appointments.json');
  const { status, date, service, search } = req.query;
  let result = appointments;

  if (req.user.role !== 'admin') {
    result = result.filter((a) => a.userId === req.user.id);
  }
  if (status) result = result.filter((a) => a.status.toLowerCase() === status.toLowerCase());
  if (date) result = result.filter((a) => a.date === date);
  if (service) result = result.filter((a) => a.serviceId === service || a.service.toLowerCase().includes(service.toLowerCase()));
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (a) =>
        a.id.toLowerCase().includes(q) ||
        a.service.toLowerCase().includes(q) ||
        (a.reason && a.reason.toLowerCase().includes(q))
    );
  }
  // Sort newest first
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(result);
};

// GET /api/appointments/:id
const getAppointmentById = (req, res) => {
  const apt = findRecord('appointments.json', (a) => a.id === req.params.id);
  if (!apt) return res.status(404).json({ error: 'Appointment not found.' });
  // Users can only view their own
  if (req.user.role !== 'admin' && apt.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied.' });
  }
  res.json(apt);
};

// POST /api/appointments
const createAppointment = (req, res) => {
  const { serviceId, date, time, reason } = req.body;
  if (!serviceId || !date || !time) {
    return res.status(400).json({ error: 'Service, date and time are required.' });
  }

  // Cannot book past dates
  const today = new Date().toISOString().split('T')[0];
  if (date < today) {
    return res.status(400).json({ error: 'Cannot book appointments for past dates.' });
  }

  // Check service exists
  const services = readJSON('services.json');
  const service = services.find((s) => s.id === serviceId && s.active);
  if (!service) return res.status(404).json({ error: 'Service not found or inactive.' });

  // Check slot capacity
  const schedule = readJSON('schedule.json');
  const appointments = readJSON('appointments.json');
  const slotBookings = appointments.filter(
    (a) =>
      a.serviceId === serviceId &&
      a.date === date &&
      a.time === time &&
      a.status !== 'Cancelled'
  );
  if (slotBookings.length >= schedule.maxAppointmentsPerSlot) {
    return res.status(409).json({ error: 'This time slot is fully booked. Please choose another slot.' });
  }

  // Check if user already has an appointment for same service/date/time
  if (req.user.role === 'user') {
    const duplicate = appointments.find(
      (a) =>
        a.userId === req.user.id &&
        a.serviceId === serviceId &&
        a.date === date &&
        a.time === time &&
        a.status !== 'Cancelled'
    );
    if (duplicate) {
      return res.status(409).json({ error: 'You already have an appointment for this service at this time.' });
    }
  }

  const newApt = {
    id: generateAppointmentId(),
    userId: req.user.id,
    serviceId,
    service: service.name,
    date,
    time,
    reason: reason || '',
    status: 'Scheduled',
    queueNumber: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  addRecord('appointments.json', newApt);

  // Notify user
  const dateStr = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  createNotification(
    req.user.id,
    'Appointment Booked',
    `Your appointment ${newApt.id} for ${service.name} on ${dateStr} at ${time} has been successfully booked.`,
    'success'
  );

  res.status(201).json(newApt);
};

// PUT /api/appointments/:id
const updateAppointment = (req, res) => {
  const apt = findRecord('appointments.json', (a) => a.id === req.params.id);
  if (!apt) return res.status(404).json({ error: 'Appointment not found.' });

  if (req.user.role !== 'admin' && apt.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const { status, date, time, reason, serviceId } = req.body;
  const updates = { updatedAt: new Date().toISOString() };

  // Handle status change
  if (status) {
    if (apt.status === 'Completed' && req.user.role !== 'admin') {
      return res.status(400).json({ error: 'Cannot modify a completed appointment.' });
    }
    if (apt.status === 'Cancelled') {
      return res.status(400).json({ error: 'Cannot modify a cancelled appointment.' });
    }
    updates.status = status;
  }

  // Handle reschedule
  if (date || time) {
    if (apt.status === 'Completed') {
      return res.status(400).json({ error: 'Cannot reschedule a completed appointment.' });
    }
    if (apt.status === 'Cancelled') {
      return res.status(400).json({ error: 'Cannot reschedule a cancelled appointment.' });
    }
    const newDate = date || apt.date;
    const newTime = time || apt.time;
    const today = new Date().toISOString().split('T')[0];
    if (newDate < today) {
      return res.status(400).json({ error: 'Cannot reschedule to a past date.' });
    }
    // Check slot availability
    const schedule = readJSON('schedule.json');
    const appointments = readJSON('appointments.json');
    const slotBookings = appointments.filter(
      (a) =>
        a.serviceId === (serviceId || apt.serviceId) &&
        a.date === newDate &&
        a.time === newTime &&
        a.status !== 'Cancelled' &&
        a.id !== apt.id
    );
    if (slotBookings.length >= schedule.maxAppointmentsPerSlot) {
      return res.status(409).json({ error: 'The new time slot is fully booked. Please choose another slot.' });
    }
    updates.date = newDate;
    updates.time = newTime;
  }

  if (reason !== undefined) updates.reason = reason;

  const updated = updateRecord('appointments.json', req.params.id, updates);

  // Notifications
  if (status === 'Cancelled') {
    createNotification(apt.userId, 'Appointment Cancelled', `Your appointment ${apt.id} for ${apt.service} has been cancelled.`, 'warning');
  } else if (date || time) {
    createNotification(apt.userId, 'Appointment Rescheduled', `Your appointment ${apt.id} for ${apt.service} has been rescheduled to ${updates.date || apt.date} at ${updates.time || apt.time}.`, 'info');
  }

  res.json(updated);
};

// DELETE /api/appointments/:id (admin only)
const deleteAppointment = (req, res) => {
  const apt = findRecord('appointments.json', (a) => a.id === req.params.id);
  if (!apt) return res.status(404).json({ error: 'Appointment not found.' });
  const updated = updateRecord('appointments.json', req.params.id, { status: 'Cancelled', updatedAt: new Date().toISOString() });
  createNotification(apt.userId, 'Appointment Cancelled', `Your appointment ${apt.id} has been cancelled by admin.`, 'warning');
  res.json({ message: 'Appointment cancelled.', appointment: updated });
};

// GET /api/appointments/slots - get available slots for a date+service
const getAvailableSlots = (req, res) => {
  const { date, serviceId } = req.query;
  if (!date) return res.status(400).json({ error: 'Date is required.' });

  const schedule = readJSON('schedule.json');
  const appointments = readJSON('appointments.json');

  // Check working day
  const dayName = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
  if (!schedule.workingDays.includes(dayName)) {
    return res.json({ slots: [], message: `${dayName} is not a working day.` });
  }

  // Generate all slots
  const slots = [];
  const [openH, openM] = schedule.openingTime.split(':').map(Number);
  const [closeH, closeM] = schedule.closingTime.split(':').map(Number);
  let current = openH * 60 + openM;
  const end = closeH * 60 + closeM;

  while (current + schedule.slotDuration <= end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    const booked = appointments.filter(
      (a) =>
        a.date === date &&
        a.time === timeStr &&
        a.status !== 'Cancelled' &&
        (!serviceId || a.serviceId === serviceId)
    ).length;

    slots.push({
      time: timeStr,
      available: booked < schedule.maxAppointmentsPerSlot,
      booked,
      capacity: schedule.maxAppointmentsPerSlot,
    });

    current += schedule.slotDuration;
  }

  res.json({ slots });
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAvailableSlots,
};
