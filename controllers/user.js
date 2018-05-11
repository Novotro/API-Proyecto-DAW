'use strict'
//Encriptador de contraseñas
var bcrypt = require('bcrypt-nodejs');

var User = require('../models/user');

var jwt = require('../services/jwt');

var mongoosePaginate = require('mongoose-pagination');

var fs = require('fs');
var path = require('path');


//metodos de prueba
function home(req,res){
  res.status(200).send({
    message: 'Hola mundo'
  });
}

function pruebas(req,res){
  res.status(200).send({
    message: 'Hola mundocpor post'
  });
}

//Registro de usuario
function saveUser(req,res){
  var params = req.body; //Es recomendable hacer una variable para los parametros que llegan desde request
  var user = new User();

  //Si llegan todos estos campos...
  if(params.name && params.surname && params.nick && params.email && params.password){

    user.name = params.name;
    user.surname = params.surname;
    user.nick = params.nick;
    user.email= params.email;
    user.role = 'ROLE_USER';
    user.image = null;

    //Controlar usuarios duplicados
    User.find({ $or: [
      {email: user.email.toLowerCase()},
      {nick: user.nick.toLowerCase()}

        ]}).exec((err,users) => {
          if(err) return res.status(500).send({message: 'Error en la peticin de usuarios'});

          if(users && users.length>=1){
            return res.status(200).send({message: 'El usuario que intentas registrar ya existe'});
          }else{
            //Cifra la contraseña y guarda los datos
            bcrypt.hash(params.password, null, null,(error,hash) =>{
              user.password = hash;
              user.save((err, userStored) =>{
                  if(err) return res.status(500).send({message: 'Error al guardar el usuario'});
                  //Si el usuario se guarda
                  if(userStored){
                    res.status(200).send({user: userStored});
                  }else{
                    res.status(404).send({message: 'No se ha registrado el usuario'});
                  }
              });
            });
          }
        });

  }else{
    res.status(200).send({message: 'Envia todos los campos necesarios!!'});
  }

}
//Login de usuario
function loginUser(req,res){
  var params =req.body;

  var email= params.email;
  var password= params.password;

  //Esto es como un WHERE email=email...etc
  User.findOne({email: email}, (err,user) =>{
      if(err) return res.status(500).send({message: 'Error en la petición'});

      if(user){
        bcrypt.compare(password, user.password,(err,check) => {
          if(check){
            if(params.gettoken){
              //generar y devolver token
              res.status(200).send({
                token: jwt.createToken(user)
              });
            }else{
              //Devolver datos de usuario
              user.password= undefined;//Evito enviar la contraseña por las cabeceras
              res.status(200).send({user});
            }
          }else{
            return res.status(404).send({message: 'El usuario no se ha podido identificar'});
          }
      });
    }else{
      return res.status(404).send({message: 'El usuario no se ha podido identificar!!'});
    }
  });
}

//Conseguir datos de un usuarios
function getUser(req,res){
  var userId = req.params.id;

  User.findById(userId, (err,user) => {
    if(err) return res.status(500).send({message: 'Error en la peticion'});

    if(!user) return res.status(404).send({message: 'El usuario no existe'});

    return res.status(200).send({user});
  });
}


//Devolver un listado de usuarios painado
function getUsers(req,res){
  var identity_user_id = req.user.sub; //Aqui esta el id del usuario logeado por jwt.js

  var page = 1;
  if(req.params.page){
    page = req.params.page;
  }

  var itemsPerPage = 5; // items por pagination

  User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) =>{
      if(err) return res.status(500).send({message: 'Error en la peticion'});

      if(!users) return res.status(404).send({message: 'No hay usuarios disponibles'});

      return res.status(200).send({
        users,
        total,
        pages: Math.ceil(total / itemsPerPage)
      });
  });
}

//Edicion de datos de usuarios
function updateUser(req, res){
  var userId= req.params.id;
  var update = req.body; // todos los parametros parados por la request

  //borrar la propiedad password
  delete update.password;
  if(userId != req.user.sub){
    return res.status(500).send({message: 'No tienes permiso para actualizar los datos del usuario'});
  }

  User.findByIdAndUpdate(userId, update, {new:true},(err,userUpdated) =>{ //con true devuelve el usuario actualizado despues de actualizarlo
    if(err) return res.status(500).send({message: 'Error en la peticion'});

    if(!userUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'});

    return res.status(200).send({user: userUpdated});//Devuelve el usuario actualizado

  });
}


//Subir archivos de imagen/avatar de usuarios
function uploadImage(req,res){
  var userId= req.params.id;
  //En la request se envian los ficheros
  if(req.files){
    //nombre del archivos
    var file_path = req.files.image.path;
    var file_split = file_path.split('/'); // Al estar en linux hay que poner solo una /, en windows seria \\
    var file_name = file_split[2];

    //Guardo extension del fichero
    var ext_split = file_name.split('\.');
    var file_ext = ext_split[1];

    if(userId != req.user.sub){
      return removeFilesOfUploads(res, file_path, 'No tienes permiso para actualizar los datos del usuario');
    }


    if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
      //Actualizar imagen del usuario logeado
      User.findByIdAndUpdate(userId, {image: file_name}, {new:true}, (err,userUpdated) =>{ //con true devuelve el usuario actualizado despues de actualizarlo
        if(err) return res.status(500).send({message: 'Error en la peticion'});

        if(!userUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'});

        return res.status(200).send({user: userUpdated});//Devuelve el usuario actualizado

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
  var path_file = './uploads/users/'+image_file;

  fs.exists(path_file, (exists)=>{
    if(exists){
      res.sendFile(path.resolve(path_file));
    }else{
      return res.status(200).send({message: 'No existe la imagen...'});
    }
  });

}





//Funcion anonima para borrar archivos
function removeFilesOfUploads(res,file_path, message){
  fs.unlink(file_path, (err) =>{
    return res.status(200).send({message: message});
  });

}



//Hay que exportar las funciones a objetos
module.exports = {
  home,
  pruebas,
  saveUser,
  loginUser,
  getUser,
  getUsers,
  updateUser,
  uploadImage,
  getImageFile
}
