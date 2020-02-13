const helper        = require('./helperFunctions');
const password_hash = require('password-hash');
const fs            = require('fs');
var base_url        = (JSON.parse(fs.readFileSync("config.json"))).base_url;

let controller = {

}

module.exports = controller;