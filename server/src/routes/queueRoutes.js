const express = require('express');
const router = express.Router();
const { getQueue, getMyQueue, joinQueue, callNext, updateQueueEntry, removeFromQueue } = require('../controllers/queueController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', requireAuth, getQueue);
router.get('/my', requireAuth, getMyQueue);
router.post('/join', requireAuth, joinQueue);
router.post('/next', requireAdmin, callNext);
router.put('/:id', requireAdmin, updateQueueEntry);
router.delete('/:id', requireAdmin, removeFromQueue);

module.exports = router;
