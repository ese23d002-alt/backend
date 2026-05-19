const router = require('express').Router();
const auth   = require('../middleware/auth');
const c      = require('../controllers/violations.controller');
const upload = require("../middleware/upload");

/**
 * @swagger
 * tags:
 *   - name: Violations
 *     description: Зөрчлийн менежмент (Violation & Actions)
 */

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
 *     summary: Шинэ зөрчил баримтын зургийн хамт бүртгэх
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
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Зөрчлийн баримт зураг эсвэл PDF (Сонголттой)
 *               violations:
 *                 type: string
 *                 description: Зөрчлийн дэд жагсаалт (JSON Стринг хэлбэрээр)
 *     responses:
 *       201:
 *         description: Амжилттай бүртгэгдлээ
 */
router.get('/', auth, c.getAllViolations);
router.post('/', auth, upload.single("file"), c.createViolation);

/**
 * @swagger
 * /api/violations/{id}/upload:
 *   post:
 *     tags: [Violations]
 *     summary: Зөрчилд файл/зураг хавсаргах (Cloudinary)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Зураг эсвэл PDF файл (jpg, jpeg, png, pdf)
 *     responses:
 *       200:
 *         description: Амжилттай хуулагдлаа
 *       400:
 *         description: Файл илгээгдээгүй
 *
 * /api/violations/{id}/file:
 *   delete:
 *     tags: [Violations]
 *     summary: Зөрчлийн файл устгах (Cloudinary)
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
 *         description: Файл олдсонгүй
 */
router.post("/:id/upload", auth, upload.single("file"), c.uploadFile);
router.delete("/:id/file", auth,                        c.deleteFile);

module.exports = router;