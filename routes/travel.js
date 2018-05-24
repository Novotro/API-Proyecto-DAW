'use strict'

var express = require ('express');
var TravelController = require('../controllers/travel');

var api= express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/travels'});

api.post('/addTravel', TravelController.saveTravel);
api.get('/travelById/:id',  TravelController.getTravelById);
api.put('/update-travel/:id',  TravelController.updateTravel);
api.get('/travelsList', TravelController.getTravels);




module.exports = api;
