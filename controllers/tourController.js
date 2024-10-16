const Tour = require('./../models/tourModel');
const catchAsync = require('../utils/catchAsyncMiddleware');
const handlerFactory = require('./handlerFactory');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// Get all tours
// handler factory for CRUD operations
exports.indexTours = handlerFactory.indexDoc(Tour);
exports.showTour = handlerFactory.showDoc(Tour, {
  path: 'reviews',
});
exports.storeTour = handlerFactory.storeDoc(Tour);
exports.updateTour = handlerFactory.updateDoc(Tour);
exports.destroyTour = handlerFactory.destroyDoc(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // Specify what we want to group by
        _id: { $toUpper: '$difficulty' },
        // _id: '$rating',
        // quantity of tours
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        averageRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
    // This removes EASY Ones
    // {$match:{_id:{$ne: "EASY"}}}
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    //
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      // with this we get id (startDates) paramerer with name of month
      $addFields: { month: '$_id' },
    },
    {
      // like this we removeing this field
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTourStarts: -1,
      },
    },
    // {
    // limits result
    // $limit: 6,
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
