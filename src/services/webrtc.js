// This service handles WebRTC signaling between peers
// In a production environment, you might want to use a service like Daily.co or PeerJS

const handleWebRTCSignaling = (socket, io) => {
    socket.on('webrtc-offer', ({ roomId, offer, targetUserId }) => {
      socket.to(roomId).emit('webrtc-offer', {
        senderId: socket.id,
        offer,
        targetUserId,
      });
    });
  
    socket.on('webrtc-answer', ({ roomId, answer, targetUserId }) => {
      socket.to(roomId).emit('webrtc-answer', {
        senderId: socket.id,
        answer,
        targetUserId,
      });
    });
  
    socket.on('webrtc-ice-candidate', ({ roomId, candidate, targetUserId }) => {
      socket.to(roomId).emit('webrtc-ice-candidate', {
        senderId: socket.id,
        candidate,
        targetUserId,
      });
    });
  };
  
  module.exports = { handleWebRTCSignaling };