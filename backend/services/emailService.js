const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "sumedhzodape8003@gmail.com",
    pass: "lftp sagn lweq ibjk",
  },
});

const sendMCQInterviewLink = async (to, interviewLink, password,start_Date,
        end_Date) => {

  console.log("------------",password)
  const mailOptions = {
    from: "sumedhzodape8003@gmail.com",
    to,
    subject: 'Interview Schedule',
    text: `Your interview is scheduled. Use the following link and password to access it:\nLink: ${interviewLink}\nPassword: ${password} and date :${start_Date} to ${end_Date}`,
  };

  await transporter.sendMail(mailOptions);
};

const sendMCQScorecard = async (to, pdfPath) => {
  const mailOptions = {
    from: "sumedhzodape8003@gmail.com",
    to,
    subject: 'Interview Scorecard',
    text: 'Please find your interview scorecard attached.',
    attachments: [{ path: pdfPath }],
  };

  await transporter.sendMail(mailOptions);
};


const sendAIInterviewLink = async (to, interviewLink, password,subjectLine,personalizedBody,scheduledEndDate,scheduledStartDate) => {

  console.log("------------",password)
  const mailOptions = {
    from: "sumedhzodape8003@gmail.com",
    to,
    subject:`${subjectLine}` ,
    text: `${personalizedBody} and
    Use the following link and password to access it:\nLink: ${interviewLink}\nPassword: ${password}
    date : ${scheduledStartDate} to ${scheduledEndDate}`,
  };

  await transporter.sendMail(mailOptions);
};
const sendAIScorecard = async (to, pdfPath) => {
  const mailOptions = {
    from: "sumedhzodape8003@gmail.com",
    to,
    subject: 'Interview Scorecard',
    text: 'Please find your interview scorecard attached.',
    attachments: [{ path: pdfPath }],
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendMCQInterviewLink, sendAIInterviewLink, sendMCQScorecard,sendAIScorecard};