const express = require('express');
const {
  getOverview,
  getTour,
  getLogin,
} = require('../controllers/viewsController');

const viewRouter = express.Router();

viewRouter.get('/', getOverview);

viewRouter.get('/login', getLogin);
viewRouter.get('/tour/:tourSlug', getTour);

module.exports = viewRouter;
