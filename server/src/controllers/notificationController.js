const { readJSON, updateRecord, writeJSON } = require('../utils/fileHelper');

// GET /api/notifications
const getNotifications = (req, res) => {
  const notifications = readJSON('notifications.json');
  const userNotifs = notifications
    .filter((n) => n.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(userNotifs);
};

// PUT /api/notifications/:id/read
const markRead = (req, res) => {
  const { id } = req.params;
  const notifications = readJSON('notifications.json');
  const notif = notifications.find((n) => n.id === id && n.userId === req.user.id);
  if (!notif) return res.status(404).json({ error: 'Notification not found.' });
  const updated = updateRecord('notifications.json', id, { read: true });
  res.json(updated);
};

// PUT /api/notifications/read-all
const markAllRead = (req, res) => {
  const notifications = readJSON('notifications.json');
  const updated = notifications.map((n) =>
    n.userId === req.user.id ? { ...n, read: true } : n
  );
  writeJSON('notifications.json', updated);
  res.json({ message: 'All notifications marked as read.' });
};

module.exports = { getNotifications, markRead, markAllRead };
