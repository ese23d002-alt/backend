const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Хэрэглэгчийн бүртгэл болон нэвтрэх хэсэг
 */

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
 *       500:
 *         description: Серверийн алдаа
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
 *       500:
 *         description: Серверийн алдаа
 */
router.post("/login", authController.login);

module.exports = router;