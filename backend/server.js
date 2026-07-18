require('dotenv').config();
const express = require('express');
const cors = require('cors');
let app;
try {
  const { sequelize } = require('./models');
  const authRoutes = require('./routes/auth');
  const vehicleRoutes = require('./routes/vehicles');
  const sparepartRoutes = require('./routes/spareparts');
  const replacementRoutes = require('./routes/replacements');
  const reminderRoutes = require('./routes/reminders');

  app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/vehicles', vehicleRoutes);
  app.use('/api/spareparts', sparepartRoutes);
  app.use('/api/replacements', replacementRoutes);
  app.use('/api/reminders', reminderRoutes);

  if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    sequelize.sync({ alter: true }).then(() => {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }).catch(err => console.error('Failed to sync database:', err));
  }
} catch (err) {
  // Fallback app to show the actual error instead of 500 Function Crash
  app = express();
  app.use((req, res) => {
    res.status(500).json({ error: 'Server initialization failed', message: err.message, stack: err.stack });
  });
}

module.exports = app;
