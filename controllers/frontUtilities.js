const helper    = require('./helperFunctions');
const fs        = require('fs');

let controller = {
    areas: function(req, res){
        let base = JSON.parse(fs.readFileSync("./bases/areas.json"));
        let dataReturn = [];
        base.forEach((element) => {
            let data = {
                id: element.ID,
                area: element.AREA
            }
            dataReturn.push(data);
        });
        helper.helper.jsonReturn(res,dataReturn);
    },
    subareas: function(req, res){
        let base        = JSON.parse(fs.readFileSync("./bases/subareas.json"));
        let base_area   = JSON.parse(fs.readFileSync("./bases/areas.json"));
        let dataReturn = [];

        base.forEach((element) => {
            base_area.forEach((element2) => {
                if(element.AREA === element2.AREA){
                    area_id = element2.ID;
                }
            })
            let data = {
                id: element.ID,
                subarea: element.SUBAREA,
                area: {
                    area: element.AREA,
                    a_id: area_id
                }
            }
            dataReturn.push(data);
        });
        helper.helper.jsonReturn(res,dataReturn);
    },
    niveles: function(req, res){
        let base = JSON.parse(fs.readFileSync("./bases/usuarios.json"));
        let dataReturn = [];
        base.forEach((element) => {
            let data = {
                id: element.ID,
                nivel: element.NOMBRE
            }
            dataReturn.push(data);
        });
        helper.helper.jsonReturn(res,dataReturn);
    }
}

module.exports = controller;