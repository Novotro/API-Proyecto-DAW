'use strict'
//Encriptador de contraseñas
var bcrypt = require('bcrypt-nodejs');

var Travel = require('../models/travel');
var Follow = require('../models/follow');
var Publication = require('../models/publication');

//var jwt = require('../services/jwt');

//var mongoosePaginate = require('mongoose-pagination');

var fs = require('fs');
var path = require('path');


//Registro del viaje
function saveTravel(req,res){
    var params = req.body; //Es recomendable hacer una variable para los parametros que llegan desde request
    var travel = new Travel();

    console.log(params);
    if(params.name && params.country && params.date && params.description && params.organizer){

        travel.name = params.name;
        travel.country = params.country;
        travel.organizer=params.organizer;
        travel.date= params.date;
        travel.status = true;
        travel.description = params.description;
        travel.galery = [];
        travel.markers =  params.markers;


        travel.save((err, travelStored) =>{
            if(err) return res.status(500).send({message: 'Error al guardar el viaje'});
            //Si el viaje se guarda
            if(travelStored){
                res.status(200).send({travel: travelStored});
            }else{
                console.log("errooooooor");
                res.status(404).send({message: 'No se ha registrado el viaje'});
            }
        });

    }else{
        res.status(200).send({message: 'Envia todos los campos necesarios!!'});
    }

}


//Conseguir datos del viaje
function getTravelById(req,res){
    var travelId = req.params.id;

    Travel.findById(travelId, (err,travel) => {
        if(err) return res.status(500).send({message: 'Error en la peticion'});

        if(!travel) return res.status(404).send({message: 'El viaje no existe'});

        /*followThisTravel(req.travel.sub, travelId).then((value)=>{
            return res.status(200).send({
                travel,
                following: value.following,
                followed: value.followed

            });

        });*/
        return res.status(200).send({travel});

    });
}

//Funcion asincrona, devuelve promesa
async function followThisTravel(identity_user_id, user_id){
    try {
        var following = await Follow.findOne({ user: identity_user_id, followed: user_id}).exec()
        .then((following) => {
            return following;
        })
        .catch((err)=>{
            return err;
        });
        var followed = await Follow.findOne({ user: user_id, followed: identity_user_id}).exec()
        .then((followed) => {
            return followed;
        })
        .catch((err)=>{
            return err;
        });
        return {
            following: following,
            followed: followed
        }
    } catch(e){
        console.log(e);
    }
}




//Devolver un listado de viajes paginado
function getTravels(req,res){
    //var identity_travel_id = req.travel.sub; //Aqui esta el id del usuario logeado por jwt.js
    var paginar = req.params.paginar;
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 5; // items por pagination
    if(paginar=="true"){
        Travel.find().sort('_id').paginate(page, itemsPerPage, (err, travels, total) =>{
            if(err) return res.status(500).send({message: 'Error en la peticion'});

            if(!travels) return res.status(404).send({message: 'No hay viajes disponibles'});

            return   res.status(200).send({
                travels,
                total,
                pages: Math.ceil(total / itemsPerPage)
            });
        });

    }else{
        Travel.find().sort('_id').exec((err, travels) =>{
            if(err) return res.status(500).send({message: 'Error en la peticion'});

            if(!travels) return res.status(404).send({message: 'No hay viajes disponibles'});

            return  res.status(200).send({travels});
        });

    }

    

}


//Borrar usuario
function deleteTravel(req,res){
    var travelId= req.params.id;
        Travel.findByIdAndRemove(travelId,(err) =>{
            console.log(travelId);
            if(err) return res.status(500).send({message: 'Error al borrar al viaje'});

            return res.status(200).send({message: 'Viaje Borrado'});
        });
}


//Subir archivos de imagen/avatar de usuarios
function uploadImage(req,res){
    var travelId= req.params.id;
    //En la request se envian los ficheros
    if(req.files){
        //nombre del archivos
        console.log("-----------------");

        var file_path = req.files.image.path;
        var file_split = file_path.split('/'); // Al estar en linux hay que poner solo una /, en windows seria \\
        var file_name = file_split[2];

        //Guardo extension del fichero
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
            //Actualizar imagen del usuario logeado

            Travel.findById(travelId, (err,travel) => {
                if(err) return res.status(500).send({message: 'Error en la peticion'});
        
                if(!travel) return res.status(404).send({message: 'El viaje no existe'});
                travel.galery.push( file_name)
                Travel.findByIdAndUpdate(travelId, travel, {new:true},(err,travelUpdated) =>{ //con true devuelve el usuario actualizado despues de actualizarlo
                    if(err) return res.status(500).send({message: 'Error en la peticion'});
        
                    if(!travelUpdated) return res.status(404).send({message: 'No se ha podido actualizar la galeria'});
        
                    return res.status(200).send({travel: travelUpdated});//Devuelve el usuario actualizado
        
                });
        
            });
        }else{
            //Elimina el archivo si no tiene la extension correcta
            return removeFilesOfUploads(res, file_path, 'Extension no valida');
        }

    }else{
        return res.status(200).send({message: 'No se han subido imagenes'});
    }

}

function getImageFile(req,res){
    var image_file = req.params.imageFile;//Va por la Url
    var path_file = './uploads/travels/'+image_file;

    fs.exists(path_file, (exists)=>{
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            return res.status(200).send({message: 'No existe la imagen...'});
        }
    });
}





//Edicion de datos de usuarios
function updateTravel(req, res){
    var travelId= req.params.id;
    var update = req.body; // todos los parametros parados por la request

    update.organizer=null;
    update.state=null;
    update.state=true;
    update.activities="";
    update.galery=null;
    const mongoose = require('mongoose');
    //console.log(mongoose.Types.ObjectId.isValid(travelId));

    //console.log(travelId);
    Travel.findByIdAndUpdate(travelId, update, {new:true},(err,travelUpdated) =>{ //con true devuelve el usuario actualizado despues de actualizarlo
        if(err) return res.status(500).send({message: 'Error en la peticion ', err});

        if(!travelUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario', err});

        return res.status(200).send({travel: travelUpdated});//Devuelve el usuario actualizado

    });


}


//Hay que exportar las funciones a objetos
module.exports = {
    saveTravel,
    updateTravel,
    getTravelById,
    getTravels,
    deleteTravel,
    uploadImage,
    getImageFile

}
