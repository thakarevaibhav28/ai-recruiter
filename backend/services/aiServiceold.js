import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI("AIzaSyDDq4xW3YZoTBLCybwaNYbyRXPXBtj1-cg");
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });


const cleanResponseText = (text) => {
  return text.replace(/```json\n|```|\n/g, '').trim();
};

const callGeminiWithRetry = async (prompt, maxRetries = 4) => {
  let attempt = 0;
  let delay   = 1000;

  while (attempt < maxRetries) {
    try {
      const { response } = await model.generateContent(prompt);
      return response.text();
    } catch (err) {
      const status = err.status ?? err.code ?? err.response?.status;
      if (status !== 503) throw err;               // not a 503 → fail fast
      if (++attempt === maxRetries) throw err;     // out of retries
      console.warn(`Gemini 503 – retrying in ${delay}ms (try ${attempt}/${maxRetries})`);
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
};
export const generateQuestions = async (jobDescription, test_title, difficulty, Exam_Type, no_of_questions) => {
 
  let prompt;

  if (Exam_Type === 'Interview') {
    prompt = `
    Generate ${no_of_questions} Interview questions for a Job Description: ${jobDescription} level candidate
    in ${test_title} with ${difficulty} difficulty.
    Each question should be concise and relevant to the technology stack.
    Return the questions as a raw JSON array of strings, without any Markdown formatting or code fences.
    Example: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]
    `;
  } else if (Exam_Type === 'MCQ') {
    prompt = `
    Generate ${no_of_questions} multiple choice questions (MCQs)and level of the candidate
    in ${test_title} with ${difficulty} difficulty.
    Each question should have 4 options (A, B, C, D) and one correct answer.
    Return the questions as a raw JSON array of objects, without any Markdown formatting or code fences.
    Each object should have: question, options (array of 4 strings), and correctAnswer (string).
    Example: [
      {
        "question": "What is the correct syntax for declaring a variable in JavaScript?",
        "options": [
          "var x = 5;",
          "variable x = 5;",
          "x := 5;",
          "x = 5;"
        ],
        "correctAnswer": "var x = 5;"
      }
    ]
    `;
  } else {
    throw new Error('Invalid exam type. Please choose either "Interview" or "MCQ"');
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();
    console.log('Raw response from Gemini:', rawText);
    const cleanedText = cleanResponseText(rawText);
    const questions = JSON.parse(cleanedText);

    if (Exam_Type === 'Interview') {
      if (!Array.isArray(questions) || questions.length !== 5) {
        throw new Error('Expected an array of 5 Interview questions');
      }
    } else if (Exam_Type === 'MCQ') {
      if (!Array.isArray(questions) || questions.length !== no_of_questions ||
        !questions.every(q => q.question && Array.isArray(q.options) && q.options.length === 4 && q.correctAnswer)) {
        throw new Error('Invalid MCQ format');
      }
    }
    return questions;
  } catch (error) {
    console.error('Error in generateQuestions:', error);
    throw new Error('Failed to generate questions');
  }
};

export const evaluateAnswer = async (question, answer) => {
  const prompt = `
  Evaluate the following answer for the given question. Provide a score out of 10 and a brief feedback.
  Question: ${question}
  Answer: ${answer}
  Return the result as a raw JSON object, without any Markdown formatting or code fences.
  Example: {"score": 8, "feedback": "Good answer, but could include more details."}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();
    console.log('Raw response from Gemini (evaluateAnswer):', rawText); // Debugging
    const cleanedText = cleanResponseText(rawText);
    const evaluation = JSON.parse(cleanedText);
    if (!evaluation.score || !evaluation.feedback) {
      throw new Error('Invalid evaluation format');
    }
    return evaluation;
  } catch (error) {
    console.error('Error in evaluateAnswer:', error);
    throw new Error('Failed to evaluate answer');
  }
};
export const generateSummary = async (scores) => {
  const prompt = `
  Given the following scores and feedback for ${no_of_questions} questions, provide a summary of the candidate's performance.
  Input: ${JSON.stringify(scores)}
  Return a concise summary as a raw JSON string, without any Markdown formatting or code fences.
  Example: "The candidate performed well overall, with strong answers in technical questions."
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();
    console.log('Raw response from Gemini (generateSummary):', rawText); // Debugging
    const cleanedText = cleanResponseText(rawText);
    const summary = JSON.parse(cleanedText);
    if (typeof summary !== 'string') {
      throw new Error('Expected a string summary');
    }
    return summary;
  } catch (error) {
    console.error('Error in generateSummary:', error);
    throw new Error('Failed to generate summary');
  }
};