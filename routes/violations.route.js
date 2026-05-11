const router = require('express').Router();
const auth   = require('../middleware/auth');
const c      = require('../controllers/violations.controller');

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
 * /api/violations/report:
 *   get:
 *     tags: [Violations]
 *     summary: Тайлангийн өгөгдөл авах
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Жил
 *       - in: query
 *         name: quarter
 *         schema:
 *           type: string
 *         description: Улирал (I улирал, II улирал ...)
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Хэлтэс
 *     responses:
 *       200:
 *         description: Амжилттай
 */
router.get('/report', auth, c.getReport);  // ← /:id -ийн өмнө байх ёстой

router.get('/', auth, c.getAllViolations);
router.post('/', auth, c.createViolation);
router.post('/import', auth, c.importFromExcel);

router.get('/:id', auth, c.getViolationById);
router.put('/:id', auth, c.updateViolation);
router.delete('/:id', auth, c.deleteViolation);

module.exports = router;