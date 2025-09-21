const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController.js');

// Rota para buscar as informações gerais do negócio
router.get('/info', businessController.getBusinessInfo);

// Rota para buscar todos os serviços do negócio
router.get('/services', businessController.getServices);

module.exports = router;