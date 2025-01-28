const Review = require('../models/reviewModel.js');
const APIFeatures = require('../utils/apiFeatures.js');
const AppError = require('../utils/appError.js');
const catchAsync = require('../utils/catchAsync.js');
const { handleResponse } = require('../utils/handlers.js');
const factory = require('./handlerFactory.js');

// Middleware for setting the tour id and the user id

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createReview = factory.createOne(Review);

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

exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
