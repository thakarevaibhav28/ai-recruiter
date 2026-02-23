import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "interviewModel",
      required: true,
    },

    interviewModel: {
      type: String,
      required: true,
      enum: ["AI_Interview", "MCQ_Interview"],
    },
    examType: {
      type: String,
      enum: ["AI", "MCQ"],
      required: true,
    },

    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate", // 👈 MUST MATCH model name exactly
      required: true,
    },

    scores: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true
        },
        score: Number,
        feedback: String,
      },
    ],

    totalScore: Number,
    maxScore: Number,
    summary: String,
    pdfPath: String,
  },
  { timestamps: true },
);

export default mongoose.model("Score", scoreSchema);
