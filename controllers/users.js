const helper    = require('./helperFunctions');
const password_hash = require('password-hash');

let controller = {
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
            helper.helper.checkAuth(req,1).then((auth) => {

                if(!auth) return helper.helper.errorMsg(res,'Usuario no autorizado. ERR_AUTH');
                    if(id == "all"){
                        sql         = 'SELECT * FROM users WHERE user_del = 0';
                    }else if(helper.helper.regExCheck(id,1)){
                        sql         = "SELECT * FROM users WHERE id = "+id+ " AND user_del = 0";
                    }
                    helper.db.queryAsync(sql)
                    .then(function(resp){     
                        if(resp.length == 0){
                            return helper.helper.errorMsg(res,'No existen registros en la base de datos');
                        }
                        let resultado = (helper.helper.createUserReturn(resp));
                        return helper.helper.jsonReturn(res, resultado);
                    });

            });
        }
    },
    new: function(req, res){
        helper.helper.checkAuth(req,1).then((e) => {
            if(!e) return helper.helper.errorMsg(res,'Usuario no autorizado. ERR_AUTH');
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
    },
    delete: function(req, res){
        helper.helper.checkAuth(req,1).then((auth) => {
            if(!auth) return helper.helper.errorMsg(res,'Usuario no autorizado. ERR_AUTH');
            let id = req.params.id;
            if(helper.helper.regExCheck(id,1)){
                helper.db.update_on('users',{user_del: true},{id: id}).then((response) =>{
                    if(response.affectedRows > 0){
                        return helper.helper.jsonReturn(res,{
                            completed: true,
                            msg: 'Usuario Eliminado Correctamente'
                        });
                    }
                }).catch((err) => {
                    return helper.helper.errorMsg(res, 'Error al eliminar usuario. ERR_01');
                })
            }
        });
    },
    update: function(req, res){
        helper.helper.checkAuth(req,1).then((auth) => {
            if(!auth) return helper.helper.errorMsg(res,'Usuario no autorizado. ERR_AUTH');
            let id = req.params.id;
            if(!helper.helper.regExCheck(id,1)){
                return helper.helper.errorMsg(res, 'El id especificado tiene un valor no valido. ERR_02');
            }
            // Verificamos que parametros se enviaron para modificar y si existe el usuario
            helper.db.queryAsync("SELECT * FROM users WHERE id = "+id+" AND user_del = 0").then((user_data) => {
                if(user_data.length == 0) return helper.helper.errorMsg(res,"Usuario inexistente. ERR_03");
                let form        = req.body;
                let dataUpdate = [];
                if(form.name != undefined){
                    if(helper.helper.regExCheck(form.name,2)){
                        dataUpdate.name = form.name;
                    }else{
                        return helper.helper.errorMsg(res, "Error de datos enviados. ERR_04");
                    }
                }
                if(form.lastName != undefined){
                    if(helper.helper.regExCheck(form.lastName,2)){
                        dataUpdate.lastName = form.lastName;
                    }else{
                        return helper.helper.errorMsg(res, "Error de datos enviados. ERR_05");
                    }
                }
                if(form.telefono != undefined){
                    dataUpdate.telefono = form.telefono;
                }
                if(form.mail != undefined){
                    if(helper.helper.regExCheck(form.mail,3)){
                        dataUpdate.mail = form.mail;
                    }else{
                        return helper.helper.errorMsg(res, "Error de datos enviados. ERR_06");
                    }
                }
                if(form.password != undefined){
                    dataUpdate.password = password_hash.generate(form.password);
                }
                if(form.nivel != undefined){
                    form.nivel = parseInt(form.nivel);
                    let cons_level = helper.helper.getAreaName(0,0,form.nivel);
                    if(cons_level.level != ""){
                        dataUpdate.nivel = form.nivel;
                    }else{
                        return helper.helper.errorMsg(res, "Error de datos enviados. ERR_07");
                    }
                }
                if(form.area != undefined && form.subarea != undefined){
                    form.area       = parseInt(form.area);
                    form.subarea    = parseInt(form.subarea);
                    let cons_area   = helper.helper.getAreaName(form.area,form.subarea,0);
                    if(cons_area.area != "" && cons_area.subarea != ""){
                        dataUpdate.area     = form.area;
                        dataUpdate.subarea  = form.subarea;
                    }else{
                        return helper.helper.errorMsg(res, "Error de datos enviados. ERR_08");
                    }
                }
                if(form.imagen != undefined){
                    dataUpdate = form.imagen;
                }
                if(form.active_user != undefined){
                    dataUpdate.active_user = form.active_user == "true" ? true : false;
                }else{
                    return helper.helper.errorMsg(res, "Error en datos enviados. ERR_08");
                }
                helper.db.update_on('users',dataUpdate,{id: id}).then((rta) => {
                    if(rta.affectedRows > 0){
                        return helper.helper.jsonReturn(res,{
                            msg: "Usuario modificado exitosamente"
                        });
                    }else{
                        return helper.helper.errorMsg(res, "Error al acutualizar. ERR_09");
                    }
                }).catch((err) => {
                    return helper.helper.errorMsg(res, "Error al acutualizar. ERR_10. "+err);
                })
            })

        });
    },
    login: function(req,res){
        let legajo      = req.body.legajo;
        let password    = req.body.password;
        helper.db.queryAsync("SELECT * FROM users WHERE legajo = '"+legajo+"' AND user_del = 0").then((rta) =>{
            if(rta.length == 0) return helper.helper.errorMsg(res, 'Usuario inexistente');
            if(password_hash.verify(password,rta[0].password)){
                let area_level_names = helper.helper.getAreaName(rta[0].area,rta[0].subarea,rta[0].nivel);
                let dataReturn = {
                    login: true,
                    legajo: legajo,
                    userData: {
                        name: rta[0].name,
                        lastName: rta[0].lastName
                    },
                    imagen: rta[0].imagen,
                    nivel: {
                        id: rta[0].nivel,
                        nivel: area_level_names.level
                    },
                    area: {
                        a_id: rta[0].area,
                        area: area_level_names.area,
                        sa_id: rta[0].subarea,
                        subarea: area_level_names.subarea
                    },
                    estado: rta[0].active_user == 1 ? 'Usuario Activo' : 'Usuario Inactivo'
                };
                return helper.helper.jsonReturn(res,dataReturn);
            }else{
                return helper.helper.errorMsg(res,"Error de autenticacion");
            }
        }).catch((err) => {return helper.helper.errorMsg(res,'Error interno ERR_01 '+err)});
    }
};

module.exports = controller;