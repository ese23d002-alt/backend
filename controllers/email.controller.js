const nodemailer = require('nodemailer');
const ntlm = require('nodemailer-ntlm-auth');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'mx.tavanbogd.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  customAuth: {
    NTLM: ntlm
  },
  auth: {
    type: 'NTLM',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    domain: process.env.EMAIL_DOMAIN || 'tavanbogd'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// transporter.verify(function (error, success) {
//   if (error) {
//     console.log("SMTP холболтын алдаа:", error);
//   } else {
//     console.log("");
//   }
// });

// OTP түр хадгалах (санах ойд)
const otpStore = new Map();

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
    console.error("EMAIL ERROR:", e);
    res.status(500).json({ message: 'Алдаа гарлаа', error: e.message });
  }
};