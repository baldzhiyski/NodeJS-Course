const express = require('express');
const {
  getOverview,
  getTour,
  getLogin,
  getProfile,
} = require('../controllers/viewsController');
const { protect, isLoggedIn } = require('../controllers/authController');

const viewRouter = express.Router();
// Use this middleware

viewRouter.get('/', getOverview);

viewRouter.get('/login', isLoggedIn, getLogin);
viewRouter.get('/account', protect, getProfile);
viewRouter.get('/tour/:tourSlug', protect, getTour);

module.exports = viewRouter;
