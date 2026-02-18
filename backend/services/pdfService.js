import PDFDocument from "pdfkit";
import fs from "fs";

export const generateScorecardPDF = (candidate, scores, totalScore, summary, outputPath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.fontSize(20).text('Interview Scorecard', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Candidate: ${candidate.name}`);
    doc.text(`Email: ${candidate.email}`);
    doc.moveDown();

    doc.fontSize(16).text('Scores:');
    scores.forEach((score, index) => {
      doc.text(`Question ${index + 1}: ${score.score}/10`);
      doc.text(`Feedback: ${score.feedback}`);
      doc.moveDown(0.5);
    });

    doc.moveDown();
    doc.fontSize(16).text(`Total Score: ${totalScore}/150`);
    doc.text(`Summary: ${summary}`);

    doc.end();
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', (err) => reject(err));
  });
};

