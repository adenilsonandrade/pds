const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController.js');

// Rota para criar um novo agendamento público
router.post('/', agendamentoController.createAgendamento);

module.exports = router;