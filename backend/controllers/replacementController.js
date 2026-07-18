const { Replacement, Vehicle, Sparepart } = require('../models');

exports.getAllReplacements = async (req, res) => {
  try {
    const replacements = await Replacement.findAll({
      include: [
        { model: Vehicle, as: 'vehicle', where: { user_id: req.user.id } },
        { model: Sparepart, as: 'sparepart' }
      ],
      order: [
        ['date_installed', 'DESC'],
        [{ model: Vehicle, as: 'vehicle' }, 'nopol', 'ASC']
      ]
    });
    res.json(replacements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createReplacement = async (req, res) => {
  try {
    const { vehicle_id, sparepart_id, km_installed, date_installed } = req.body;
    
    // Verify vehicle belongs to user
    const vehicle = await Vehicle.findOne({ where: { id: vehicle_id, user_id: req.user.id } });
    if (!vehicle) {
      return res.status(403).json({ error: 'Not authorized for this vehicle' });
    }

    const replacement = await Replacement.create({
      vehicle_id,
      sparepart_id,
      km_installed,
      date_installed: date_installed || new Date()
    });
    
    // Also update vehicle's current km if the km_installed is higher
    if (km_installed > vehicle.current_km) {
      vehicle.current_km = km_installed;
      await vehicle.save();
    }

    res.status(201).json(replacement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateReplacement = async (req, res) => {
  try {
    const { id } = req.params;
    const { km_installed, date_installed } = req.body;
    
    const replacement = await Replacement.findByPk(id, {
      include: [{ model: Vehicle, as: 'vehicle', where: { user_id: req.user.id } }]
    });

    if (!replacement) {
      return res.status(404).json({ error: 'Replacement not found or not authorized' });
    }

    replacement.km_installed = km_installed;
    replacement.date_installed = date_installed;
    await replacement.save();

    res.json(replacement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteReplacement = async (req, res) => {
  try {
    const { id } = req.params;
    
    const replacement = await Replacement.findByPk(id, {
      include: [{ model: Vehicle, as: 'vehicle', where: { user_id: req.user.id } }]
    });

    if (!replacement) {
      return res.status(404).json({ error: 'Replacement not found or not authorized' });
    }

    await replacement.destroy();
    res.json({ message: 'Replacement deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
