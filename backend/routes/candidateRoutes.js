const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Candidate = require('../models/Candidate');
const Interview = require('../models/MCQ_Interview');
const Admin = require('../models/Admin');
const Question = require('../models/Question');
const Score = require('../models/Score');
const auth = require('../middleware/auth');
const { evaluateAnswer, generateSummary } = require('../services/aiService');
const { generateScorecardPDF, sendScorecard } = require('../services/pdfService');
const multer = require('multer');
const path = require('path');

// Candidate login for interview
router.post('/login/:id', async (req, res) => {
  const { email, password } = req.body;
  const { id } = req.params;

  try {
    // Find the interview by ID
    const interview = await Interview.findById(id).populate('candidates.candidateId', 'email');


    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Find the candidate entry in the interview's candidates array
    const candidateEntry = interview.candidates.find(
      c =>
        c.candidateId &&
        c.candidateId.email === email &&
        c.password === password
    );


    if (!candidateEntry) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: candidateEntry.candidateId._id, role: 'candidate' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, interviewId: id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});




// Configure multer for multiple file uploads for candidate documents
const documentsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.params.id}_${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const documentsUpload = multer({ storage: documentsStorage });



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


router.get('/interview/:id', auth('candidate'), async (req, res) => {
  const { id } = req.params;
  try {
    const interview = await Interview.findById(id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    const questions = await Question.find({ interviewId: id });
    res.json({ interview, questions });
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
    if (interview.Exam_Type === 'MCQ') {
      // For MCQ, check if answer is correct, feedback should be blank
      const isCorrect = question.correctAnswer && answerText === question.correctAnswer;
      evaluation = {
        score: isCorrect ? 10 : 0,
        feedback: ''
      };
    } else {
      // For other types, use AI evaluation
      evaluation = await evaluateAnswer(question.questionText, answerText);
    }

    if (existingAnswerIndex !== -1) {
      // Update existing answer
      question.answers[existingAnswerIndex].answerText = answerText;
      question.answers[existingAnswerIndex].score = evaluation.score;
      question.answers[existingAnswerIndex].feedback = evaluation.feedback;
    } else {
      // Add new answer
      question.answers.push({
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
    const candidateAnswers = questions.flatMap(q => q.answers.filter(a => a.candidateId.toString() === req.user.id));

    if (candidateAnswers.length < 15) {
      return res.status(400).json({ message: 'All questions must be answered' });
    }

    const scores = candidateAnswers.map(a => ({
      questionId: a.questionId,
      score: a.score,
      feedback: a.feedback,
    }));
    console.log("scores",scores)
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
    const summary = await generateSummary(scores);

    const score = new Score({
      interviewId: id,
      candidateId: req.user.id,
      scores,
      totalScore,
      summary,
    });

    const candidate = await Candidate.findById(req.user.id);
    const pdfPath = `scorecards/${candidate.email}-${id}.pdf`;
    await generateScorecardPDF(candidate, scores, totalScore, summary, pdfPath);
    score.pdfPath = pdfPath;
    await score.save();

    const admin = await Admin.findById((await Interview.findById(id)).createdBy);
    await sendScorecard(candidate.email, pdfPath);
    await sendScorecard(admin.email, pdfPath);

    res.json({ message: 'Interview submitted, scorecard sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;