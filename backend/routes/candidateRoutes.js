import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";

import Candidate from "../models/Candidate.js";
import Interview from "../models/MCQ_Interview.js";
import AI_Interview from "../models/AI_Interview.js";
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


// Get interview details for candidate examination
router.get('/interview/:id', auth('candidate'), async (req, res) => {
  const { id } = req.params;
  try {
    const interview = await Interview.findById(id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    const questions = await Question.find({ interviewId: id }).select("-correctAnswer -answers");
    res.json({ interview, questions });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


//get interview MCQ question 
router.get('/interview/:id/questions', auth('candidate'), async (req, res) => {
  const { id } = req.params;
  try {
    const questions = await Question.find({ interviewId: id });
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

router.post('/interview/:id/submit', auth('candidate'), async (req, res) => {
  const { id } = req.params;

  try {
    const questions = await Question.find({ interviewId: id });

    const candidateAnswers = [];

    questions.forEach(q => {
      q.answers.forEach(a => {
        if (a.candidateId.toString() === req.user.id) {
          candidateAnswers.push({
            questionId: q._id,
            answerText: a.answerText,
            score: a.score || 0,
            feedback: a.feedback || '',
          });
        }
      });
    });

    const scores = candidateAnswers.map(a => ({
      questionId: a.questionId,
      score: a.score,
      feedback: a.feedback,
      no_of_questions: questions.length
    }));

    const totalScore = scores.reduce((sum, s) => sum + (s.score || 0), 0);

    const summary = await generateSummary(scores);

    const scoreDoc = new Score({
      interviewId: id,
      candidateId: req.user.id,
      scores,
      totalScore,
      summary,
    });

    const candidate = await Candidate.findById(req.user.id);

  const pdfPath = `uploads/scorecards/${candidate.email}-${id}-${Date.now()}.pdf`;


    // ✅ Generate PDF only once
    await generateScorecardPDF(candidate, scores, totalScore, summary, pdfPath);

    scoreDoc.pdfPath = pdfPath;
    await scoreDoc.save();

    const interview = await Interview.findById(id);
    const admin = await Admin.findById(interview.createdBy);

    // ✅ Send emails properly (NOT generate PDF again)
    // await sendScorecardEmail(candidate.email, pdfPath);
    // await sendScorecardEmail(admin.email, pdfPath);

    res.json({ message: 'Interview submitted, scorecard sent' });

  } catch (error) {
    console.error("Submit error:", error);
    res.status(500).json({ message: error.message });
  }
});



export default router;