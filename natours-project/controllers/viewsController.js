const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../models/bookings');

exports.getOverview = catchAsync(async (req, res) => {
  // 1) Get tour data
  const tours = await Tour.find();
  // 2) Check if the user is logged in
  let userFavorites = [];
  if (res.locals.user) {
    // Get the user's favorites if the user is logged in
    userFavorites = res.locals.user.favourites.map((fav) => fav.id); // Assuming 'id' is the field in each favorite object
  }

  console.log(userFavorites); // This will now log an array of favorite IDs

  // 3) Render the overview template and pass tours + user favorites
  res.status(200).render('overview', {
    title: 'All tours',
    tours: tours,
    userFavorites: userFavorites,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tourSlug = req.params.tourSlug;
  const query = Tour.findOne({ slug: tourSlug });
  const tour = await query.populate({
    path: 'reviews',
    select: 'review rating user', // ✅ Use 'select' instead of 'fields'
  });

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

exports.getRegisterPage = catchAsync(async (req, res, next) => {
  res.status(200).render('register', {
    title: 'Create an account',
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

// TODO : Make a view for chaning the actual forgot pass

exports.getWindowForChangePass = (req, res, next) => {
  res.status(200).render('changeForgotPass', {
    title: 'Change Password',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours: tours,
  });
});
