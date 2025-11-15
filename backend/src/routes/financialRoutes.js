const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financialController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, financialController.getFinancialOverview);

module.exports = router;
