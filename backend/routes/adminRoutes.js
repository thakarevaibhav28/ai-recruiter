const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const Admin = require("../models/Admin");
const MCQ_Interview = require("../models/MCQ_Interview");
const AI_Interview = require("../models/AI_Interview");
const Candidate = require("../models/Candidate");
const Question = require("../models/Question");
const Score = require("../models/Score");
const auth = require("../middleware/auth");
const { randomUUID } = require("crypto");


const {
  sendMCQInterviewLink,
  sendAIInterviewLink,
  sendMCQScorecard,
  sendAIScorecard,
} = require("../services/emailService");
const { generateQuestions } = require("../services/aiService");
const csv = require("csv-parser");
const fs = require("fs");

// Configure multer to preserve the original file extension and set a proper destination
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    // Get the original extension
    // const ext = file.originalname.split('.').pop();
    // Use a unique filename with the original extension
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });
console.log("upload", upload);

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    admin = new Admin({ email, password, role: "admin" });
    await admin.save();

    const accessToken = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    const refreshToken = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    admin.refreshToken = refreshToken;
    await admin.save();

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    };

    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        user: {
          _id: admin._id,
          email: admin.email,
        },
        accessToken,
        refreshToken,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    console.log(admin);
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    const refreshToken = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    admin.refreshToken = refreshToken;
    await admin.save();

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        user: {
          _id: admin._id,
          email: admin.email,
        },
        accessToken,
        refreshToken,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// interview ai ccreate
router.post(
  "/interview/ai",
  auth("admin"),
  upload.single("jobDescription"),
  async (req, res) => {
    const { difficulty, duration } = req.body;
    const no_of_questions = 5;

    try {
      if (!difficulty || !duration) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // ✅ Define jobDescription from file
      const jobDescription = req.file
        ? req.file.path.replace(/\\/g, "/")
        : "No description provided";

      // ✅ Correct parameter order
      const questions = await generateQuestions(
        jobDescription,
        "AI Interview", // test_title
        difficulty,
        "Interview", // Exam_Type
        no_of_questions,
      );

      const interview = await AI_Interview.create({
        jobDescription,
        difficulty,
        duration,
        createdBy: req.user.id,
      });

      const questionDocs = questions.map((q) => ({
        interviewId: interview._id,
        questionText: q,
      }));
      await Question.insertMany(questionDocs);

      res.status(201).json({ interview, questions });
    } catch (err) {
      console.error("Error in /interview/ai:", err);
      res.status(500).json({ message: "Server error", details: err.message });
    }
  },
);

// routes/adminInterviewRoutes.js

