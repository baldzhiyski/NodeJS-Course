const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const {
  getAllReviewsSpecificTour,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
} = reviewController;

const { protect, restrictTo } = authController;

const reviewRouter = express.Router({ mergeParams: true });
reviewRouter.use(protect);

// Nested routes for the reviews
reviewRouter
  .route('/')
  .post(restrictTo('user'), setTourUserIds, createReview)
  .get(setTourUserIds, getAllReviewsSpecificTour);

reviewRouter
  .route('/:id')
  .get(getReview)
  .delete(restrictTo('user', 'admin'), deleteReview)
  .patch(restrictTo('user', 'admin'), updateReview);

module.exports = reviewRouter;
