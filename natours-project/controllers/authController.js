const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const { handleResponse } = require('../utils/handlers');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');

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

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    confirmPass: req.body.confirmPass,
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
