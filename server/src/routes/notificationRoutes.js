const express = require('express');
const router = express.Router();
const { getNotifications, markRead, markAllRead } = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, getNotifications);
router.put('/read-all', requireAuth, markAllRead);
router.put('/:id/read', requireAuth, markRead);

module.exports = router;
