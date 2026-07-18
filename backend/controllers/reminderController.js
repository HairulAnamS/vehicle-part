const { Vehicle, Sparepart, Replacement, sequelize } = require('../models');

exports.getReminders = async (req, res) => {
  try {
    // 1. Get all vehicles for this user
    const vehicles = await Vehicle.findAll({ where: { user_id: req.user.id } });
    if (!vehicles.length) {
      return res.json([]);
    }
    const vehicleIds = vehicles.map(v => v.id);

    // 2. For each vehicle, get the LATEST replacement for each sparepart
    // Note: We use a raw query or find all and group in memory to make it easier for Sequelize
    const replacements = await Replacement.findAll({
      where: { vehicle_id: vehicleIds },
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Sparepart, as: 'sparepart' }
      ],
      order: [['date_installed', 'DESC']]
    });

    const latestReplacementsMap = new Map();
    replacements.forEach(rep => {
      const key = `${rep.vehicle_id}-${rep.sparepart_id}`;
      if (!latestReplacementsMap.has(key)) {
        latestReplacementsMap.set(key, rep);
      }
    });

    const reminders = [];
    latestReplacementsMap.forEach((rep) => {
      const currentKm = rep.vehicle.current_km;
      const kmInstalled = rep.km_installed;
      const replacementInterval = rep.sparepart.replacement_km;
      
      const kmSinceReplacement = currentKm - kmInstalled;
      const kmRemaining = replacementInterval - kmSinceReplacement;

      if (kmRemaining <= 0) {
        reminders.push({
          id: rep.id,
          vehicle: rep.vehicle,
          sparepart: rep.sparepart,
          status: 'OVERDUE',
          km_exceeded: Math.abs(kmRemaining),
          message: `Waktunya mengganti ${rep.sparepart.name} pada ${rep.vehicle.nopol} (Terlewat ${Math.abs(kmRemaining)} KM)`
        });
      } else if (kmRemaining <= 500) { // e.g. Warning if < 500km left
        reminders.push({
          id: rep.id,
          vehicle: rep.vehicle,
          sparepart: rep.sparepart,
          status: 'WARNING',
          km_remaining: kmRemaining,
          message: `${rep.sparepart.name} pada ${rep.vehicle.nopol} perlu diganti dalam ${kmRemaining} KM`
        });
      }
    });

    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
