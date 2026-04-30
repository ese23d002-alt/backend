const crypto = require("crypto");
const bcrypt = require("bcryptjs"); // эсвэл "bcrypt"
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const User = require("../models/user.model");
const sendEmail = require("../utils/sendEmail");

// --- 1. БҮРТГҮҮЛЭХ (Signup) ---
exports.signup = async (req, res) => {
    // ... таны өмнөх Signup код энд байх ёстой ...
};

// --- 2. НЭВТРЭХ (Login) ---
exports.login = async (req, res) => {
    // ... таны өмнөх Login код энд байх ёстой ...
};

// --- 3. ӨӨРИЙН МЭДЭЭЛЭЛ АВАХ (Get Me) ---
exports.getMe = async (req, res) => {
    try {
        res.json({ success: true, user: req.user });
    } catch (err) {
        res.status(500).json({ message: "Сервер дээр алдаа гарлаа" });
    }
};

// --- 4. НУУЦ ҮГ МАРТСАН (Forgot Password) ---
exports.forgotPassword = async (req, res) => {
    // ... таны саяны бичсэн forgotPassword код ...
};

// --- 5. НУУЦ ҮГ ШИНЭЧЛЭХ (Reset Password) ---
exports.resetPassword = async (req, res) => {
    // ... таны саяны бичсэн resetPassword код ...
};