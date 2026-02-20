import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  examType: {
    type: String,
    enum: ["MCQ", "AI"],
    required: true,
  },

  questionText: { type: String, required: true },

  options: [String], // used for MCQ only
  correctAnswer: String, // used for MCQ only

  answers: [
    {
      candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
      },
      answerText: String,
      score: Number,
      feedback: String,
    },
  ],
});

export default mongoose.model("Question", questionSchema);