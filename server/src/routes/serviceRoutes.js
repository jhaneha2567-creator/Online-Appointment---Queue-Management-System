const express = require('express');
const router = express.Router();
const { getServices, getActiveServices, createService, updateService, deleteService } = require('../controllers/serviceController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', requireAuth, getServices);
router.get('/active', requireAuth, getActiveServices);
router.post('/', requireAdmin, createService);
router.put('/:id', requireAdmin, updateService);
router.delete('/:id', requireAdmin, deleteService);

module.exports = router;
