const { ReminderHistory } = require('../models');
const { getUserReminders, getVehiclePartStatuses } = require('../services/reminderService');

exports.getReminders = async (req, res) => {
  try {
    const reminders = await getUserReminders(req.user.id);
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVehicleStatuses = async (req, res) => {
  try {
    const statuses = await getVehiclePartStatuses(req.user.id);
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReminderHistory = async (req, res) => {
  try {
    const history = await ReminderHistory.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
