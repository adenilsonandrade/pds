const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/adminBusinessesController');

router.use(auth);

router.get('/', controller.listBusinesses);
router.post('/', controller.createBusiness);
router.put('/:id', controller.updateBusiness);
router.delete('/:id', controller.deleteBusiness);

module.exports = router;
