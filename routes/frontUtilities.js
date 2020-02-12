const express       = require('express');
const controller    = require('../controllers/frontUtilities');

var router = express.Router();

router.get('/areas',controller.areas);
router.get('/subareas',controller.subareas);
router.get('/niveles',controller.niveles);

module.exports = router;