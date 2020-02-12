const express       = require('express');
const controller    = require('../controllers/users');

var router = express.Router();

router.get('/:id', controller.get);
router.post('/new',controller.new);
router.delete('/:id',controller.delete);
router.put('/:id',controller.update);
router.post('/login',controller.login);

module.exports = router;