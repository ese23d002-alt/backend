const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    },
    debug: true,
    logger: true
  });

  const mailOptions = {
    from: `"Control Dashboard" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  try {
    await transporter.verify();
    console.log("SMTP сервертэй амжилттай холбогдлоо.");
    await transporter.sendMail(mailOptions);
    console.log("И-мэйл амжилттай илгээгдлээ.");
  } catch (error) {
    console.error("Мэйл илгээхэд гарсан алдаа:", error.message);
    throw error;
  }
};

module.exports = sendEmail;