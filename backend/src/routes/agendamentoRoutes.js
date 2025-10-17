const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController.js');

router.post('/:handle', agendamentoController.createAgendamento);

router.post('/', agendamentoController.createAgendamento);

module.exports = router;