const { readJSON } = require('./fileHelper');

/**
 * Generate the next appointment ID (APT-1001, APT-1002, ...)
 */
function generateAppointmentId() {
  const appointments = readJSON('appointments.json');
  if (appointments.length === 0) return 'APT-1001';
  const ids = appointments
    .map((a) => parseInt(a.id.replace('APT-', ''), 10))
    .filter((n) => !isNaN(n));
  const max = Math.max(...ids);
  return `APT-${max + 1}`;
}

/**
 * Generate the next queue number for today (Q001, Q002, ...)
 */
function generateQueueNumber() {
  const today = new Date().toISOString().split('T')[0];
  const queue = readJSON('queue.json');
  const todayQueue = queue.filter((q) => q.date === today);
  const count = todayQueue.length + 1;
  return `Q${String(count).padStart(3, '0')}`;
}

/**
 * Generate a queue entry ID
 */
function generateQueueId() {
  const queue = readJSON('queue.json');
  if (queue.length === 0) return 'QUEUE-001';
  const ids = queue
    .map((q) => parseInt(q.id.replace('QUEUE-', ''), 10))
    .filter((n) => !isNaN(n));
  const max = Math.max(...ids);
  return `QUEUE-${String(max + 1).padStart(3, '0')}`;
}

/**
 * Generate a notification ID
 */
function generateNotifId() {
  const notifs = readJSON('notifications.json');
  if (notifs.length === 0) return 'NOTIF-001';
  const ids = notifs
    .map((n) => parseInt(n.id.replace('NOTIF-', ''), 10))
    .filter((n) => !isNaN(n));
  const max = Math.max(...ids);
  return `NOTIF-${String(max + 1).padStart(3, '0')}`;
}

module.exports = {
  generateAppointmentId,
  generateQueueNumber,
  generateQueueId,
  generateNotifId,
};
