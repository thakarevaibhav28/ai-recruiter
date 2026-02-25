import puppeteer from "puppeteer";

export const generateScorecardPDFBuffer = async (
  candidate,
  scores,
  totalScore,
  summary,
) => {
  const totalQuestions = scores.length;
  const maxScore = totalQuestions * 10;
  const percentage = ((totalScore / maxScore) * 100).toFixed(1);
  const passed = percentage >= 70;

  let rating = "Needs Improvement";
  if (percentage >= 85) rating = "Excellent";
  else if (percentage >= 70) rating = "Very Good";
  else if (percentage >= 50) rating = "Good";

  const ratingColor =
    percentage >= 85
      ? "#16a34a"
      : percentage >= 70
        ? "#2563eb"
        : percentage >= 50
          ? "#f59e0b"
          : "#dc2626";

  const statusColor = passed ? "#16a34a" : "#dc2626";
  const statusBg = passed ? "#f0fdf4" : "#fef2f2";
  const statusBorder = passed ? "#bbf7d0" : "#fecaca";

  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const generatedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const scoreRows = scores
    .map((item, i) => {
      const isCorrect = item.userAnswer && item.userAnswer.trim() === (item.correctAnswer || "").trim();

      // Build options HTML
      let optionsHtml = "";
      if (item.options && item.options.length > 0) {
        optionsHtml = `<div class="options-grid">${item.options
          .map((opt) => {
            const isThisCorrect = opt.trim() === (item.correctAnswer || "").trim();
            const isUserPick = opt.trim() === (item.userAnswer || "").trim();
            let cls = "option-default";
            if (isThisCorrect) cls = "option-correct";
            else if (isUserPick && !isThisCorrect) cls = "option-wrong";
            return `<div class="option-item ${cls}">${opt}${isThisCorrect ? ' <span class="option-tag">✓ Correct</span>' : ""}${isUserPick && !isThisCorrect ? ' <span class="option-tag">✗ Your Answer</span>' : ""}</div>`;
          })
          .join("")}</div>`;
      }

      return `
      <div class="question-card ${i % 2 === 0 ? "card-even" : "card-odd"}">
        <div class="question-header">
          <div class="question-number">Q${i + 1}</div>
          <span class="score-pill" style="background: ${item.score >= 7 ? "#dcfce7" : item.score >= 5 ? "#fef9c3" : "#fee2e2"}; color: ${item.score >= 7 ? "#166534" : item.score >= 5 ? "#854d0e" : "#991b1b"}">
            ${item.score}/10
          </span>
        </div>
        <div class="question-text">${item.questionText || "Question not available"}</div>
        ${optionsHtml}
        ${!item.options?.length && item.userAnswer ? `<div class="user-answer-text"><strong>Answer:</strong> ${item.userAnswer}</div>` : ""}
      </div>`;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1e293b;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    width: 794px;
    min-height: 1123px;
    padding: 0;
    position: relative;
  }

  /* ===== HEADER ===== */
  .header {
    background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
    padding: 40px 50px 35px;
    position: relative;
    overflow: hidden;
  }

  .header::before {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: rgba(255,255,255,0.03);
  }

  .header::after {
    content: '';
    position: absolute;
    bottom: -30px;
    left: 30%;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: rgba(255,255,255,0.02);
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .brand-icon {
    width: 42px;
    height: 42px;
    background: rgba(255,255,255,0.15);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #fff;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .brand-text {
    color: rgba(255,255,255,0.5);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .doc-id {
    color: rgba(255,255,255,0.4);
    font-size: 10px;
    font-weight: 400;
    text-align: right;
    line-height: 1.6;
  }

  .header h1 {
    color: #ffffff;
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.5px;
    position: relative;
  }

  .header-accent {
    display: inline-block;
    width: 40px;
    height: 3px;
    background: #3b82f6;
    border-radius: 2px;
    margin-top: 12px;
  }

  /* ===== CONTENT ===== */
  .content {
    padding: 35px 50px;
  }

  /* ===== CANDIDATE INFO ===== */
  .candidate-section {
    display: flex;
    gap: 24px;
    margin-bottom: 30px;
  }

  .candidate-card {
    flex: 1;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 22px 26px;
  }

  .candidate-card h3 {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #94a3b8;
    margin-bottom: 14px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .info-row:last-child { border-bottom: none; }

  .info-label {
    font-size: 11px;
    font-weight: 500;
    color: #64748b;
  }

  .info-value {
    font-size: 11px;
    font-weight: 600;
    color: #1e293b;
  }

  /* ===== SCORE OVERVIEW ===== */
  .score-overview {
    display: flex;
    gap: 16px;
    margin-bottom: 30px;
  }

  .score-box {
    flex: 1;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    border: 1px solid #e2e8f0;
  }

  .score-box-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #64748b;
    margin-bottom: 8px;
  }

  .score-box-value {
    font-size: 28px;
    font-weight: 800;
    color: #0f172a;
    line-height: 1;
  }

  .score-box-sub {
    font-size: 10px;
    color: #94a3b8;
    margin-top: 4px;
  }

  .score-box.highlight {
    background: ${statusBg};
    border-color: ${statusBorder};
  }

  .score-box.highlight .score-box-value {
    color: ${statusColor};
  }

  .score-box.rating {
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  }

  /* ===== STATUS BANNER ===== */
  .status-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px;
    border-radius: 10px;
    margin-bottom: 30px;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 0.5px;
    background: ${statusBg};
    color: ${statusColor};
    border: 1.5px solid ${statusBorder};
  }

  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${statusColor};
  }

  /* ===== SECTION TITLE ===== */
  .section-title {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-title .accent-bar {
    width: 4px;
    height: 20px;
    background: #3b82f6;
    border-radius: 2px;
  }

  .score-pill {
    display: inline-block;
    padding: 3px 12px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 11px;
  }

  /* ===== QUESTION CARDS ===== */
  .question-card {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 16px;
    page-break-inside: avoid;
  }

  .card-even { background: #ffffff; }
  .card-odd { background: #f8fafc; }

  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .question-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #0f172a;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
  }

  .question-text {
    font-size: 12px;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.6;
    margin-bottom: 14px;
  }

  .options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .option-item {
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 500;
    border: 1px solid #e2e8f0;
    color: #334155;
    line-height: 1.4;
  }

  .option-default {
    background: #ffffff;
    border-color: #e2e8f0;
  }

  .option-correct {
    background: #dcfce7;
    border-color: #86efac;
    color: #166534;
    font-weight: 600;
  }

  .option-wrong {
    background: #fee2e2;
    border-color: #fca5a5;
    color: #991b1b;
    font-weight: 600;
  }

  .option-tag {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-left: 6px;
    opacity: 0.85;
  }

  .user-answer-text {
    margin-top: 10px;
    padding: 10px 14px;
    background: #f1f5f9;
    border-radius: 8px;
    font-size: 11px;
    color: #334155;
    line-height: 1.5;
  }

  /* ===== SUMMARY ===== */
  .summary-box {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 28px;
    margin-bottom: 30px;
  }

  .summary-box p {
    font-size: 12px;
    line-height: 1.8;
    color: #374151;
    text-align: justify;
  }

  /* ===== FOOTER ===== */
  .footer {
    padding: 20px 50px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .footer-left {
    font-size: 9px;
    color: #94a3b8;
  }

  .footer-right {
    font-size: 9px;
    color: #94a3b8;
    text-align: right;
  }

  .confidential-badge {
    display: inline-block;
    padding: 3px 10px;
    background: #fef2f2;
    color: #dc2626;
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    border-radius: 4px;
    border: 1px solid #fecaca;
  }
</style>
</head>
<body>
  <div class="page">

    <!-- HEADER -->
    <div class="header">
      <div class="header-top">
        <div class="brand">
          <div class="brand-icon">&#9733;</div>
          <div class="brand-text">Interview Intelligence Platform</div>
        </div>
        <div class="doc-id">
          ${generatedDate}<br/>${generatedTime}
        </div>
      </div>
      <h1>Interview Evaluation Report</h1>
      <div class="header-accent"></div>
    </div>

    <div class="content">

      <!-- CANDIDATE INFO -->
      <div class="candidate-section">
        <div class="candidate-card">
          <h3>Candidate Details</h3>
          <div class="info-row">
            <span class="info-label">Full Name</span>
            <span class="info-value">${candidate.name || "N/A"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email Address</span>
            <span class="info-value">${candidate.email || "N/A"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Interview Date</span>
            <span class="info-value">${generatedDate}</span>
          </div>
        </div>
        <div class="candidate-card">
          <h3>Assessment Overview</h3>
          <div class="info-row">
            <span class="info-label">Total Questions</span>
            <span class="info-value">${totalQuestions}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Maximum Score</span>
            <span class="info-value">${maxScore}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Performance Rating</span>
            <span class="info-value" style="color: ${ratingColor}">${rating}</span>
          </div>
        </div>
      </div>

      <!-- SCORE OVERVIEW -->
      <div class="score-overview">
        <div class="score-box">
          <div class="score-box-label">Score Achieved</div>
          <div class="score-box-value">${totalScore}</div>
          <div class="score-box-sub">out of ${maxScore}</div>
        </div>
        <div class="score-box">
          <div class="score-box-label">Percentage</div>
          <div class="score-box-value">${percentage}%</div>
          <div class="score-box-sub">overall score</div>
        </div>
        <div class="score-box rating">
          <div class="score-box-label">Rating</div>
          <div class="score-box-value" style="font-size:20px; color:${ratingColor}">${rating}</div>
          <div class="score-box-sub">performance level</div>
        </div>
        <div class="score-box highlight">
          <div class="score-box-label">Result</div>
          <div class="score-box-value">${passed ? "PASSED" : "FAILED"}</div>
          <div class="score-box-sub">passing threshold: 70%</div>
        </div>
      </div>

      <!-- STATUS BANNER -->
      <div class="status-banner">
        <div class="status-dot"></div>
        FINAL STATUS: ${passed ? "PASSED" : "FAILED"} &mdash; ${percentage}% Score Achieved
      </div>

      <!-- DETAILED EVALUATION -->
      <div class="section-title">
        <span class="accent-bar"></span>
        Detailed Evaluation
      </div>

      ${scoreRows}

      <!-- PERFORMANCE SUMMARY -->
      <div class="section-title">
        <span class="accent-bar"></span>
        Performance Summary
      </div>

      <div class="summary-box">
        <p>${summary || "No summary available."}</p>
      </div>

    </div>

    <!-- FOOTER -->
    <div class="footer">
      <div class="footer-left">
        <span class="confidential-badge">Confidential</span>
        &nbsp; This document is auto-generated and intended for authorized personnel only.
      </div>
      <div class="footer-right">
        Interview Intelligence Platform<br/>
        Generated: ${generatedDate} at ${generatedTime}
      </div>
    </div>

  </div>
</body>
</html>`;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
};
