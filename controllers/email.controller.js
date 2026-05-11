const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,       // ← SMTP_HOST → EMAIL_HOST
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,     // ← SMTP_USER → EMAIL_USER
    pass: process.env.EMAIL_PASS,     // ← SMTP_PASS → EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false         // ← корпорат сервер бол заавал нэм
  }
});

exports.sendEmail = async (req, res) => {
  const { to, subject, body } = req.body;
  try {
    await transporter.sendMail({
      from: `"Систем" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: body,
    });
    res.json({ message: 'Email амжилттай илгээгдлээ' });
  } catch (e) {
    res.status(500).json({ message: 'Алдаа гарлаа', error: e.message });
  }
};