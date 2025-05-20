const Room = require('../models/Room');
const Message = require('../models/Message');

// Clean up expired rooms
exports.cleanupExpiredRooms = async () => {
  try {
    // MongoDB TTL index will automatically remove expired rooms
    // This is just for additional cleanup if needed
    const result = await Room.deleteMany({
      createdAt: { $lt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
    });
    console.log(`Cleaned up ${result.deletedCount} expired rooms`);
  } catch (err) {
    console.error('Error cleaning up rooms:', err.message);
  }
};

// Get room with participants
exports.getRoomWithParticipants = async (roomId) => {
  return await Room.findOne({ roomId })
    .populate('creator', 'username avatar')
    .populate('participants', 'username avatar');
};

// Add participant to room
exports.addParticipantToRoom = async (roomId, userId) => {
  return await Room.findOneAndUpdate(
    { roomId },
    { $addToSet: { participants: userId } },
    { new: true }
  );
};

// Remove participant from room
exports.removeParticipantFromRoom = async (roomId, userId) => {
  return await Room.findOneAndUpdate(
    { roomId },
    { $pull: { participants: userId } },
    { new: true }
  );
};