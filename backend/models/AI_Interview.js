const mongoose = require('mongoose');
const { required } = require('nodemon/lib/config');

const aiinterviewSchema = new mongoose.Schema({
  jobDescription: { type: String, required: true },
  difficulty: { type: String, required: true },
  duration: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  createdAt: { type: Date, default: Date.now },
  candidates: [{
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
    interviewLink: String,
    password: String,
    scheduledStartDate: Date,
    scheduledEndDate: Date,
    emailSubject: String,
    emailBody: String,
  }]
});

module.exports = mongoose.model('AI_Interview', aiinterviewSchema);