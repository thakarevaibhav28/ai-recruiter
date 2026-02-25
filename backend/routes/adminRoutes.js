// -----------------------new code -----------------------
import express from "express";
import auth from "../middleware/auth.js";
import { uploadCSV, upload, uploadMemory } from "../middleware/upload.js";
import pkg from "pdf2json";
import cloudinary from "../config/cloudinary.js";
const PDFParser = pkg.default || pkg;
import mammoth from "mammoth";
import openai from "openai";
import pdf from "pdf-parse";

import {
  RegisterUser,
  LoginUser,
  getMe,
  GetTopPerformance,
  GetAllSchedule,rescheduleInterview,cancelInterview,getStudentScores
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
  UpdateAIInterview,
} from "../controllers/adminControllers/InterviewController.js";

import {
  CreateCandidate,
  GetCandidate,
  getCandidateProfile,
  UpdateCandidate,
  BulkAddCandidates,
} from "../controllers/candidateControllers/AuthorizationController.js";

const router = express.Router();

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
router.put("/interview/template/:id/update", auth("admin"), UpdateAIInterview);

router.get("/interviews/list", auth("admin"), GetAllAIInterview);

// Create Candidate
router.post("/create/candidate", auth("admin"), CreateCandidate);

router.get("/candidates", auth("admin"), GetCandidate);

router.get("/candidate_profile/:id", auth("admin"), getCandidateProfile);

router.patch("/candidate/:id", auth("admin"), UpdateCandidate);

// Get all Assessment Schedule data
router.get("/total-schedule", auth("admin"), GetAllSchedule);

router.put(
  "/interview/:type/:interviewId/reschedule",
  auth("admin"),
  rescheduleInterview,
);

router.put(
  "/interview/:type/:interviewId/cancel",
  auth("admin"),
  cancelInterview
);

// Get all AI Interview Schedule data
// router.get("/total-schedule", auth("admin"), GetAllAiInterviewSchedule);
router.post(
  "/candidates/bulk",
  auth("admin"),
  uploadCSV.single("csvFile"),
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

router.get("/student-scores",auth("admin"), getStudentScores);

// router.put(
//   "/interview/ai/:interviewId/reschedule",
//   auth("admin"),
//   rescheduleAiInterview,
// );

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

// ── Helper: extract raw text from buffer ───────────────────

export const extractTextFromFile = async (buffer, mimetype) => {
  try {
    // PDF
    if (mimetype === "application/pdf") {
      const data = await pdf(buffer);
      return data.text;
    }

    // DOCX
    if (
      mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    // DOC (older format)
    if (mimetype === "application/msword") {
      throw new Error("DOC format not supported. Please upload DOCX.");
    }

    throw new Error("Unsupported file type");
  } catch (error) {
    console.error("Text extraction error:", error);
    throw error;
  }
};
/* ──────────────────────────────────────────────
   Helper: Analyze using Hugging Face
   SAME JSON STRUCTURE AS BEFORE
────────────────────────────────────────────── */
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function analyzeJDWithAI(rawText) {
  const prompt = `
You are an expert HR analyst. Analyze the following Job Description and extract structured information.

Return ONLY valid JSON with exactly this structure:
{
  "jobTitle": "",
  "jobSummary": "",
  "primarySkill": "",
  "secondarySkill": "",
  "requiredSkills": [],
  "niceToHaveSkills": [],
  "experienceLevel": "",
  "experienceYears": "",
  "responsibilities": [],
  "qualifications": [],
  "jobType": "",
  "industry": "",
  "fullJobDescription": ""
}

Job Description:
${rawText}
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile", // 🔥 Very powerful model
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Invalid response from Groq");
  }

  // Safe JSON extraction
  const jsonStart = content.indexOf("{");
  const jsonEnd = content.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("AI did not return valid JSON");
  }

  const finalJson = content.substring(jsonStart, jsonEnd + 1);

  return JSON.parse(finalJson);
}

export const analyzeResumeWithAI = async (resumeText) => {
  const prompt = `
Extract structured candidate details from the resume.
Also identify year_of_experience and show like 0-1,1-2,2-3,...

Return ONLY valid JSON.
Do NOT wrap in markdown.
Do NOT include explanation.

Format strictly:

{
  "name": "",
  "email": "",
  "mobile": "",
  "role": "",
  "year_of_experience": "",
  "key_Skills": "",
  "description": ""
}

Resume:
${resumeText}
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  let content = response.choices[0].message.content;

  try {
    // 🔥 Remove markdown if present
    content = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(content);
  } catch (error) {
    console.error("AI returned invalid JSON:", content);
    throw new Error("AI returned invalid JSON format");
  }
};
/* ──────────────────────────────────────────────
   POST /api/analyze
   SAME RESPONSE FORMAT
────────────────────────────────────────────── */
router.post(
  "/analyze",
  auth("admin"),
  uploadMemory.single("jobDescription"),
  async (req, res) => {
    try {
      const rawText = await extractTextFromFile(
        req.file.buffer,
        req.file.mimetype
      );

      if (!rawText || rawText.trim().length < 50) {
        return res.status(422).json({
          message:
            "Could not extract meaningful text from the document. Please check the file.",
        });
      }

      const analysis = await analyzeJDWithAI(rawText);

      // ✅ SAME RESPONSE AS BEFORE
      res.json({
        success: true,
        fileName: req.file.originalname,
        analysis,
      });
    } catch (err) {
      console.error("JD Analysis error:", err.message);

      res.status(500).json({
        message: err.message || "Failed to analyze job description",
      });
    }
  }
);


//Resume Upload
router.post(
  "/resume/analyze",
  auth("admin"),
  uploadMemory.single("resume"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Resume file is required" });
      }

      /* ---------------- EXTRACT TEXT ---------------- */
      const rawText = await extractTextFromFile(
        req.file.buffer,
        req.file.mimetype
      );

      if (!rawText || rawText.trim().length < 50) {
        return res.status(422).json({
          message: "Could not extract meaningful text from resume.",
        });
      }

      /* ---------------- AI ANALYSIS ---------------- */
      const analysis = await analyzeResumeWithAI(rawText);

      /* ---------------- CLOUDINARY UPLOAD ---------------- */
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "resumes",
              resource_type: "auto",
              public_id: `${Date.now()}-${req.file.originalname}`,

            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(req.file.buffer);
      });

      /* ---------------- RESPONSE ---------------- */
      res.status(200).json({
        success: true,
        analysis,
        resumeUrl: uploadResult.secure_url,
      });
    } catch (err) {
      console.error("Resume Analyze + Upload Error:", err);
      res.status(500).json({
        message: err.message || "Resume processing failed",
      });
    }
  }
);
export default router;