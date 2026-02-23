import dotenv from "dotenv";
import Question from "../../models/Question.js";
dotenv.config();

export const generateMCQs = async (req, res) => {
  try {
    const { topic, difficulty, count } = req.body;
    const { id } = req.params;
    const interviewId = id;

    if (!topic || !difficulty || !count || !interviewId) {
      return res.status(400).json({
        success: false,
        message: "topic, difficulty, count and interviewId are required",
      });
    }

    const BATCH_SIZE = 5;
    const totalBatches = Math.ceil(count / BATCH_SIZE);
    let allQuestions = [];

    for (let i = 0; i < totalBatches; i++) {
      const remaining = count - allQuestions.length;
      const currentBatchSize = remaining >= BATCH_SIZE ? BATCH_SIZE : remaining;

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

      // ✅ Groq API — fast, free, reliable
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "system",
                content:
                  "You are an expert quiz generator. Always respond with ONLY a valid JSON array. No prose, no markdown, no code fences.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: 800,
            temperature: 0.5,
            stream: false,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Groq API error:", response.status, errorText);
        return res.status(response.status).json({
          success: false,
          message: "Failed to generate MCQs",
          details: errorText,
        });
      }

      const data = await response.json();
      let generatedText = data?.choices?.[0]?.message?.content || "";

      // Strip any markdown fences just in case
      generatedText = generatedText
        .replace(/```json/gi, "")
        .replace(/```/gi, "")
        .trim();

      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Invalid JSON returned by AI");
      }

      const batchQuestions = JSON.parse(jsonMatch[0]);

      // Save batch to DB
      const questionDocs = batchQuestions.map((q) => ({
        interviewId,
        questionText: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        examType: "MCQ",
      }));

      await Question.insertMany(questionDocs);

      allQuestions = [...allQuestions, ...batchQuestions];
    }

    return res.status(200).json({
      success: true,
      questions: allQuestions.slice(0, count),
    });

  } catch (error) {
    console.error("MCQ Generation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate MCQs",
      error: error.message,
    });
  }
};