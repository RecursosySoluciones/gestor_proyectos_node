const users_table = require('./user_table');
const tickets_table = require('./tickets_table');

let migrations = () => {
    users_table();
    tickets_table();
};

module.exports = migrations;