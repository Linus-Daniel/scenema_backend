const winston = require('winston');
const { combine, timestamp, printf, colorize, align } = winston.format;

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [new winston.transports.Console()]
});

// Morgan stream for HTTP request logging
const morganStream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Middleware to log request details
const requestLogger = (req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
};

// Export the logger, morganStream, and requestLogger
module.exports = { logger, morganStream, requestLogger };
