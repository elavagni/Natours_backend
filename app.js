const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, './views'));

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

//1) GLOBAL MIDDLEWARES

// Set Security HTTP headers
app.use(helmet());

// Development logging
// app.use indicates the usage of middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit the amount of request from same IP
const limiter = rateLimit({
  //100 requests from same IP
  max: 100,
  // per 1 hour
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter);

// Body parser, reading data from the body into req.body
app.use(
  express.json({
    limit: '10kb'
  })
);

// Data sanitization against NoSql query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

//The order of the middleware is really important, if the middleware if defined after the routes,
//it will not be executed, as the route handler will finish the request/response cycle
//Test middleware
app.use((req, res, next) => {
  res.requestTime = new Date().toISOString();
  next();
});

//3 ROUTES - mount the routes middlerware
app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);

//If we reach this point, there isn't a route for the given URL
//Run for all http verbs (get, post, put, etc )
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
