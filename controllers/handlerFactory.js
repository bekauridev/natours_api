const apiFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsyncMiddleware');

// Display all documents
exports.indexDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const filter = Object.entries(req.filter || {}).length ? req.filter : {};

    // Get the total count of documents for pagination
    const totalDocuments = await Model.countDocuments(filter);

    // Use pagination features
    const features = new apiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query; // Await the Promise from Model.find()

    // Return the total count and limited results
    res.status(200).json({
      status: 'success',
      total: totalDocuments, // Include total documents
      results: doc.length,
      data: { doc },
    });
  });
// Show single document
exports.showDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    // Apply the filter based on the request (e.g., logged-in user)
    const filter = Object.entries(req.filter || {}).length ? req.filter : {};

    // Find the document by ID and apply any additional filters
    let query = Model.findOne({ _id: req.params.id, ...filter });

    // Check if the populate field is provided and apply it for multiple fields
    if (req.query.populate) {
      const populateFields = req.query.populate.split(','); // Split by comma
      populateFields.forEach((field) => {
        query = query.populate(field.trim());
      });
    }

    // Execute the query
    const doc = await query;

    if (!doc) {
      return next(
        new AppError(`No document found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
// Creates single document
exports.storeDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

// Updates single document
exports.updateDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    // Apply the filter based on the request (e.g., logged-in user)
    const filter = Object.entries(req.filter || {}).length ? req.filter : {};

    // Find the document by ID and apply the filter, then update it
    const doc = await Model.findOneAndUpdate(
      // Apply the filter and match the document by ID
      { _id: req.params.id, ...filter },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!doc) {
      return next(
        new AppError(`No document found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

// delete single document
exports.destroyDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    // Apply the filter based on the request (e.g., logged-in user)
    const filter = Object.entries(req.filter).length ? req.filter : {};

    // Find the document by ID and with the filter, then update it as inactive
    const doc = await Model.findOneAndDelete(
      {
        _id: req.params.id,
        ...filter,
      },
      {
        active: false,
      }
    );

    if (!doc) {
      return next(
        new AppError(
          `No active document found with id of ${req.params.id}`,
          404
        )
      );
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
