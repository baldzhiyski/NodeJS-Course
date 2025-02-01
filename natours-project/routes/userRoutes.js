const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  getProfile,
} = userController;

const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
  logout,
} = authController;
const userRouter = express.Router();
// Routes
// Auth
// Free for the public
userRouter.post('/signup', signUp);
userRouter.post('/login', login);
userRouter.get('/logout', logout);
userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:token', resetPassword);

// Protect all routes from here on
userRouter.use(protect);
userRouter.patch('/updatePassword', updatePassword);
userRouter.delete('/deleteMe', deleteMe);
userRouter.patch('/updateMe', updateMe);
userRouter.get('/me', getMe, getProfile);

// Users

userRouter.use(restrictTo('admin'));
userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = userRouter;
