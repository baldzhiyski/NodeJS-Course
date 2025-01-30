const express = require('express');
const { getOverview, getTour } = require('../controllers/viewsController');

const viewRouter = express.Router();

viewRouter.get('/', getOverview);
viewRouter.get('/tour', getTour);

module.exports = viewRouter;
