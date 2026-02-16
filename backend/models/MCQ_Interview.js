const mongoose = require("mongoose");
const { required } = require("nodemon/lib/config");

const interviewSchema = new mongoose.Schema({
  difficulty: { type: String, required: true },
  candidates: [
    {
      candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
      interviewLink: String,
      password: String,
      start_Date: Date,
      end_Date: Date,
    },
  ],
  duration: { type: String, require: true },
  test_title: { type: String, required: true },
  no_of_questions: { type: Number, require: true },
  primary_skill: { type: String, require: true },
  secondary_skill: { type: String, require: true },
  passing_score: { type: String, require: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MCQ_Interview", interviewSchema);
