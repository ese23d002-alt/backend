const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const c = require('../controllers/violations.controller');
const upload = require("../middleware/upload");

/**
 * @swagger
 * tags:
 *   - name: Violations
 *     description: Зөрчлийн менежмент (Violation & Actions)
 */

/**
 * @swagger
 * /api/violations/check-duplicates:
 *   get:
 *     tags: [Violations]
 *     summary: Ижил төстэй давтагдсан зөрчил байгаа эсэхийг шалгах
 *     parameters:
 *       - in: query
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: Зөрчлийн гарчиг/нэр
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Хариуцах хэлтэс
 *     responses:
 *       200:
 *         description: Амжилттай
 */
router.get('/check-duplicates', c.checkDuplicates);

/**
 * @swagger
 * /api/violations/stats:
 *   get:
 *     tags: [Violations]
 *     summary: Ерөнхий тойм статистик авах
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Амжилттай
 */
router.get('/stats', auth, c.getGeneralStats);

/**
 * @swagger
 * /api/violations:
 *   get:
 *     tags: [Violations]
 *     summary: Бүх зөрчлийн жагсаалт
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Амжилттай
 *   post:
 *     tags: [Violations]
 *     summary: Шинэ зөрчил бүртгэх — зурагтай хамт (multipart/form-data)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - group_number
 *               - year
 *               - quarter
 *               - rating
 *             properties:
 *               group_number:
 *                 type: string
 *                 example: "ЗД-2026-001"
 *               year:
 *                 type: integer
 *                 example: 2026
 *               quarter:
 *                 type: string
 *                 example: "I улирал"
 *               rating:
 *                 type: string
 *                 example: "Бага"
 *               violations:
 *                 type: string
 *                 description: JSON string болгосон violations массив
 *                 example: '[{"title":"Малгай өмсөөгүй","severity":"medium","department":"Үйлдвэр"}]'
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Файлууд (зураг, PDF, видео) — заавал биш, max 10
 *     responses:
 *       201:
 *         description: Амжилттай бүртгэгдлээ
 */
router.get('/', auth, c.getAllViolations);
router.post('/', auth, upload.any(), c.createViolation);

/**
 * @swagger
 * /api/violations/{id}:
 *   delete:
 *     tags: [Violations]
 *     summary: Зөрчлийг бүрэн устгах (Cloudinary зураг хамт устгана)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Амжилттай устгагдлаа
 *       404:
 *         description: Зөрчил олдсонгүй
 */
router.delete("/:id", auth, c.deleteViolation);

module.exports = router;