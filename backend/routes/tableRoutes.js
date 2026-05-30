const express = require('express');
const router = express.Router();
const { getTables, createTable, updateTable, deleteTable, generateQR } = require('../controllers/tableController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getTables);
router.post('/', protect, authorize('admin'), createTable);
router.put('/:id', protect, updateTable);
router.delete('/:id', protect, authorize('admin'), deleteTable);
router.get('/:id/qr', protect, authorize('admin'), generateQR);

module.exports = router;
