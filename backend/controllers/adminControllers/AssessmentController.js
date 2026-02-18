import MCQ_Interview from "../../models/MCQ_Interview.js";
import Candidate from "../../models/Candidate.js";
import Question from "../../models/Question.js";
import Score from "../../models/Score.js";
import AI_Interview from "../../models/AI_Interview.js";

export const GetAllMCQInterviews = async (req, res) => {
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
};

export const CreateMCQTemplate = async (req, res) => {
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
    const jobDescription = req.file ? req.file.path.replace(/\\/g, "/") : "";

    // Generate questions using AI
    const questions = await generateQuestions(
      jobDescription,
      test_title,
      difficulty,
      "MCQ",
      parseInt(no_of_questions),
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
};

export const AssessmentInvitation = async (req, res) => {
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
    const jobDescription = req.file ? req.file.path.replace(/\\/g, "/") : "";

    // Generate questions using AI
    const questions = await generateQuestions(
      jobDescription,
      test_title,
      difficulty,
      "MCQ",
      parseInt(no_of_questions),
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
          endDate,
        );
        emailResults.push({ candidate: candidate.email, status: "sent" });
      } catch (emailError) {
        console.error(
          `Failed to send email to ${candidate.email}:`,
          emailError,
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
      (r) => r.status === "sent",
    ).length;
    const failedEmails = emailResults.filter(
      (r) => r.status === "failed",
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
};

export const AssessmentInvitationByID = async (req, res) => {
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
          endDate,
        );
        emailResults.push({ candidate: candidate.email, status: "sent" });
      } catch (emailError) {
        console.error(
          `Failed to send email to ${candidate.email}:`,
          emailError,
        );
        emailResults.push({
          candidate: candidate.email,
          status: "failed",
          error: emailError.message,
        });
      }
    }

    // ── Save updated assessment ──────────────────────────────
    await interview.save();

    const successfulEmails = emailResults.filter(
      (r) => r.status === "sent",
    ).length;
    const failedEmails = emailResults.filter(
      (r) => r.status === "failed",
    ).length;

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
};


export const GetCandidatesInInterview = async (req, res) => {
    const { id } = req.params;

    try {
      // Find the interview and populate candidate details
      const interview = await AI_Interview.findById(id).populate(
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
  }
