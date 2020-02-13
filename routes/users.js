const express       = require('express');
const controller    = require('../controllers/users');
const multipart     = require('connect-multiparty');
let multipartMiddleware = multipart({
    uploadDir: './public/imgs'
});

var router = express.Router();

router.post('/new',multipartMiddleware,controller.new);
router.route("/:id")
            .get(controller.get)
            .delete(controller.delete)
            .put(multipartMiddleware, controller.update);
router.post('/login',controller.login);

module.exports = router;