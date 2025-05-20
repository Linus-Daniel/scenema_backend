const crypto = require('crypto');

// Generate a random room ID
exports.generateRoomId = () => {
  return crypto.randomBytes(8).toString('hex');
};

// Validate video URL
exports.validateVideoUrl = (url) => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/;
  
  return youtubeRegex.test(url) || vimeoRegex.test(url);
};

// Format user data for response
exports.formatUserResponse = (user) => {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    rooms: user.rooms,
  };
};