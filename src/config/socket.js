require("dotenv").config()
const socketio = require('socket.io');
const { authenticateSocket } = require('../utils/auth');
const { initializeSocketEvents } = require('../services/socket');
const { handleWebRTCSignaling } = require('../services/webrtc');
const Room = require('../models/Room');
const Message = require('../models/Message');

const initializeSocket = (server) => {
  const io = socketio(server, {
    cors: {
      origin:"http://localhost:3000",
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  // Socket.IO authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`New socket connection: ${socket.id} from user ${socket.userId}`);

    // Join room
    socket.on('join-room', async (roomId) => {
      try {
        const room = await Room.findOne({ roomId });
        if (!room) {
          throw new Error('Room not found');
        }

        socket.join(roomId);
        console.log(`User ${socket.userId} joined room ${roomId}`);

        // Add user to room participants if not already there
        if (!room.participants.includes(socket.userId)) {
          room.participants.push(socket.userId);
          await room.save();
        }

        // Notify others in the room
        socket.to(roomId).emit('user-joined', socket.userId);

        // Send current video state to the new user
        socket.emit('video-state', {
          isPlaying: room.isPlaying,
          currentTime: room.currentTime,
          videoUrl: room.videoUrl,
        });

        // Send chat history
        const messages = await Message.find({ roomId })
          .sort({ timestamp: 1 })
          .populate('sender', 'username avatar');
        socket.emit('chat-history', messages);
      } catch (err) {
        console.error(err);
        socket.emit('error', err.message);
      }
    });

    // Leave room
    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', socket.userId);
    });

    // Initialize socket event handlers
    initializeSocketEvents(socket, io);
    handleWebRTCSignaling(socket, io);

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = { initializeSocket };