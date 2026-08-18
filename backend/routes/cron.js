const express = require('express');
const router = express.Router();
const cronController = require('../controllers/cronController');
const cronAuth = require('../middleware/cronAuth');

router.get('/send-reminders', cronAuth, cronController.triggerReminders);

module.exports = router;
