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
 *     summary: Шинэ зөрчил гараар бүртгэх (Frontend-ээс Cloudinary JSON объект авна)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
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
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "Хамгаалалтын малгай өмсөөгүй"
 *                     description:
 *                       type: string
 *                       example: "Талбай дээр малгайгүй явсан зөрчил"
 *                     severity:
 *                       type: string
 *                       example: "medium"
 *                     status:
 *                       type: string
 *                       example: "new"
 *                     department:
 *                       type: string
 *                       example: "Үйлдвэр"
 *                     evidence_file:
 *                       type: object
 *                       description: Cloudinary-аас ирсэн бүтэн объект
 *                       example:
 *                         asset_id: "c9f10236fbacc8f86957169763e3a320"
 *                         public_id: "violations/nxgcfaswcriuahb4naw2"
 *                         secure_url: "https://res.cloudinary.com/dezrlor5e/image/upload/v1779172467/violations/nxgcfaswcriuahb4naw2.png"
 *                         url: "http://res.cloudinary.com/dezrlor5e/image/upload/v1779172467/violations/nxgcfaswcriuahb4naw2.png"
 *                         format: "png"
 *     responses:
 *       201:
 *         description: Амжилттай бүртгэгдлээ
 */
router.get('/', auth, c.getAllViolations);
router.post('/', auth, c.createViolation);

/**
 * @swagger
 * /api/violations/{id}/upload:
 *   post:
 *     tags: [Violations]
 *     summary: Зөрчилд файл/зураг хавсаргах (Backend-ээр дамжуулах)
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
 *     summary: Зөрчлийн файл устгах (Бааз доторх JSON-оос public_id уншиж устгана)
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
 *         description: Зөрчил эсвэл файл олдсонгүй
 */
router.post("/:id/upload", auth, upload.single("file"), c.uploadFile);
router.delete("/:id/file", auth,                        c.deleteFile);

module.exports = router;