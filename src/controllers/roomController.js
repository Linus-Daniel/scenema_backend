const Room = require("../models/Room");
const User = require("../models/User");
const { generateRoomId } = require("../utils/helpers");

// Create a new room
exports.createRoom = async (req, res) => {
  try {
    const { userId, roomName,videoUrl } = req.body;
    const roomId = generateRoomId();

    const room = new Room({
      roomId,
      roomName,
      videoUrl,
      creator: userId,
      participants: [userId],
    });

    await room.save();

    // Add room to user's rooms
    await User.findByIdAndUpdate(userId, {
      $push: { rooms: room._id },
    });

    res.status(201).json({
      success: true,
      room,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get room details
exports.getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    console.log(roomId);
    const room = await Room.findOne({ roomId })
      .populate("creator", "username avatar")
      .populate("participants", "username avatar");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      room,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update room video
exports.updateRoomVideo = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { videoUrl } = req.body;

    const room = await Room.findOneAndUpdate(
      { roomId },
      { videoUrl, currentTime: 0, isPlaying: false },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      room,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete room
exports.deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOneAndDelete({ roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Remove room from users' rooms
    await User.updateMany(
      { _id: { $in: room.participants } },
      { $pull: { rooms: room._id } }
    );

    // Delete all messages in the room
    await Message.deleteMany({ roomId });

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



// Get all rooms for the current user
exports.getAllUserRooms = async (req, res) => {
    try {
      const user = await User.findById(req.params.userId)
        .select('-password')
        .populate('rooms'); // Assuming you have a 'rooms' reference in your User model
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
  
      res.status(200).json({
        success: true,
        rooms: user.rooms || [], // Return empty array if no rooms exist
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };

  exports.joinRoom = async (req, res) => {
    try {
      const userId = req.user.id;
      const { roomId } = req.params;
  
      // Find the room by your custom roomId field
      const room = await Room.findOne({ roomId });
      if (!room) {
        return res.status(404).json({ success: false, message: "Room not found" });
      }
  
      // Add user to participants if not already there
      if (!room.participants.includes(userId)) {
        room.participants.push(userId);
        await room.save();
      }
  
      // Find user by default _id (assuming you use Mongo default _id)
      const user = await User.findById(userId);
      if (!user.rooms.includes(room._id)) {
        user.rooms.push(room._id); // add the Mongo ObjectId of the room, not roomId string
        await user.save();
      }
  
      res.status(200).json({ success: true, message: 'Joined room successfully', room });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  };
  