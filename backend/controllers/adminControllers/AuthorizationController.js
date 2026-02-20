import Admin from "../../models/Admin.js";
import jwt from "jsonwebtoken";
import Score from "../../models/Score.js";
import mongoose from "mongoose";
import MCQ_Interview from "../../models/MCQ_Interview.js";

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


// export const GetTopPerformance = async (req, res) => {
//   const { examType } = req.query;

//   if (!examType || !["MCQ", "AI"].includes(examType)) {
//     return res.status(400).json({
//       success: false,
//       message: "examType must be MCQ or AI",
//     });
//   }

//   try {
//     let InterviewModel;

//     if (examType === "MCQ") {
//       InterviewModel = MCQ_Interview;
//     } else {
//       InterviewModel = AI_Interview;
//     }

//     const topPerformers = await Score.aggregate([
//       // Join Interview
//       {
//         $lookup: {
//           from: examType === "MCQ" ? "mcq_interviews" : "ai_interviews",
//           localField: "interviewId",
//           foreignField: "_id",
//           as: "interview",
//         },
//       },
//       { $unwind: "$interview" },

//       // Calculate total questions dynamically
//       {
//         $addFields: {
//           totalQuestions: {
//             $cond: {
//               if: { $isArray: "$scores" },
//               then: { $size: "$scores" },
//               else: 0,
//             },
//           },
//         },
//       },

//       // Calculate percentage
//       {
//         $addFields: {
//           percentage: {
//             $cond: [
//               { $eq: ["$totalQuestions", 0] },
//               0,
//               {
//                 $multiply: [
//                   { $divide: ["$totalScore", "$totalQuestions"] },
//                   100,
//                 ],
//               },
//             ],
//           },
//         },
//       },

//       // Join Candidate Info
//       {
//         $lookup: {
//           from: "candidates",
//           localField: "candidateId",
//           foreignField: "_id",
//           as: "candidate",
//         },
//       },
//       { $unwind: "$candidate" },

//       // Sort by percentage
//       { $sort: { percentage: -1 } },

//       // Limit Top 10
//       { $limit: 10 },

//       // Clean Output
//       {
//         $project: {
//           _id: 0,
//           candidateId: "$candidate._id",
//           name: "$candidate.name",
//           email: "$candidate.email",
//           totalScore: 1,
//           totalQuestions: 1,
//           percentage: { $round: ["$percentage", 2] },
//           interviewId: 1,
//         },
//       },
//     ]);

//     res.status(200).json({
//       success: true,
//       data: topPerformers,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };


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
