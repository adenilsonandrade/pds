const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/servicesController.js');
const authMiddleware = require('../middleware/auth.js');

router.get('/', authMiddleware, servicesController.listServices);
router.get('/:handle', authMiddleware, servicesController.listServices);
router.post('/', authMiddleware, servicesController.createService);
router.post('/:handle', authMiddleware, servicesController.createService);

router.put('/:id', authMiddleware, servicesController.updateService);
router.put('/:handle/:id', authMiddleware, servicesController.updateService);

router.delete('/:id', authMiddleware, servicesController.deleteService);
router.delete('/:handle/:id', authMiddleware, servicesController.deleteService);

module.exports = router;
