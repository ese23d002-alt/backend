const router = require('express').Router();
const auth   = require('../middleware/auth');
const c      = require('../controllers/violations.controller');

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Violation'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
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
 *             $ref: '#/components/schemas/ViolationInput'
 *     responses:
 *       201:
 *         description: Амжилттай нэмэгдлээ
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ViolationInput'
 *     responses:
 *       200:
 *         description: Амжилттай засагдлаа
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
 *     responses:
 *       200:
 *         description: Амжилттай устгагдлаа
 */
router.delete('/:id', auth, c.remove);

module.exports = router;