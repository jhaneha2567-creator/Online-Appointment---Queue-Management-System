const { addRecord } = require('./fileHelper');
const { generateNotifId } = require('./idGenerator');

/**
 * Create and persist a notification for a user
 */
function createNotification(userId, title, message, type = 'info') {
  const notif = {
    id: generateNotifId(),
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  };
  addRecord('notifications.json', notif);
  return notif;
}

module.exports = { createNotification };
