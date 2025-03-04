const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const catchAsyncMiddleware = require('../middlewares/catchAsyncMiddleware');
const AppError = require('../utils/AppError');
exports.getOverview = catchAsyncMiddleware(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render('pages/overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsyncMiddleware(async (req, res) => {
  const { slug } = req.params;
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

  // This sorts based on date but if review belongs req.user it will be on top
  const sortedReviews = tour.reviews.sort((a, b) => {
    // Check if either review has a valid user
    const isAUserReview = a.user && a.user._id?.toString() === userId;
    const isBUserReview = b.user && b.user._id?.toString() === userId;

    if (isAUserReview && !isBUserReview) return -1; // Move A up
    if (!isAUserReview && isBUserReview) return 1; // Move B up

    // If both or neither belong to the user, sort by date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  res.status(200).render('pages/tour', {
    title: `${tour.name} Tour`,
    tour,
    isBooked,
    haveReviewed,
    sortedReviews,
  });
});

exports.getLoginForm = catchAsyncMiddleware(async (req, res) => {
  res.status(200).render('pages/login', {
    title: 'Log into your account',
  });
});
exports.getSignForm = catchAsyncMiddleware(async (req, res) => {
  res.status(200).render('pages/signup', {
    title: 'Sign up to create account',
  });
});

exports.getAccount = catchAsyncMiddleware(async (req, res) => {
  res.status(200).render('pages/account', {
    title: 'Your account',
  });
});

exports.getMyTours = catchAsyncMiddleware(async (req, res) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });
  // console.log(bookings, req.user.id);
  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: tourIDs });
  res.status(200).render('pages/overview', {
    title: 'My Tours',
    tours,
  });
});

exports.updateUserData = catchAsyncMiddleware(async (req, res) => {
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

  res.status(200).render('pages/account', {
    title: 'Your account',
    user: updatedUser,
  });
});

exports.getMyReviews = catchAsyncMiddleware(async (req, res) => {
  // 1) Find all reviews
  const reviews = await Review.find({ user: req.user.id })
    .populate({
      path: 'tour',
      select: 'slug',
    })
    .sort({ createdAt: -1 });
  const is_reviewPage = true;
  res.status(200).render('pages/reviewOverview', {
    title: 'My Reviews',
    reviews,
    is_reviewPage,
  });
});

exports.getMyPayments = catchAsyncMiddleware(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id });
  // const bookings = await Booking.find({ user: req.user.id }).populate({
  //   path: 'tour',
  //   select: 'name slug',
  // });

  console.log('Bookings with populated tours:', bookings); // Check the populated bookings data

  res.status(200).render('pages/payments', {
    title: 'My Payments',
    bookings,
  });
});
