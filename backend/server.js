require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const sparepartRoutes = require('./routes/spareparts');
const replacementRoutes = require('./routes/replacements');
const reminderRoutes = require('./routes/reminders');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/spareparts', sparepartRoutes);
app.use('/api/replacements', replacementRoutes);
app.use('/api/reminders', reminderRoutes);

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
});
