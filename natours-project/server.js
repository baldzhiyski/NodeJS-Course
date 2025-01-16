const mongoose = require('mongoose');
const app = require('./app');
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

// Start the server
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
