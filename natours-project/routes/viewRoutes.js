const express = require('express');
const {
  getOverview,
  getTour,
  getLogin,
  getProfile,
  getForgotPass,
  getWindowForChangePass,
} = require('../controllers/viewsController');
const { protect, isLoggedIn } = require('../controllers/authController');

const viewRouter = express.Router();
// Use this middleware

viewRouter.get('/', isLoggedIn, getOverview);

viewRouter.get('/login', isLoggedIn, getLogin);
viewRouter.get('/forgot-password', getForgotPass);
// viewRouter.get('/changeForgottetPassword/:token', getWindowForChangePass);
viewRouter.get('/account', protect, getProfile);
viewRouter.get('/tour/:tourSlug', protect, getTour);

module.exports = viewRouter;
