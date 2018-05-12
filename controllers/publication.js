'use strict'

var path = require('path');
var fs =require('fs');
var moment = require('moment');
var mongooosePaginate = require('mongoose-pagination');

var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');

function probando(req,res){
  res.status(200).send({message: "hola desde el controlador de publicaciones"});
}


module.exports={
  probando
}
