exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

// Custom error classes
exports.BadRequestError = class extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
};

exports.NotFoundError = class extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
};

exports.UnauthorizedError = class extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
};