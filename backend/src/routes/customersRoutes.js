const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customersController.js');
const authMiddleware = require('../middleware/auth.js');

router.get('/', authMiddleware, customersController.listCustomers);

router.get('/:id', authMiddleware, customersController.getCustomer);

router.post('/', authMiddleware, customersController.createCustomer);

router.put('/:id', authMiddleware, customersController.updateCustomer);

router.delete('/:id', authMiddleware, customersController.deleteCustomer);

module.exports = router;
