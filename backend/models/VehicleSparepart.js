const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VehicleSparepart = sequelize.define('VehicleSparepart', {
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
  replacement_km: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  timestamps: true,
});

module.exports = VehicleSparepart;
