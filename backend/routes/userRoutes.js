// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  assignToUnit,
  getSummary,
  backfillUnits
} = require('../controllers/userController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/summary', getSummary);
router.get('/', requireRole('admin','secretary','accountant'), getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', requireRole('admin'), deleteUser);
router.post('/:userId/assign-unit', requireRole('admin','secretary'), assignToUnit);
router.post('/backfill-units', requireRole('admin','secretary'), backfillUnits);

module.exports = router;
