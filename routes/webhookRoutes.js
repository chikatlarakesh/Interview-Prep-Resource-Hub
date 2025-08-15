const express = require('express');
const router = express.Router();
const { handleGitHubWebhook } = require('../controllers/webhookController');

router.post('/webhook', handleGitHubWebhook);

module.exports = router;