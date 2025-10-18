const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/servicesController.js');
const authMiddleware = require('../middleware/auth.js');

router.get('/', authMiddleware, servicesController.listServices);
router.get('/:handle', authMiddleware, servicesController.listServices);

module.exports = router;
