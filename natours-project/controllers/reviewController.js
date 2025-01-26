const Review = require('../models/reviewModel.js');
const APIFeatures = require('../utils/apiFeatures.js');
const AppError = require('../utils/appError.js');
const catchAsync = require('../utils/catchAsync.js');
const { handleResponse } = require('../utils/handlers.js');

exports.createReview = catchAsync(async (req, res, next) => {
  // Nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await Review.create(req.body);

  handleResponse(res, { review: newReview }, 'success');
});

exports.getAllReviewsSpecificTour = catchAsync(async (req, res, next) => {
  const tourId = req.body.tour || req.params.tourId;

  if (!tourId) {
    return next(new AppError('Tour ID and User ID are required.', 400));
  }

  const reviewsData = await Review.find({ tour: tourId });

  res.status(200).json({
    status: 'success',
    data: {
      reviews: reviewsData,
    },
  });
});
