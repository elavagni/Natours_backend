const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//1) MIDDLEWARES  -app.use indicates the usage of middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//The order of the middleware is really important, if the middleware if defined after the routes,
//it will not be executed, as the route handler will finish the request/response cycle
app.use((req, res, next) => {
  res.requestTime = new Date().toISOString();
  next();
});

//3 ROUTES - mount the routes middlerware
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

//If we reach this point, there isn't a route for the given URL
//Run for all http verbs (get, post, put, etc )
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
