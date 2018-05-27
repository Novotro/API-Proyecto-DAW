'use strict'

var mongoose= require('mongoose');
var Schema= mongoose.Schema;

var EnrollSchema = Schema({
  user: {type: Schema.ObjectId, ref: 'User'},
  enrolled: {type: Schema.ObjectId, ref: 'Travel'}
});

module.exports = mongoose.model('Enroll', EnrollSchema);
