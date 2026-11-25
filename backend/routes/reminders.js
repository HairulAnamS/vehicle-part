const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', reminderController.getReminders);
router.get('/statuses', reminderController.getVehicleStatuses);
router.get('/history', reminderController.getReminderHistory);

module.exports = router;
