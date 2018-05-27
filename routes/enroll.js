'use strict'

var express =require('express');
var EnrollController = require('../controllers/enroll');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/enroll', md_auth.ensureAuth, EnrollController.saveEnroll);
api.delete('/deleteEnroll/:id', md_auth.ensureAuth, EnrollController.deleteEnroll);
api.get('/getEnrolledUsers/:id', md_auth.ensureAuth, EnrollController.getEnrolledUsers  );
//api.get('/followed/:id?/:page?', md_auth.ensureAuth, FollowController.getFollowedUsers);
//api.get('/getMyEnrolls/:enrolled?', md_auth.ensureAuth, EnrollController.getMyEnrolls);


module.exports = api;