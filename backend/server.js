require("dotenv").config();

const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");
const adminRoutes = require("./routes/adminRoutes");
const candidateRoutes = require("./routes/candidateRoutes");

const app = express();

connectDB();

/*
|--------------------------------------------------------------------------
| CORS Configuration
|--------------------------------------------------------------------------
*/

// Allowed origins (add your frontend URLs here)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://192.168.31.223:5173", // local network frontend
  "http://192.168.31.230:5173", // local network frontend
  "http://192.168.31.222:5173",

  process.env.FRONTEND_URL, // production frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
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

  credentials: true, // allow cookies & auth headers

  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));
app.use("/scorecards", express.static("scorecards"));

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.use("/api/admin", adminRoutes);
app.use("/api/candidate", candidateRoutes);

/*
|--------------------------------------------------------------------------
| Server
|--------------------------------------------------------------------------
*/

app.post("/api/generate-mcq", async (req, res) => {
  try {
    const { topic, difficulty, count } = req.body;

    if (!topic || !difficulty || !count) {
      return res.status(400).json({
        success: false,
        message: "topic, difficulty and count are required",
      });
    }

    const BATCH_SIZE = 5; // generate 5 at a time
    const totalBatches = Math.ceil(count / BATCH_SIZE);
    let allQuestions = [];

    for (let i = 0; i < totalBatches; i++) {
      const remaining = count - allQuestions.length;
      const currentBatchSize =
        remaining >= BATCH_SIZE ? BATCH_SIZE : remaining;

      const prompt = `
Generate exactly ${currentBatchSize} ${difficulty} multiple choice questions about ${topic}.

Rules:
- Each question must have exactly 4 options
- No explanations
- correctAnswer must match one option exactly
- Keep questions concise
- Return ONLY valid JSON array

Format exactly like this:

[
  {
    "question": "What is ...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A"
  }
]
`;

      const response = await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "mistralai/Mistral-7B-Instruct-v0.2",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 800,
            temperature: 0.5,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({
          success: false,
          message: "Failed to generate MCQs",
          details: errorText,
        });
      }

      const data = await response.json();

      let generatedText =
        data?.choices?.[0]?.message?.content || "";

      generatedText = generatedText
        .replace(/```json/gi, "")
        .replace(/```/gi, "")
        .trim();

      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);

      if (!jsonMatch) {
        throw new Error("Invalid JSON returned by AI");
      }

      const batchQuestions = JSON.parse(jsonMatch[0]);

      allQuestions = [...allQuestions, ...batchQuestions];
    }

    res.status(200).json({
      success: true,
      questions: allQuestions.slice(0, count),
    });

  } catch (error) {
    console.error("MCQ Generation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate MCQs",
      error: error.message,
    });
  }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
