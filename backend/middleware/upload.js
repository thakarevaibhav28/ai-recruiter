import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

/* ================= FILE TYPE FILTER ================= */

const fileFilter = (req, file, cb) => {
  const allowedDocs = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const allowedImages = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  // Job Description
  if (file.fieldname === "jobDescription") {
    if (allowedDocs.includes(file.mimetype)) return cb(null, true);
    return cb(new Error("Only PDF/DOC/DOCX allowed"), false);
  }

  // Photo
  if (file.fieldname === "photo") {
    if (allowedImages.includes(file.mimetype)) return cb(null, true);
    return cb(new Error("Only image files allowed"), false);
  }
  // Resume
  if (file.fieldname === "resume") {
    if (allowedDocs.includes(file.mimetype)) return cb(null, true);
    return cb(new Error("Only PDF/DOC/DOCX allowed for Resume"), false);
  }

  // Aadhar
  if (file.fieldname === "aadharCard") {
    if (
      allowedDocs.includes(file.mimetype) ||
      allowedImages.includes(file.mimetype)
    )
      return cb(null, true);

    return cb(new Error("Invalid file type for Aadhar"), false);
  }

  return cb(new Error("Invalid file type"), false);
};

/* ================= CLOUDINARY STORAGE ================= */

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "general";

    if (file.fieldname === "jobDescription") folder = "job-descriptions";
    if (file.fieldname === "aadharCard") folder = "aadharCards";
    if (file.fieldname === "resume") folder = "resumes";
    if (file.fieldname === "photo") folder = "candidate-photo";
    if (file.fieldname === "scorecard") folder = "scorecards";

    return {
      folder,
      resource_type: "auto",
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

/* ================= MULTER INSTANCES ================= */

// Cloudinary uploads (documents, images, scorecards)
export const upload = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

// CSV Upload (memory only)
export const uploadCSV = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["text/csv", "application/vnd.ms-excel"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only CSV files allowed"), false);
  },
});

export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});
