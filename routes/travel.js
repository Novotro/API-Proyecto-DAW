'use strict'

var express = require ('express');
var TravelController = require('../controllers/travel');

var api= express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/travels'});

console.log("paso2");
api.post('/addTravel', TravelController.saveTravel);
api.get('/travelById/:id',  TravelController.getTravelById);
api.put('/update-travel/:id',  TravelController.updateTravel);
api.get('/travelsList/:paginar?', TravelController.getTravels);
api.get('/travelsListFollow/:id', TravelController.getTravelsFollow);
api.delete('/delete-travel/:id', TravelController.deleteTravel);
api.post('/upload-image-travel/:id',  md_upload, TravelController.uploadImage);
api.get('/get-image-travel/:imageFile', TravelController.getImageFile);





module.exports = api;
