const Review = require('../models/reviewModel.js');
const APIFeatures = require('../utils/apiFeatures.js');
const AppError = require('../utils/appError.js');
const catchAsync = require('../utils/catchAsync.js');
const { handleResponse } = require('../utils/handlers.js');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviewsFeatures = new APIFeatures(Review.find(), req.query)
    .filter()
    .limitFields()
    .sort()
    .paginate();

  const reviewsData = await reviewsFeatures.query;
  handleResponse(res, { reviews: reviewsData }, 'success');
});

exports.getCurrentReview = catchAsync(async (req, res, next) => {
  const review = await Review.findOne({ _id: req.params.id });

  if (!review) {
    return next(
      new AppError(`No review found with id : ${req.params.id}`, 404)
    );
  }
  handleResponse(res, { review });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);

  handleResponse(res, { review: newReview }, 'success');
});
