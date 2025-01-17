const mongoose = require('mongoose');

exports.validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid tour ID',
    });
  }
  next();
};

exports.handleResponse = (res, data, message = 'success', status = 200) => {
  res.status(status).json({
    status: message,
    results: data?.length,
    data,
  });
};

exports.handleError = (res, error) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  } else if (error.code === 11000) {
    // Check for duplicate key error
    return res.status(400).json({
      status: 'fail',
      message: `Duplicate value for ${Object.keys(error.keyValue).join(
        ', '
      )}, please choose a different value.`,
    });
  } else {
    console.log(error.message); // Log other types of errors
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong on the server!',
    });
  }
};
