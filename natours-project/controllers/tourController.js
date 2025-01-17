const Tour = require('../models/tourModel');
const {
  validateObjectId,
  handleResponse,
  handleError,
} = require('../utils/utils');

exports.getAllTours = async (req, res) => {
  try {
    // 1. Basic Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 2. Advanced Filtering: Matching valid fields
    const validFields = [
      'name',
      'difficulty',
      'price',
      'duration',
      'ratingsAverage',
    ];
    const query = {};
    for (const key in queryObj) {
      if (validFields.includes(key)) {
        query[key] = queryObj[key];
      }
    }

    const tours = await Tour.find(query);
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
