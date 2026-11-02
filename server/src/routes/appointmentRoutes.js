const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAvailableSlots,
} = require('../controllers/appointmentController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/slots', requireAuth, getAvailableSlots);
router.get('/', requireAuth, getAppointments);
router.get('/:id', requireAuth, getAppointmentById);
router.post('/', requireAuth, createAppointment);
router.put('/:id', requireAuth, updateAppointment);
router.delete('/:id', requireAdmin, deleteAppointment);

module.exports = router;
