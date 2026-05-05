const router = require('express').Router();
const auth   = require('../middleware/auth.middleware');
const c      = require('../controllers/violations.controller');

/**
 * @swagger
 * tags:
 *   - name: Violations
 *     description: Зөрчлийн менежмент
 */

/**
 * @swagger
 * /api/violations/stats:
 *   get:
 *     tags: [Violations]
 *     summary: Ерөнхий тойм статистик авах (хугацаагаар шүүх боломжтой)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date
 *         description: Эхлэх огноо (YYYY-MM-DD)
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date
 *         description: Дуусах огноо (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Амжилттай
 *       401:
 *         description: Нэвтрээгүй байна
 */
router.get('/stats', auth, c.getGeneralStats);

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
 *         description: Хуудасны дугаар
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Нэг хуудсанд авах тоо
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
 *         description: Зөрчлийн төлөв
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Амжилттай
 *       401:
 *         description: Нэвтрээгүй байна
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
 *               description:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [low, mid, high, critical]
 *               status:
 *                 type: string
 *                 enum: [new, progress, done]
 *     responses:
 *       201:
 *         description: Амжилттай нэмэгдлээ
 */
router.get('/', auth, c.getAll);
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
 *               status:
 *                 type: string
 *                 enum: [new, progress, done]
 *     responses:
 *       200:
 *         description: Амжилттай засагдлаа
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
 *     responses:
 *       200:
 *         description: Амжилттай устгагдлаа
 */
router.put('/:id', auth, c.update);
router.delete('/:id', auth, c.remove);

module.exports = router;