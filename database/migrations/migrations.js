const migration1 = require('./user_table');

let migrations = () => {
    migration1();
};

module.exports = migrations;