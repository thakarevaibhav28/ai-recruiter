const mongoose = require("mongoose");

const aiInterviewSchema = new mongoose.Schema(
  {
    position: { type: String, required: true },
    description: { type: String },

    jobDescription: { type: String, required: true }, // file path

    difficulty: { type: String, required: true },
    duration: { type: String, required: true },
    passingScore: { type: Number, required: true },

    numberOfQuestions: { type: Number, required: true },
    questions: [{ type: String }],
    skills: [{ type: String }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "scheduled"],
      default: "draft",
    },

    candidates: [
      {
        candidateId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Candidate",
        },
        interviewLink: String,
        password: String,
        scheduledStartDate: Date,
        scheduledEndDate: Date,
        emailSubject: String,
        emailBody: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("AI_Interview", aiInterviewSchema);
