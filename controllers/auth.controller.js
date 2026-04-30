const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const User = require("../models/user.model");
const sendEmail = require("../utils/sendEmail");

// --- 1. БҮРТГҮҮЛЭХ (Signup) ---
exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Бүх талбарыг бөглөнө үү." });
        }
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Энэ и-мэйл аль хэдийн бүртгэгдсэн байна." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });
        res.status(201).json({ message: "Хэрэглэгч амжилттай бүртгэгдлээ", userId: newUser.id });
    } catch (error) {
        if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ message: "Өгөгдөл буруу байна", errors: error.message });
        }
        res.status(500).json({ message: "Бүртгэх явцад алдаа гарлаа" });
    }
};

// --- 2. НЭВТРЭХ (Login) ---
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Нэр, нууц үгээ оруулна уу." });
        }
        const user = await User.findOne({ where: { username } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Хэрэглэгчийн нэр эсвэл нууц үг буруу' });
        }
        const token = jwt.sign(
            { id: user.id, username: user.username, role: 'user' },
            process.env.JWT_SECRET || 'your_super_secret_key',
            { expiresIn: '8h' }
        );
        return res.status(200).json({ message: "Амжилттай нэвтэрлээ", token, user: { id: user.id, username: user.username } });
    } catch (error) {
        return res.status(500).json({ message: "Серверийн алдаа" });
    }
};

// --- 3. ӨӨРИЙН МЭДЭЭЛЭЛ АВАХ (Get Me) ---
exports.getMe = async (req, res) => {
    try {
        res.json({ success: true, user: req.user });
    } catch (err) {
        res.status(500).json({ message: "Сервер дээр алдаа гарлаа" });
    }
};

// --- 4. НУУЦ ҮГ МАРТСАН (Forgot Password - OTP илгээх) ---
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "Энэ и-мэйлтэй хэрэглэгч олдсонгүй." });
        }

        // 6 оронтой OTP код үүсгэх
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Баазад хадгалах (10 минутын хугацаатай)
        user.reset_password_token = otpCode;
        user.reset_password_expires = new Date(Date.now() + 10 * 60 * 1000); 
        await user.save();

        const message = `Сайн байна уу,\n\nТаны нууц үг сэргээх код: ${otpCode}\n\nЭнэ код 10 минутын дараа хүчингүй болно.`;

        await sendEmail({
            email: user.email,
            subject: "Нууц үг сэргээх OTP код",
            message,
        });

        res.status(200).json({ message: "OTP кодыг и-мэйл рүү илгээлээ." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "И-мэйл илгээхэд алдаа гарлаа." });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        // req.body-оос ирж буй өгөгдлийг шалгах
        const { otp, password, token } = req.body; 
        
        // Аль нэгээр нь утга ирсэн эсэхийг баталгаажуулах
        const inputCode = otp || token;

        // Хэрэв код байхгүй бол Sequelize-рүү хүсэлт явуулахаас өмнө зогсоох
        if (!inputCode) {
            return res.status(400).json({ message: "Баталгаажуулах код (OTP) ирсэнгүй. Swagger дээрх 'otp' талбарыг шалгана уу." });
        }

        const user = await User.findOne({
            where: {
                reset_password_token: inputCode, 
                reset_password_expires: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: "Код буруу эсвэл хугацаа нь дууссан байна." });
        }

        user.password = await bcrypt.hash(password, 10);
        user.reset_password_token = null;
        user.reset_password_expires = null;
        await user.save();

        res.status(200).json({ message: "Нууц үг амжилттай шинэчлэгдлээ." });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ 
            message: "Сервер дээр алдаа гарлаа", 
            error: error.message 
        });
    }
};