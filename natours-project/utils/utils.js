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
    data,
  });
};

exports.handleError = (res, error) => {
  console.error('Error:', error);
  if (error.name === 'ValidationError') {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong on the server!',
    });
  }
};
