const express = require("express");
const router = express.Router();
const InterviewFeedback = require("../models/InterviewFeedback");
import { auth } from "../middleware/auth";
// ─── POST /feedback ─────────────────────────
router.post("/feedback",auth(candidate), async (req, res) => {
  try {
    const {
      interview_id,
      userName,
      userEmail,
      feedback,
      transcript,
      behaviorReport,
      completedAt,
    } = req.body;

    if (!interview_id) {
      return res.status(400).json({
        success: false,
        message: "interview_id is required",
      });
    }

    const doc = await InterviewFeedback.findOneAndUpdate(
      { interview_id },
      {
        $set: {
          userName,
          userEmail,
          feedback,
          transcript,
          behaviorReport,
          completedAt: completedAt ? new Date(completedAt) : new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      message: "Feedback stored successfully",
      data: doc,
    });

  } catch (error) {
    console.error("POST Feedback Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});


// ─── GET Single ─────────────────────────────
router.get("/feedback/:interview_id", async (req, res) => {
  try {
    const doc = await InterviewFeedback
      .findOne({ interview_id: req.params.interview_id })
      .lean();

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.json({ success: true, data: doc });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});


// ─── LIST All ───────────────────────────────
router.get("/feedbacks", async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const filter = {};

    if (req.query.verdict)
      filter["feedback.overallVerdict"] = req.query.verdict;

    if (req.query.search) {
      filter.$or = [
        { userName: { $regex: req.query.search, $options: "i" } },
        { userEmail: { $regex: req.query.search, $options: "i" } },
        { "feedback.candidateName": { $regex: req.query.search, $options: "i" } },
      ];
    }

    const [docs, total] = await Promise.all([
      InterviewFeedback.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      InterviewFeedback.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: docs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});


// ─── DELETE ────────────────────────────────
router.delete("/feedback/:interview_id", async (req, res) => {
  try {
    await InterviewFeedback.findOneAndDelete({
      interview_id: req.params.interview_id,
    });

    res.json({ success: true, message: "Feedback deleted" });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});
