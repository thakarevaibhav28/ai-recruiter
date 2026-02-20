import { randomUUID } from "crypto";
import AI_Interview from "../../models/AI_Interview.js";
import Candidate from "../../models/Candidate.js";
import { sendAIInterviewLink } from "../../services/emailService.js";
import mongoose from "mongoose";
export const CreateAITemplate = async (req, res) => {
  try {
    const {
      position,
      description,
      passingScore,
      difficulty,
      skills,
      duration,
      numberOfQuestions,
      secondaryJobDescription,
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
    // examType = "Interview";
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
      secondaryJobDescription,
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
        secondaryJobDescription: interview.secondaryJobDescription,
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
};

export const GetAllAIInterview = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.query;

    /* ================= GET SINGLE INTERVIEW ================= */
    if (id) {

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid interview ID",
        });
      }

      const interview = await AI_Interview.findOne({
        _id: id,
        createdBy: adminId,
      });

      if (!interview) {
        return res.status(404).json({
          success: false,
          message: "Interview not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: interview,
      });
    }

    /* ================= GET ALL DRAFT INTERVIEWS ================= */

    const drafts = await AI_Interview.find({
      createdBy: adminId
    })

    const formattedDrafts = drafts.map((item) => ({
      jobId: item._id,
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
    console.error("Get AI Interview Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
export const AIInterviewInvitation = async (req, res) => {
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
    console.log("Interview found:", interview);
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
      const interviewLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/user/login/${interview._id}`;
      const username = `user_${Math.random().toString(36).substring(2, 10)}`;
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
        interview.passingScore,
        finalMessage,
        new Date(endDate),
        new Date(startDate),
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
};
export const UpdateAIInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const interview = await AI_Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    if (req.file) {
      if (interview.jobDescription) {
        const oldPath = path.resolve(interview.jobDescription);

        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (err) {
            console.error("Error deleting old job description:", err);
          }
        }
      }
      interview.jobDescription = req.file.path.replace(/\\/g, "/");
    }

    // ✅ Validate status
    const allowedFields = [
      "draft",
      "scheduled",
      "position",
      "description",
      "jobDescription",
      "secondaryJobDescription",
      "difficulty",
      "duration",
      "passingScore",
      "numberOfQuestions",
      "skills",
    ];

    allowedFields.forEach((field) => {
      if (
        req.body[field] !== undefined &&
        req.body[field] !== null &&
        req.body[field] !== ""
      ) {
        interview[field] = req.body[field];
      }
    });
    await interview.save();

    return res.status(200).json({
      message: "Interview updated successfully",
      interview,
    });
  } catch (error) {
    console.error("Update Interview Status Error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
export const ScheduleAiInterview = async (req, res) => {
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
    console.log("interview existing candidates:", interview);
    const scheduledCandidates = [];

    for (const candId of candidateArray) {
      const candidate = await Candidate.findById(candId);
      if (!candidate)
        return res
          .status(404)
          .json({ message: `Candidate ID ${candId} not found` });

      const interviewLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/candidate/login/${interviewId}`;
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
};
export const GetAllAiInterviewSchedule=async (req, res) => {
  try {
    const [{ total } = { total: 0 }] = await AI_Interview.aggregate([
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
}
