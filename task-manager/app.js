const express = require("express");
const dotenv = require("dotenv");
const logger = require("./utils/logger");

dotenv.config({ path: "./.env" });

const app = express();

// Set port, default to 3000 if not defined in .env
const port = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Hello, Task Manager App is running!");
  logger.info("Hello from the server !");
});

const server = app.listen(port, () => {
  logger.info(`App running on port ${port}...`);
});
process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION! 💥 Shutting down...");
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
