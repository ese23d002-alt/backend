const router = require('express').Router();
const auth   = require('../middleware/auth');
const { sendEmail } = require('../controllers/email.controller');

/**
 * @swagger
 * /api/email/send:
 * post:
 * summary: Имэйл илгээх
 * tags: [Email]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * to:
 * type: string
 * subject:
 * type: string
 * text:
 * type: string
 * responses:
 * 200:
 * description: Амжилттай
 */
router.post('/send', auth, sendEmail);

module.exports = router;