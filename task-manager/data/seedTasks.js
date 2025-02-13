const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const logger = require("../utils/logger");
const Task = require("../models/taskModel"); // Ensure correct path

// Read tasks from JSON file
const tasksFilePath = path.join(__dirname, "tasks.json");
const tasksData = () => {
  try {
    const tasks = fs.readFileSync(tasksFilePath, "utf-8");
    return JSON.parse(tasks);
  } catch (error) {
    logger.error("Error reading tasks file:", error);
    return [];
  }
};

// Function to seed database
exports.seedDB = async () => {
  try {
    const taskCount = await Task.countDocuments();
    if (taskCount === 0) {
      const tasks = tasksData();
      if (tasks.length > 0) {
        await Task.insertMany(tasks);
        logger.info("Database seeded with tasks");
      } else {
        logger.warn("No tasks found in JSON file, skipping seeding");
      }
    } else {
      logger.info("Database already contains tasks, skipping seeding");
    }
  } catch (err) {
    logger.error("Error seeding database:", err);
  }
};
