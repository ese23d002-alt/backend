const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/violations.controller');

/**
 * @swagger
 * tags:
 *   name: Violations
 *   description: Зөрчлийн менежмент (Violation & Actions)
 */

/**
 * @swagger
 * /api/violations:
 *   post:
 *     tags: [Violations]
 *     summary: Шинэ зөрчил нэмэх
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
 *               - violations
 *             properties:
 *               group_number:
 *                 type: string
 *                 example: "V-2026-001"
 *               year:
 *                 type: integer
 *                 example: 2026
 *               quarter:
 *                 type: integer
 *                 example: 1
 *               rating:
 *                 type: string
 *                 example: "B+"
 *               violations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "Аюулгүй ажиллагааны зөрчил"
 *                     description:
 *                       type: string
 *                       example: "Тайлант хугацаанд зааварчилгаа аваагүй"
 *                     severity:
 *                       type: string
 *                       example: "High"
 *                     department:
 *                       type: string
 *                       example: "ИТ Алба"
 *                     action_plan:
 *                       type: string
 *                       example: "Дахин сургалтанд хамруулах"
 *                     due_date:
 *                       type: string
 *                       format: date
 *                       example: "2026-05-20"
 *                     assignee_name:
 *                       type: string
 *                       example: "Бат"
 *                     assignee_email:
 *                       type: string
 *                       example: "bat@tavanbogd.com"
 *                     manager_name:
 *                       type: string
 *                       example: "Болд"
 *     responses:
 *       201:
 *         description: Амжилттай бүртгэгдлээ
 */
router.post('/', auth, c.createViolation);

/**
 * @swagger
 * /api/violations:
 *   get:
 *     tags: [Violations]
 *     summary: Бүх зөрчлийн жагсаалтыг авах
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Амжилттай
 */
router.get('/', auth, c.getAllViolations);

/**
 * @swagger
 * /api/violations/{id}:
 *   get:
 *     tags: [Violations]
 *     summary: Тодорхой нэг зөрчлийн дэлгэрэнгүйг харах
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
 *         description: Амжилттай
 */
router.get('/:id', auth, c.getViolationById);

/**
 * @swagger
 * /api/violations/{id}:
 *   put:
 *     tags: [Violations]
 *     summary: Зөрчлийн хэрэгжилтийн хариу, нотлох баримт шинэчлэх
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "Дууссан"
 *               execution_response:
 *                 type: string
 *                 example: "Зааварчилгааг өгч дуусгасан."
 *     responses:
 *       200:
 *         description: Амжилттай шинэчлэгдлээ
 */
router.put('/:id', auth, c.updateViolation);

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
 *         description: Устгагдлаа
 */
router.delete('/:id', auth, c.deleteViolation);

module.exports = router;