'use strict'

// var path = require('path');
// var fs= require('fs');
var mongoosePaginate = require('mongoose-pagination');
var mongoose = require('mongoose');

var User = require('../models/user');
var Enroll = require('../models/enroll');

function saveEnroll(req,res){
  var params = req.body;
  console.log("alo");
  var enroll= new Enroll();
  enroll.user = req.user.sub;
  enroll.enrolled = params.enrolled;

  enroll.save((err, enrollStored)=>{
    if(err) return res.status(500).send({message: 'Error al guardar el seguimiento'});

    if(!enrollStored){
      return res.status(404).send({message: 'El seguimiento no se ha guardado'});
    }
    //Si no hay errores se envia el seguimiento
    return res.status(200).send({enroll: enrollStored});
  });
}

function deleteEnroll(req,res){
  var userId = req.user.sub;
  var enrollId = req.params.id;

  Enroll.find({'user': userId, 'enroll':enrollId}).remove(err =>{
    if(err) return res.status(500).send({message: 'Error al dejar de seguir'});

    return res.status(200).send({message: ' El usuario ya no está apuntado.'});
  });

}







function getEnrolledUsers(req,res){
  var travelId = req.params.id;

  var page = 1;

  if(req.params.page){
    page = req.params.page;
  }else{
    page = req.params.id;
  }

  var itemsPerPage = 4;


  Enroll.find({enrolled:travelId}).populate('user').paginate(page, itemsPerPage, (err,enrolls, total) =>{
    console.log(err);
      if(err) return res.status(500).send({message: 'Error en el servidor'});

      if(!enrolls) return res.status(404).send({message: 'No te sigue ningun usuario'});

      enrollUserIds(req.params.id).then((value)=>{
          return  res.status(200).send({
              total: total,
              pages: Math.ceil(total/itemsPerPage),
              enrolls,
              users_follow_me: value.enrolled
           });
       });
  });

}




  //Devolver listado de usuarios

function getMyEnrolls(req,res){
  var userId = req.user.sub;
  var enrolled = req.params.enrolled;

  var find = Enroll.find({user:userId});
  

  find.populate('user enrolled').exec((err, enrolls)=>{
    if(err) return res.status(500).send({message: 'Error en el servidor'});

    if(!enrolls) return res.status(404).send({message: 'No te sigue ningun usuario'});

    return  res.status(200).send({enrolls});
  });
}



async function enrollUserIds(user_id){
    try {

        var enrolled = await Enroll.find({'enrolled':user_id}).select({'_id':0,'__v':0,'enrolled':0}).exec()
        .then((enrolled) => {
            return enrolled;
        })
        .catch((err)=>{
            return handleError(err);
        });    //Procesr following ids



        //Procesar followed ids
        var enrolled_clean = [];
        enrolled.forEach((enrolled)=>{
          enrolled_clean.push(enrolled.user);
        });

        return{
            enrolled: enrolled_clean
        }
        return {
            enrolled: enrolled
        }
    } catch(e){
        console.log(e);
    }
}







module.exports={
  saveEnroll,
  deleteEnroll,
  getEnrolledUsers,
  //getMyEnrolls,
  /*
    getFollowedUsers,
  getMyFollows,
  followUserIds*/
}
