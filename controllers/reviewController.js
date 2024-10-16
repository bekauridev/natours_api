const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsyncMiddleware');
const Review = require('../models/reviewModel');
const handlerFactory = require('./handlerFactory');
const AppError = require('../utils/AppError');

// Automatically set tourId and userId
// Used as a middleware for storeReview
exports.setTourUserIds = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;

  const tour = await Tour.findById(req.body.tour);
  if (!tour)
    return next(new AppError(`No tour found with ID: ${req.body.tour}`, 404));

  if (!req.body.user) req.body.user = req.user.id;
  next();
});

// handler factory for CRUD operations
exports.indexReview = handlerFactory.indexDoc(Review);
exports.showReview = handlerFactory.showDoc(Review);
exports.storeReview = handlerFactory.storeDoc(Review);
exports.destroyReview = handlerFactory.destroyDoc(Review);
exports.updateReview = handlerFactory.updateDoc(Review);
