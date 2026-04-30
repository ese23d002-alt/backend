const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Gmail-ийн SMTP "Transporter" үүсгэх
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. И-мэйлийн агуулга бэлдэх
  const mailOptions = {
    from: `"Таны Систем" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // Хэрэв гоё харагдуулах бол html ашиглаж болно:
    // html: `<b>${options.message}</b>`
  };

  // 3. Илгээх
  try {
    await transporter.sendMail(mailOptions);
    console.log("И-мэйл амжилттай илгээгдлээ!");
  } catch (error) {
    console.error("Nodemailer-т алдаа гарлаа:", error);
    throw new Error("И-мэйл илгээж чадсангүй.");
  }
};

module.exports = sendEmail;