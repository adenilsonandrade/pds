const express = require('express');
const router = express.Router();
const goalsController = require('../controllers/goalsController.js');
const auth = require('../middleware/auth.js');

router.use(auth);

router.get('/', goalsController.listGoals);
router.post('/', goalsController.createGoal);
router.put('/:id', goalsController.updateGoal);
router.delete('/:id', goalsController.deleteGoal);

module.exports = router;
