const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const { getAllReviews, getCurrentReview, createReview } = reviewController;

const { protect, restrictTo } = authController;

const reviewRouter = express.Router();

reviewRouter
  .route('/')
  .get(protect, getAllReviews)
  .post(protect, restrictTo('user'), createReview);

reviewRouter.route('/:id').get(protect, getCurrentReview);

module.exports = reviewRouter;
