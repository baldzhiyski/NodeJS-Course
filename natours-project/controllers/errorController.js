const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  // Extract the duplicate field value from the `keyValue` property
  const value = Object.values(err.keyValue)[0];
  console.log(value); // Log the duplicate value

  // Construct a user-friendly error message
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = (err) => {
  return new AppError('Invalid token ! Please log in again ...', 401);
};

const handleExpiredTokenError = (err) => {
  return new AppError(
    'The JWT token is expired ! Please log in again ...',
    401
  );
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = Object.assign({}, err); // Copies all properties
  error.name = err.name; // Explicitly set the name
  error.message = err.message; // Explicitly set the message

  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError')
    error = handleJsonWebTokenError(error);
  if (error.name === 'TokenExpiredError')
    error = handleExpiredTokenError(error);

  sendErrorProd(error, res);
};
