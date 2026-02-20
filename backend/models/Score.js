import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  examType: {
    type: String,
    enum: ["AI", "MCQ"],
    required: true,
  },

  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate",
    required: true,
  },

  scores: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      score: Number,
      feedback: String,
    },
  ],

  totalScore: Number,
  maxScore: Number,
  summary: String,
  pdfPath: String,
});

export default mongoose.model('Score', scoreSchema);