const mongoose = require('mongoose');

const toursSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    trim: true,
    unique: true,
    maxlength: [50, 'A tour name must have less or equal than 50 characters'],
    minlength: [5, 'A tour name must have more or equal than 5 characters'],
  },
  duration: {
    type: String,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size '],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
    min: [0, 'Price must be above 0'],
  },
  priceDiscount: {
    type: Number,
  },
  summery: {
    type: String,
    trim: true,
  },
  description: {
    type: String, // Consider using Number if you want to store it as a number (e.g., in days)
    required: [true, 'A tour must have a description'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty must be either easy, medium, or difficult',
    },
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startDates: [Date],
});

// We do not use a callback (arrow function) here because we need the `this` keyword to refer to the specific document (tour).
// This property will be available only when we get the data , not in the collection
toursSchema.virtual('durationWeeks').get(function () {
  // `this` refers to the current document instance (tour).
  return this.duration / 7; // Calculate the duration in weeks by dividing the duration (in days) by 7.
});
// Ensure that virtuals are included in the output when converting to JSON or object
toursSchema.set('toJSON', { virtuals: true });
toursSchema.set('toObject', { virtuals: true });

const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;
