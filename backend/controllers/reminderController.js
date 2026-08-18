const { getUserReminders } = require('../services/reminderService');

exports.getReminders = async (req, res) => {
  try {
    const reminders = await getUserReminders(req.user.id);
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
