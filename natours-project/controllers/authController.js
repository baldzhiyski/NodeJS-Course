const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const { handleResponse } = require('../utils/handlers');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const { decode } = require('punycode');

const signToken = (id, email) =>
  jwt.sign(
    {
      id: id,
      email: email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Check if the token exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2) Verification of token
  if (!token) {
    return next(
      new AppError('You are not logged in ! Please log in to get access!', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const id = decoded.id;
  const email = decoded.email;

  // 3) Check existence of user
  const user = await User.findOne({ _id: id, email: email });
  if (!user) {
    return next(
      new AppError(
        'Unauthorized ! The user belonging to the token no longer exists !',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed password ! Please log in again ...',
        401
      )
    );
  }

  // Grand access to protected route
  req.user = user;
  next();
});

// Middleware to restrict access based on user roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated and if their role is in the allowed roles list
    // `req.user` is populated by authentication middleware like the `protect` middleware
    if (!req.user || !roles.includes(req.user.role)) {
      // If the user is not authenticated or their role is not allowed, deny access with 403 error
      return next(new AppError('Permission denied!', 403));
    }

    // If the user has the correct role, grant access by passing control to the next middleware/route handler
    next();
  };
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    confirmPass: req.body.confirmPass,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const token = signToken(newUser._id, newUser.email);

  return res.status(201).json({
    status: 'success',
    message: 'Successfully registered user !',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if user exists and if password is correct
  if (!email || !password) {
    return next(new AppError('Please provide email and password !', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Bad credentials !', 401));
  }

  // 2) Send a token back to the client
  const token = signToken(user._id, user.email);
  res.status(200).json({
    status: 'success',
    token,
  });
});
