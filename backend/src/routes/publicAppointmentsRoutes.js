const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/publicAppointmentsController.js');

router.post('/:handle', agendamentoController.createPublicAppointment);

router.post('/', agendamentoController.createPublicAppointment);

module.exports = router;