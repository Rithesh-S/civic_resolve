const express = require('express');
const router = express.Router();
const { verifyWebhook, handleWhatsappMessage } = require('../controllers/whatsappController');

// Route for Meta to verify your webhook
// Your Callback URL in the App Dashboard will be: https://<your-domain>/api/whatsapp
router.get('/', verifyWebhook);

// Route for Meta to send all message events
router.post('/', handleWhatsappMessage);

module.exports = router;
