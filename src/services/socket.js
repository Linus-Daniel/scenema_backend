const Room = require('../models/Room');
const Message = require('../models/Message');

exports.initializeSocketEvents = (socket, io) => {
  // Handle video control events
  socket.on('play-video', async (roomId) => {
    try {
      const room = await Room.findOneAndUpdate(
        { roomId },
        { isPlaying: true, lastUpdated: Date.now() },
        { new: true }
      );
      socket.to(roomId).emit('video-played');
    } catch (err) {
      console.error('Play video error:', err);
    }
  });

  socket.on('pause-video', async (roomId) => {
    try {
      const room = await Room.findOneAndUpdate(
        { roomId },
        { isPlaying: false, lastUpdated: Date.now() },
        { new: true }
      );
      socket.to(roomId).emit('video-paused');
    } catch (err) {
      console.error('Pause video error:', err);
    }
  });

  socket.on('seek-video', async (roomId, currentTime) => {
    try {
      const room = await Room.findOneAndUpdate(
        { roomId },
        { currentTime, lastUpdated: Date.now() },
        { new: true }
      );
      socket.to(roomId).emit('video-seeked', currentTime);
    } catch (err) {
      console.error('Seek video error:', err);
    }
  });

  socket.on('change-video', async (roomId, videoUrl) => {
    try {
      const room = await Room.findOneAndUpdate(
        { roomId },
        { videoUrl, currentTime: 0, isPlaying: false, lastUpdated: Date.now() },
        { new: true }
      );
      socket.to(roomId).emit('video-changed', videoUrl);
    } catch (err) {
      console.error('Change video error:', err);
    }
  });

  // Handle chat messages
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

  // Handle WebRTC signaling
  socket.on('webrtc-signal', ({ roomId, signal, targetUserId }) => {
    socket.to(roomId).emit('webrtc-signal', {
      senderId: socket.id,
      signal,
      targetUserId,
    });
  });
};