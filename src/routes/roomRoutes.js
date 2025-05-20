const express = require('express');
const router = express.Router();
const {
  createRoom,
  getRoom,
  updateRoomVideo,
  getAllUserRooms,
  deleteRoom,
  joinRoom,
} = require('../controllers/roomController');
const { protect } = require('../utils/auth');

router.post('/', protect, createRoom);
router.get('/user/:userId', protect, getAllUserRooms);
router.post('/:roomId/join', protect, joinRoom);
router.get('/:roomId', protect, getRoom);
router.put('/:roomId/video', protect, updateRoomVideo);
router.delete('/:roomId', protect, deleteRoom);

module.exports = router;