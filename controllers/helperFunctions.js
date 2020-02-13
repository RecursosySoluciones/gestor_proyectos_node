const mysql = require('mysql');
const fs    = require('fs');
const password_hash = require('password-hash');


let db = {
    connect: () => {
        var conn = mysql.createConnection({
            host: "localhost",
            user: 'root',
            password: '',
            database: 'ticketera_telecom',
            port: 3306
        });
        conn.connect();
        return conn;
    },
    query: function(query, resultado) {
        let connect = db.connect();
        connect.query(query,function(err, res) {
            return resultado(err, res);
        });
    },
    queryAsync: async function(query) {

        let connect = db.connect();
        return new Promise((res, rec) => {
            connect.query(query,function (err,resultado) {
                if(err){
                    rec();
                }
                res(resultado);
            })
        })
    },
    insert_on: async function(table,value){
        let sql = "";
        let columns = "INSERT INTO `"+table+"` (";
        let values  = " VALUES (";
        let i = 1;
        obj_length = helper.object_size(value);
        for(key in value){
            if(i < obj_length){
                columns += key+",";
                values  += typeof(value[key] === 'string') ? "'" + value[key] + "'," : value[key] + ",";
            }else if(i == obj_length){
                columns += key+")";
                values  += typeof(value[key] === 'string') ? "'" + value[key] + "')" : value[key] + ")";
            }
            i++;
        }
        sql = columns + values;
        return new Promise ((resolve,reject) => {
            this.queryAsync(sql).then((e) => {
                resolve(e);
            });
        })
    },
    update_on: async function(table,value,where){
        let sql = "UPDATE "+ table;
        let set = " SET ";
        let whe = " WHERE ";
        let k = 1;
        let i = 1;
        set_length = helper.object_size(value);
        whe_length = helper.object_size(where);
        for(key in value){
            if(i < set_length){
                set += typeof(value[key]) == 'string' ? key + " = '" + value[key] + "'," : key + " = " + value[key] + ",";
            }else if(i == set_length){
                set += typeof(value[key]) == 'string' ? key + " = '" + value[key] + "'": key + " = " + value[key];
            }
            i++
        }

        for(key in where){
            if(k < whe_length){
                whe += typeof(where[key]) == 'string' ? key + " = '" + where[key] + "' AND " : key + " = " + where[key] + " AND ";
            }else if(k == whe_length){
                whe += typeof(where[key]) == 'string' ? key + " = '" + where[key] + "'" : key + " = " + where[key] + ";";
            }
            k++
        }
        sql += set + whe;
        return new Promise((resolve,reject) => {
            this.queryAsync(sql).then((rta) => {
                resolve(rta);
            }).catch((err) => {
                reject(err);
            })
        });

    }
};

