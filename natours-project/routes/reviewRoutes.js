const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const { getAllReviewsSpecificTour, createReview } = reviewController;

const { protect, restrictTo } = authController;

const reviewRouter = express.Router({ mergeParams: true });

// Nested routes for the reviews
reviewRouter
  .route('/')
  .post(protect, restrictTo('user'), createReview)
  .get(protect, getAllReviewsSpecificTour);

module.exports = reviewRouter;
