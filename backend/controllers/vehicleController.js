const { Vehicle, Replacement } = require('../models');

exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({ 
      where: { user_id: req.user.id },
      order: [['nopol', 'ASC']]
    });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createVehicle = async (req, res) => {
  try {
    const { nopol, type, brand, model, current_km, km_harian } = req.body;
    const vehicle = await Vehicle.create({
      user_id: req.user.id,
      nopol,
      type,
      brand,
      model,
      current_km: current_km || 0,
      km_harian: km_harian || 0,
      last_update_current_km: new Date()
    });
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateVehicleKm = async (req, res) => {
  try {
    const { id } = req.params;
    const { current_km } = req.body;
    
    const vehicle = await Vehicle.findOne({ where: { id, user_id: req.user.id } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    vehicle.current_km = current_km;
    vehicle.last_update_current_km = new Date();
    await vehicle.save();
    
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { nopol, type, brand, model, current_km, km_harian } = req.body;
    
    const vehicle = await Vehicle.findOne({ where: { id, user_id: req.user.id } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    vehicle.nopol = nopol;
    vehicle.type = type;
    vehicle.brand = brand;
    vehicle.model = model;
    
    if (vehicle.current_km !== current_km) {
      vehicle.current_km = current_km;
      vehicle.last_update_current_km = new Date();
    }
    
    vehicle.km_harian = km_harian;
    await vehicle.save();
    
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vehicle = await Vehicle.findOne({ where: { id, user_id: req.user.id } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const replacementCount = await Replacement.count({ where: { vehicle_id: id } });
    if (replacementCount > 0) {
      return res.status(400).json({ error: 'Tidak dapat menghapus kendaraan karena terdapat riwayat pergantian sparepart.' });
    }

    await vehicle.destroy();
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
