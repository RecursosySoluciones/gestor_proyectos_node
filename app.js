const express       = require('express');
const bodyParser    = require('body-parser');
const migrations    = require('./database/migrations/migrations');

var app = express();

// Routes files
var user_routes = require('./routes/users');


// Middlewares
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Routes
app.use('/api/users', user_routes);

migrations();

module.exports = app;