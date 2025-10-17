const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController.js');


router.get('/:handle/info', businessController.getBusinessInfo);

router.get('/:handle/services', businessController.getServices);

router.get('/info', businessController.getBusinessInfo);

router.get('/services', businessController.getServices);

module.exports = router;