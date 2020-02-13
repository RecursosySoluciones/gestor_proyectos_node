const db            = require('../../controllers/helperFunctions');
const password_hash = require('password-hash');
const fs            = require('fs');

let migration = async () => {
    let sql = "CREATE TABLE IF NOT EXISTS `users` (`id` INT NOT NULL AUTO_INCREMENT,`name` VARCHAR(60) NOT NULL,`lastName` VARCHAR(60) NOT NULL,`legajo` VARCHAR(20) NOT NULL,`telefono` INT,`mail` VARCHAR(100) NOT NULL,`password` VARCHAR(255) NOT NULL,`nivel` INT NOT NULL,`area` INT NOT NULL,`subarea` INT NOT NULL,`imagen` VARCHAR(255),`user_del` BOOLEAN DEFAULT false,`active_user` BOOLEAN DEFAULT true,`created_at` TIMESTAMP NOT NULL,`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE KEY `uniqu` (`legajo`) USING BTREE,PRIMARY KEY (`id`)) ENGINE=InnoDB;";
    db.db.queryAsync(sql).then((rta) => {
        if(rta){ throw rta; }
    }).catch((err) => {
        //console.log(err);
    })
    let pass = password_hash.generate('Noviembre2019');
    db.db.queryAsync("SELECT * FROM users WHERE legajo = 'rysteco'").then((rta) =>{
        if(rta.length == 0){
            let sql1 = "INSERT INTO users (name,lastName,legajo,telefono,mail,password,nivel,area,subarea) VALUES ('RyS','Telecom Argentina','rysteco',0,'recursosysoluciones@teco.com.ar','"+pass+"',1,1,1);";
            db.db.query(sql1,(err, res) => {});
        }
    })




}

module.exports = migration;
