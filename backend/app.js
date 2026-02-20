import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import MCQRoutes from "./routes/MCQRoutes.js";

const app = express();

connectDB();

//cors configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://192.168.31.223:5173",
  "http://192.168.31.230:5173",
  "http://192.168.31.222:5173",

  process.env.FRONTEND_URL,
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],

  credentials: true,

  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

//Middleware
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads and scorecards
app.use("/uploads", express.static("uploads"));
app.use("/scorecards", express.static("scorecards"));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/admin/generate-mcq", MCQRoutes);

export default app;
