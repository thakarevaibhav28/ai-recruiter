import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  role: { type: String, required: true },
  year_of_experience: { type: String, required: true },
  key_Skills: { type: String, require: true },
  description: { type: String },
  status: {
    type: String,
    enum: ["new", "inprogress", "completed"],
    default: "new",
  },
  candidate_status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  aadharCard: { type: String, default: null },
  photo: { type: String, default: null },
});

export default mongoose.model("Candidate", candidateSchema);
