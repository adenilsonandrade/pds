const express = require('express');
const router = express.Router();
const petsController = require('../controllers/petsController.js');
const authMiddleware = require('../middleware/auth.js');

router.get('/', authMiddleware, petsController.listPets);

router.get('/:id', authMiddleware, petsController.getPet);

router.post('/', authMiddleware, petsController.createPet);

router.put('/:id', authMiddleware, petsController.updatePet);

router.delete('/:id', authMiddleware, petsController.deletePet);

module.exports = router;
