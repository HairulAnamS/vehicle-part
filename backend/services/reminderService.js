const { User, Vehicle, Sparepart, Replacement, VehicleSparepart } = require('../models');

const computeEstimatedDate = (kmRemaining, kmHarian) => {
  if (!kmHarian || kmHarian <= 0 || kmRemaining <= 0) return null;
  const daysRemaining = Math.ceil(kmRemaining / kmHarian);
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysRemaining);
  return targetDate.toISOString();
};

exports.getUserReminders = async (userId) => {
  const user = await User.findByPk(userId, { attributes: ['warning_km_threshold'] });
  const warningThreshold = user?.warning_km_threshold ?? 500;

  // 1. Get all vehicles for this user
  const vehicles = await Vehicle.findAll({ where: { user_id: userId } });
  if (!vehicles.length) {
    return [];
  }
  const vehicleIds = vehicles.map(v => v.id);

  // 2. Fetch all VehicleSparepart settings for these vehicles
  const settings = await VehicleSparepart.findAll({ where: { vehicle_id: vehicleIds } });
  const settingsMap = new Map();
  settings.forEach(s => {
    settingsMap.set(`${s.vehicle_id}-${s.sparepart_id}`, s.replacement_km);
  });

  // 3. For each vehicle, get the LATEST replacement for each sparepart
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
    const key = `${rep.vehicle_id}-${rep.sparepart_id}`;
    const replacementInterval = settingsMap.get(key);
    
    // Jika tidak ada setting interval untuk kendaraan dan sparepart ini, lewati (tidak ada reminder)
    if (!replacementInterval) return;

    const currentKm = rep.vehicle.current_km;
    const kmInstalled = rep.km_installed;
    
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
    } else if (kmRemaining <= warningThreshold) {
      const estimatedReplacementDate = computeEstimatedDate(kmRemaining, rep.vehicle.km_harian);

      reminders.push({
        id: rep.id,
        vehicle: rep.vehicle,
        sparepart: rep.sparepart,
        status: 'WARNING',
        km_remaining: kmRemaining,
        estimated_replacement_date: estimatedReplacementDate,
        message: `${rep.sparepart.name} pada ${rep.vehicle.nopol} perlu diganti dalam ${kmRemaining} KM`
      });
    }
  });

  return reminders;
};

exports.getVehiclePartStatuses = async (userId) => {
  const user = await User.findByPk(userId, { attributes: ['warning_km_threshold'] });
  const warningThreshold = user?.warning_km_threshold ?? 500;

  const vehicles = await Vehicle.findAll({
    where: { user_id: userId },
    order: [['nopol', 'ASC']]
  });
  if (!vehicles.length) {
    return [];
  }
  const vehicleIds = vehicles.map(v => v.id);

  const settings = await VehicleSparepart.findAll({
    where: { vehicle_id: vehicleIds },
    include: [{ model: Sparepart, as: 'sparepart' }]
  });

  const replacements = await Replacement.findAll({
    where: { vehicle_id: vehicleIds },
    order: [['date_installed', 'DESC']]
  });

  const latestReplacementsMap = new Map();
  replacements.forEach(rep => {
    const key = `${rep.vehicle_id}-${rep.sparepart_id}`;
    if (!latestReplacementsMap.has(key)) {
      latestReplacementsMap.set(key, rep);
    }
  });

  return vehicles.map(vehicle => {
    const vehicleSettings = settings.filter(s => s.vehicle_id === vehicle.id);
    const parts = vehicleSettings
      .filter(s => s.replacement_km && s.replacement_km > 0 && s.sparepart)
      .map(s => {
        const key = `${vehicle.id}-${s.sparepart_id}`;
        const latestRep = latestReplacementsMap.get(key);

        if (!latestRep) {
          return {
            sparepart_id: s.sparepart_id,
            sparepart_name: s.sparepart.name,
            replacement_km: s.replacement_km,
            km_installed: null,
            km_used: null,
            km_remaining: null,
            progress_percent: 0,
            status: 'NO_HISTORY',
            estimated_replacement_date: null
          };
        }

        const kmUsed = Math.max(0, vehicle.current_km - latestRep.km_installed);
        const kmRemaining = s.replacement_km - kmUsed;
        const progressPercent = Math.min(100, Math.max(0, Math.round((kmUsed / s.replacement_km) * 100)));

        let status = 'SAFE';
        if (kmRemaining <= 0) {
          status = 'OVERDUE';
        } else if (kmRemaining <= warningThreshold) {
          status = 'WARNING';
        }

        return {
          sparepart_id: s.sparepart_id,
          sparepart_name: s.sparepart.name,
          replacement_km: s.replacement_km,
          km_installed: latestRep.km_installed,
          date_installed: latestRep.date_installed,
          km_used: kmUsed,
          km_remaining: kmRemaining,
          progress_percent: progressPercent,
          status,
          estimated_replacement_date: computeEstimatedDate(kmRemaining, vehicle.km_harian)
        };
      });

    // Urutkan: OVERDUE dulu, lalu WARNING, SAFE, NO_HISTORY
    const statusOrder = { OVERDUE: 0, WARNING: 1, SAFE: 2, NO_HISTORY: 3 };
    parts.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    return {
      vehicle: {
        id: vehicle.id,
        nopol: vehicle.nopol,
        type: vehicle.type,
        brand: vehicle.brand,
        model: vehicle.model,
        current_km: vehicle.current_km,
        km_harian: vehicle.km_harian
      },
      parts
    };
  });
};
