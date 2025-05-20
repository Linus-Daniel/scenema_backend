const express = require('express');
const router = express.Router();
const { protect } = require('../utils/auth');

// These endpoints are optional since most signaling happens via WebSockets
// They're included here for RESTful alternatives if needed

router.post('/offer', protect, (req, res) => {
  // Handle offer via REST
});

router.post('/answer', protect, (req, res) => {
  // Handle answer via REST
});

router.post('/ice-candidate', protect, (req, res) => {
  // Handle ICE candidate via REST
});

module.exports = router;