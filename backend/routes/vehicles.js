const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const auth = require('../middleware/auth');

router.use(auth); // Protect all vehicle routes

router.get('/', vehicleController.getAllVehicles);
router.post('/', vehicleController.createVehicle);
router.put('/:id/km', vehicleController.updateVehicleKm);
router.put('/:id', vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);

module.exports = router;
