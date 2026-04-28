const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const User   = require('../models/user.model');

// --- БҮРТГҮҮЛЭХ ХЭСЭГ ---
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Талбарууд бүрэн эсэхийг шалгах
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Бүх талбарыг бөглөнө үү." });
    }

    // 2. Ийм и-мэйлтэй хэрэглэгч байгаа эсэхийг шалгах
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Энэ и-мэйл аль хэдийн бүртгэгдсэн байна." });
    }

    // 3. Нууц үг кодлох
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Өгөгдлийн санд шинэ хэрэглэгч үүсгэх
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({ 
      message: "Хэрэглэгч амжилттай бүртгэгдлээ", 
      userId: newUser.id 
    });

  } catch (error) {
    console.error("Signup алдаа:", error);

    // ✅ Sequelize Validation алдаа (isEmail, allowNull гэх мэт)
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Оруулсан мэдээлэл буруу байна",
        errors: error.errors.map(e => e.message)
      });
    }

    // ✅ Давхардсан утга (unique constraint)
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Имэйл эсвэл username аль хэдийн бүртгэлтэй байна"
      });
    }

    res.status(500).json({ message: "Бүртгэх явцад алдаа гарлаа", error: error.message });
  }
};

// --- НЭВТРЭХ ХЭСЭГ ---
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Талбарууд бүрэн эсэхийг шалгах
    if (!username || !password) {
      return res.status(400).json({ message: "Хэрэглэгчийн нэр болон нууц үгийг оруулна уу." });
    }

    // 2. Хэрэглэгчийг нэрээр нь баазаас хайх
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Хэрэглэгчийн нэр эсвэл нууц үг буруу' });
    }

    // 3. Нууц үг таарч байгаа эсэхийг шалгах
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Хэрэглэгчийн нэр эсвэл нууц үг буруу' });
    }

    // 4. JWT Token үүсгэх
    const token = jwt.sign(
      { id: user.id, username: user.username, role: 'user' },
      process.env.JWT_SECRET || 'your_super_secret_key',
      { expiresIn: '8h' }
    );

    // 5. Хариу илгээх
    res.status(200).json({ 
      message: "Амжилттай нэвтэрлээ",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login алдаа:", error);
    res.status(500).json({ message: "Серверийн алдаа", error: error.message });
  }
};