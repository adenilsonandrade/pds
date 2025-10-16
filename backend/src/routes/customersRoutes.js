const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customersController.js');
const authMiddleware = require('../middleware/auth.js');

// Listar todos os clientes (filtrado por business_id baseado no role)
router.get('/', authMiddleware, customersController.listCustomers);

// Buscar um cliente específico
router.get('/:id', authMiddleware, customersController.getCustomer);

// Criar novo cliente
router.post('/', authMiddleware, customersController.createCustomer);

// Atualizar cliente
router.put('/:id', authMiddleware, customersController.updateCustomer);

// Deletar cliente
router.delete('/:id', authMiddleware, customersController.deleteCustomer);

module.exports = router;
