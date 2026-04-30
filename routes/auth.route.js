// routes/auth.route.js

const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authGuard = require("../middleware/auth.guard");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Хэрэглэгчийн бүртгэл болон нэвтрэх хэсэг
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Нэвтэрсэн хэрэглэгчийн мэдээллийг авах (Token шалгах)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Токен хүчинтэй, хэрэглэгчийн мэдээлэл
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Токен байхгүй эсвэл буруу
 *       403:
 *         description: Токен хүчингүй болсон
 */
router.get("/me", authGuard, authController.getMe);

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Шинэ хэрэглэгч бүртгэх
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: john_doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Амжилттай бүртгэгдлээ
 *       400:
 *         description: Талбар дутуу эсвэл и-мэйл давхардсан
 */
router.post("/signup", authController.signup);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Хэрэглэгч нэвтрэх
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: john_doe
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Нэвтрэлт амжилттай
 *       401:
 *         description: Нэр эсвэл нууц үг буруу
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Нууц үг сэргээх хүсэлт гаргах (OTP и-мэйл илгээх)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP кодыг и-мэйл рүү илгээлээ
 *       500:
 *         description: И-мэйл илгээхэд алдаа гарлаа
 */
router.post("/forgot-password", authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Нууц үг шинэчлэх (OTP кодоор)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *               - password
 *             properties:
 *               otp:
 *                 type: string
 *                 description: И-мэйлээр ирсэн 6 оронтой код
 *                 example: "123456"
 *               password:
 *                 type: string
 *                 description: Шинэ нууц үг
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Нууц үг амжилттай шинэчлэгдлээ
 *       400:
 *         description: Код буруу эсвэл хугацаа дууссан
 */
router.post("/reset-password", authController.resetPassword);

module.exports = router;