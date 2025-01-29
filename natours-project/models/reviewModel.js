const mongoose = require('mongoose');
const Tour = require('./tourModel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      minLength: [1, 'The text for the review is required!'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      require: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: [true, 'Review must belong to an user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Each user can create one review on each tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName imageUrl',
  });
  //   this.populate({
  //     path: 'tour',
  //     select: 'name price description difficulty',
  //   });
  next();
});

// Static method to calculate average ratings for a specific tour
reviewSchema.statics.calcAvgRatings = async function (tourId) {
  // Aggregation pipeline to calculate statistics for the given tourId
  const stats = await this.aggregate([
    {
      // Stage 1: Match reviews related to the specified tour
      $match: { tour: tourId },
    },
    {
      // Stage 2: Group the reviews by tour and calculate the count and average of ratings
      $group: {
        _id: '$tour', // Group by the 'tour' field
        nRating: { $sum: 1 }, // Count the total number of reviews (nRating)
        avgRating: { $avg: '$rating' }, // Calculate the average rating
      },
    },
  ]);

  // If no stats returned, just return
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // points to the current review
  this.constructor.calcAvgRatings(this.tour);
});

// Calculating also when deleting and updating review ( solution around the problem)
// findByIdAndUpdate
// findByIdAndDelete
// Pre-hook to capture the current review before it's updated or deleted
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // Store the document that will be updated or deleted
  this.r = await this.findOne();
  next(); // Proceed with the update or delete operation
});

// Post-hook to recalculate ratings after an update or delete operation
reviewSchema.post(/^findOneAnd/, async function () {
  // Recalculate the average rating and review count for the associated tour
  await this.r.constructor.calcAvgRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
