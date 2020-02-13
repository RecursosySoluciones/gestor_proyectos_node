const express       = require('express');
const controller    = require('../controllers/tickets');
const multipart     = require('connect-multiparty');
let multipartMiddleware = multipart({
    uploadDir: './public/imgs'
});

var router = express.Router();

module.exports = router;