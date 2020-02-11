const helper    = require('./helperFunctions');
const password_hash = require('password-hash');


var controller = {
    get: function(req, res) {
        let id          = req.params.id;
        if(id == 'validate'){
            let legajo = req.query.legajo;
            if(legajo == undefined){
                return helper.helper.errorMsg(res,'No definio el legajo');
            }
            helper.db.queryAsync("SELECT * FROM users WHERE legajo = '"+legajo+"' AND user_del = 0").then((resp) => {
                if(resp.length == 0){
                    return helper.helper.errorMsg(res, 'Usuario inexistente en nuestra base de datos');
                }else{
                    return helper.helper.jsonReturn(res,{
                        autorizado: true
                    });
                }
            });
        }else{
            if(id == "all"){
                sql         = 'SELECT * FROM users';
            }else if(helper.helper.regExCheck(id,1)){
                sql         = "SELECT * FROM users WHERE id = "+id;
            }
            helper.db.queryAsync(sql)
            .then(function(resp){     
                if(resp.length == 0){
                    return helper.helper.errorMsg(res,'No existen registros en la base de datos');
                }
                let resultado = (helper.helper.createUserReturn(resp));
                return helper.helper.jsonReturn(res, resultado);
            });
        } 
    },
    new: function(req, res){
        helper.helper.checkAuth(req,1).then((e) => {
            if(!e) return helper.helper.errorMsg(res,'Usuario no autorizado');
            let data = req.body;
            // consultamos si lleno todos los campos obligatorios
            if(!data.name || !data.lastName || !data.legajo || !data.mail || !data.password || !data.nivel || !data.area || !data.subarea){
                return helper.helper.errorMsg(res, 'Faltan campos para poder crear un usuario. ERR_00');
            }
            // consultamos si ya no existe registrado
            helper.db.queryAsync("SELECT user_del FROM users WHERE legajo = '" + data.legajo + "' OR mail = '" + data.mail + "';").then((q) => {
                if(q.length != 0){
                    return helper.helper.errorMsg(res, 'Error al crear el usuario. ERR_01');
                }
                // consultamos si el nivel, area y subarea existe en la base de datos
                let nivel            = parseInt(data.nivel);
                let area             = parseInt(data.area);
                let subarea          = parseInt(data.subarea);
                let check_area_nivel = helper.helper.getAreaName(area,subarea,nivel);
                if(check_area_nivel.area == '' || check_area_nivel.subarea == '' || check_area_nivel.nivel == ''){
                    return helper.helper.errorMsg(res, 'Error al crear el usuario. ERR_02');
                }
                // Hasheamos la clave
                pass = password_hash.generate(data.password);
                // Chequeamos si el nombre y apellido ingresados cumplen con regex de A-Za-z de 1 a 15 caracteres
                if((!helper.helper.regExCheck(data.name,2)) || (!helper.helper.regExCheck(data.lastName,2))){
                    return helper.helper.errorMsg(res, 'Error al crear el usuario. ERR_03');
                }
                insertData = {
                    name: data.name,
                    lastName: data.lastName,
                    legajo: data.legajo,
                    telefono: data.telefono == undefined ? 0 : data.telefono,
                    mail: data.mail,
                    password: pass,
                    nivel: nivel,
                    area: area,
                    subarea: subarea,
                    imagen: ""
                };
                helper.db.insert_on('users',insertData).then((n) => {
                    return helper.helper.jsonReturn(res, {
                        msg: "Usuario creado exitosamente",
                        id: n.insertId,
                        legajo: insertData.legajo
                    });
                });
            });

        });
    }
};

module.exports = controller;