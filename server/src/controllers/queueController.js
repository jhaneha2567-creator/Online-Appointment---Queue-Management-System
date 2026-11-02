const { readJSON, writeJSON, addRecord, updateRecord, findRecord } = require('../utils/fileHelper');
const { generateQueueId, generateQueueNumber } = require('../utils/idGenerator');
const { createNotification } = require('../utils/notificationHelper');

const today = () => new Date().toISOString().split('T')[0];

// GET /api/queue - get today's queue
const getQueue = (req, res) => {
  const queue = readJSON('queue.json');
  const todayStr = today();
  const todayQueue = queue.filter((q) => q.date === todayStr);
  // Sort by joined time
  todayQueue.sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt));

  const inProgress = todayQueue.find((q) => q.status === 'In Progress');
  const waiting = todayQueue.filter((q) => q.status === 'Waiting');
  const completed = todayQueue.filter((q) => q.status === 'Completed');

  const schedule = readJSON('schedule.json');
  const avgTime = schedule.averageServiceTime || 5;

  // Add estimated wait info to each waiting entry
  const waitingWithEta = waiting.map((q, idx) => ({
    ...q,
    position: idx + 1,
    estimatedWait: (idx + 1) * avgTime,
  }));

  res.json({
    nowServing: inProgress || null,
    waiting: waitingWithEta,
    completed,
    totalToday: todayQueue.length,
    averageServiceTime: avgTime,
  });
};

// GET /api/queue/my - get current user's queue status
const getMyQueue = (req, res) => {
  const queue = readJSON('queue.json');
  const todayStr = today();
  const myEntry = queue.find(
    (q) => q.userId === req.user.id && q.date === todayStr && q.status !== 'Completed' && q.status !== 'Removed'
  );

  if (!myEntry) {
    return res.json({ inQueue: false });
  }

  // Calculate position among waiting
  const todayQueue = queue.filter((q) => q.date === todayStr);
  todayQueue.sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt));
  const waiting = todayQueue.filter((q) => q.status === 'Waiting');
  const myIndex = waiting.findIndex((q) => q.id === myEntry.id);
  const schedule = readJSON('schedule.json');
  const avgTime = schedule.averageServiceTime || 5;

  res.json({
    inQueue: true,
    entry: myEntry,
    position: myEntry.status === 'In Progress' ? 0 : myIndex + 1,
    peopleAhead: myEntry.status === 'In Progress' ? 0 : myIndex,
    estimatedWait: myEntry.status === 'In Progress' ? 0 : myIndex * avgTime,
  });
};

// POST /api/queue/join
const joinQueue = (req, res) => {
  const { serviceId, appointmentId } = req.body;
  if (!serviceId) return res.status(400).json({ error: 'Service is required.' });

  const todayStr = today();
  const queue = readJSON('queue.json');

  // Check if user already in queue today
  const alreadyIn = queue.find(
    (q) => q.userId === req.user.id && q.date === todayStr && q.status !== 'Completed' && q.status !== 'Removed'
  );
  if (alreadyIn) {
    return res.status(409).json({ error: 'You are already in the queue today.', entry: alreadyIn });
  }

  const services = readJSON('services.json');
  const service = services.find((s) => s.id === serviceId && s.active);
  if (!service) return res.status(404).json({ error: 'Service not found.' });

  const queueNumber = generateQueueNumber();
  const newEntry = {
    id: generateQueueId(),
    queueNumber,
    userId: req.user.id,
    serviceId,
    service: service.name,
    appointmentId: appointmentId || null,
    status: 'Waiting',
    joinedAt: new Date().toISOString(),
    calledAt: null,
    completedAt: null,
    date: todayStr,
  };

  addRecord('queue.json', newEntry);

  // Update appointment if linked
  if (appointmentId) {
    updateRecord('appointments.json', appointmentId, { queueNumber, status: 'Waiting', updatedAt: new Date().toISOString() });
  }

  // Calculate wait
  const allQueue = readJSON('queue.json');
  const todayWaiting = allQueue.filter((q) => q.date === todayStr && q.status === 'Waiting');
  const position = todayWaiting.length;
  const schedule = readJSON('schedule.json');
  const avgTime = schedule.averageServiceTime || 5;
  const estimatedWait = (position - 1) * avgTime;

  createNotification(
    req.user.id,
    'Queue Joined',
    `You have joined the queue. Your number is ${queueNumber}. Estimated waiting time: ${estimatedWait} minutes.`,
    'success'
  );

  res.status(201).json({ entry: newEntry, position, estimatedWait });
};

