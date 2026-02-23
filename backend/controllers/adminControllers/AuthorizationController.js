import Admin from "../../models/Admin.js";
import jwt from "jsonwebtoken";
import Score from "../../models/Score.js";
import mongoose from "mongoose";
import MCQ_Interview from "../../models/MCQ_Interview.js";
import AI_Interview from "../../models/AI_Interview.js";
import Candidate from "../../models/Candidate.js";

export const RegisterUser = async (req, res) => {
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
      { expiresIn: "12h" },
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
          role: admin.role
        },
        accessToken,
        refreshToken,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const LoginUser = async (req, res) => {
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
      { expiresIn: "12h" },
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
           role: admin.role
        },
        accessToken,
        refreshToken,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMe = async (req, res) => {
  console.log("getMe called with user ID:", req.user);
  try {
    const user = await Admin.findById(req.user.id).select("-password");
 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const accessToken = jwt.sign(
      { id: user._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
    );

    res.status(200).json({
      success: true,
      user,
      accessToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const GetTopPerformance = async (req, res) => {
  const { examType } = req.query;

  if (!examType || !["AI", "MCQ"].includes(examType)) {
    return res.status(400).json({
      success: false,
      message: "examType must be AI or MCQ",
    });
  }

  const allScores = await Score.find();
console.log("All Scores:", allScores);
  try {
    const testInterview = await MCQ_Interview.findById(allScores[0].interviewId);
console.log("Interview exists?", testInterview);
    // ✅ Get real collection names dynamically
    const interviewCollection =
      examType === "AI"
        ? mongoose.model("AI_Interview").collection.name
        : mongoose.model("MCQ_Interview").collection.name;
 console.log("Using interview collection:", interviewCollection);


 const topPerformers = await Score.aggregate([

  // 🔥 Fix type casting issue
  {
    $addFields: {
      interviewIdObj: {
        $cond: [
          { $eq: [{ $type: "$interviewId" }, "string"] },
          { $toObjectId: "$interviewId" },
          "$interviewId"
        ]
      }
    }
  },

  {
    $lookup: {
      from: interviewCollection,
      localField: "interviewIdObj",
      foreignField: "_id",
      as: "interview",
    },
  },
  { $unwind: "$interview" },

  {
    $lookup: {
      from: mongoose.model("Candidate").collection.name,
      localField: "candidateId",
      foreignField: "_id",
      as: "candidate",
    },
  },
  { $unwind: "$candidate" },

  {
    $addFields: {
      totalQuestions:
        examType === "AI"
          ? "$interview.numberOfQuestions"
          : "$interview.no_of_questions",
    },
  },
  {
    $addFields: {
      percentage: {
        $cond: [
          { $eq: ["$totalQuestions", 0] },
          0,
          {
            $multiply: [
              { $divide: ["$totalScore", "$totalQuestions"] },
              100,
            ],
          },
        ],
      },
    },
  },

  { $sort: { percentage: -1 } },
  { $limit: 10 },

  {
    $project: {
      _id: 0,
      candidate: {
        name: "$candidate.name",
        email: "$candidate.email",
      },
      interview: {
        examType: "$interview.examType",
        difficulty: "$interview.difficulty",
        test_title: "$interview.test_title",
      },
      totalScore: 1,
      totalQuestions: 1,
      percentage: { $round: ["$percentage", 2] },
    },
  },
]);
 console.log("Top Performers:", topPerformers);
    res.status(200).json({
      success: true,
      data: topPerformers,
    });
  } catch (error) {
    console.error("TopPerformance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// export const GetAllSchedule = async (req, res) => {
//   try {
//     const now = new Date();

//     /* =====================================================
//        1️⃣ MCQ INTERVIEWS
//     ===================================================== */

//     const mcqData = await MCQ_Interview.aggregate([
//       { $unwind: "$candidates" },

//       {
//         $lookup: {
//           from: "candidates",
//           localField: "candidates.candidateId",
//           foreignField: "_id",
//           as: "candidateDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$candidateDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },

//       {
//         $project: {
//           _id: 1,
//           type: { $literal: "MCQ" },
//           title: "$test_title",
//           examType: 1,
//           difficulty: 1,

//           candidate: {
//             _id: "$candidateDetails._id",
//             name: "$candidateDetails.name",
//             email: "$candidateDetails.email",
//             mobile: "$candidateDetails.mobile",
//             role: "$candidateDetails.role",
//             year_of_experience:
//               "$candidateDetails.year_of_experience",
//             status: "$candidateDetails.status",
//             candidate_status:
//               "$candidateDetails.candidate_status",
//           },

//           startDate: "$candidates.start_Date",
//           endDate: "$candidates.end_Date",
//           interviewStatus: "$candidates.status",
//           interviewLink: "$candidates.interviewLink",
//           password: "$candidates.password",
//         },
//       },
//     ]);

//     /* =====================================================
//        2️⃣ AI INTERVIEWS
//     ===================================================== */

//     const aiData = await AI_Interview.aggregate([
//       { $unwind: "$candidates" },

//       {
//         $lookup: {
//           from: "candidates",
//           localField: "candidates.candidateId",
//           foreignField: "_id",
//           as: "candidateDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$candidateDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },

//       {
//         $project: {
//           _id: 1,
//           type: { $literal: "AI" },
//           title: "$position",
//           examType: 1,
//           difficulty: 1,

//           candidate: {
//             _id: "$candidateDetails._id",
//             name: "$candidateDetails.name",
//             email: "$candidateDetails.email",
//             mobile: "$candidateDetails.mobile",
//             role: "$candidateDetails.role",
//             year_of_experience:
//               "$candidateDetails.year_of_experience",
//             status: "$candidateDetails.status",
//             candidate_status:
//               "$candidateDetails.candidate_status",
//           },

//           startDate: "$candidates.scheduledStartDate",
//           endDate: "$candidates.scheduledEndDate",
//           interviewStatus: "$candidates.status",
//           interviewLink: "$candidates.interviewLink",
//           password: "$candidates.password",
//         },
//       },
//     ]);

//     /* =====================================================
//        3️⃣ MERGE + FILTER
//        Remove:
//        - No interview link
//        - No password
//        - Cancelled interviews
//     ===================================================== */

//     const allInterviews = [...mcqData, ...aiData]
//       .filter(
//         (item) =>
//           item.interviewLink &&
//           item.password &&
//           item.interviewStatus !== "cancelled" // 🔥 Exclude cancelled
//       )
//       .map(({ password, ...rest }) => rest); // Remove password

//     /* =====================================================
//        4️⃣ CATEGORIZE
//     ===================================================== */

//     const upcoming = [];
//     const ongoing = [];
//     const past = [];

//     allInterviews.forEach((item) => {
//       if (!item.startDate || !item.endDate) return;

//       const start = new Date(item.startDate);
//       const end = new Date(item.endDate);

//       if (now < start) {
//         upcoming.push(item);
//       } else if (now >= start && now <= end) {
//         ongoing.push(item);
//       } else {
//         past.push(item);
//       }
//     });

//     /* =====================================================
//        5️⃣ RESPONSE
//     ===================================================== */

//     return res.status(200).json({
//       totalScheduledTests: allInterviews.length,
//       upcomingCount: upcoming.length,
//       ongoingCount: ongoing.length,
//       pastCount: past.length,
//       upcoming,
//       ongoing,
//       past,
//     });
//   } catch (error) {
//     console.error("GetAllSchedule Error:", error);
//     return res.status(500).json({ message: "Server Error" });
//   }
// };



export const GetAllSchedule = async (req, res) => {
  try {
    const now = new Date();

    //  MCQ INTERVIEWS

    const mcqData = await MCQ_Interview.aggregate([
      { $unwind: "$candidates" },
      {
        $lookup: {
          from: "candidates",
          localField: "candidates.candidateId",
          foreignField: "_id",
          as: "candidateDetails",
        },
      },
      {
        $unwind: {
          path: "$candidateDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          type: { $literal: "MCQ" },
          title: "$test_title",
          examType: 1,
          difficulty: 1,
          candidate: {
            _id: "$candidateDetails._id",
            name: "$candidateDetails.name",
            email: "$candidateDetails.email",
            mobile: "$candidateDetails.mobile",
            role: "$candidateDetails.role",
            year_of_experience:
              "$candidateDetails.year_of_experience",
            status: "$candidateDetails.status",
            candidate_status:
              "$candidateDetails.candidate_status",
          },
          startDate: "$candidates.start_Date",
          endDate: "$candidates.end_Date",
          interviewStatus: "$candidates.status",
          interviewLink: "$candidates.interviewLink",
          password: "$candidates.password",
        },
      },
    ]);

    //  AI INTERVIEWS

    const aiData = await AI_Interview.aggregate([
      { $unwind: "$candidates" },
      {
        $lookup: {
          from: "candidates",
          localField: "candidates.candidateId",
          foreignField: "_id",
          as: "candidateDetails",
        },
      },
      {
        $unwind: {
          path: "$candidateDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          type: { $literal: "AI" },
          title: "$position",
          examType: 1,
          difficulty: 1,
          candidate: {
            _id: "$candidateDetails._id",
            name: "$candidateDetails.name",
            email: "$candidateDetails.email",
            mobile: "$candidateDetails.mobile",
            role: "$candidateDetails.role",
            year_of_experience:
              "$candidateDetails.year_of_experience",
            status: "$candidateDetails.status",
            candidate_status:
              "$candidateDetails.candidate_status",
          },
          startDate: "$candidates.scheduledStartDate",
          endDate: "$candidates.scheduledEndDate",
          interviewStatus: "$candidates.status",
          interviewLink: "$candidates.interviewLink",
          password: "$candidates.password",
        },
      },
    ]);

      //  🔥 NEW: COUNT MCQ & AI SCHEDULED

    const sheduled_mcq_interview = mcqData.filter(
      (item) =>
        item.interviewLink &&
        item.password &&
        item.interviewStatus !== "cancelled"
    ).length;

    const sheduled_ai_interview = aiData.filter(
      (item) =>
        item.interviewLink &&
        item.password &&
        item.interviewStatus !== "cancelled"
    ).length;

      //  MERGE + FILTER

    const allInterviews = [...mcqData, ...aiData]
      .filter(
        (item) =>
          item.interviewLink &&
          item.password &&
          item.interviewStatus !== "cancelled"
      )
      .map(({ password, ...rest }) => rest);

    // CATEGORIZE
  
    const upcoming = [];
    const ongoing = [];
    const past = [];

    allInterviews.forEach((item) => {
      if (!item.startDate || !item.endDate) return;

      const start = new Date(item.startDate);
      const end = new Date(item.endDate);

      if (now < start) {
        upcoming.push(item);
      } else if (now >= start && now <= end) {
        ongoing.push(item);
      } else {
        past.push(item);
      }
    });

// response with counts and categorized interviews

    return res.status(200).json({
      totalScheduledTests: allInterviews.length,

      // 🔥 Newly Added Counts
      sheduled_mcq_interview,
      sheduled_ai_interview,

      upcomingCount: upcoming.length,
      ongoingCount: ongoing.length,
      pastCount: past.length,

      upcoming,
      ongoing,
      past,
    });
  } catch (error) {
    console.error("GetAllSchedule Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};


export const rescheduleInterview = async (req, res) => {
  try {
    const { type, interviewId } = req.params;
    const { candidateId, newStartDate, newEndDate } = req.body;

    if (!candidateId || !newStartDate || !newEndDate) {
      return res.status(400).json({
        message: "candidateId, newStartDate, newEndDate required",
      });
    }

    let interview;

    if (type === "MCQ") {
      interview = await MCQ_Interview.findById(interviewId);
    } else if (type === "AI") {
      interview = await AI_Interview.findById(interviewId);
    } else {
      return res.status(400).json({ message: "Invalid interview type" });
    }

    if (!interview)
      return res.status(404).json({ message: "Interview not found" });

    const candidateEntry = interview.candidates.find(
      (c) => c.candidateId.toString() === candidateId
    );

    if (!candidateEntry)
      return res.status(404).json({ message: "Candidate not found" });

    // ❌ Don't reschedule completed or cancelled
    if (
      candidateEntry.status === "completed" ||
      candidateEntry.status === "cancelled"
    ) {
      return res.status(400).json({
        message: "Cannot reschedule completed/cancelled interview",
      });
    }

    if (type === "MCQ") {
      candidateEntry.start_Date = new Date(newStartDate);
      candidateEntry.end_Date = new Date(newEndDate);
    } else {
      candidateEntry.scheduledStartDate = new Date(newStartDate);
      candidateEntry.scheduledEndDate = new Date(newEndDate);
    }

    candidateEntry.status = "scheduled";

    await interview.save();

    // 🔥 Update Candidate status
    await Candidate.findByIdAndUpdate(candidateId, {
      status: "scheduled",
    });

    res.status(200).json({
      message: "Interview rescheduled successfully",
    });
  } catch (error) {
    console.error("Reschedule Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const cancelInterview = async (req, res) => {
  try {
    const { type, interviewId } = req.params;
    const { candidateId } = req.body;

    if (!candidateId) {
      return res.status(400).json({ message: "candidateId required" });
    }

    let interview;

    if (type === "MCQ") {
      interview = await MCQ_Interview.findById(interviewId);
    } else if (type === "AI") {
      interview = await AI_Interview.findById(interviewId);
    } else {
      return res.status(400).json({ message: "Invalid interview type" });
    }

    if (!interview)
      return res.status(404).json({ message: "Interview not found" });

    const candidateEntry = interview.candidates.find(
      (c) => c.candidateId.toString() === candidateId
    );

    if (!candidateEntry)
      return res.status(404).json({ message: "Candidate not found" });

    candidateEntry.status = "cancelled";

    await interview.save();

    // 🔥 Update Candidate status
    await Candidate.findByIdAndUpdate(candidateId, {
      status: "cancelled",
    });

    res.status(200).json({
      message: "Interview cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


export const getStudentScores = async (req, res) => {
  try {
    const { examType } = req.query;

    if (!examType || !["MCQ", "AI"].includes(examType)) {
      return res.status(400).json({
        success: false,
        message: "examType must be MCQ or AI",
      });
    }
  
    // const results = await Score.aggregate([
    //   {
    //     $match: { examType },
    //   },

    //   {
    //     $lookup: {
    //       from: "candidates",
    //       localField: "candidateId",
    //       foreignField: "_id",
    //       as: "candidate",
    //     },
    //   },

    //   { $unwind: "$candidate" },

    //   // 🔥 Calculate maxScore dynamically
    //   {
    //     $addFields: {
    //       maxScore: { $size: "$scores" },
    //     },
    //   },

    //   {
    //     $addFields: {
    //       percentage: {
    //         $cond: [
    //           { $gt: ["$maxScore", 0] },
    //           {
    //             $multiply: [
    //               { $divide: ["$totalScore", "$maxScore"] },
    //               100,
    //             ],
    //           },
    //           0,
    //         ],
    //       },
    //     },
    //   },

    //   {
    //     $group: {
    //       _id: "$candidate._id",
    //       candidate: {
    //         $first: {
    //           _id: "$candidate._id",
    //           name: "$candidate.name",
    //           email: "$candidate.email",
    //           role: "$candidate.role",
    //           candidate_status: "$candidate.candidate_status",
    //         },
    //       },
    //       scores: {
    //         $push: {
    //           interviewId: "$interviewId",
    //           totalScore: "$totalScore",
    //           maxScore: "$maxScore",
    //           percentage: { $round: ["$percentage", 2] },
    //           createdAt: "$createdAt",
    //         },
    //       },
    //       totalAttempts: { $sum: 1 },
    //     },
    //   },

    //   { $sort: { "scores.createdAt": -1 } },
    // ]);
      const scores = await Score.find({ examType }).populate("interviewId").populate("candidateId").populate("scores.questionId")

    return res.status(200).json({
      success: true,
      totalStudents: scores.length,
       scores,
    });
  } catch (error) {
    console.error("getStudentScores Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};