import express from "express";
import multer from "multer";
import auth from "../middleware/auth.js";

import mammoth from "mammoth";
import OpenAI from "openai";

import {
  RegisterUser,
  LoginUser,
  getMe,
  GetTopPerformance
} from "../controllers/adminControllers/AuthorizationController.js";

import {
  GetAllMCQInterviews,
  CreateMCQTemplate,
  AssessmentInvitation,
  AssessmentInvitationByID,
  GetCandidatesInInterview,
  updateMCQInterview,
} from "../controllers/adminControllers/AssessmentController.js";

import {
  CreateAITemplate,
  AIInterviewInvitation,
  GetAllAIInterview,
  ScheduleAiInterview,
  UpdateAIInterview
} from "../controllers/adminControllers/InterviewController.js";

import {
  CreateCandidate,
  GetCandidate,
  UpdateCandidate,
GetAllSchedule,
  BulkAddCandidates,
} from "../controllers/candidateControllers/AuthorizationController.js";

const router = express.Router();

// Configure multer to preserve the original file extension and set a proper destination
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Admin registration and login routes
router.post("/register", RegisterUser);
router.post("/login", LoginUser);
router.get("/me", auth("admin"), getMe);

router.get("/top-performance", auth("admin"), GetTopPerformance);

// POST Create MCQ Assessment Template
router.post(
  "/assessment/template",
  auth("admin"),
  upload.single("jobDescription"),
  CreateMCQTemplate,
);

// POST Create MCQ Assessment and Send Invites
router.post(
  "/assessment/send-invites",
  auth("admin"),
  upload.single("jobDescription"),
  AssessmentInvitation,
);

// Send single assessment invite by assessment ID
router.post(
  "/assessment/:assessmentId/invite",
  auth("admin"),
  AssessmentInvitationByID,
);

// GET all MCQ interviews/templates
router.get("/assessment/mcq/list", auth("admin"), GetAllMCQInterviews);

router.put(
  "/assessment/template/:id/update",
  auth("admin"),
  upload.single("jobDescription"),
  updateMCQInterview,
);

// router.post("/assessment/:id/generate-questions", auth("candidate"), GenerateMCQQuestions);

//Create AI interview
router.post(
  "/interview/template",
  auth("admin"),
  upload.single("jobDescription"),
  CreateAITemplate,
);

// Send interview invitations
router.post("/interview/send-invites", auth("admin"), AIInterviewInvitation);

// Update interview status (draft/scheduled)
router.put(
  "/interview/template/:id/update",
  auth("admin"),
  UpdateAIInterview,
);

router.get("/interviews/list", auth("admin"), GetAllAIInterview);

// Create Candidate
router.post("/create/candidate", auth("admin"), CreateCandidate);

router.get("/candidates", auth("admin"), GetCandidate);

router.patch("/candidate/:id", auth("admin"), UpdateCandidate);

// Get all Assessment Schedule data
router.get("/total-schedule", auth("admin"), GetAllSchedule);

// Get all AI Interview Schedule data
// router.get("/total-schedule", auth("admin"), GetAllAiInterviewSchedule);
router.post(
  "/candidates/bulk",
  auth("admin"),
  upload.single("csvFile"),
  BulkAddCandidates,
);

// Get all candidates for a specific interview, including scorecard info if available and scheduledDate, result (pass/fail)
router.get(
  "/assessment/:id/getcandidates/mcq",
  auth("admin"),
  GetCandidatesInInterview,
);

// POST  /interview/:id/candidate/schedule/ai
// router.post("/interview/:id/candidate/schedule/ai",auth("admin"),async (req, res) => {
//     try {
//       const { scheduledDate, candidates } = req.body;
//       const { id } = req.params;

//       if (!scheduledDate || !Array.isArray(candidates) || !candidates.length) {
//         return res
//           .status(400)
//           .json({ message: "scheduledDate and candidates[] are required" });
//       }

//       const job = await MCQ_Interview.findById(id);
//       if (!job) return res.status(404).json({ message: "Interview not found" });

//       const updatedCandidates = [];

//       for (const candId of candidates) {
//         const candidate = await Candidate.findById(candId);
//         if (!candidate)
//           return res
//             .status(404)
//             .json({ message: `Candidate ${candId} not found` });

