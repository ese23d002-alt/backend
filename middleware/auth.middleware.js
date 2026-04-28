const router = require('express').Router();
const auth   = require('../middleware/auth.middleware'); // ✅ Зөв зам
const c      = require('../controllers/violations.controller');

/**
 * @swagger
 * tags:
 *   name: Violations
 *   description: Зөрчлийн менежмент
 */

/**
 * @swagger
 * /api/violations:
 *   get:
 *     tags: [Violations]
 *     summary: Зөрчлүүдийг жагсаах
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, mid, high, critical]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, progress, done]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Амжилттай
 *       401:
 *         description: Нэвтрээгүй байна
 */
router.get('/', auth, c.getAll);

/**
 * @swagger
 * /api/violations:
 *   post:
 *     tags: [Violations]
 *     summary: Зөрчил нэмэх
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Гүйдлийн хэтрэлт"
 *               description:
 *                 type: string
 *                 example: "Хурдны хязгаар зөрчсөн"
 *               severity:
 *                 type: string
 *                 enum: [low, mid, high, critical]
 *                 example: "high"
 *               status:
 *                 type: string
 *                 enum: [new, progress, done]
 *                 example: "new"
 *     responses:
 *       201:
 *         description: Амжилттай нэмэгдлээ
 *       401:
 *         description: Нэвтрээгүй байна
 */
router.post('/', auth, c.create);

/**
 * @swagger
 * /api/violations/{id}:
 *   put:
 *     tags: [Violations]
 *     summary: Зөрчил засах
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Засварласан зөрчил"
 *               status:
 *                 type: string
 *                 enum: [new, progress, done]
 *                 example: "done"
 *     responses:
 *       200:
 *         description: Амжилттай засагдлаа
 *       401:
 *         description: Нэвтрээгүй байна
 *       404:
 *         description: Олдсонгүй
 */
router.put('/:id', auth, c.update);

/**
 * @swagger
 * /api/violations/{id}:
 *   delete:
 *     tags: [Violations]
 *     summary: Зөрчил устгах
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Амжилттай устгагдлаа
 *       401:
 *         description: Нэвтрээгүй байна
 *       404:
 *         description: Олдсонгүй
 */
router.delete('/:id', auth, c.remove);

// Нэвтрэх шаардлагагүй зам
router.get('/all', (req, res) => {
    res.json({ message: "Энэ мэдээллийг хэн ч үзэж болно." });
});

// Зөвхөн нэвтэрсэн хэрэглэгчид
router.post('/create', auth, (req, res) => {
    res.json({ 
        message: "Амжилттай! Та нэвтэрсэн учраас энэ үйлдлийг хийж чадлаа.",
        user: req.user
    });
});

module.exports = router; // 
``