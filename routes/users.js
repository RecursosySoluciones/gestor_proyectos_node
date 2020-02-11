const express       = require('express');
const controller    = require('../controllers/users');

var router = express.Router();

router.get('/:id', controller.get);
router.post('/new',controller.new);

module.exports = router;