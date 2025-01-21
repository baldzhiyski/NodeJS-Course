const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const { getAllUsers, createUser, getUser, updateUser, deleteUser } =
  userController;

const { signUp } = authController;
const userRouter = express.Router();
// Routes
// Auth
userRouter.post('/signup', signUp);

// Users
userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = userRouter;
