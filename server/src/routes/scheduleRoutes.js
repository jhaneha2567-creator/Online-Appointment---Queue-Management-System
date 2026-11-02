const express = require('express');
const router = express.Router();
const { getSchedule, updateSchedule } = require('../controllers/scheduleController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', requireAuth, getSchedule);
router.put('/', requireAdmin, updateSchedule);

module.exports = router;
