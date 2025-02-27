const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const color = require('colors');
const catchAsyncMiddleware = require('../utils/catchAsyncMiddleware');
const AppError = require('../utils/AppError');
exports.getOverview = catchAsyncMiddleware(async (req, res) => {
  // 1) get all data from collection
  const tours = await Tour.find();
  // 2) Build template
  //   3) Render that template using tour data
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsyncMiddleware(async (req, res, next) => {
  const slug = req.params.slug;
  const tour = await Tour.findOne({ slug: slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  const isBooked = await Booking.findOne({tour:tour.id})
  // console.log()
  // if (!tour) {
  //   return next(new AppError('There is no tour with that name', 404));
  // }
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
    isBooked:!!isBooked
  });
});

exports.getLoginForm = catchAsyncMiddleware(async (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
});
exports.getSignForm = catchAsyncMiddleware(async (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign up to create account',
  });
});

exports.getAccount = catchAsyncMiddleware(async (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
});

exports.getMyTours = catchAsyncMiddleware(async (req, res, next) => {
  // 1) Find all bookings

  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: tourIDs });
  const names = tours.map((tour) => tour.name);

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.updateUserData = catchAsyncMiddleware(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
  next();
});
