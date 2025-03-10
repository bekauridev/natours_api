const colors = require('colors');
const AppError = require('../utils/AppError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 404);
};
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]; // Extract the value from errmsg

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400); // Use 400 for bad request, not 404
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Jwt token related
const handleJWTError = () =>
  new AppError('Invalid token please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// const sendErrorDev = (err, req, res) => {

//   // API
//   if (req.originalUrl.startsWith('/api')) {
//     return res.status(err.statusCode).json({
//       status: err.status,
//       error: err,
//       message: err.message,
//       stack: err.stack,
//     });
//   }
//   // RENDERED WEBSITE
//   return res.status(err.statusCode).render('error', {
//     title: 'Something went wrong',
//     msg: err.message,
//   });
// };
// const sendErrorProd = (errreq, req, res) => {
//   console.log(`from send error prod handler 💥💥💥: `, err.message);
//   // API
//   if (req.originalUrl.startsWith('/api')) {
//     if (err.isOperational) {
//       return res.status(err.statusCode).json({
//         status: err.status,
//         message: err.message,
//       });
//     }

//     // 1) Log Err
//     console.error('Error 💥', err);
//     return res.status(500).json({
//       status: 'error',
//       message: 'Something went wrong :/',
//     });
//   }
//   if (err.isOperational) {
//     // RENDERED WEBSITE
//     return res.status(err.statusCode).render('error', {
//       title: 'Something went wrong',
//       msg: 'Please try again later.',
//     });
//   }
// };

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // B) RENDERED WEBSITE
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    // console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  // Ensure err.statusCode and err.status are set
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = {
      ...err,
      // name: err.name,
      // code: err.code,
      // errmsg: err.errmsg,
      message: err.message,
    };

    // Handle specific errors
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    // Handle validation errors or other errors as needed
    sendErrorProd(error, req, res);
  }
};
