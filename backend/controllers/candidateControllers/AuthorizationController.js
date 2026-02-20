import Candidate from "../../models/Candidate.js";
import csv from "csv-parser";
import fs from "fs";
import {getIO} from "../../socket.js"
import AI_Interview from "../../models/AI_Interview.js";
import MCQ_Interview from "../../models/MCQ_Interview.js";



export const CreateCandidate = async (req, res) => {
  const {
    id,
    email,
    name,
    mobile,
    role,
    key_Skills,
    description,
    year_of_experience,
  } = req.body;

 
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
        { new: true, runValidators: true },
      );

      if (!updatedCandidate) {
        return res.status(404).json({ message: "Candidate not found." });
      }


      let io=getIO();
      io.to("admins").emit("candidate-updated",updatedCandidate);
      io.to(updatedCandidate._id.toString()).emit("candidate-updated",updatedCandidate);
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

    let io=getIO();
    io.to("admins").emit("candidate-added",candidate);
    io.to(candidate._id.toString()).emit("candidate-added",candidate);
    res.status(201).json({
      message: "Candidate added",
      newCandidate: candidate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const GetCandidate = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });

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
}

export const UpdateCandidate= async (req, res) => {
  const { id } = req.params;
  const { candidate_status } = req.body;

  if (!["active", "inactive"].includes(candidate_status)) {
    return res.status(400).json({
      message: "Invalid status value.",
    });
  }

  try {
    const candidate = await Candidate.findByIdAndUpdate(
      id,
      { candidate_status },
      { new: true },
    );

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found.",
      });
    }

    let io=getIO();
    io.to("admins").emit("candidate-updated",candidate);
    io.to(candidate._id.toString()).emit("candidate-updated",candidate);
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

 export const BulkAddCandidates = async (req, res) => {
    const results = [];

    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required." });
    }

    try {
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
}
export const GetAllSchedule = async (req, res) => {
  try {
    const now = new Date();

    /* =====================================================
       1️⃣ MCQ INTERVIEWS
    ===================================================== */

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
      { $unwind: { path: "$candidateDetails", preserveNullAndEmptyArrays: true } },

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
            year_of_experience: "$candidateDetails.year_of_experience",
            status: "$candidateDetails.status",
            candidate_status: "$candidateDetails.candidate_status",
          },

          startDate: "$candidates.start_Date",
          endDate: "$candidates.end_Date",
          interviewStatus: "$candidates.status",
          interviewLink: "$candidates.interviewLink",
          password: "$candidates.password", // for filtering only
        },
      },
    ]);

    /* =====================================================
       2️⃣ AI INTERVIEWS
    ===================================================== */

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
      { $unwind: { path: "$candidateDetails", preserveNullAndEmptyArrays: true } },

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
            year_of_experience: "$candidateDetails.year_of_experience",
            status: "$candidateDetails.status",
            candidate_status: "$candidateDetails.candidate_status",
          },

          startDate: "$candidates.scheduledStartDate",
          endDate: "$candidates.scheduledEndDate",
          interviewStatus: "$status",
          interviewLink: "$candidates.interviewLink",
          password: "$candidates.password",
        },
      },
    ]);

    /* =====================================================
       3️⃣ MERGE + FILTER (Remove Password)
    ===================================================== */

    const allInterviews = [...mcqData, ...aiData]
      .filter((item) => item.interviewLink && item.password)
      .map(({ password, ...rest }) => rest);

    /* =====================================================
       4️⃣ CATEGORIZE
    ===================================================== */

    const upcoming = [];
    const ongoing = [];
    const past = [];

    allInterviews.forEach((item) => {
      if (!item.startDate || !item.endDate) return;

      if (now < new Date(item.startDate)) {
        upcoming.push(item);
      } else if (
        now >= new Date(item.startDate) &&
        now <= new Date(item.endDate)
      ) {
        ongoing.push(item);
      } else {
        past.push(item);
      }
    });

    /* =====================================================
       5️⃣ RESPONSE
    ===================================================== */

    res.status(200).json({
      totalScheduledTests: allInterviews.length,
      upcomingCount: upcoming.length,
      ongoingCount: ongoing.length,
      pastCount: past.length,
      upcoming,
      ongoing,
      past,
    });

  } catch (error) {
    console.error("GetAllSchedule Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};