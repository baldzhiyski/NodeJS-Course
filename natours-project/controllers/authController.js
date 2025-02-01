const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const { handleResponse } = require('../utils/handlers');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const { decode } = require('punycode');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const cookieOptions = {
  expiresIn: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000
  ),
  secure: process.env.NODE_ENV === 'production' ? true : false,
  httpOnly: true,
};

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
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
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

  res.cookie('jwt', token, cookieOptions);

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

  res.cookie('jwt', token, cookieOptions);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError(`User with email ${req.body.email} is not existing !`, 404)
    );
  }

  // 2) Generate random token
  const resentToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resentToken}`;

  const message = `Forgot your password ? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password ,please ignore this email !`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes )',
      message,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.log(err);

    return next(
      new AppError(
        'There was an error sending the email. Try again later !',
        500
      )
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // Find the user based on the hashed token and check if it is expired or not (here we check for the expiration of the token)
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired , and there is user , set the new password,
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // 3) Update changedPasswordAt property for the user
  user.password = req.body.password;
  user.confirmPass = req.body.confirmPass;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // The validators in the schema will test if the passwords are equal or not . Here the middlewares will be activated also for hashing the new pass
  await user.save();

  // 4) Log the user in , send JWT
  const token = signToken(user._id);

  res.cookie('jwt', token, cookieOptions);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const currentUser = await User.findById(req.user.id).select('+password');

  // 2) Check if posted current password is correct
  const password = req.body.password;
  const newPassword = req.body.newPassword;
  const newPasswordconfirm = req.body.newPasswordConfirm;

  if (newPassword !== newPasswordconfirm) {
    return next(
      new AppError('New password does not match the confirm one !', 400)
    );
  }

  if (!currentUser.correctPassword(password, currentUser.password)) {
    return next(new AppError('The provided password is incorrect !', 401));
  }

  // 3) If so , update password
  currentUser.password = newPassword;
  currentUser.confirmPass = newPasswordconfirm;
  await currentUser.save();

  // 4) Log user in send JWT
  const token = signToken(currentUser._id);

  res.cookie('jwt', token, cookieOptions);

  res.status(200).json({
    status: 'success',
    token,
  });
});

// Only for rendered pages , no errors !
exports.isLoggedIn = async (req, res, next) => {
  // 1) Check if the token exists

  try {
    let token;
    if (req.cookies.jwt) {
      token = req.cookies.jwt;

      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );
      const id = decoded.id;
      const email = decoded.email;

      // 3) Check existence of user
      const user = await User.findOne({ _id: id, email: email });
      if (!user) {
        return next();
      }

      // 4) Check if user changed password after the token was issued
      if (user.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      // There is a logged in user
      // Make it accessible for our templates
      res.locals.user = user;
      return next();
    }
    next();
  } catch (e) {
    return next();
  }
};
exports.logout = (req, res) => {
  // Clear the JWT cookie by setting it to a past date
  res.cookie('jwt', '', {
    expires: new Date(0), // Expire the cookie immediately
    httpOnly: true, // Ensure it’s only accessible through HTTP (not JS)
  });

  // Send a response indicating successful logout
  handleResponse(res, null, 'success', 200);
};
