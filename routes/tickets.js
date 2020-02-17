const express       = require('express');
const controller    = require('../controllers/tickets');
const multipart     = require('connect-multiparty');
let multipartMiddleware = multipart({
    uploadDir: './public/tickets_imgs'
});

var router = express.Router();

router.post('/new',multipartMiddleware,controller.new);
router.route('/:id')
                    .get(controller.get);

module.exports = router;