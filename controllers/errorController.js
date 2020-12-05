const AppError = require('./../utils/appError');

const handleCastErrorDB = error => {
  const message = `Invalid ${error.path}; ${error.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = error => {
  const value = error.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
  const message = `Duplicate field value: ${value}.  Please use a different value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = error => {
  const errors = Object.values(error.errors).map(element => element.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    error: error,
    message: error.message,
    stack: error.stack
  });
};

const sendErrorProd = (error, res) => {
  //Operational, trusted error: send message to client
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // eslint-disable-next-line no-console
    console.error('ERROR', error);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

const handleJwtError = () =>
  new AppError('Invalid token.  Please log in again!', 401);

const handleJwtExpiredError = () =>
  new AppError('Your token has expired. Please log in again!', 401);

//By giving these four arguments to the following function, express will recognize it as error handling middleware
module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    let err = { ...error };

    if (err.name === 'CastError') {
      err = handleCastErrorDB(err);
    }

    if (err.code === 11000) {
      err = handleDuplicateFieldsDB(err);
    }

    if (err.name === 'ValidationError') {
      err = handleValidationErrorDB(err);
    }

    if (err.name === 'JsonWebTokenError') {
      err = handleJwtError(err);
    }

    if (err.name === 'TokenExpiredError') {
      err = handleJwtExpiredError(err);
    }
    sendErrorProd(err, res);
  }
};
