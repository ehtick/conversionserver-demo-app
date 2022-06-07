const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProjectSchema = new Schema({ 
  name: { type: String, required: true},
  users: [{user: {type: Schema.Types.ObjectId, ref: 'User'}, role: String}],
  hub: { type: Schema.Types.ObjectId, ref: 'Hub'}
}, {timestamps:true});

module.exports = mongoose.model('Projects', ProjectSchema);

