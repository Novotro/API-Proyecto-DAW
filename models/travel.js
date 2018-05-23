'use strict'

var mongoose= require('mongoose');
var Schema= mongoose.Schema;

var TravelSchema = Schema({
  name: String,
  country: String,
  organizer: {type: Schema.ObjectId, ref: 'User'},
  date: String,
  state: Boolean,
  description: String,
  activities: String,
  galery: [String]
  
});

module.exports = mongoose.model('Travel', TravelSchema);
