const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');
const {
  getAllTours,
  postTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getToursStats,
  getMontlyPlan,
} = tourController;

const { protect, restrictTo } = authController;

const { checkID, checkTourBody } = require('../controllers/tourController');

// Routes
const tourRouter = express.Router();

tourRouter.use('/:tourId/reviews', reviewRouter);

// Param middleware
// tourRouter.param('id', checkID);

// Tours
// Middelware for checking if the request was ok when trying to create a new tour
tourRouter.route('/tour-stats').get(protect, getToursStats);
tourRouter.route('/montly-plan/:year').get(protect, getMontlyPlan);
tourRouter.route('/top-5-cheap').get(protect, aliasTopTours, getAllTours);
tourRouter.route('/').get(protect, getAllTours).post(protect, postTour);
tourRouter
  .route('/:id')
  .get(protect, getTour)
  .patch(protect, updateTour)
  .delete(protect, deleteTour);

module.exports = tourRouter;
