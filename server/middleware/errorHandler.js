// Centralized error handling middleware

class ApiError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

// Common error factories
const errors = {
  badRequest: (message = 'Bad request', details = null) =>
    new ApiError(message, 400, details),
  unauthorized: (message = 'Unauthorized') =>
    new ApiError(message, 401),
  forbidden: (message = 'Forbidden') =>
    new ApiError(message, 403),
  notFound: (message = 'Not found') =>
    new ApiError(message, 404),
  conflict: (message = 'Conflict', details = null) =>
    new ApiError(message, 409, details),
  internal: (message = 'Internal server error') =>
    new ApiError(message, 500),
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log error
  console.error('Error:', {
    message: err.message,
    statusCode: err.statusCode,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  // Handle specific PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        return res.status(409).json({
          error: 'Resource already exists',
          details: err.detail,
        });
      case '23503': // foreign_key_violation
        return res.status(400).json({
          error: 'Referenced resource does not exist',
          details: err.detail,
        });
      case '22P02': // invalid_text_representation (includes invalid UUID)
        return res.status(400).json({
          error: 'Invalid identifier format',
          details: 'The provided ID is not in the correct format',
        });
      case 'P0001': // raise_exception (custom triggers)
        return res.status(400).json({
          error: err.message,
        });
    }
  }

  // Handle invalid UUID errors from string matching
  if (err.message && err.message.includes('invalid input syntax for type uuid')) {
    return res.status(400).json({
      error: 'Invalid identifier format',
      details: 'The provided ID is not in the correct format',
    });
  }

  // Handle known operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
  }

  // Handle unknown errors
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong'
    : err.message;

  res.status(statusCode).json({
    error: message,
  });
};

// Async wrapper to catch promise rejections
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  ApiError,
  errors,
  errorHandler,
  asyncHandler,
};
