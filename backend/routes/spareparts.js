const express = require('express');
const router = express.Router();
const sparepartController = require('../controllers/sparepartController');
const auth = require('../middleware/auth');

router.use(auth); // Protect all sparepart routes

router.get('/', sparepartController.getAllSpareparts);
router.post('/', sparepartController.createSparepart);
router.put('/:id', sparepartController.updateSparepart);
router.delete('/:id', sparepartController.deleteSparepart);

module.exports = router;
