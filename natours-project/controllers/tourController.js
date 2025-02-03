const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures.js');
const AppError = require('../utils/appError.js');
const catchAsync = require('../utils/catchAsync.js');
const factory = require('./handlerFactory.js');
const multer = require('multer');
const sharp = require('sharp');
const { handleResponse, handleError } = require('../utils/handlers.js');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Multiple images
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // Process Cover image
  const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${imageCoverFilename}`);

  // put it into the body before the actual update process starts
  req.body.imageCover = imageCoverFilename;

  // Process all other images

  req.body.images = [];
  // We use map beacuse we need to await promises in a loop
  await Promise.all(
    req.files.images.map(async (file, idx) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${idx + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);

      // put it into the body before the actual update process starts
      req.body.images.push(fileName);
    })
  );

  next();
};

// Middleware for alias the tours
exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.updateTour = factory.updateOne(Tour);
exports.postTour = factory.createOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

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

// /tours-within/233/center/34.111745,-188.113491/unit/mi
// Find tours within your current address
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  handleResponse(res, tours);
});

// Define the function to calculate distances from a specific location to all tours
// To ensure that the $geoNear query works efficiently, the startLocation field in your Tour model must have a geospatial index.
exports.getDistancesFromLocationToTours = catchAsync(async (req, res, next) => {
  // Destructure the parameters from the request
  const { latlng, unit } = req.params;

  // Split the latlng string into latitude and longitude values
  const [lat, lng] = latlng.split(',');

  // Check if both latitude and longitude are provided
  if (!lat || !lng) {
    // If either lat or lng is missing, throw an error with a 400 status
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  // Convert the latitude and longitude values to numbers (they come as strings from req.params)
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  // Check if both latitude and longitude are valid numbers
  if (isNaN(latitude) || isNaN(longitude)) {
    // If not, throw an error indicating invalid coordinates
    return next(
      new AppError(
        'Invalid latitude or longitude value. Please provide valid numbers.',
        400
      )
    );
  }

  // Calculate the multiplier based on the unit (miles or kilometers)
  // Example: If the unit is 'mi' (miles), use a multiplier to convert the distance accordingly
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001; // Miles or Kilometers conversion

  // Use MongoDB aggregation to calculate distances
  const distances = await Tour.aggregate([
    {
      // `$geoNear` stage to calculate distances from the provided location
      $geoNear: {
        // The reference location (the point from which distances will be calculated)
        near: {
          type: 'Point', // The type of the location (Point for lat, lng)
          coordinates: [longitude, latitude], // MongoDB expects [longitude, latitude]
        },
        // The name of the field where the distance will be stored
        distanceField: 'distance',
        // Optionally multiply the distance by a value based on the unit (mi or km)
        distanceMultiplier: multiplier,
      },
    },
    {
      // `$project` stage to select only the relevant fields .
      $project: {
        // Include the 'distance' field and the 'name' of each tour in the response
        distance: 1,
        name: 1,
      },
    },
  ]);

  // Handle the successful response and send the distances data to the client
  handleResponse(res, distances);
});
