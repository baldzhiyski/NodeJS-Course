const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('./../../models/tourModel');
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

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// import data into db

const importData = async () => {
  try {
    await Tour.create(tours);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// Delete all data from collection
const deleteData = async () => {
  try {
    await Tour.deleteMany({});
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
