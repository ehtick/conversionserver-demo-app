const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const HubSchema = new Schema({ 
  name: { type: String, required: true},
  users: [{email:String, role: String}],  
});

module.exports = mongoose.model('Hubs', HubSchema);

