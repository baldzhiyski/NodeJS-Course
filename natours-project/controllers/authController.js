const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const { handleResponse } = require('../utils/handlers');

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  handleResponse(res, { user: newUser }, 'Successfully created User !', 201);
});
