const router = require('express').Router();
const auth   = require('../middleware/auth');
const { sendEmail } = require('../controllers/email.controller');
router.post('/send', auth, sendEmail);
module.exports = router;