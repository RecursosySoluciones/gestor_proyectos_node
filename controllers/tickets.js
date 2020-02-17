const helper        = require('./helperFunctions');
const password_hash = require('password-hash');
const fs            = require('fs');
var base_url        = (JSON.parse(fs.readFileSync("config.json"))).base_url;

let controller = {
    new: function(req,res){
        helper.helper.checkAuth(req,1).then((auth) => {
            if(!auth) return helper.helper.errorMsg(res,'Usuario no autorizado. ERR_AUTH');
            // Almacenamos los datos en las variables 
            let formData = req.body;
            // Verificamos que se hayan enviado los parametros solicitados 
            if(!formData.asunto || !formData.app || !formData.uCreador || !formData.descripcion){
                return helper.helper.errorMsg(res,'Error en los datos enviados. ERR_01');
            }
            dataUpload = {
                asunto: formData.asunto,
                app: parseInt(formData.app),
                uCreador: formData.uCreador,
                id_user: "",
                imagen: "",
                descripcion: formData.descripcion,
                estado: 1,
                ticket_del: false
            }
            let sql = "SELECT id FROM users WHERE legajo = '" + dataUpload.uCreador + "'";
            helper.db.queryAsync(sql).then((data) => {
                if(data.length == 0){
                    return helper.helper.errorMsg(res, "Usuario creador no encontrado. ERR_02");
                }
                dataUpload.id_user = data[0].id;
                helper.db.insert_on('tickets',dataUpload).then((success) => {
                    if(success.length == 0){
                        return helper.helper.errorMsg(res, "Error al guardar el registro. ERR_03");
                    }else{
                        helper.helper.createTicketReturn(success.insertId).then((data2) => {
                            return helper.helper.jsonReturn(res, data2, "Ticket agregado correctamente")
                        }).catch((err) => {return helper.helper.errorMsg(res, err);})
                    }
                }).catch((err) => {return helper.helper.errorMsg(res, err);});
            }).catch((err) => {
                return helper.helper.errorMsg(res, err);
            })
        })
    },
    get: function(req,res){
        helper.helper.checkAuth(req,9).then((auth) => {
            if(!auth) return helper.helper.errorMsg(res,'Usuario no autorizado. ERR_AUTH');
            // generamos la vista segun el nivel de usuario
            let id          = req.params.id;
            if(id == "all"){
                helper.helper.createTicketsList(req).then((data) => {
                    if(data.length == 0){
                        return helper.helper.jsonReturn(res,data,"No existen tickets con los filtros asignados");
                    }else{
                        return helper.helper.jsonReturn(res,data,"Listado de todos los tickets");
                    }
                }).catch((err) => {helper.helper.errorMsg(res,err)});
            }else if(helper.helper.regExCheck(id,1)){
                helper.helper.createTicketReturn(id).then((data2) => {
                    return helper.helper.jsonReturn(res,data2,"Detalle del ticket ID: " + id); 
                }).catch((err) => {helper.helper.errorMsg(res,err)});
            }
        });
    }
}

module.exports = controller;