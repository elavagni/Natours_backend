const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Define email
  const emailOptions = {
    from: 'Eric Lavagni <helllo@elavagni.io>',
    to: options.email,
    subject: options.subject,
    text: options.message
    //html:
  };

  // Send email with nodemailer
  await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
