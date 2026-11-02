const express = require('express');
const router = express.Router();
const { getAdminDashboard, getReports, getUserDashboard } = require('../controllers/dashboardController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/admin/dashboard', requireAdmin, getAdminDashboard);
router.get('/admin/reports', requireAdmin, getReports);
router.get('/user/dashboard', requireAuth, getUserDashboard);

module.exports = router;
