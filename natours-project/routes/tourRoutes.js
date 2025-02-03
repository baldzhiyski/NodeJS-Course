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
  getToursWithin,
  getDistancesFromLocationToTours,
  uploadTourImages,
  resizeTourImages,
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
tourRouter.route('/tour-stats').get(getToursStats);
tourRouter
  .route('/montly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide'), getMontlyPlan);
tourRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours);
tourRouter
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), postTour);
tourRouter
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

tourRouter
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

tourRouter
  .route('/distances/:latlng/unit/:unit')
  .get(getDistancesFromLocationToTours);

module.exports = tourRouter;
