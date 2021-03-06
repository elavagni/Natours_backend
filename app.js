const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, './views'));

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

//1) GLOBAL MIDDLEWARES
//implement cors, allow all origins (Access-Control-Allow-Origin *)
app.use(cors());

//Example to only allow a specific origin
/*app.use(
  cors({
    origin: 'https://www.natours.com'
  })
);
*/

// Allow cors preflight phase for all complex requests to our API (to patch or delete)
app.options('*', cors());

// Allow cors preflight to an specific route
// app.options('/api/v1/tours', cors());

// Set Security HTTP headers
//enable helmet security later
//app.use(helmet());

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

//This webhook is handle here instead of the booking router because the webhookCheckout
//handler function will call a Stripe function that requires the body in a raw form (stream instead of json)
//all requests handle by the routers are going to be parse to json due the use of the express.json middleware
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

// Body parser, reading data from the body into req.body
app.use(
  express.json({
    limit: '10kb'
  })
);
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

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

app.use(compression());

//The order of the middleware is really important, if the middleware if defined after the routes,
//it will not be executed, as the route handler will finish the request/response cycle
//Test middleware
app.use((req, res, next) => {
  res.requestTime = new Date().toISOString();
  //console.log(req.cookies);
  next();
});

//3 ROUTES - mount the routes middlerware
app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//If we reach this point, there isn't a route for the given URL
//Run for all http verbs (get, post, put, etc )
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
