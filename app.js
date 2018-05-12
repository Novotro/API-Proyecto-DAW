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


//MidleWares (Metodo que se ejecuta antes de que llegue a un controlador)
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
//Cors

//Rutas
app.use('/api', user_routes);
app.use('/api', follow_routes);
app.use('/api',publication_routes);
app.use('/api',message_routes);

//Exportar Configuracion
module.exports = app;
