const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const sendEmail = require("../utils/sendEmail");
const { User } = require("../models/user.model");

// --- 1. БҮРТГҮҮЛЭХ ---
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
        const newUser = await User.create({ username, email, password: hashedPassword });

        res.status(201).json({ message: "Хэрэглэгч амжилттай бүртгэгдлээ", userId: newUser.id });
    } catch (error) {
        console.error("Signup Error:", error);
        if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ message: "Өгөгдөл буруу байна", errors: error.message });
        }
        res.status(500).json({ message: "Бүртгэх явцад алдаа гарлаа" });
    }
};

// --- 2. НЭВТРЭХ ---
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Нэр, нууц үгээ оруулна уу." });
        }

        const user = await User.findOne({ where: { username } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Хэрэглэгчийн нэр эсвэл нууц үг буруу" });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: "user" },
            process.env.JWT_SECRET || "your_super_secret_key",
            { expiresIn: "8h" }
        );

        return res.status(200).json({ 
            message: "Амжилттай нэвтэрлээ", 
            token, 
            user: { id: user.id, username: user.username } 
        });
    } catch (error) {
        console.error("Login Error Stack:", error.stack);
        return res.status(500).json({ message: "Серверийн алдаа", error: error.message });
    }
};

// --- 3. ӨӨРИЙН МЭДЭЭЛЭЛ АВАХ ---
exports.getMe = async (req, res) => {
    try {
        res.json({ success: true, user: req.user });
    } catch (err) {
        res.status(500).json({ message: "Сервер дээр алдаа гарлаа" });
    }
};

// --- 4. НУУЦ ҮГ МАРТСАН ---
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(404).json({ message: "Энэ и-мэйлтэй хэрэглэгч олдсонгүй." });

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.reset_password_token = otpCode;
        user.reset_password_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 минут
        
        await user.save();

        await sendEmail({
            email: user.email,
            subject: "Нууц үг сэргээх OTP код",
            message: `Таны код: ${otpCode}`,
        });

        res.status(200).json({ message: "OTP кодыг и-мэйл рүү илгээлээ." });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "И-мэйл илгээхэд алдаа гарлаа." });
    }
};

// --- 5. OTP ШАЛГАХ ---
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Имэйл болон код шаардлагатай." });
        }

        const user = await User.findOne({
            where: {
                email,
                reset_password_token: String(otp),
                reset_password_expires: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: "Код буруу эсвэл хугацаа дууссан." });
        }

        res.status(200).json({ message: "Код зөв байна." });
    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ message: "Сервер дээр алдаа гарлаа." });
    }
};

// --- 6. НУУЦ ҮГ ШИНЭЧЛЭХ ---
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword, token, password } = req.body;
        const inputCode = otp || token;
        const newPass = newPassword || password;

        // ── Шинэ нэмэлт: нууц үг давтах шалгалт ──
        if (newPassword && confirmPassword && newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Нууц үг таарахгүй байна." });
        }

        if (!inputCode) return res.status(400).json({ message: "Баталгаажуулах код ирсэнгүй." });
        if (!newPass) return res.status(400).json({ message: "Шинэ нууц үг оруулна уу." });

        const user = await User.findOne({
            where: {
                reset_password_token: inputCode,
                reset_password_expires: { [Op.gt]: new Date() }
            }
        });

        if (!user) return res.status(400).json({ message: "Код буруу эсвэл хугацаа нь дууссан." });

        user.password = await bcrypt.hash(newPass, 10);
        user.reset_password_token = null;
        user.reset_password_expires = null;
        await user.save();

        res.status(200).json({ message: "Нууц үг амжилттай шинэчлэгдлээ." });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Нууц үг шинэчлэхэд алдаа гарлаа.", error: error.message });
    }
};