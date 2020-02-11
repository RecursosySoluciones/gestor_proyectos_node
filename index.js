// const mongoose      = require('mongoose');
const mysql         = require('mysql');
const app           = require('./app');
const port          = 8080;

mysql.Promise    = global.Promise;

mysql.createConnection({
    host: "localhost",
    user: 'root',
    password: '',
    database: 'ticketera_telecom',
    port: 3306
}).connect((err) => {
    if(err){
        throw err;
    }else{
        console.log('Conexion a la base de datos realizada correctamente');
        app.listen(port, () => {
            console.log('El servidor esta re javi sousaaaa');
        });
    }
});