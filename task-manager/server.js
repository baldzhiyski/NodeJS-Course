const app = require("./app");
const dotenv = require("dotenv");
const logger = require("./utils/logger");
const mongoose = require("mongoose");
const { seedDB } = require("./data/seedTasks");

dotenv.config({ path: "./.env" });

const DB = process.env.DATABASE_URL.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {}).then(() => logger.info("DB connection successful!"));

// Set port, default to 3000 if not defined in .env
const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  logger.info(`App running on port ${port}...`);
});

// Run seeding function
seedDB();

process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  logger.error(err.name, err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION! 💥 Shutting down...");
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