//         // 1️⃣  check if candidate already stored in interview
//         const existing = job.candidates.find(c =>
//           c.candidateId.equals(candidate._id)
//         );

//         const entry = {
//           candidateId: candidate._id,
//           interviewLink: `http://localhost:5173/candidate/interview/${id}`,
//           password: Math.random().toString(36).slice(-8),
//           scheduledDate
//         };

//         if (existing) {
//           // update in‑place
//           Object.assign(existing, entry);
//         } else {
//           // 2️⃣  push new one
//           job.candidates.push(entry);
//         }
//         updatedCandidates.push(entry);

//         // (optional) send mail in same loop
//         await sendInterviewLink(candidate.email, entry.interviewLink, entry.password);
//       }

//       await job.save();

//       res.status(200).json({
//         message: "Candidates scheduled successfully",
//         candidates: updatedCandidates
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: "Server error" });
//     }
//   }
// );
// POST  /interview/:id/candidate/schedule/mcq
// router.post("/interview/:id/candidate/schedule/mcq",auth("admin"),async (req, res) => {
//     try {
//       const { scheduledDate, candidates } = req.body;
//       const { id } = req.params;

//       if (!scheduledDate || !Array.isArray(candidates) || !candidates.length) {
//         return res
//           .status(400)
//           .json({ message: "scheduledDate and candidates[] are required" });
//       }

//       const job = await MCQ_Interview.findById(id);
//       if (!job) return res.status(404).json({ message: "Interview not found" });

//       const updatedCandidates = [];

//       for (const candId of candidates) {
//         const candidate = await Candidate.findById(candId);
//         if (!candidate)
//           return res
//             .status(404)
//             .json({ message: `Candidate ${candId} not found` });

//         // 1️⃣  check if candidate already stored in interview
//         const existing = job.candidates.find(c =>
//           c.candidateId.equals(candidate._id)
//         );

//         const entry = {
//           candidateId: candidate._id,
//           interviewLink: `http://localhost:5173/candidate/interview/${id}`,
//           password: Math.random().toString(36).slice(-8),
//           scheduledDate
//         };

//         if (existing) {
//           // update in‑place
//           Object.assign(existing, entry);
//         } else {
//           // 2️⃣  push new one
//           job.candidates.push(entry);
//         }
//         updatedCandidates.push(entry);

//         // (optional) send mail in same loop
//         await sendInterviewLink(candidate.email, entry.interviewLink, entry.password);
//       }

//       await job.save();

//       res.status(200).json({
//         message: "Candidates scheduled successfully",
//         candidates: updatedCandidates
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: "Server error" });
//     }
//   }
// );
// Bulk add candidates to an interview from a CSV file
// This endpoint allows the admin to upload a CSV file containing candidate details (name, email,

// routes/adminInterviewRoutes.js

router.post(
  "/interview/ai/:interviewId/schedule",
  auth("admin"),
  ScheduleAiInterview,
);

// router.get("/interview/:id/getcandidates/mcq",
//   auth("admin"),
//   async (req, res) => {
//     const { id } = req.params;

//     try {
//       // Find the interview and populate candidate details
//       const interview = await Interview.findById(id).populate(
//         "candidates.candidateId",
//       );
//       if (!interview) {
//         return res.status(404).json({ message: "Interview not found" });
//       }

//       // Get all candidate IDs in this interview
//       const candidateIds = interview.candidates
//         .map((c) => c.candidateId && c.candidateId._id)
//         .filter(Boolean);

//       // Get all scores for this interview and these candidates
//       const scores = await Score.find({
//         interviewId: id,
//         candidateId: { $in: candidateIds },
//       });

//       // Map candidateId to score for quick lookup
//       const scoreMap = {};
//       scores.forEach((score) => {
//         scoreMap[score.candidateId.toString()] = score;
//       });

//       // Get Exam_Type for logic
//       const examType = interview.Exam_Type;

//       // Build response
//       let candidates = interview.candidates
//         .map((c) => {
//           const candidate = c.candidateId;
//           if (!candidate) return null;
//           const score = scoreMap[candidate._id.toString()];
//           let result = null;
//           let totalScore = null;

