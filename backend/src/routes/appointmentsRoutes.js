const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointmentsController.js');
const authMiddleware = require('../middleware/auth.js');

router.get('/', authMiddleware, appointmentsController.listAppointments);
router.get('/:handle', authMiddleware, appointmentsController.listAppointments);

router.post('/', authMiddleware, appointmentsController.createAppointment);
router.post('/:handle', authMiddleware, appointmentsController.createAppointment);

router.put('/:id', authMiddleware, appointmentsController.updateAppointment);

module.exports = router;
