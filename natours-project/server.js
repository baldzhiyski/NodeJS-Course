const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Load environment variables
dotenv.config({ path: './config.env' });
const app = require('./app');

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

// Start the server
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.message);
  console.log('UNHANDLED REJECTION ! Shutting down ... ');
  server.close(() => {
    process.exit(1);
  });
});
