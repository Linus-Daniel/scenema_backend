require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./utils/errorHandler');
const { initializeSocket } = require('./config/socket');

const app = express();



// Middleware
app.use(cors({
  origin: "https://scenema.vercel.app/",
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection
const connectDb = require('./config/db');

connectDb();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/webrtc', require('./routes/webrtcRoutes'));

// Error handling
app.use(errorHandler);

module.exports = app;