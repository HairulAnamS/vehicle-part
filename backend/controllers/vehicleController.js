const { Vehicle, Replacement, VehicleSparepart, sequelize } = require('../models');

exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({ 
      where: { user_id: req.user.id },
      include: [
        { model: VehicleSparepart, as: 'sparepart_settings' }
      ],
      order: [['nopol', 'ASC']]
    });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createVehicle = async (req, res) => {
  try {
    const { nopol, type, brand, model, current_km, km_harian, sparepart_settings } = req.body;
    
    // Gunakan transaction agar jika gagal, vehicle tidak terbuat
    const result = await sequelize.transaction(async (t) => {
      const vehicle = await Vehicle.create({
        user_id: req.user.id,
        nopol,
        type,
        brand,
        model,
        current_km: current_km || 0,
        km_harian: km_harian || 0,
        last_update_current_km: new Date()
      }, { transaction: t });

      if (sparepart_settings && Array.isArray(sparepart_settings)) {
        const settingsToInsert = [];
        const replacementsToInsert = [];

        sparepart_settings.forEach(setting => {
          settingsToInsert.push({
            vehicle_id: vehicle.id,
            sparepart_id: setting.sparepart_id,
            replacement_km: setting.replacement_km
          });
          
          if (setting.last_km_installed !== undefined && setting.last_km_installed !== '') {
            replacementsToInsert.push({
              vehicle_id: vehicle.id,
              sparepart_id: setting.sparepart_id,
              km_installed: setting.last_km_installed,
              date_installed: new Date()
            });
          }
        });

        await VehicleSparepart.bulkCreate(settingsToInsert, { transaction: t });
        
        if (replacementsToInsert.length > 0) {
          await Replacement.bulkCreate(replacementsToInsert, { transaction: t });
        }
      }

      return vehicle;
    });

    res.status(201).json(result);
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
    const { nopol, type, brand, model, current_km, km_harian, sparepart_settings } = req.body;
    
    const vehicle = await Vehicle.findOne({ where: { id, user_id: req.user.id } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    await sequelize.transaction(async (t) => {
      vehicle.nopol = nopol;
      vehicle.type = type;
      vehicle.brand = brand;
      vehicle.model = model;
      
      if (vehicle.current_km !== current_km) {
        vehicle.current_km = current_km;
        vehicle.last_update_current_km = new Date();
      }
      
      vehicle.km_harian = km_harian;
      await vehicle.save({ transaction: t });

      if (sparepart_settings && Array.isArray(sparepart_settings)) {
        // Cari history lama untuk cek mana sparepart yang baru disetting
        const existingReplacements = await Replacement.findAll({ where: { vehicle_id: id }, transaction: t });
        const existingSparepartIds = existingReplacements.map(r => r.sparepart_id);

        // Hapus setting lama
        await VehicleSparepart.destroy({ where: { vehicle_id: id }, transaction: t });
        
        // Insert setting baru
        const settingsToInsert = [];
        const replacementsToInsert = [];

        sparepart_settings.forEach(setting => {
          settingsToInsert.push({
            vehicle_id: vehicle.id,
            sparepart_id: setting.sparepart_id,
            replacement_km: setting.replacement_km
          });

          // Hanya buat history jika sparepart ini belum punya riwayat sama sekali
          if (!existingSparepartIds.includes(setting.sparepart_id)) {
            if (setting.last_km_installed !== undefined && setting.last_km_installed !== '') {
              replacementsToInsert.push({
                vehicle_id: vehicle.id,
                sparepart_id: setting.sparepart_id,
                km_installed: setting.last_km_installed,
                date_installed: new Date()
              });
            }
          }
        });

        await VehicleSparepart.bulkCreate(settingsToInsert, { transaction: t });
        
        if (replacementsToInsert.length > 0) {
          await Replacement.bulkCreate(replacementsToInsert, { transaction: t });
        }
      }
    });
    
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

    await sequelize.transaction(async (t) => {
      await VehicleSparepart.destroy({ where: { vehicle_id: id }, transaction: t });
      await vehicle.destroy({ transaction: t });
    });
    
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
