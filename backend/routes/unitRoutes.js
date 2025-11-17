// routes/unitRoutes.js
const express = require('express');
const router = express.Router();
const { createUnit, getUnits, getUnitById, updateUnit, deleteUnit } = require('../controllers/unitController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.post('/', requireRole('admin','secretary'), createUnit);
router.get('/', getUnits);
router.get('/:id', getUnitById);
router.put('/:id', requireRole('admin','secretary'), updateUnit);
router.delete('/:id', requireRole('admin'), deleteUnit);

module.exports = router;
