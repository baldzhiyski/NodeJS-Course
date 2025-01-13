const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

const baseUrl = '/api/v1';

// Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

// static file middleware
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log(' Hello from the middleware');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Mounting the routes
app.use(`${baseUrl}/tours`, tourRouter);
app.use(`${baseUrl}/users`, userRouter);

module.exports = app;