let helper = {
    regExCheck: (value, type) => {
        let regEx, exp;
        switch(type){
            case 1:
                regEx   = /^([0-9]{1,7})$/;
                exp     = new RegExp(regEx);
                return exp.test(value);
                // id regex
            break;
            case 2:
                regEx   = /^([A-Za-z]{1,15})+( [A-Za-z]{1,15})?$/;
                exp     = new RegExp(regEx);
                return exp.test(value);
            break;
            case 3:
                regEx   = /^([A-Za-z0-9\.\_\-]{1,20})+@+([a-z]{1,15})+(\.[a-z]{1,4})+(\.[a-z]{1,3})?$/;
                exp     = new RegExp(regEx);
                return exp.test(value);
            break; 
        }
    },
    object_size: function(obj){
        let count = 0;
        for(key in obj){
            count++;
        }
        return count;
    },
    getAreaName: function(area_id, subarea_id, level_id){
        let area_base       = JSON.parse(fs.readFileSync("./bases/areas.json"));
        let subarea_base    = JSON.parse(fs.readFileSync("./bases/subareas.json"));
        let levels_base     = JSON.parse(fs.readFileSync("./bases/usuarios.json"));
        let data = {
            area: "",
            subarea: "",
            level: ""
        };
        if(area_id > 0 && subarea_id > 0){
            area_base.forEach(element => {
                if(element.ID == area_id){
                    data.area = element.AREA;
                }
            });
            subarea_base.forEach(element => {
                if(element.ID == subarea_id && element.AREA == data.area){
                    data.subarea = element.SUBAREA;
                }
            });
        }
        if(level_id > 0){
            levels_base.forEach(element => {
                if(element.ID == level_id){
                    data.level = element.NOMBRE;
                }
            });
        }
        return data;

    },
    createUserReturn: function(array_users){
        let returndata = [];
        array_users.forEach(function (data) {
            let area_level_names = helper.getAreaName(data.area,data.subarea,data.nivel);
            let tempData = {
                id: data.id,
                name: data.name,
                lastName: data.lastName,
                legajo: data.legajo,
                telefono: data.telefono,
                mail: data.mail,
                nivel: {
                    id: data.nivel,
                    name: area_level_names.level
                },
                area: {
                    area_id: data.area,
                    area_name: area_level_names.area,
                    subarea_id: data.subarea,
                    subarea_name: area_level_names.subarea
                },
                imagen: data.imagen, 
                active_user: data.active_user == 1 ? 'Usuario Activo' : 'Usuario Inactivo',
                dates: {
                    created: data.created_at,
                    lastUpdate: data.updated_at
                }
            }
            returndata.push(tempData)
        })
        return returndata;
    },
    errorMsg: function(res,msg = ""){
        return res.status(200).send({
            error: true,
            msg: msg
        });
    },
    jsonReturn: function(res, object){
        return res.status(200).json(object);
    },
    checkAuth: async function(res,level){
        let auth = res.headers.authorization;
        if(auth == undefined){
            return false;
        }
        auth = auth.split(" ");
        if(auth[0] != 'Basic'){
            return false;
        }
        auth = (Buffer.from(auth[1],'base64')).toString().split(":");
        let user = auth[0];
        let pass = auth[1];
        return new Promise((res,rec) => {
            db.queryAsync("SELECT id,password,nivel FROM users WHERE legajo = '" + user + "' AND user_del = 0").then((e) => {
                if(level < e[0].nivel){
                    res(false);
                }
                if(e.length == 0){
                    res(false);
                }else{
                    let passHash = e[0].password;
                    if(password_hash.isHashed(passHash)){
                        return password_hash.verify(pass,passHash) ? res(true) : res(true);
                    }else{
                        return res(false);
                    }
                }
            })
        })
    },
    deletePicturesNotUsed: function(type){
        switch(type) {
            case 'profile':
                // funcion que elimina las imagenes que no estan linkeadas, osea son viejas
                let profileImgs = fs.readdirSync('public/imgs');
                db.db.queryAsync("SELECT imagen FROM users").then((element) => {
                    element.forEach((el) => {
                        if(el.imagen != "" && el.imagen != null){
                            imagen_db = (el.imagen.split('/'))[2];
                            profileImgs.forEach((elem) => {
                                if(elem != imagen_db){
                                    fs.unlink('public/imgs/' + elem,(err) => {
                                        if(err){
                                            throw err;
                                        }
                                    })
                                }
                            })
                        }
                    })
                });
            break;
            default:
                console.log('Valor invalido en funcion de deletePicturesNotUsed');
            break;
        }

    },
    getStatusTicketName: function(id_status){
        let ticket_status = JSON.parse(fs.readFileSync("./bases/estado_tickets.json"));
        let returnData = {
            id: "",
            estado: ""
        }
        ticket_status.forEach((element) => {
            if(element.ID == id_status){
                returnData = {
                    id: element.ID,
                    estado: element.ESTADO
                }
            }
        });
        return returnData;
    }
} 

module.exports.db       = db;
module.exports.helper   = helper;