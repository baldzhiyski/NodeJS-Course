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

// Nested routes for the reviews
reviewRouter
  .route('/')
  .post(protect, restrictTo('user'), setTourUserIds, createReview)
  .get(protect, setTourUserIds, getAllReviewsSpecificTour);

reviewRouter
  .route('/:id')
  .get(protect, getReview)
  .delete(protect, deleteReview)
  .patch(protect, updateReview);

module.exports = reviewRouter;