// POST /api/queue/next (admin: call next)
const callNext = (req, res) => {
  const todayStr = today();
  const queue = readJSON('queue.json');
  const sorted = queue
    .filter((q) => q.date === todayStr)
    .sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt));

  // Complete current in-progress
  const inProgress = sorted.find((q) => q.status === 'In Progress');
  if (inProgress) {
    updateRecord('queue.json', inProgress.id, {
      status: 'Completed',
      completedAt: new Date().toISOString(),
    });
    // Update linked appointment
    if (inProgress.appointmentId) {
      updateRecord('appointments.json', inProgress.appointmentId, {
        status: 'Completed',
        updatedAt: new Date().toISOString(),
      });
    }
    createNotification(inProgress.userId, 'Appointment Completed', `Your service has been completed. Thank you for visiting!`, 'success');
  }

  // Find next waiting
  const freshQueue = readJSON('queue.json');
  const nextWaiting = freshQueue
    .filter((q) => q.date === todayStr && q.status === 'Waiting')
    .sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt))[0];

  if (!nextWaiting) {
    return res.json({ message: 'No more customers waiting.', nowServing: null });
  }

  updateRecord('queue.json', nextWaiting.id, {
    status: 'In Progress',
    calledAt: new Date().toISOString(),
  });
  if (nextWaiting.appointmentId) {
    updateRecord('appointments.json', nextWaiting.appointmentId, {
      status: 'In Progress',
      updatedAt: new Date().toISOString(),
    });
  }
  createNotification(nextWaiting.userId, 'Your Turn', `Your queue number ${nextWaiting.queueNumber} is now being called. Please proceed to the service counter.`, 'success');

  // Notify next few in line
  const remaining = readJSON('queue.json')
    .filter((q) => q.date === todayStr && q.status === 'Waiting')
    .sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt));
  if (remaining[0]) {
    createNotification(remaining[0].userId, 'Almost Your Turn', `You are next in line (${remaining[0].queueNumber}). Please be ready.`, 'info');
  }

  const updatedEntry = findRecord('queue.json', (q) => q.id === nextWaiting.id);
  res.json({ message: `Now serving ${nextWaiting.queueNumber}`, nowServing: updatedEntry });
};

// PUT /api/queue/:id - admin update queue entry
const updateQueueEntry = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const entry = findRecord('queue.json', (q) => q.id === id);
  if (!entry) return res.status(404).json({ error: 'Queue entry not found.' });

  const updates = { status };
  if (status === 'Completed') updates.completedAt = new Date().toISOString();
  if (status === 'In Progress') updates.calledAt = new Date().toISOString();

  const updated = updateRecord('queue.json', id, updates);

  if (entry.appointmentId) {
    updateRecord('appointments.json', entry.appointmentId, { status, updatedAt: new Date().toISOString() });
  }

  if (status === 'Completed') {
    createNotification(entry.userId, 'Service Completed', `Your service for ${entry.service} is now complete. Thank you!`, 'success');
  } else if (status === 'In Progress') {
    createNotification(entry.userId, 'Your Turn', `Queue number ${entry.queueNumber} is now being called. Please proceed.`, 'success');
  }

  res.json(updated);
};

// DELETE /api/queue/:id - remove from queue
const removeFromQueue = (req, res) => {
  const { id } = req.params;
  const entry = findRecord('queue.json', (q) => q.id === id);
  if (!entry) return res.status(404).json({ error: 'Queue entry not found.' });

  updateRecord('queue.json', id, { status: 'Removed' });
  if (entry.appointmentId) {
    updateRecord('appointments.json', entry.appointmentId, { queueNumber: null, status: 'Scheduled', updatedAt: new Date().toISOString() });
  }
  createNotification(entry.userId, 'Removed from Queue', `You have been removed from the queue by admin.`, 'warning');
  res.json({ message: 'Customer removed from queue.' });
};

module.exports = { getQueue, getMyQueue, joinQueue, callNext, updateQueueEntry, removeFromQueue };
