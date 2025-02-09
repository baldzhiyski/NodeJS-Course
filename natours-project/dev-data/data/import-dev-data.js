const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Replace placeholder in the database URL
const DB = process.env.DATABASE_URL.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Connect to the database
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true, // Newer and more recommended option
  })
  .then(() => {
    console.log('DB connection successful');
  })
  .catch((err) => {
    console.error('DB connection error:', err);
  });

// Read JSON File

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// import data into db

// In order to import , we need to manually turn off the middlewares in the model !

const isDbEmpty = async () => {
  const tourCount = await Tour.countDocuments();
  const userCount = await User.countDocuments();
  const reviewCount = await Review.countDocuments();

  return tourCount === 0 && userCount === 0 && reviewCount === 0;
};

const importData = async () => {
  try {
    // Temporarily disable the password hashing middleware
    await User.create(
      users.map((user) => {
        user.password = user.password; // Ensure passwords aren't hashed during import
        return user;
      }),
      { validateBeforeSave: false }
    );

    // Or you can use insertMany() to bypass the save hooks completely:
    // await User.insertMany(users);

    await Tour.create(tours);
    await Review.create(reviews);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// Delete all data from collection
const deleteData = async () => {
  try {
    await Tour.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] == '--import') {
  importData();
} else if (process.argv[2] == '--delete') {
  deleteData();
}

// To run the script use node dev-data/data/import-dev-data --import or --delete
// When I run this for the users, i DO NOT WANT to hash the pass only here turn it off
// Runs only when the db is empty

const runIfDbEmpty = async () => {
  const isEmpty = await isDbEmpty();
  if (isEmpty) {
    console.log('Database is empty. Importing data...');
    importData();
  } else {
    console.log('Database is not empty. Skipping data import.');
    process.exit();
  }
};

module.exports = runIfDbEmpty();
