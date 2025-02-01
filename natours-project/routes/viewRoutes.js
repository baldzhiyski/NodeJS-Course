const express = require('express');
const {
  getOverview,
  getTour,
  getLogin,
} = require('../controllers/viewsController');
const { protect, isLoggedIn } = require('../controllers/authController');

const viewRouter = express.Router();
// Use this middleware
viewRouter.use(isLoggedIn);
viewRouter.get('/', getOverview);

viewRouter.get('/login', getLogin);
viewRouter.get('/tour/:tourSlug', protect, getTour);

module.exports = viewRouter;
