const express = require('express');
const tourController = require('../controllers/tourController');
const { getAllTours, postTour, getTour, updateTour, deleteTour } =
  tourController;

const { checkID, checkTourBody } = require('../controllers/tourController');

// Routes
const tourRouter = express.Router();

// Param middleware
// tourRouter.param('id', checkID);

// Tours
// Middelware for checking if the request was ok when trying to create a new tour
tourRouter.route('/').get(getAllTours).post(postTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = tourRouter;
