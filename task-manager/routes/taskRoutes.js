const express = require("express");
const {
  getAllTasks,
  createTask,
  getSingleTask,
  deleteTask,
  updateTask,
} = require("../controllers/tasksController");

const taskRouter = express.Router();

taskRouter.route("/").get(getAllTasks).post(createTask);
taskRouter
  .route("/:id")
  .get(getSingleTask)
  .patch(updateTask)
  .delete(deleteTask);

module.exports = taskRouter;
