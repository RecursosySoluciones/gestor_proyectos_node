const express       = require('express');
const bodyParser    = require('body-parser');
const migrations    = require('./database/migrations/migrations');
const fs            = require('fs');
const IMG_DIR       = __dirname + '/public/imgs/';

let app = express();
app.set('view engine','pug');


// Routes files
let user_routes              = require('./routes/users');
let frontUtilities_routes    = require('./routes/frontUtilities');
let tickets_routes    = require('./routes/tickets');


// Middlewares
app.use('/imgs',express.static(IMG_DIR));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Routes
app.use('/api/users', user_routes);
app.use('/api/frontUtilities', frontUtilities_routes);
app.use('/api/tickets', tickets_routes);

migrations();

module.exports = app;