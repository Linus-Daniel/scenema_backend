const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getUserRooms,
} = require('../controllers/userController');
const { protect } = require('../utils/auth');

router.get('/:userId', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/rooms/all', protect, getUserRooms);

module.exports = router;