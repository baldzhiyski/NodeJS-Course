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
  rating: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
    min: [0, 'Price must be above 0'],
  },
  duration: {
    type: String, // Consider using Number if you want to store it as a number (e.g., in days)
    required: [true, 'A tour must have a duration'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty must be either easy, medium, or difficult',
    },
  },
});

const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;