router.post(
  "/interview/ai/:interviewId/schedule",
  auth("admin"),
  async (req, res) => {
    try {
      const {
        candidates,
        scheduledStartDate,
        scheduledEndDate,
        subjectLine,
        messageBody,
      } = req.body;

      const { interviewId } = req.params;

      if (
        !scheduledStartDate ||
        !scheduledEndDate ||
        !subjectLine ||
        !messageBody ||
        !candidates
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const candidateArray =
        typeof candidates === "string" ? JSON.parse(candidates) : candidates;
      if (!Array.isArray(candidateArray) || candidateArray.length === 0)
        return res.status(400).json({ message: "Candidates must be an array" });

      // 🔍 Get existing interview
      const interview = await AI_Interview.findById(interviewId);
      if (!interview)
        return res.status(404).json({ message: "Interview not found" });

      const scheduledCandidates = [];

      for (const candId of candidateArray) {
        const candidate = await Candidate.findById(candId);
        if (!candidate)
          return res
            .status(404)
            .json({ message: `Candidate ID ${candId} not found` });

        const interviewLink = `http://localhost:5173/candidate/interview/ai/${interviewId}`;
        const password = Math.random().toString(36).slice(-8);

        const personalizedBody = messageBody
          .replace("[Candidates Name]", candidate.name)
          .replace("[job role]", candidate.role || "your applied role")
          .replace("[Date]", new Date(scheduledEndDate).toDateString())
          .replace("[Interview link]", interviewLink);

        const entry = {
          candidateId: candidate._id,
          interviewLink,
          password,
          scheduledStartDate: new Date(scheduledStartDate),
          scheduledEndDate: new Date(scheduledEndDate),
          emailSubject: subjectLine,
          emailBody: personalizedBody,
        };

        interview.candidates.push(entry);
        scheduledCandidates.push(entry);

        await sendAIInterviewLink(
          candidate.email,
          entry.interviewLink,
          entry.password,
          subjectLine,
          personalizedBody,
          scheduledEndDate,
          scheduledStartDate,
        );
      }

      await interview.save();

      res.status(200).json({
        message: "Interview invitations sent",
        interviewId,
        scheduledCandidates,
      });
    } catch (err) {
      console.error("Error scheduling AI interview:", err);
      res.status(500).json({ message: "Server error", details: err.message });
    }
  },
);

// POST /api/admin/interview/mcq/full
router.post("/interview/mcq", auth("admin"), async (req, res) => {
  try {
    const {
      test_title,
      difficulty,
      duration,
      no_of_questions,
      primary_skill,
      secondary_skill,
      passing_score,
      start_Date,
      end_Date,
      candidates, // should be array of candidate IDs
    } = req.body;

    // Validate required fields
    const requiredFields = [
      test_title,
      difficulty,
      duration,
      no_of_questions,
      primary_skill,
      secondary_skill,
      passing_score,
      start_Date,
      end_Date,
      ,
      candidates,
    ];
    if (requiredFields.some((v) => !v)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let candidateArray;
    try {
      // Parse if sent as JSON string
      candidateArray =
        typeof candidates === "string" ? JSON.parse(candidates) : candidates;
      if (!Array.isArray(candidateArray)) throw new Error();
    } catch {
      return res.status(400).json({ message: "Invalid candidates array" });
    }

    // Optional job description file
    const jobDescription = "";

    // Generate questions
    const questions = await generateQuestions(
      jobDescription,
      test_title,
      difficulty,
      "MCQ",
      no_of_questions,
    );

    // Create interview
    const interview = await MCQ_Interview.create({
      test_title,
      difficulty,
      duration,
      no_of_questions,
      primary_skill,
      secondary_skill,
      passing_score,
      createdBy: req.user.id,
    });

    // Save questions
    const questionDocs = questions.map((q) => ({
      interviewId: interview._id,
      questionText: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
    }));
    await Question.insertMany(questionDocs);

    // Schedule candidates
    const updatedCandidates = [];
    for (const candId of candidateArray) {
      const candidate = await Candidate.findById(candId);
      if (!candidate)
        return res
          .status(404)
          .json({ message: `Candidate ${candId} not found` });

      const entry = {
        candidateId: candidate._id,
        interviewLink: `http://localhost:5173/candidate/interview/${interview._id}`,
        password: Math.random().toString(36).slice(-8),
        start_Date,
        end_Date,
      };

      interview.candidates.push(entry);
      updatedCandidates.push(entry);

      // Send email
      await sendMCQInterviewLink(
        candidate.email,
        entry.interviewLink,
        entry.password,
        start_Date,
        end_Date,
      );
    }

    await interview.save();

    res.status(201).json({
      message: "Interview created and candidates scheduled successfully",
      interview,
      questions,
      scheduledCandidates: updatedCandidates,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", details: err.message });
  }
});

// Create Candidate
router.post("/create/candidate", auth("admin"), async (req, res) => {
  const {
    id, // optional for update
    email,
    name,
    mobile,
    role,
    key_Skills,
    description,
    year_of_experience,
  } = req.body;

  // Basic input validation
  if (
    !email ||
    !name ||
    !mobile ||
    !role ||
    !key_Skills ||
    !description ||
    !year_of_experience
  ) {
    return res.status(400).json({
      message: "all fields are required.",
    });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  // Mobile validation
  const mobileRegex = /^[0-9]{10,15}$/;
  if (!mobileRegex.test(mobile)) {
    return res.status(400).json({ message: "Invalid mobile number." });
  }

  try {
    // 🔥 UPDATE FLOW
    if (id) {
      const updatedCandidate = await Candidate.findByIdAndUpdate(
        id,
        {
          email,
          name,
          mobile,
          role,
          key_Skills,
          description,
          year_of_experience,
        },
        { new: true, runValidators: true }
      );

      if (!updatedCandidate) {
        return res.status(404).json({ message: "Candidate not found." });
      }

      return res.status(200).json({
        message: "Candidate updated successfully.",
        newCandidate: updatedCandidate,
      });
    }

    //  CREATE FLOW
    const existingCandidate = await Candidate.findOne({ email });

    if (existingCandidate) {
      return res.status(409).json({ message: "Candidate already added." });
    }

    const candidate = await Candidate.create({
      email,
      name,
      mobile,
      role,
      key_Skills,
      description,
      year_of_experience,
    });

    res.status(201).json({
      message: "Candidate added",
      newCandidate: candidate,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});


// get All candidate
router.get("/candidates", auth("admin"), async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates,
    });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch candidates",
      error: error.message,
    });
  }
});

// Update Candidate Status api
router.patch(
  "/candidate/:id",
  auth("admin"),
  async (req, res) => {
    const { id } = req.params;
    const { candidate_status } = req.body;

    // Validate status
    if (!["active", "inactive"].includes(candidate_status)) {
      return res.status(400).json({
        message: "Invalid status value.",
      });
    }

    try {
      const candidate = await Candidate.findByIdAndUpdate(
        id,
        { candidate_status },
        { new: true }
      );

      if (!candidate) {
        return res.status(404).json({
          message: "Candidate not found.",
        });
      }


      return res.status(200).json({
        message: `Candidate ${candidate_status} successfully.`,
        data: candidate,
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// Get all Schedule data
router.get("/total-schedule", auth("admin"), async (req, res) => {
  try {
    const [{ total } = { total: 0 }] = await Interview.aggregate([
      { $unwind: "$candidates" },
      {
        $match: {
          "candidates.interviewLink": { $type: "string", $ne: null },
          "candidates.password": { $type: "string", $ne: null },
        },
      },
      { $count: "total" },
    ]);

    return res.json({ totalSchedules: total });
  } catch (err) {
    console.error("Error counting schedules:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});
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
router.post(
  "/interview/candidates/bulk",
  auth("admin"),
  upload.single("csvFile"),
  async (req, res) => {
    const results = [];

    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required." });
    }

    try {
      // Parse CSV
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          const addedCandidates = [];
          for (const row of results) {
            console.log(row);
            const {
              name,
              email,
              mobile,
              role,
              year_of_experience,
              key_Skills,
            } = row;
            if (
              !name ||
              !email ||
              !mobile ||
              !role ||
              !year_of_experience ||
              !key_Skills
            )
              continue;

            // Email and mobile validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const mobileRegex = /^[0-9]{10,15}$/;
            if (!emailRegex.test(email) || !mobileRegex.test(mobile)) continue;

            let candidate = await Candidate.findOne({ email });
            if (!candidate) {
              console.log(`Creating new candidate: ${name}`);
              candidate = await Candidate.create({
                name,
                email,
                mobile,
                role,
                year_of_experience,
                key_Skills,
              });
            }

            // Check if already added to this interview
            // if (
            //   interview.candidates.some((c) =>
            //     c.candidateId.equals(candidate._id)
            //   )
            // )
            // continue;

            // interview.candidates.push({
            //   candidateId: candidate._id,
            //   interviewLink: null,
            //   password: null,
            //   scheduledDate: null,
            // });
            addedCandidates.push(candidate);
          }
          // await interview.save();
          fs.unlinkSync(req.file.path);
          res.status(201).json({
            message: "Bulk candidates added",
            added: addedCandidates.length,
          });
        });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path))
        fs.unlinkSync(req.file.path);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// Get all candidates for a specific interview, including scorecard info if available and scheduledDate, result (pass/fail)
router.get(
  "/interview/:id/getcandidates/mcq",
  auth("admin"),
  async (req, res) => {
    const { id } = req.params;

    try {
      // Find the interview and populate candidate details
      const interview = await Interview.findById(id).populate(
        "candidates.candidateId",
      );
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }

      // Get all candidate IDs in this interview
      const candidateIds = interview.candidates
        .map((c) => c.candidateId && c.candidateId._id)
        .filter(Boolean);

      // Get all scores for this interview and these candidates
      const scores = await Score.find({
        interviewId: id,
        candidateId: { $in: candidateIds },
      });

      // Map candidateId to score for quick lookup
      const scoreMap = {};
      scores.forEach((score) => {
        scoreMap[score.candidateId.toString()] = score;
      });

      // Get Exam_Type for logic
      const examType = interview.Exam_Type;

      // Build response
      let candidates = interview.candidates
        .map((c) => {
          const candidate = c.candidateId;
          if (!candidate) return null;
          const score = scoreMap[candidate._id.toString()];
          let result = null;
          let totalScore = null;

          // Calculate result if score exists
          if (score && examType === "MCQ") {
            // MCQ: full mark is 10, passing is 60% (6/10)
            const totalQuestions = score.scores ? score.scores.length : 0;
            const correctAnswers = score.scores
              ? score.scores.filter((q) => q.score === 1).length
              : 0;
            totalScore = correctAnswers;
            result =
              totalQuestions > 0 && correctAnswers / totalQuestions >= 0.6
                ? "Pass"
                : "Fail";
          } else if (score && examType === "Interview") {
            // Interview: no MCQ, so pass/fail logic can be based on totalScore >= 60%
            // If totalScore is out of 10, use same logic, else just pass totalScore
            if (typeof score.totalScore === "number") {
              totalScore = score.totalScore;
              result = score.totalScore >= 6 ? "Pass" : "Fail";
            }
          }

          return {
            _id: candidate._id,
            name: candidate.name,
            email: candidate.email,
            mobile: candidate.mobile,
            aadharFront: candidate.aadharFront,
            aadharBack: candidate.aadharBack,
            photo: candidate.photo,
            scoreCard: score ? score.totalScore : null,
            scores: score ? score.scores : null,
            summary: score ? score.summary : null,
            pdfPath: score ? score.pdfPath : null,
            totalScore: totalScore,
            scheduledDate: c.scheduledDate || null,
            Exam_Type: examType,
            result: score ? result : null,
          };
        })
        .filter(Boolean);

      // Sort candidates so the latest added is on top (descending by scheduledDate)
      candidates.sort((a, b) => {
        const aTime = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0;
        const bTime = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0;
        return bTime - aTime;
      });

      res.json({ candidates });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  },
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
router.get("/interview/job_list", auth("admin"), async (req, res) => {
  try {
    const interviewsData = await Interview.find().sort({ createdAt: -1 });
    console.log(interviewsData);
    res.json(interviewsData);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

//create AI interview
router.post(
  "/create/interview/ai",
  auth("admin"),
  upload.single("jobDescription"),
  async (req, res) => {
    try {
      const {
        position,
        description,
        passingScore,
        difficulty,
        skills,
        duration,
        numberOfQuestions,
      } = req.body;

      const file = req.file;

      // ================= VALIDATION =================
      if (
        !file ||
        !difficulty ||
        !duration ||
        !position ||
        !description ||
        !skills ||
        !passingScore ||
        !numberOfQuestions
      ) {
        return res.status(400).json({
          message:
            "Job description file, difficulty, duration, position, description, passing score,skills and number of questions are required.",
        });
      }

      // ================= FORMAT FILE PATH =================
      const jobDescription = file.path.replace(/\\/g, "/");
      examType = "Interview";
      // ================= GENERATE QUESTIONS USING AI =================
      // const questions = await generateQuestions(
      //   jobDescription,
      //   position,
      //   difficulty,
      //   examType,
      //   parseInt(numberOfQuestions)
      // );

      // ================= CREATE INTERVIEW =================
      const interview = await AI_Interview.create({
        jobDescription: jobDescription,
        position,
        difficulty,
        duration,
        skills,
        passingScore,
        numberOfQuestions,
        createdBy: req.user.id, // from auth middleware
        // questions,
        candidates: [],
        status: "draft", // default
      });

      // ================= RESPONSE =================
      return res.status(201).json({
        jobId: interview._id,
        interview: {
          _id: interview._id,
          position: interview.position,
          difficulty: interview.difficulty,
          duration: interview.duration,
          createdAt: interview.createdAt,
          questions: interview.questions,
          skills: interview.skills,
          passingScore: interview.passingScore,
          description: interview.description,
          numberOfQuestions: interview.numberOfQuestions,
        },
        // questions,
      });
    } catch (error) {
      console.error("Generate AI Interview Error:", error);
      return res.status(500).json({
        message: "Server error while generating AI interview",
        error: error.message,
      });
    }
  },
);

// Send interview invitations
router.post("/send-invitations", auth("admin"), async (req, res) => {
  try {
    const { jobId, candidateIds, messageBody, startDate, endDate, testTitle } =
      req.body;

    if (
      !jobId ||
      !candidateIds ||
      !messageBody ||
      !startDate ||
      !endDate ||
      !testTitle
    ) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    const interview = await AI_Interview.findById(jobId);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found." });
    }

    const candidates = await Candidate.find({
      _id: { $in: candidateIds },
    });

    if (candidates.length !== candidateIds.length) {
      return res.status(400).json({
        message: "Some candidate IDs are invalid.",
      });
    }

    interview.candidates = [];

    for (const candidate of candidates) {
      const interviewLink = `https://your-app.com/interview/${randomUUID()}`;
      const password = randomUUID().slice(0, 8);

      interview.candidates.push({
        candidateId: candidate._id,
        interviewLink,
        password,
        scheduledStartDate: new Date(startDate),
        scheduledEndDate: new Date(endDate),
        emailBody: messageBody,
      });

      const finalMessage = messageBody
        .replace("[Candidate Name]", candidate.name)
        .replace("[Job Role]", testTitle);

      await sendAIInterviewLink(
        candidate.email,
        interviewLink,
        password,
        `AI Interview Invitation - ${testTitle}`,
        finalMessage,
        new Date(endDate),
        new Date(startDate)
      );
    }

    interview.status = "scheduled";
    await interview.save();

    res.status(200).json({
      message: "Invitations sent successfully",
      totalCandidates: candidates.length,
    });
  } catch (error) {
    console.error("Error sending invitations:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// Update interview status (draft/scheduled)
router.patch("/interview/:id/status", auth("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ✅ Validate status
    const allowedStatus = ["draft", "scheduled"];

    if (!status || !allowedStatus.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${allowedStatus.join(", ")}`,
      });
    }

    const interview = await AI_Interview.findById(id);

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    interview.status = status;
    await interview.save();

    return res.status(200).json({
      message: "Interview status updated successfully",
      interviewId: interview._id,
      newStatus: interview.status,
    });
  } catch (error) {
    console.error("Update Interview Status Error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});
router.get("/interviews/draft", auth("admin"), async (req, res) => {
  try {
    const adminId = req.user.id;

    const drafts = await AI_Interview.find({
      createdBy: adminId,
      status: "draft",
    })
      .sort({ createdAt: -1 })
      .select(
        "_id position difficulty duration skills passingScore numberOfQuestions description status createdAt",
      );

    const formattedDrafts = drafts.map((item) => ({
      jobId: item._id, // 🔥 send as jobId
      _id: item._id,
      position: item.position,
      difficulty: item.difficulty,
      duration: item.duration,
      skills: item.skills,
      passingScore: item.passingScore,
      numberOfQuestions: item.numberOfQuestions,
      description: item.description,
      status: item.status,
      createdAt: item.createdAt,
    }));

    return res.status(200).json({
      success: true,
      totalDrafts: formattedDrafts.length,
      drafts: formattedDrafts,
    });
  } catch (error) {
    console.error("Get Draft Interviews Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});


// ==================== MCQ ASSESSMENT ROUTES ====================


// POST Create MCQ Assessment Template (without candidates - no email sent)
router.post(
  "/assessment/template",
  auth("admin"),
  upload.single("jobDescription"),
  async (req, res) => {
    try {
      const {
        test_title,
        difficulty,
        duration,
        no_of_questions,
        primary_skill,
        secondary_skill,
        passing_score,
      } = req.body;

      // Validate required fields
      if (
        !test_title ||
        !difficulty ||
        !duration ||
        !no_of_questions ||
        !primary_skill ||
        !passing_score
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required fields",
        });
      }

      // Get job description file path if uploaded
      const jobDescription = req.file
        ? req.file.path.replace(/\\/g, "/")
        : "";

      // Generate questions using AI
      const questions = await generateQuestions(
        jobDescription,
        test_title,
        difficulty,
        "MCQ",
        parseInt(no_of_questions)
      );
      console.log("Generated questions for template:", questions);

      // Create interview template
      const interview = await MCQ_Interview.create({
        test_title,
        difficulty,
        duration,
        no_of_questions: parseInt(no_of_questions),
        primary_skill,
        secondary_skill: secondary_skill || "",
        passing_score,
        jobDescription,
        createdBy: req.user.id,
        isTemplate: true, // Mark as template
      });

      // Save questions
      const questionDocs = questions.map((q) => ({
        interviewId: interview._id,
        questionText: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      }));
      await Question.insertMany(questionDocs);

      res.status(201).json({
        success: true,
        message: "Assessment template created successfully",
        data: {
          interview,
          questionCount: questions.length,
        },
      });
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create assessment template",
        error: error.message,
      });
    }
  }
);

// POST Create MCQ Assessment and Send Invites (with candidates - emails sent)
router.post(
  "/assessment/send-invites",
  auth("admin"),
  upload.single("jobDescription"),
  async (req, res) => {
    try {
      const {
        test_title,
        difficulty,
        duration,
        no_of_questions,
        primary_skill,
        secondary_skill,
        passing_score,
        start_date,
        end_date,
        candidates,
      } = req.body;

      // Validate required fields
      if (
        !test_title ||
        !difficulty ||
        !duration ||
        !no_of_questions ||
        !primary_skill ||
        !passing_score ||
        !start_date ||
        !end_date ||
        !candidates
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required fields including candidates",
        });
      }

      // Parse candidates array
      let candidateArray;
      try {
        candidateArray =
          typeof candidates === "string" ? JSON.parse(candidates) : candidates;
        if (!Array.isArray(candidateArray) || candidateArray.length === 0) {
          throw new Error("Invalid candidates array");
        }
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Please select at least one candidate",
        });
      }

      // Validate dates
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (endDate <= startDate) {
        return res.status(400).json({
          success: false,
          message: "End date must be after start date",
        });
      }

      // Get job description file path
      const jobDescription = req.file
        ? req.file.path.replace(/\\/g, "/")
        : "";

      // Generate questions using AI
      const questions = await generateQuestions(
        jobDescription,
        test_title,
        difficulty,
        "MCQ",
        parseInt(no_of_questions)
      );

      // Create interview
      const interview = await MCQ_Interview.create({
        test_title,
        difficulty,
        duration,
        no_of_questions: parseInt(no_of_questions),
        primary_skill,
        secondary_skill: secondary_skill || "",
        passing_score,
        jobDescription,
        createdBy: req.user.id,
        isTemplate: false,
      });

      // Save questions
      const questionDocs = questions.map((q) => ({
        interviewId: interview._id,
        questionText: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      }));
      await Question.insertMany(questionDocs);

      // Schedule candidates and send emails
      const scheduledCandidates = [];
      const emailResults = [];

      for (const candId of candidateArray) {
        const candidate = await Candidate.findById(candId);
        if (!candidate) {
          console.warn(`Candidate ${candId} not found, skipping...`);
          continue;
        }

        // Generate credentials
        const username = `user_${Math.random().toString(36).substring(2, 10)}`;
        const password = Math.random().toString(36).slice(-8);
        const interviewLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/candidate/interview/${interview._id}`;

        const entry = {
          candidateId: candidate._id,
          interviewLink,
          username,
          password,
          start_Date: startDate,
          end_Date: endDate,
        };

        interview.candidates.push(entry);
        scheduledCandidates.push({
          ...entry,
          name: candidate.name,
          email: candidate.email,
        });

        // Send email
        try {
          await sendMCQInterviewLink(
            candidate.email,
            candidate.name,
            interviewLink,
            username,
            password,
            test_title,
            difficulty,
            duration,
            no_of_questions,
            passing_score,
            primary_skill,
            secondary_skill,
            startDate,
            endDate
          );
          emailResults.push({ candidate: candidate.email, status: "sent" });
        } catch (emailError) {
          console.error(
            `Failed to send email to ${candidate.email}:`,
            emailError
          );
          emailResults.push({
            candidate: candidate.email,
            status: "failed",
            error: emailError.message,
          });
        }
      }

      await interview.save();

      const successfulEmails = emailResults.filter(
        (r) => r.status === "sent"
      ).length;
      const failedEmails = emailResults.filter(
        (r) => r.status === "failed"
      ).length;

      res.status(201).json({
        success: true,
        message: `Assessment created and invitations sent to ${successfulEmails} candidate(s)`,
        data: {
          interview,
          questionCount: questions.length,
          scheduledCandidates,
          emailStats: {
            total: emailResults.length,
            successful: successfulEmails,
            failed: failedEmails,
          },
          emailResults,
        },
      });
    } catch (error) {
      console.error("Error creating assessment and sending invites:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create assessment and send invites",
        error: error.message,
      });
    }
  }
);

// GET all MCQ interviews/templates
router.get("/assessment/mcq/list", auth("admin"), async (req, res) => {
  try {
    const interviews = await MCQ_Interview.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate("createdBy", "email");

    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews,
    });
  } catch (error) {
    console.error("Error fetching MCQ assessments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assessments",
      error: error.message,
    });
  }
});

router.post(
  "/assessment/:assessmentId/invite",
  auth("admin"),
  async (req, res) => {
    try {
      const { assessmentId } = req.params;
      const { candidateIds, start_date, end_date } = req.body;

      // ── Validate fields ──────────────────────────────────────
      if (!candidateIds || !start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: "Please provide candidateIds, start_date, and end_date",
        });
      }

      // ── Parse candidateIds ───────────────────────────────────
      let candidateArray;
      try {
        candidateArray =
          typeof candidateIds === "string"
            ? JSON.parse(candidateIds)
            : candidateIds;
        if (!Array.isArray(candidateArray) || candidateArray.length === 0) {
          throw new Error("Invalid candidateIds array");
        }
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Please select at least one candidate",
        });
      }

      // ── Validate dates ───────────────────────────────────────
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (endDate <= startDate) {
        return res.status(400).json({
          success: false,
          message: "End date must be after start date",
        });
      }

      // ── Find the existing assessment ─────────────────────────
      const interview = await MCQ_Interview.findById(assessmentId);
      if (!interview) {
        return res.status(404).json({
          success: false,
          message: "Assessment not found",
        });
      }

      // ── Loop candidates — same logic as your existing route ──
      const scheduledCandidates = [];
      const emailResults = [];

      for (const candId of candidateArray) {
        const candidate = await Candidate.findById(candId);
        if (!candidate) {
          console.warn(`Candidate ${candId} not found, skipping...`);
          continue;
        }

        // Generate credentials (same as your existing route)
        const username = `user_${Math.random().toString(36).substring(2, 10)}`;
        const password = Math.random().toString(36).slice(-8);
        const interviewLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/candidate/interview/${interview._id}`;

        const entry = {
          candidateId: candidate._id,
          interviewLink,
          username,
          password,
          start_Date: startDate,
          end_Date: endDate,
        };

        // Push to assessment candidates array
        interview.candidates.push(entry);
        scheduledCandidates.push({
          ...entry,
          name: candidate.name,
          email: candidate.email,
        });

        // Send email — exact same call as your existing route
        try {
          await sendMCQInterviewLink(
            candidate.email,
            candidate.name,
            interviewLink,
            username,
            password,
            interview.test_title,
            interview.difficulty,
            interview.duration,
            interview.no_of_questions,
            interview.passing_score,
            interview.primary_skill,
            interview.secondary_skill,
            startDate,
            endDate
          );
          emailResults.push({ candidate: candidate.email, status: "sent" });
        } catch (emailError) {
          console.error(`Failed to send email to ${candidate.email}:`, emailError);
          emailResults.push({
            candidate: candidate.email,
            status: "failed",
            error: emailError.message,
          });
        }
      }

      // ── Save updated assessment ──────────────────────────────
      await interview.save();

      const successfulEmails = emailResults.filter((r) => r.status === "sent").length;
      const failedEmails = emailResults.filter((r) => r.status === "failed").length;

      return res.status(200).json({
        success: true,
        message: `Invitations sent to ${successfulEmails} candidate(s)`,
        data: {
          assessmentId: interview._id,
          scheduledCandidates,
          emailStats: {
            total: emailResults.length,
            successful: successfulEmails,
            failed: failedEmails,
          },
          emailResults,
        },
      });
    } catch (error) {
      console.error("Error sending invites:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send invites",
        error: error.message,
      });
    }
  }
);

module.exports = router;
