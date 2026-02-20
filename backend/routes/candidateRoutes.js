import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";

import Candidate from "../models/Candidate.js";
import Interview from "../models/MCQ_Interview.js";
import AI_Interview from "../models/AI_Interview.js";
import MCQ_Interview from "../models/MCQ_Interview.js";
import Admin from "../models/Admin.js";
import Question from "../models/Question.js";
import Score from "../models/Score.js";
import auth from "../middleware/auth.js";

import { generateSummary } from "../services/aiServiceold.js";
import { generateScorecardPDF } from "../services/pdfService.js";
import {getMCQInterviewById} from "../controllers/adminControllers/AssessmentController.js"

const router = express.Router();

// Candidate login for interview
router.post("/login/:id", async (req, res) => {
  const { email, password } = req.body;
  const { id } = req.params;

  try {
    // 1️⃣ Try finding in Interview
    let interview = await Interview.findById(id)
      .populate("candidates.candidateId", "email");

    // 2️⃣ If not found → Try AI_Interview
    if (!interview) {
      interview = await AI_Interview.findById(id)
        .populate("candidates.candidateId", "email");
    }

    // 3️⃣ If still not found
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // 4️⃣ Find candidate
    const candidateEntry = interview.candidates.find(
      (c) =>
        c.candidateId &&
        c.candidateId.email === email &&
        c.password === password
    );

    if (!candidateEntry) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 5️⃣ Date Check
    const now = new Date();
    const startDate = new Date(candidateEntry.start_Date);
    const endDate = new Date(candidateEntry.end_Date);

    if (now < startDate) {
      return res.status(403).json({
        message: "Interview has not started yet",
      });
    }

    if (now > endDate) {
      candidateEntry.status = "expired";
      await interview.save();

      return res.status(403).json({
        message: "Interview has expired",
      });
    }

    if (candidateEntry.status === "completed") {
      return res.status(403).json({
        message: "Interview already completed",
      });
    }

    // 6️⃣ Generate Token
    const token = jwt.sign(
      { id: candidateEntry.candidateId._id, role: "candidate" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      interviewId: id,
      candidateEntry,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Configure multer for multiple file uploads for candidate documents
const documentsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "uploads";

    if (file.fieldname === "aadharCard") {
      uploadPath = "uploads/aadharCards";
    } else if (file.fieldname === "photo") {
      uploadPath = "uploads/candidate-photo";
    }

    // Create folder if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);

    const fileName = `${req.user.id}_${file.fieldname}_${Date.now()}${ext}`;

    cb(null, fileName);
  }
});

const documentsUpload = multer({
  storage: documentsStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Upload candidate documents: aadharFront, aadharBack, photo
router.put('/:id/upload-aadharCard', auth('candidate'), documentsUpload.fields([
  { name: 'aadharCard', maxCount: 1 }
]), async (req, res) => {
  const { id } = req.params;
  try {
    // Remove debug return so code executes
    const candidate = await Candidate.findById(req.user.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    // Update fields if files are uploaded, convert backslashes to forward slashes
    if (req.files['aadharCard']) {
      candidate.aadharCard = req.files['aadharCard'][0].path.replace(/\\/g, '/');
    }
    await candidate.save();
    res.json({
      message: 'Document uploaded and candidate updated',
      aadharCard: candidate.aadharCard
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/upload-photo', auth('candidate'), documentsUpload.fields([
  { name: 'photo', maxCount: 1 }
]), async (req, res) => {
  const { id } = req.params;
  try {
    // Remove debug return so code executes
    const candidate = await Candidate.findById(req.user.id);
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    // Update fields if files are uploaded, convert backslashes to forward slashes
    
    if (req.files['photo']) {
      candidate.photo = req.files['photo'][0].path.replace(/\\/g, '/');
    }
    await candidate.save();
    res.json({
      message: 'Document uploaded and candidate updated',
      photo: candidate.photo
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get MCQ interview template for candidate
router.get("/assessment/template/:id", auth("candidate"), getMCQInterviewById);

router.get("/interview/:id", auth("candidate"), async (req, res) => {
  try {
    const { id } = req.params;
    const candidateId = req.user.id;

    const interview = await MCQ_Interview.findById(id);
    if (!interview)
      return res.status(404).json({ message: "Interview not found" });

    const candidateEntry = interview.candidates.find(
      (c) => c.candidateId.toString() === candidateId
    );

    if (!candidateEntry)
      return res.status(403).json({ message: "Not authorized" });

    const now = new Date();
    if (now < candidateEntry.start_Date || now > candidateEntry.end_Date) {
      return res.status(403).json({ message: "Interview not active" });
    }

    const questionLimit = interview.no_of_questions;

    let questions;

    // ✅ If already assigned → return same
    if (candidateEntry.assignedQuestions.length > 0) {
      questions = await Question.find({
        _id: { $in: candidateEntry.assignedQuestions },
      }).select("-correctAnswer -answers");
    } else {
      // ✅ Randomly assign only once
      const randomQuestions = await Question.aggregate([
        {
          $match: {
            interviewId: interview._id,
            examType: "MCQ",
          },
        },
        { $sample: { size: questionLimit } },
        { $project: { correctAnswer: 0, answers: 0 } },
      ]);

      candidateEntry.assignedQuestions = randomQuestions.map((q) => q._id);
      candidateEntry.status = "in_progress";

      await interview.save();

      questions = randomQuestions;
    }

    res.json({ interview, questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


//get interview MCQ question 
router.get('/interview/:id/questions', auth('candidate'), async (req, res) => {
  const { id } = req.params;
  try {
    const questions = await Question.find({ interviewId: id });
    console.log("Questions fetched for interview",questions);
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});



router.post('/interview/:id/answer', auth('candidate'), async (req, res) => {
  const { id } = req.params;
  const { questionId, answerText } = req.body;
  try {

    const interview = await Interview.findById(id);
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    // Check if the candidate already answered this question
    const existingAnswerIndex = question.answers.findIndex(
      a => a.candidateId.toString() === req.user.id
    );

    let evaluation;
    console.log("interview.Exam_Type",interview)

      // For MCQ, check if answer is correct, feedback should be blank
      const isCorrect = question.correctAnswer && answerText === question.correctAnswer;
      evaluation = {
        questionId,
        candidateId: req.user.id,
        answerText,
        score: isCorrect ? 10 : 0,
        feedback: ''
      };
  

    if (existingAnswerIndex !== -1) {
      // Update existing answer
      question.answers[existingAnswerIndex].answerText = answerText;
      question.answers[existingAnswerIndex].score = evaluation.score;
      question.answers[existingAnswerIndex].feedback = evaluation.feedback;
    } else {
      // Add new answer
      question.answers.push({
        questionId,
        candidateId: req.user.id,
        answerText,
        score: evaluation.score,
        feedback: evaluation.feedback,
      });
    }

    await question.save();

    res.json({ message: 'Answer submitted', evaluation });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post("/interview/:id/submit", auth("candidate"), async (req, res) => {
  try {
    const { id } = req.params;
    const candidateId = req.user.id;
    console.log("Submit called for interview", id, "by candidate", candidateId);

    // 🔥 1️⃣ Get interview
    const interview = await MCQ_Interview.findById(id);
    if (!interview)
      return res.status(404).json({ message: "Interview not found" });

    // 🔥 2️⃣ Find candidate entry
    const candidateEntry = interview.candidates.find(
      (c) => c.candidateId.toString() === candidateId
    );

    if (!candidateEntry)
      return res.status(403).json({ message: "Not authorized" });

    // 🔥 3️⃣ Prevent double submission
    if (candidateEntry.status === "completed") {
      return res.status(400).json({
        message: "Interview already submitted",
      });
    }

    // 🔥 4️⃣ Use ONLY assigned questions
    const assignedQuestions = candidateEntry.assignedQuestions;

    if (!assignedQuestions || assignedQuestions.length === 0) {
      return res.status(400).json({
        message: "No assigned questions found",
      });
    }

    const questions = await Question.find({
      _id: { $in: assignedQuestions },
    });

    let totalScore = 0;
    const scores = [];

    questions.forEach((q) => {
      const answer = q.answers.find(
        (a) => a.candidateId.toString() === candidateId
      );

      const score = answer?.score || 0;
      totalScore += score;

      scores.push({
        questionId: q._id,
        answerText: answer?.answerText || "",
        score,
        feedback: answer?.feedback || "",
      });
    });

    const totalQuestions = assignedQuestions.length;
    const maxScore = totalQuestions * 10;
    const percentage = (totalScore / maxScore) * 100;

    // 🔥 5️⃣ Generate summary
    const summary = await generateSummary(scores);

    // 🔥 6️⃣ Save score document
    const scoreDoc = new Score({
      interviewId: id,
      examType: interview.examType,
      candidateId,
      scores,
      totalScore,
      summary,
    });
 

    // 🔥 7️⃣ Generate PDF
    const candidate = await Candidate.findById(candidateId);

    const pdfPath = `uploads/scorecards/${candidate.email}-${id}-${Date.now()}.pdf`;

    await generateScorecardPDF(
      candidate,
      scores,
      totalScore,
      summary,
      pdfPath
    );

    scoreDoc.pdfPath = pdfPath;
    await scoreDoc.save();

    // 🔥 8️⃣ Update candidate status inside interview
    candidateEntry.status = "completed";
    candidateEntry.score = totalScore;
    candidateEntry.submittedAt = new Date();

    await interview.save();

    res.json({
      message: "Interview submitted successfully",
      totalScore,
      totalQuestions,
      percentage: Math.round(percentage),
      pdfPath,
    });
  } catch (error) {
    console.error("Submit error:", error);
    res.status(500).json({ message: error.message });
  }
});



export default router;