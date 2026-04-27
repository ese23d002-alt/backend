const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

exports.sendEmail = async (req, res) => {
  const { to, subject, body } = req.body;
  try {
    await transporter.sendMail({
      from: `"Систем" <${process.env.SMTP_USER}>`,
      to, subject, text: body,
    });
    res.json({ message: 'Email илгээгдлээ' });
  } catch (e) {
    res.status(500).json({ message: 'Алдаа гарлаа', error: e.message });
  }
};