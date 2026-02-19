import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();


// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Format date helper
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format time helper
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Send MCQ Interview invitation email with credentials
 * @param {string} candidateEmail - Candidate's email
 * @param {string} candidateName - Candidate's name
 * @param {string} interviewLink - Interview link
 * @param {string} username - Generated username
 * @param {string} password - Generated password
 * @param {string} testTitle - Assessment title
 * @param {string} difficulty - Difficulty level
 * @param {string} duration - Duration
 * @param {number} noOfQuestions - Number of questions
 * @param {string} passingScore - Passing score percentage
 * @param {string} primarySkill - Primary skill
 * @param {string} secondarySkill - Secondary skill (optional)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 */

// Send AI Interview invitation email
export const sendMCQInterviewLink = async (
  candidateEmail,
  candidateName,
  interviewLink,
  username,
  password,
  testTitle,
  difficulty,
  duration,
  noOfQuestions,
  passingScore,
  primarySkill,
  secondarySkill,
  startDate,
  endDate
) => {
  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          padding: 20px;
          margin: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
        }
        .greeting {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .info-box {
          background-color: #f8f9fa;
          border-left: 4px solid #667eea;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: bold;
          color: #555;
        }
        .info-value {
          color: #333;
        }
        .credentials {
          background-color: #fff3cd;
          border: 2px dashed #ffc107;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
          text-align: center;
        }
        .credentials h3 {
          margin-top: 0;
          color: #856404;
          font-size: 18px;
        }
        .credential-item {
          margin: 15px 0;
          font-size: 16px;
        }
        .credential-item strong {
          display: inline-block;
          width: 100px;
          color: #856404;
        }
        .credential-item span {
          background-color: #fff;
          padding: 8px 20px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          border: 1px solid #ffc107;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          padding: 15px 40px;
          border-radius: 5px;
          font-weight: bold;
          font-size: 16px;
        }
        .button:hover {
          opacity: 0.9;
        }
        .important-note {
          background-color: #e7f3ff;
          border-left: 4px solid #2196F3;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .important-note h4 {
          margin-top: 0;
          color: #1976D2;
        }
        .important-note ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .important-note li {
          margin: 8px 0;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📝 Assessment Invitation</h1>
          <p>You've been invited to take an MCQ assessment</p>
        </div>
        
        <div class="content">
          <p class="greeting">Dear <strong>${candidateName}</strong>,</p>
          
          <p>You have been invited to participate in the following assessment. Please review the details below carefully:</p>
          
          <div class="info-box">
            <div class="info-row">
              <span class="info-label">Assessment Title:</span>
              <span class="info-value">${testTitle}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Primary Skill:</span>
              <span class="info-value">${primarySkill}</span>
            </div>
            ${
              secondarySkill
                ? `
            <div class="info-row">
              <span class="info-label">Secondary Skill:</span>
              <span class="info-value">${secondarySkill}</span>
            </div>
            `
                : ""
            }
            <div class="info-row">
              <span class="info-label">Difficulty Level:</span>
              <span class="info-value">${difficulty}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Duration:</span>
              <span class="info-value">${duration}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Number of Questions:</span>
              <span class="info-value">${noOfQuestions}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Passing Score:</span>
              <span class="info-value">${passingScore}%</span>
            </div>
          </div>
          
          <div class="credentials">
            <h3>🔐 Your Login Credentials</h3>
            <p style="color: #856404; margin: 10px 0;">Please keep these safe and do not share with anyone</p>
            <div class="credential-item">
              <strong>Username:</strong>
              <span>${username}</span>
            </div>
            <div class="credential-item">
              <strong>Password:</strong>
              <span>${password}</span>
            </div>
          </div>
          
          <div class="info-box">
            <div class="info-row">
              <span class="info-label">📅 Start Date:</span>
              <span class="info-value">${formatDate(startDate)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">🕐 Start Time:</span>
              <span class="info-value">${formatTime(startDate)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">📅 End Date:</span>
              <span class="info-value">${formatDate(endDate)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">🕐 End Time:</span>
              <span class="info-value">${formatTime(endDate)}</span>
            </div>
          </div>
          
          <div class="button-container">
            <a href="${interviewLink}" class="button">
              Start Assessment →
            </a>
          </div>
          
          <div class="important-note">
            <h4>⚠️ Important Guidelines:</h4>
            <ul>
              <li>Keep your login credentials safe and confidential</li>
              <li>Complete the assessment within the specified time window</li>
              <li>Ensure you have a stable internet connection</li>
              <li>Once started, the timer cannot be paused</li>
              <li>You need to score at least ${passingScore}% to pass</li>
              <li>Make sure to submit your answers before the timer expires</li>
              <li>Any form of malpractice will result in immediate disqualification</li>
            </ul>
          </div>
          
          <p>Good luck with your assessment! If you experience any technical difficulties or have questions, please contact our support team immediately.</p>
          
          <p>Best regards,<br>
          <strong>Recruitment Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; ${new Date().getFullYear()} Assessment Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Assessment Platform" <${process.env.EMAIL_USER}>`,
    to: candidateEmail,
    subject: `Assessment Invitation: ${testTitle}`,
    html: emailHTML,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${candidateEmail}`);
    return { success: true, email: candidateEmail };
  } catch (error) {
    console.error(`❌ Error sending email to ${candidateEmail}:`, error);
    throw error;
  }
};

// Send AI Interview invitation email
export const sendAIInterviewLink = async (
  candidateEmail,
  interviewLink,
  username,
  password,
  subjectLine,
  passingScore,
  messageBody,
  scheduledEndDate,
  scheduledStartDate
) => {
  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .content {
          padding: 30px;
        }
        .credentials {
          background-color: #fff3cd;
          border: 2px dashed #ffc107;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
          text-align: center;
        }
           .credentials h3 {
          margin-top: 0;
          color: #856404;
          font-size: 18px;
        }
        .credential-item {
          margin: 15px 0;
          font-size: 16px;
        }
        .credential-item strong {
          display: inline-block;
          width: 100px;
          color: #856404;
        }
        .credential-item span {
          background-color: #fff;
          padding: 8px 20px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          border: 1px solid #ffc107;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          text-decoration: none;
          padding: 15px 40px;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
           .important-note {
          background-color: #e7f3ff;
          border-left: 4px solid #2196F3;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .important-note h4 {
          margin-top: 0;
          color: #1976D2;
        }
        .important-note ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .important-note li {
          margin: 8px 0;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎤 AI Interview Invitation</h1>
        </div>
        <div class="content">
          ${messageBody}
          
         <div class="credentials">
            <h3>🔐 Your Login Credentials</h3>
            <p style="color: #856404; margin: 10px 0;">Please keep these safe and do not share with anyone</p>
            <div class="credential-item">
              <strong>Username:</strong>
              <span>${username}</span>
            </div>
            <div class="credential-item">
              <strong>Password:</strong>
              <span>${password}</span>
            </div>
          </div>
          
          <p><strong>Scheduled:</strong> ${formatDate(scheduledStartDate)} at ${formatTime(scheduledStartDate)}</p>
          <p><strong>Deadline:</strong> ${formatDate(scheduledEndDate)} at ${formatTime(scheduledEndDate)}</p>
          
          <div style="text-align: center;">
            <a href="${interviewLink}" class="button">Join Interview</a>
          </div>
        </div>
        <div class="important-note">
            <h4>⚠️ Important Guidelines:</h4>
            <ul>
              <li>Keep your login credentials safe and confidential</li>
              <li>Complete the assessment within the specified time window</li>
              <li>Ensure you have a stable internet connection</li>
              <li>Once started, the timer cannot be paused</li>
                <li>You need to score at least ${passingScore}% to pass</li>
              <li>Make sure to submit your answers before the timer expires</li>
              <li>Any form of malpractice will result in immediate disqualification</li>
            </ul>
          </div>
          
          <p>Good luck with your assessment! If you experience any technical difficulties or have questions, please contact our support team immediately.</p>
          
          <p>Best regards,<br>
          <strong>Recruitment Team</strong></p>
          </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Assessment Platform" <${process.env.EMAIL_USER}>`,
    to: candidateEmail,
    subject: subjectLine,
    html: emailHTML,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ AI Interview email sent to ${candidateEmail}`);
  } catch (error) {
    console.error(`❌ Error sending AI interview email:`, error);
    throw error;
  }
};

//Send MCQ Scorecard email
export const sendMCQScorecard = async (candidateEmail, candidateName, scoreData) => {
  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .score-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Assessment Results</h1>
        </div>
        <div class="content">
          <p>Dear ${candidateName},</p>
          <p>Your assessment has been evaluated. Here are your results:</p>
          <div class="score-box">
            <p><strong>Total Score:</strong> ${scoreData.totalScore}</p>
            <p><strong>Result:</strong> ${scoreData.result}</p>
          </div>
          <p>Thank you for participating!</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Assessment Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Assessment Platform" <${process.env.EMAIL_USER}>`,
    to: candidateEmail,
    subject: "Your Assessment Results",
    html: emailHTML,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Scorecard sent to ${candidateEmail}`);
  } catch (error) {
    console.error(`❌ Error sending scorecard:`, error);
    throw error;
  }
};

 //Send AI Interview Scorecard
export const sendAIScorecard = async (candidateEmail, candidateName, scoreData) => {
  // Similar to MCQ scorecard but for AI interviews
  return sendMCQScorecard(candidateEmail, candidateName, scoreData);
};

