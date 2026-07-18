const sequelize = require('../config/database');
const User = require('./User');
const Vehicle = require('./Vehicle');
const Sparepart = require('./Sparepart');
const Replacement = require('./Replacement');

// Associations
User.hasMany(Vehicle, { foreignKey: 'user_id', as: 'vehicles' });
Vehicle.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Vehicle.hasMany(Replacement, { foreignKey: 'vehicle_id', as: 'replacements' });
Replacement.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });

Sparepart.hasMany(Replacement, { foreignKey: 'sparepart_id', as: 'replacements' });
Replacement.belongsTo(Sparepart, { foreignKey: 'sparepart_id', as: 'sparepart' });

module.exports = {
  sequelize,
  User,
  Vehicle,
  Sparepart,
  Replacement
};
