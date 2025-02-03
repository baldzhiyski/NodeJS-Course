const User = require('../models/userModel');
const { handleResponse } = require('../utils/handlers.js');
const APIFeatures = require('../utils/apiFeatures.js');
const AppError = require('../utils/appError.js');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory.js');
const multer = require('multer');

// Define some settings for the multer for the middleware
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, res, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cv(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

/**
 * Filters an object to include only specified allowed fields.
 *
 * @param {Object} obj - The object to be filtered.
 * @param {...string} allowedFields - The fields to be allowed in the new object.
 * @returns {Object} - A new object containing only the allowed fields from the original object.
 */
const filterObj = (obj, ...allowedFields) => {
  const newObj = {}; // Initialize an empty object to hold filtered key-value pairs.

  // Iterate through each key in the original object.
  Object.keys(obj).forEach((el) => {
    // Check if the key is in the list of allowed fields.
    if (allowedFields.includes(el)) {
      // Add the key-value pair to the new object if it is allowed.
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.newPassword || req.body.newPasswordConfirm) {
    return next(
      new AppError(
        'This route is not for password udpates ! Please use /updatePassword',
        400
      )
    );
  }
  // 2) Update user document
  const filteredBody = filterObj(req.body, 'firstName', 'lastName', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined ! Please use /signup instead !',
  });
};

// Middleware so we can set the params id and reuse the getOne Method from the handlerFactory.js file
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.uploadUserPic = upload.single('photo');
exports.getProfile = factory.getOne(User);
exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User);
