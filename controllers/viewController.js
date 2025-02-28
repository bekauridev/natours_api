const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
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

  const userId = req.user?.id;

  // Check if the user has booked the tour
  const isBooked = userId
    ? await Booking.exists({ user: userId, tour: tour._id })
    : false;

  // Check if the user has reviewed the tour
  const haveReviewed = userId
    ? tour.reviews.some((review) => review.user?._id.toString() === userId)
    : false;

  const sortedReviews = tour.reviews.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
    isBooked,
    haveReviewed,
    sortedReviews,
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
  console.log(bookings, req.user.id);
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

exports.getMyReviews = catchAsyncMiddleware(async (req, res, next) => {
  // 1) Find all reviews
  const reviews = await Review.find({ user: req.user.id });
  console.log(reviews, req.user.id);
  // 2) Find tours with the returned IDs
  const tourIDs = reviews.map((el) => el.tour);
  const tours = await Tour.find({ _id: tourIDs });
  // const names = tours.map((tour) => tour.name);

  res.status(200).render('reviewOverview', {
    title: 'My Tours',
    reviews,
    tours,
  });
});
