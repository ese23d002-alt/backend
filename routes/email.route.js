const router = require('express').Router();
const auth   = require('../middleware/auth');
const { sendEmail } = require('../controllers/email.controller');

/**
 * @swagger
 * /api/email/send:
 * post:
 * summary: Имэйл илгээх (Authentication шаардлагатай)
 * tags: [Email]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - to
 * - subject
 * - text
 * properties:
 * to:
 * type: string
 * example: "recipient@example.com"
 * description: Хүлээн авагчийн имэйл хаяг
 * subject:
 * type: string
 * example: "Төлбөрийн мэдэгдэл"
 * description: Имэйлийн гарчиг
 * text:
 * type: string
 * example: "Таны төлбөр амжилттай хийгдлээ."
 * description: Имэйлийн үндсэн агуулга
 * responses:
 * 200:
 * description: Имэйл амжилттай илгээгдлээ
 * 401:
 * description: Нэвтрэх эрхгүй байна (Token байхгүй эсвэл буруу)
 * 500:
 * description: Серверийн алдаа
 */
router.post('/send', auth, sendEmail);

module.exports = router;