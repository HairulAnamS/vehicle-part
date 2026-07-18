const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Replacement = sequelize.define('Replacement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  vehicle_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  sparepart_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  km_installed: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date_installed: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  timestamps: true,
});

module.exports = Replacement;
