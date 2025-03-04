const mongoose = require('mongoose');
const Review = require('./reviewModel');
const slugify = require('slugify');
// const User = require('./userModel');

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
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
    set: (val) => Math.round(val * 10) / 10,
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
    // Custom validation
    validate: {
      validator: function (val) {
        // this only points to current doc on NEW document creation
        return val < this.price;
      },
      message: 'Discount price ({VALUE}) should be below the regular price',
    },
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
  slug: String,
  secretTour: {
    type: Boolean,
    default: false,
  },
  startLocation: {
    //GeoJSON
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: [Number],
    address: String,
    description: String,
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number,
    },
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
});
toursSchema.index({ price: 1, ratingsAverage: -1 });
toursSchema.index({ slug: 1 });

toursSchema.index({ startLocation: '2dsphere' });

// We do not use a callback (arrow function) here because we need the `this` keyword to refer to the specific document (tour).
// This property will be available only when we get the data , not in the collection
toursSchema.virtual('durationWeeks').get(function () {
  // `this` refers to the current document instance (tour).
  return this.duration / 7; // Calculate the duration in weeks by dividing the duration (in days) by 7.
});
// Ensure that virtuals are included in the output when converting to JSON or object
toursSchema.set('toJSON', { virtuals: true });
toursSchema.set('toObject', { virtuals: true });

// Document Middleware : run before the .save() and .create() command. Like in express we also need in mongoose to say next at the end !
toursSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

// toursSchema.post('save', function (doc, next) {
//   console.log(' Document saved !');
//   next();
// });

// Only for creating new documents ( for embedding )
// toursSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => {
//     await User.findById(id);
//   });

//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// Virtual populate
// Here we keep a ref without persisting this into the db
// Then just use it in the tour controller by find , use populate('reviews')
toursSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// Query Middleware
toursSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

toursSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
toursSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds !`);
  next();
});

// Tour schema: Pre hook to delete all reviews associated with the tour before deleting the tour document
toursSchema.pre('findOneAndDelete', async function (next) {
  // Access the tour that is going to be deleted (from the 'this' context)
  const tourId = this.getQuery()['_id'];

  // Delete all reviews where the tour is referenced (assuming 'tour' field in review schema)
  await Review.deleteMany({ tour: tourId });

  next(); // Continue with the deletion process
});

// Aggregation Middleware
// toursSchema.pre('aggreagate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;
