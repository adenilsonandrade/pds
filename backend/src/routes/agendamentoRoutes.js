const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController.js');

// POST /api/agendamentos-publicos/:handle
router.post('/:handle', agendamentoController.createAgendamento);
// fallback: POST /api/agendamentos-publicos
router.post('/', agendamentoController.createAgendamento);

module.exports = router;