const db            = require('../../controllers/helperFunctions');
const password_hash = require('password-hash');
const fs            = require('fs');

let migration = async () => {

    let sql = "CREATE TABLE IF NOT EXISTS `tickets` (`id` BIGINT NOT NULL AUTO_INCREMENT,`asunto` VARCHAR(200) NOT NULL,`app` INT,`uCreador` VARCHAR(60) NOT NULL,`id_user` INT,`imagen` VARCHAR(100),`descripcion` TEXT(500),`estado` INT,`ticket_del` BOOLEAN DEFAULT false,`created_at` TIMESTAMP NOT NULL,`update_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY (`id`)) ENGINE=InnoDB;";
    db.db.queryAsync(sql).then((rta) => {
        if(rta){ throw rta; }
    }).catch((err) => {
        //console.log(err);
    })
    let sql2 = "CREATE TABLE IF NOT EXISTS `tickets_msg` (`id` BIGINT NOT NULL AUTO_INCREMENT,`mensaje` VARCHAR(255) NOT NULL,`ticket_id` INT NOT NULL,`id_user` INT NOT NULL,`imagen` VARCHAR(100),`created_at` TIMESTAMP NOT NULL,PRIMARY KEY (`id`)) ENGINE=InnoDB;";
    db.db.queryAsync(sql2).then((rta) => {
        if(rta){ throw rta; }
    }).catch((err) => {
        //console.log(err);
    })
}

module.exports = migration;
