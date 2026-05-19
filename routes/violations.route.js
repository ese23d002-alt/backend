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

// /**
//  * @swagger
//  * /api/violations/report:
//  *   get:
//  *     tags: [Violations]
//  *     summary: Тайлангийн өгөгдөл авах
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: year
//  *         schema:
//  *           type: integer
//  *         description: Жил
//  *       - in: query
//  *         name: quarter
//  *         schema:
//  *           type: string
//  *         description: Улирал (I улирал, II улирал ...)
//  *       - in: query
//  *         name: department
//  *         schema:
//  *           type: string
//  *         description: Хэлтэс
//  *     responses:
//  *       200:
//  *         description: Амжилттай
//  */
// router.get('/report', auth, c.getReport);

// /**
//  * @swagger
//  * /api/violations/report/export/excel:
//  *   get:
//  *     tags: [Violations]
//  *     summary: Excel экспорт
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: year
//  *         schema:
//  *           type: integer
//  *       - in: query
//  *         name: quarter
//  *         schema:
//  *           type: string
//  *       - in: query
//  *         name: department
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Excel файл буцаана
//  *         content:
//  *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
//  *             schema:
//  *               type: string
//  *               format: binary
//  */
// router.get('/report/export/excel', auth, c.exportExcel);

// /**
//  * @swagger
//  * /api/violations/report/export/pdf:
//  *   get:
//  *     tags: [Violations]
//  *     summary: PDF экспорт
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: year
//  *         schema:
//  *           type: integer
//  *       - in: query
//  *         name: quarter
//  *         schema:
//  *           type: string
//  *       - in: query
//  *         name: department
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: HTML/PDF файл буцаана
//  *         content:
//  *           text/html:
//  *             schema:
//  *               type: string
//  */
// router.get('/report/export/pdf', auth, c.exportPdf);

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
 *     summary: Шинэ зөрчил гараар бүртгэх
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *     responses:
 *       201:
 *         description: Амжилттай бүртгэгдлээ
 */
router.get('/', auth, c.getAllViolations);
router.post('/', auth, c.createViolation);

// /**
//  * @swagger
//  * /api/violations/import:
//  *   post:
//  *     tags: [Violations]
//  *     summary: Excel файлаас импортлох
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               file:
//  *                 type: string
//  *                 format: binary
//  *               group_number:
//  *                 type: string
//  *               year:
//  *                 type: integer
//  *               quarter:
//  *                 type: string
//  *               rating:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: Амжилттай импортлогдлоо
//  */
// router.post('/import', auth, c.importFromExcel);

// /**
//  * @swagger
//  * /api/violations/{id}:
//  *   get:
//  *     tags: [Violations]
//  *     summary: Нэг зөрчлийг ID-аар авах
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Амжилттай
//  *       404:
//  *         description: Олдсонгүй
//  *   put:
//  *     tags: [Violations]
//  *     summary: Зөрчил засах
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *     responses:
//  *       200:
//  *         description: Амжилттай шинэчлэгдлээ
//  *   delete:
//  *     tags: [Violations]
//  *     summary: Зөрчил устгах
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Амжилттай устгагдлаа
//  *       404:
//  *         description: Олдсонгүй
//  */
// router.get('/:id', auth, c.getViolationById);
// router.put('/:id', auth, c.updateViolation);
// router.delete('/:id', auth, c.deleteViolation);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 file_url:
 *                   type: string
 *                   example: "https://res.cloudinary.com/..."
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