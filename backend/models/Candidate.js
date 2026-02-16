const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  role:{type:String,required:true},
  year_of_experience:{type:String,required:true},
  key_Skills:{type:String,require:true},
  description:{type:String},
  aadharCard: { type: String, default: null },
  photo: { type: String, default: null },
});

module.exports = mongoose.model('Candidate', candidateSchema);