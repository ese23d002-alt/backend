const router = require('express').Router();
const auth   = require('../middleware/auth');
const { sendEmail } = require('../controllers/email.controller');

/**
 * @swagger
 * /api/email/send:
 *   post:
 *     tags: [Email]
 *     summary: Имэйл илгээх
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - subject
 *               - body
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *                 example: "example@company.mn"
 *               subject:
 *                 type: string
 *                 example: "Зөрчлийн мэдэгдэл"
 *               body:
 *                 type: string
 *                 example: "Имэйлийн агуулга..."
 *     responses:
 *       200:
 *         description: Амжилттай илгээгдлээ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email амжилттай илгээгдлээ"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/send', auth, sendEmail);

module.exports = router;