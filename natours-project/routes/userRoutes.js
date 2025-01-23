const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const { getAllUsers, createUser, getUser, updateUser, deleteUser } =
  userController;

const { signUp, login, forgotPassword, resetPassword } = authController;
const userRouter = express.Router();
// Routes
// Auth
userRouter.post('/signup', signUp);
userRouter.post('/login', login);

userRouter.post('/forgotPassword', forgotPassword);
userRouter.post('/resetPassword', resetPassword);

// Users
userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = userRouter;
