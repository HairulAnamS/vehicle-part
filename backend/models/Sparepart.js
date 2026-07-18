const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sparepart = sequelize.define('Sparepart', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  replacement_km: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  timestamps: true,
});

module.exports = Sparepart;
