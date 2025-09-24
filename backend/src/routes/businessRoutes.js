const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController.js');

// Routes with optional handle param. Example:
// GET /api/business/petdaguivi/info
// GET /api/business/petdaguivi/services
router.get('/:handle/info', businessController.getBusinessInfo);
router.get('/:handle/services', businessController.getServices);

// Fallback routes without handle (use default business id)
router.get('/info', businessController.getBusinessInfo);
router.get('/services', businessController.getServices);

module.exports = router;