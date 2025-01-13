const fs = require('fs');
const path = require('path');

const toursFilePath = path.join(
  __dirname,
  '..',
  'dev-data',
  'data',
  'tours-simple.json'
);

// Utility function to read tours data
const readToursFile = () => {
  try {
    const data = fs.readFileSync(toursFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading tours file:', err);
    return [];
  }
};

// Utility function to write tours data
const writeToursFile = (tours, res) => {
  fs.writeFile(toursFilePath, JSON.stringify(tours), (err) => {
    if (err) {
      console.error('Error writing to tours file:', err);
      return res.status(500).json({ message: 'Error saving data to file!' });
    }
  });
};

// Route handlers
// Initialize tours data
let tours = readToursFile();

exports.checkID = (req, res, next, val) => {
  const tourId = parseInt(req.params.id, 10);
  const tourIndex = tours.findIndex((t) => t.id === tourId);

  if (tourIndex === -1) {
    return res
      .status(404)
      .json({ message: `Tour with id ${tourId} does not exist!` });
  }
  next();
};

exports.checkTourBody = (req, res, next) => {
  const { name, difficulty, duration, price } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Name is required and must not be empty');
  }

  if (!price || typeof price != 'number') {
    errors.push('Price is required !');
  }

  if (
    !difficulty ||
    typeof difficulty !== 'string' ||
    difficulty.trim() === ''
  ) {
    errors.push('Difficulty is required and must not be empty');
  }

  if (!duration || typeof duration !== 'string' || duration.trim() === '') {
    errors.push('Duration is required and must be a positive number');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation errors',
      errors,
    });
  }

  next();
};

exports.getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
};

exports.getTour = (req, res) => {
  const tourId = parseInt(req.params.id, 10);
  const tour = tours.find((t) => t.id === tourId);

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};

exports.updateTour = (req, res) => {
  const tourId = parseInt(req.params.id, 10);
  const tour = tours.find((t) => t.id === tourId);

  Object.assign(tour, req.body);
  writeToursFile(tours, res);

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};

exports.postTour = (req, res) => {
  const newId = tours.length ? tours[tours.length - 1].id + 1 : 1;
  const newTour = { id: newId, ...req.body };

  tours.push(newTour);
  writeToursFile(tours, res);

  res.status(201).json({
    status: 'success',
    data: { tour: newTour },
  });
};

exports.deleteTour = (req, res) => {
  const tourId = parseInt(req.params.id, 10);
  const tourIndex = tours.findIndex((t) => t.id === tourId);

  tours.splice(tourIndex, 1);
  writeToursFile(tours, res);

  res.status(204).json({
    status: 'success',
    data: null,
  });
};
