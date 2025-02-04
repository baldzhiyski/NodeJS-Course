const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res) => {
  // 1) Get tour data
  const tours = await Tour.find();

  // 2) Build template

  // 3) Render that template using tour data from 1)

  res.status(200).render('overview', {
    title: 'All tours',
    tours: tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tourSlug = req.params.tourSlug;
  const query = Tour.findOne({ slug: tourSlug });
  const tour = await query.populate({
    path: 'reviews',
    select: 'review rating user', // ✅ Use 'select' instead of 'fields'
  });
  console.log(tour);

  if (!tour) {
    return next(
      new AppError(`Tour with slug ${tourSlug} does not exist !`, 400)
    );
  }

  res.status(200).render('tour', {
    title: tour.name,
    tour: tour,
  });
});

exports.getLogin = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log Into Your Account',
  });
});

exports.getProfile = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Profile',
  });
});

exports.getForgotPass = (req, res, next) => {
  res.status(200).render('forgotPassword', {
    title: 'Forgot My Password',
  });
};

exports.getWindowForChangePass = (req, res, next) => {
  res.status(200).render('changeForgotPass', {
    title: 'Change Password',
  });
};
