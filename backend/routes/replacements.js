const express = require('express');
const router = express.Router();
const replacementController = require('../controllers/replacementController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', replacementController.getAllReplacements);
router.get('/summary', replacementController.getExpenseSummary);
router.post('/', replacementController.createReplacement);
router.put('/:id', replacementController.updateReplacement);
router.delete('/:id', replacementController.deleteReplacement);

module.exports = router;