//           // Calculate result if score exists
//           if (score && examType === "MCQ") {
//             // MCQ: full mark is 10, passing is 60% (6/10)
//             const totalQuestions = score.scores ? score.scores.length : 0;
//             const correctAnswers = score.scores
//               ? score.scores.filter((q) => q.score === 1).length
//               : 0;
//             totalScore = correctAnswers;
//             result =
//               totalQuestions > 0 && correctAnswers / totalQuestions >= 0.6
//                 ? "Pass"
//                 : "Fail";
//           } else if (score && examType === "Interview") {
//             // Interview: no MCQ, so pass/fail logic can be based on totalScore >= 60%
//             // If totalScore is out of 10, use same logic, else just pass totalScore
//             if (typeof score.totalScore === "number") {
//               totalScore = score.totalScore;
//               result = score.totalScore >= 6 ? "Pass" : "Fail";
//             }
//           }

//           return {
//             _id: candidate._id,
//             name: candidate.name,
//             email: candidate.email,
//             mobile: candidate.mobile,
//             aadharFront: candidate.aadharFront,
//             aadharBack: candidate.aadharBack,
//             photo: candidate.photo,
//             scoreCard: score ? score.totalScore : null,
//             scores: score ? score.scores : null,
//             summary: score ? score.summary : null,
//             pdfPath: score ? score.pdfPath : null,
//             totalScore: totalScore,
//             scheduledDate: c.scheduledDate || null,
//             Exam_Type: examType,
//             result: score ? result : null,
//           };
//         })
//         .filter(Boolean);

//       // Sort candidates so the latest added is on top (descending by scheduledDate)
//       candidates.sort((a, b) => {
//         const aTime = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0;
//         const bTime = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0;
//         return bTime - aTime;
//       });

//       res.json({ candidates });
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ message: "Server error" });
//     }
//   },
// );
// Get all interviews created by the admin








// ── Multer: memory storage for JD uploads ─────────────────
const uploadJD = multer({
  storage: multer.memoryStorage(), // ✅ explicit memoryStorage
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF and DOC/DOCX files are allowed"), false);
  },
});

// ── Helper: extract raw text from buffer ───────────────────
async function extractTextFromFile(buffer, mimetype) {
  if (mimetype === "application/pdf") {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
    const pdf = await loadingTask.promise;
    
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  }

  // DOC / DOCX
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

// ── Helper: analyze JD text with AI ────────────────────────
async function analyzeJDWithAI(rawText) {
  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY, // ✅ use env var, not hardcoded key
  });

  const prompt = `
You are an expert HR analyst. Analyze the following Job Description and extract structured information.

Return a valid JSON object with exactly these fields:
{
  "jobTitle": "string",
  "jobSummary": "2-3 sentence summary of the role",
  "primarySkill": "most important technical skill (single skill)",
  "secondarySkill": "second most important skill (single skill, or empty string)",
  "requiredSkills": ["array", "of", "required", "technical", "skills"],
  "niceToHaveSkills": ["array", "of", "optional", "skills"],
  "experienceLevel": "Entry / Junior / Mid / Senior / Lead",
  "experienceYears": "e.g. 3-5 years (or empty string if not specified)",
  "responsibilities": ["key", "responsibilities", "as", "short", "bullets"],
  "qualifications": ["required", "qualifications"],
  "jobType": "Full-time / Part-time / Contract / Remote (or empty string)",
  "industry": "industry domain e.g. FinTech, Healthcare, E-commerce",
  "fullJobDescription": "cleaned full job description text, preserving all details"
}

Job Description:
${rawText}

Return ONLY the JSON object. No markdown, no explanation.
`;

  const response = await client.chat.completions.create({
    model: "openai/gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content?.trim();
  const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

// POST /api/jd/analyze
router.post("/analyze", auth("admin"), uploadJD.single("jobDescription"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // ✅ Use req.file.buffer directly — no file path needed
    const rawText = await extractTextFromFile(req.file.buffer, req.file.mimetype);

    if (!rawText || rawText.trim().length < 50) {
      return res.status(422).json({
        message: "Could not extract meaningful text from the document. Please check the file.",
      });
    }

    const analysis = await analyzeJDWithAI(rawText);

    res.json({
      success: true,
      fileName: req.file.originalname,
      analysis,
    });

  } catch (err) {
    console.error("JD Analysis error:", err);
    res.status(500).json({
      message: err.message || "Failed to analyze job description",
    });
  }
  // ✅ No cleanup needed — memory storage, nothing written to disk
});
export default router;
