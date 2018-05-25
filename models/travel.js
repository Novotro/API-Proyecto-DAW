'use strict'

var mongoose= require('mongoose');
var Schema= mongoose.Schema;

var TravelSchema = Schema({
  name: String,
  country: String,
  organizer: {type: Schema.ObjectId, ref: 'User'},
  date: String,
  status: Boolean,
  description: String,
  galery: [String],
  markers: []

});




module.exports = mongoose.model('Travel', TravelSchema);
