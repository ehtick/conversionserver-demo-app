const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const HubSchema = new Schema({ 
  name: { type: String, required: true},
  users: [{user: {type: Schema.Types.ObjectId, ref: 'User'}, role: String}],  
});

module.exports = mongoose.model('Hubs', HubSchema);

