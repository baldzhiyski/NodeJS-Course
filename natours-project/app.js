const express = require('express');
const path = require('path');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const passport = require('./utils/passportConfig'); // Import passport config

const jwt = require('jsonwebtoken');

const app = express();

app.set('view engine', 'pug'); // ✅ Corrected
app.set('views', path.join(__dirname, 'views'));
// Static file middleware
app.use(express.static(path.join(__dirname, 'public')));

const baseUrl = '/api/v1';

//  Global Middlewares

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(
  express.json({
    limit: '10kb',
  })
);

// Parses data from cookies
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization aginst XSS .
app.use(xss());

// Prevent param polutions
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression());

// Limit requests
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP , please try again in an hour !',
});

app.use('/api', limiter);

// Security HTTP Headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'https://avatars.githubusercontent.com/'],
      // other directives like scriptSrc, styleSrc can be added as needed
    },
  })
);
// Mounting the routes
app.use('/', viewRouter);
app.use(`${baseUrl}/tours`, tourRouter);
app.use(`${baseUrl}/users`, userRouter);
app.use(`${baseUrl}/reviews`, reviewRouter);
app.use(`${baseUrl}/reviews`, reviewRouter);
app.use(`${baseUrl}/bookings`, bookingRouter);

// GitHub Auth Routes
app.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['read:user', 'user:email'] })
);

app.get('/auth/github/callback', async (req, res, next) => {
  try {
    passport.authenticate('github', async (err, user, info) => {
      if (err) {
        console.error('GitHub authentication error:', err);
        return res
          .status(500)
          .json({ error: 'Authentication failed', details: err.message });
      }

      if (!user) {
        return res.redirect('/login'); // Redirect if authentication fails
      }

      // ✅ Generate a JWT instead of using req.logIn
      const token = jwt.sign(
        { id: user.id, email: user.email }, // Payload
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN,
        }
      );

      console.log('User authenticated successfully:', user);

      // ✅ Send JWT to the frontend (or store it in a cookie)
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
      return res.redirect('/'); // Redirect after successful login
    })(req, res, next);
  } catch (error) {
    console.error('Unexpected error during authentication:', error);
    return res
      .status(500)
      .json({ error: 'Internal Server Error', details: error.message });
  }
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server !`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
