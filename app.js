const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//1) MIDDLEWARES  -app.use indicates the usage of middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//The other of the middleware is really important, if the middleware if define after the routes,
//it will not be executed, as the route handler will finish the request/response cycle
app.use((req, res, next) => {
  console.log('Hello from the middleware');
  //Invoke next function passed as parameter
  next();
});

app.use((req, res, next) => {
  res.requestTime = new Date().toISOString();
  next();
});

//3 ROUTES - mount the routes middlerware
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

module.exports = app;
