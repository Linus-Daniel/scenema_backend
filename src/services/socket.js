const mongoose = require('mongoose');
const Room = require('../models/Room');
const Message = require('../models/Message');

exports.initializeSocketEvents = (socket, io) => {
  // Join Room
  socket.on('joinRoom', async (roomId, userId) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) return;

      socket.join(roomId);
      const room = await Room.findOne({ roomId });
      if (!room) return;

      const userObjectId = new mongoose.Types.ObjectId(userId);
      if (!room.participants.some(p => p.equals(userObjectId))) {
        room.participants.push(userObjectId);
        await room.save();
      }

      io.to(roomId).emit('userJoined', userId);
      console.log("A friend joined this room");
    } catch (err) {
      console.error('Join room error:', err);
    }
  });

socket.on('join-video-room', (roomId) => {
  socket.join(roomId);
  console.log(`Socket ${socket.id} joined video room ${roomId}`);
});


  // Play
  socket.on('play-video', async (roomId) => {
    try {
      await Room.findOneAndUpdate(
        { roomId },
        { isPlaying: true, lastUpdated: Date.now() },
        { new: true }
      );
      socket.to(roomId).emit('play-video'); // Match frontend event name
      console.log(`Video played in room: ${roomId}`);
    } catch (err) {
      console.error('Play video error:', err);
    }
  });

  // Pause
  socket.on('pause-video', async (roomId) => {
    try {
      await Room.findOneAndUpdate(
        { roomId },
        { isPlaying: false, lastUpdated: Date.now() },
        { new: true }
      );
      socket.to(roomId).emit('pause-video'); // Match frontend event name
      console.log(`Video paused in room: ${roomId}`);
    } catch (err) {
      console.error('Pause video error:', err);
    }
  });

  socket.on('duration-video', async (roomId, duration) => {
  try {
    await Room.findOneAndUpdate(
      { roomId },
      { duration, lastUpdated: Date.now() },
      { new: true }
    );
  } catch (err) {
    console.error('Duration update error:', err);
  }
});
  

  socket.on('request-state', async (roomId) => {
    try {
      const room = await Room.findOne({ roomId });
      if (!room) return;

      const hostSocket = Array.from(io.sockets.adapter.rooms.get(roomId) || [])[0];
      if (hostSocket && hostSocket !== socket.id) {
        io.to(hostSocket).emit('request-state', roomId);
      } else if (hostSocket === socket.id) {
        // Current socket is the host
        socket.emit('video-state', {
          isPlaying: room.isPlaying,
          currentTime: room.currentTime,
          url: room.videoUrl
        });
      }
      console.log(`State requested for room: ${roomId}`);
    } catch (err) {
      console.error('State request error:', err);
    }
  });

  socket.on('video-state', (roomId, state) => {
    try {
      socket.to(roomId).emit('receive-state', state);
      console.log(`State shared for room: ${roomId}`);
    } catch (err) {
      console.error('State sharing error:', err);
    }
  });

  // Progress Updates
  socket.on('progress-video', (roomId, progress) => {
    try {
      socket.to(roomId).emit('progress-video', progress);
    } catch (err) {
      console.error('Progress update error:', err);
    }
  });

  //sync video 
  socket.on('sync-video', (roomId, fraction, timestamp) => {
    socket.to(roomId).emit('sync-video', fraction, timestamp);
  });

  // Seek
  socket.on('seek-video', async (roomId, fraction) => {
    try {
      const room = await Room.findOne({ roomId });
      if (!room) return;
      
      const currentTime = fraction * room.duration;
      await Room.findOneAndUpdate(
        { roomId },
        { currentTime, lastUpdated: Date.now() },
        { new: true }
      );
      socket.to(roomId).emit('seek-video', fraction);
      console.log(`Video seeked in room: ${roomId} to fraction: ${fraction}`);
    } catch (err) {
      console.error('Seek video error:', err);
    }
  });

  // Change
  socket.on('change-video', async (roomId, videoUrl) => {
    try {
      await Room.findOneAndUpdate(
        { roomId },
        { videoUrl, currentTime: 0, isPlaying: false, lastUpdated: Date.now() },
        { new: true }
      );
      socket.to(roomId).emit('video-changed', videoUrl);
    } catch (err) {
      console.error('Change video error:', err);
    }
  });

  // Messaging
  socket.on('send-message', async ({ roomId, senderId, content }) => {
    try {
      const message = new Message({
        roomId,
        sender: senderId,
        content,
      });

      await message.save();

      const populatedMessage = await Message.populate(message, {
        path: 'sender',
        select: 'username avatar',
      });

      io.to(roomId).emit('new-message', populatedMessage);
    } catch (err) {
      console.error('Send message error:', err);
    }
  });

  // WebRTC
  socket.on('webrtc-signal', ({ roomId, signal, targetUserId }) => {
    socket.to(roomId).emit('webrtc-signal', {
      senderId: socket.id,
      signal,
      targetUserId,
    });
  });
};
