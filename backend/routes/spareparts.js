const express = require('express');
const router = express.Router();
const sparepartController = require('../controllers/sparepartController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.use(auth); // Protect all sparepart routes

router.get('/', sparepartController.getAllSpareparts);
router.post('/', adminAuth, sparepartController.createSparepart);
router.put('/:id', adminAuth, sparepartController.updateSparepart);
router.delete('/:id', adminAuth, sparepartController.deleteSparepart);

module.exports = router;
