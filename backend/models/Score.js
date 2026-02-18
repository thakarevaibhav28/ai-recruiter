import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema({
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  scores: [{ questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }, score: Number, feedback: String }],
  totalScore: Number,
  summary: String,
  pdfPath: String,
});

export default mongoose.model('Score', scoreSchema);