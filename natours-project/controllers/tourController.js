const Tour = require('../models/tourModel');
const {
  validateObjectId,
  handleResponse,
  handleError,
} = require('../utils/utils');

exports.getAllTours = async (req, res) => {
  try {
    // 1. Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Tour.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      // Multiple sort
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Field Limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');

      // Selecting certain field names
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) {
        throw new Error('This Page does not exists !');
      }
    }

    const tours = await query;

    handleResponse(res, { tours }, 'success');
  } catch (error) {
    handleError(res, error);
  }
};

exports.getTour = [
  validateObjectId,
  async (req, res) => {
    try {
      const tour = await Tour.findById(req.params.id);
      if (!tour) {
        return handleResponse(res, null, 'No tour found with that ID', 404);
      }
      handleResponse(res, { tour });
    } catch (error) {
      handleError(res, error);
    }
  },
];

exports.updateTour = [
  validateObjectId,
  async (req, res) => {
    try {
      const updatedTour = await Tour.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
      if (!updatedTour) {
        return handleResponse(res, null, 'No tour found with that ID', 404);
      }
      handleResponse(res, { tour: updatedTour });
    } catch (error) {
      handleError(res, error);
    }
  },
];

exports.postTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    handleResponse(res, { tour: newTour }, 'success', 201);
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteTour = [
  validateObjectId,
  async (req, res) => {
    try {
      const tour = await Tour.findByIdAndDelete(req.params.id);
      if (!tour) {
        return handleResponse(res, null, 'No tour found with that ID', 404);
      }
      handleResponse(res, null, 'success', 204);
    } catch (error) {
      handleError(res, error);
    }
  },
];
