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
    const { vehicle_id, sparepart_id, km_installed, date_installed, notes, cost, workshop_name } = req.body;
    
    // Verify vehicle belongs to user
    const vehicle = await Vehicle.findOne({ where: { id: vehicle_id, user_id: req.user.id } });
    if (!vehicle) {
      return res.status(403).json({ error: 'Not authorized for this vehicle' });
    }

    const replacement = await Replacement.create({
      vehicle_id,
      sparepart_id,
      km_installed,
      date_installed: date_installed || new Date(),
      notes: notes || null,
      cost: cost !== undefined && cost !== '' ? parseInt(cost, 10) || 0 : 0,
      workshop_name: workshop_name || null
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
    const { km_installed, date_installed, notes, cost, workshop_name } = req.body;
    
    const replacement = await Replacement.findByPk(id, {
      include: [{ model: Vehicle, as: 'vehicle', where: { user_id: req.user.id } }]
    });

    if (!replacement) {
      return res.status(404).json({ error: 'Replacement not found or not authorized' });
    }

    replacement.km_installed = km_installed;
    replacement.date_installed = date_installed;
    if (notes !== undefined) {
      replacement.notes = notes || null;
    }
    if (cost !== undefined) {
      replacement.cost = cost !== '' ? parseInt(cost, 10) || 0 : 0;
    }
    if (workshop_name !== undefined) {
      replacement.workshop_name = workshop_name || null;
    }
    await replacement.save();

    res.json(replacement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getExpenseSummary = async (req, res) => {
  try {
    const replacements = await Replacement.findAll({
      include: [
        { model: Vehicle, as: 'vehicle', where: { user_id: req.user.id } }
      ],
      order: [['date_installed', 'ASC']]
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthKey = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let totalAllTime = 0;
    let totalThisMonth = 0;
    let totalThisYear = 0;

    const monthMap = new Map();
    const yearMap = new Map();
    const vehicleMap = new Map();

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    for (const rep of replacements) {
      const cost = Number(rep.cost) || 0;
      const date = new Date(rep.date_installed);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
      const monthLabel = `${monthNames[month]} ${year}`;

      totalAllTime += cost;
      if (year === currentYear) totalThisYear += cost;
      if (monthKey === currentMonthKey) totalThisMonth += cost;

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { key: monthKey, label: monthLabel, total: 0 });
      }
      monthMap.get(monthKey).total += cost;

      const yearKey = String(year);
      if (!yearMap.has(yearKey)) {
        yearMap.set(yearKey, { year: yearKey, label: yearKey, total: 0 });
      }
      yearMap.get(yearKey).total += cost;

      if (rep.vehicle) {
        const vehId = rep.vehicle.id;
        if (!vehicleMap.has(vehId)) {
          vehicleMap.set(vehId, {
            vehicle_id: vehId,
            nopol: rep.vehicle.nopol,
            label: `${rep.vehicle.nopol} (${rep.vehicle.brand} ${rep.vehicle.model})`,
            total: 0
          });
        }
        vehicleMap.get(vehId).total += cost;
      }
    }

    const byMonth = Array.from(monthMap.values()).slice(-12);
    const byYear = Array.from(yearMap.values()).sort((a, b) => a.year.localeCompare(b.year));
    const byVehicle = Array.from(vehicleMap.values()).sort((a, b) => b.total - a.total);

    res.json({
      total_all_time: totalAllTime,
      total_this_month: totalThisMonth,
      total_this_year: totalThisYear,
      by_month: byMonth,
      by_year: byYear,
      by_vehicle: byVehicle
    });
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
