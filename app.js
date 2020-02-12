const express       = require('express');
const bodyParser    = require('body-parser');
const migrations    = require('./database/migrations/migrations');

let app = express();

// Routes files
let user_routes              = require('./routes/users');
let frontUtilities_routes    = require('./routes/frontUtilities');


// Middlewares
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Routes
app.use('/api/users', user_routes);
app.use('/api/frontUtilities', frontUtilities_routes);

migrations();

module.exports = app;