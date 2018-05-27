//Configuracion de express
'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//Cargar Rutas
var user_routes = require('./routes/user');
var follow_routes = require('./routes/follow');
var publication_routes = require('./routes/publication');
var message_routes = require('./routes/message');
var travel_routes = require('./routes/travel');
var enroll_routes= require('./routes/enroll');


//MidleWares (Metodo que se ejecuta antes de que llegue a un controlador)
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
//Cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    next();
});

//Rutas
app.use('/api', user_routes);
app.use('/api', follow_routes);
app.use('/api',publication_routes);
app.use('/api',message_routes);
app.use('/api',travel_routes);
app.use('/api',enroll_routes);

//Exportar Configuracion
module.exports = app;
