// const mongoose = require("mongoose");
// const { required } = require("nodemon/lib/config");
// const { use } = require("react");

// const interviewSchema = new mongoose.Schema({
//   difficulty: { type: String, required: true },
//   candidates: [
//     {
//       candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
//       interviewLink: String,
//       username: String,
//       password: String,
//       start_Date: Date,
//       end_Date: Date,
//     },
//   ],
//   duration: { type: String, require: true },
//   test_title: { type: String, required: true },
//   no_of_questions: { type: Number, require: true },
//   primary_skill: { type: String, require: true },
//   secondary_skill: { type: String, require: true },
//   passing_score: { type: String, require: true },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Admin",
//     required: true,
//   },
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("MCQ_Interview", interviewSchema);


const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    difficulty: {
      type: String,
      required: [true, "Difficulty level is required"],
      enum: {
        values: ["Easy", "Intermediate", "Advanced"],
        message: "{VALUE} is not a valid difficulty level",
      },
    },
    candidates: [
      {
        candidateId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Candidate",
          required: true,
        },
        interviewLink: {
          type: String,
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        password: {
          type: String,
          required: true,
        },
        start_Date: {
          type: Date,
          required: true,
        },
        end_Date: {
          type: Date,
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "in_progress", "completed", "expired"],
          default: "pending",
        },
        score: {
          type: Number,
          default: null,
        },
        submittedAt: {
          type: Date,
          default: null,
        },
      },
    ],
    duration: {
      type: String,
      required: [true, "Duration is required"],
    },
    test_title: {
      type: String,
      required: [true, "Test title is required"],
      trim: true,
    },
    no_of_questions: {
      type: Number,
      required: [true, "Number of questions is required"],
      min: [1, "Must have at least 1 question"],
    },
    primary_skill: {
      type: String,
      required: [true, "Primary skill is required"],
      trim: true,
    },
    secondary_skill: {
      type: String,
      trim: true,
      default: "",
    },
    passing_score: {
      type: String,
      required: [true, "Passing score is required"],
    },
    jobDescription: {
      type: String, // Store file path or URL
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Index for faster queries
interviewSchema.index({ createdBy: 1, createdAt: -1 });
interviewSchema.index({ "candidates.candidateId": 1 });

// Virtual for checking if interview is active
interviewSchema.virtual("isActive").get(function () {
  const now = new Date();
  return this.candidates.some(
    (c) => now >= c.start_Date && now <= c.end_Date
  );
});

module.exports = mongoose.model("MCQ_Interview", interviewSchema);