const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures.js');
const AppError = require('../utils/appError.js');
const catchAsync = require('../utils/catchAsync.js');

const { handleResponse, handleError } = require('../utils/handlers.js');

// Middleware for alias the tours
exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .limitFields()
    .paginate()
    .sort();
  const tours = await features.query;

  handleResponse(res, { tours }, 'success');
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new AppError(`No tour found with id : ${req.params.id}`, 404));
  }
  handleResponse(res, { tour });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedTour) {
    return next(new AppError(`No tour found with id : ${req.params.id}`, 404));
  }
  handleResponse(res, { tour: updatedTour });
});

exports.postTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  handleResponse(res, { tour: newTour }, 'success', 201);
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError(`No tour found with id : ${req.params.id}`, 404));
  }
  handleResponse(res, null, 'success', 204);
});
exports.getToursStats = catchAsync(async (req, res) => {
  // Using Mongoose's aggregation pipeline to calculate statistical data for tours.
  const stats = await Tour.aggregate([
    // Stage 1: $match
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
      // The $match stage filters documents in the 'Tour' collection.
      // Only include tours where the 'ratingsAverage' is greater than or equal to 4.5.
      // Example: A tour with a ratingsAverage of 4.6 will be included.
    },

    // Stage 2: $group
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        // Group documents by the 'difficulty' field.
        // Each unique 'difficulty' value will form a separate group.

        num: { $sum: 1 },
        // num calculates the total number of documents in each group (i.e., the count of tours with the same ratingsAverage).

        avgRating: { $avg: '$ratingsAverage' },
        // avgRating calculates the average of the 'ratingsAverage' field within each group.

        numRatings: { $sum: '$ratingsQuantity' },
        // numRatings sums up the 'ratingsQuantity' field for all documents in the group.

        avgPrice: { $avg: '$price' },
        // avgPrice calculates the average of the 'price' field within each group.

        minPrice: { $min: '$price' },
        // minPrice finds the minimum value of the 'price' field in the group.

        maxPrice: { $max: '$price' },
        // maxPrice finds the maximum value of the 'price' field in the group.
      },
    },
    {
      $sort: {
        avgPrice: -1,
      },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  // Send the calculated statistics back to the client in the response.
  // handleResponse is a helper function to format and send the response.
  handleResponse(res, stats);
});

exports.getMontlyPlan = catchAsync(async (req, res) => {
  // Get the year from the request parameters and convert it to a number.
  // The `year` is provided in the URL (e.g., '/monthly-plan/2021').
  const year = req.params.year * 1; // Example: 2021

  // Use Mongoose's aggregation framework to create the monthly plan.
  const plan = await Tour.aggregate([
    // Stage 1: $unwind
    {
      $unwind: '$startDates',
      // The $unwind stage deconstructs the `startDates` array field from the documents.
      // Each element of the array will become a separate document.
      // Example: If a tour has multiple start dates, each date will now have its own document.
    },

    // Stage 2: $match
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
        // The $match stage filters documents that have `startDates` within the specified year.
        // Only dates between January 1st and December 31st of the given year are included.
      },
    },

    // Stage 3: $group
    {
      $group: {
        _id: { $month: '$startDates' },
        // Group the documents by the month of the `startDates` field.
        // The `_id` field will contain the month number (1 for January, 2 for February, etc.).

        numTourStarts: { $sum: 1 },
        // numTourStarts counts the number of tours starting in each month.

        tours: { $push: '$name' },
        // tours creates an array of tour names that start in each month.
        // The `$push` operator adds each tour's name to the array.
      },
    },

    // Stage 4: $addFields
    {
      $addFields: { month: '$_id' },
      // The $addFields stage adds a new field `month` with the value of `_id`.
      // This makes it easier to understand the output by having the month as a separate field.
    },

    // Stage 5: $project
    {
      $project: {
        _id: 0,
      },
      // The $project stage is used to include or exclude fields in the output documents.
      // Here, we exclude the `_id` field by setting it to 0.
    },

    // Stage 6: $sort
    {
      $sort: { numTourStarts: -1 },
      // The $sort stage sorts the documents by `numTourStarts` in descending order.
      // This means the month with the most tour starts will appear first.
    },
  ]);

  // Send the resulting plan back to the client.
  // handleResponse is a helper function to format and send the response.
  handleResponse(res, plan);
});
