const express = require('express');
const router = express.Router();
const adminUsersController = require('../controllers/adminUsersController.js');
const authMiddleware = require('../middleware/auth.js');

router.get('/', authMiddleware, adminUsersController.listUsers);

router.post('/', authMiddleware, adminUsersController.createUser);

router.put('/:id', authMiddleware, adminUsersController.updateUser);

router.delete('/:id', authMiddleware, adminUsersController.deleteUser);

module.exports = router;
