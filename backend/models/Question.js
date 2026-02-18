import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
  questionText: { type: String, required: true },
  options: [String],
  correctAnswer: String,
  answers: [{
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
    answerText: String,
    score: Number,
    feedback: String,
  }],
});

export default mongoose.model('Question', questionSchema);