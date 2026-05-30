const express = require('express');
const router = express.Router();
const { login, logout, getMe, register, getStaff, deleteStaff } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/register', register);
router.post('/register/staff', protect, authorize('admin'), register);
router.get('/staff', protect, authorize('admin'), getStaff);
router.delete('/staff/:id', protect, authorize('admin'), deleteStaff);

module.exports = router;
