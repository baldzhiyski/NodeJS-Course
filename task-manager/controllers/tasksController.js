const Task = require("../models/taskModel");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsyncError = require("../utils/catchAsyncError");

exports.getAllTasks = catchAsyncError(async (req, res, next) => {
  const features = new APIFeatures(Task.find(), req.query)

    .filter()
    .limitFields()
    .paginate()
    .sort();
  const tasks = await features.query;

  res.status(200).json({
    status: "success",
    message: "All tours",
    data: tasks,
  });
});

exports.getSingleTask = catchAsyncError(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(
      new AppError(`Task with id ${req.params.id} does not exists !`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    message: "Get Specific Tourt",
    data: task,
  });
});

exports.updateTask = catchAsyncError(async (req, res, next) => {
  req.body.updatedAt = Date.now();

  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!task) {
    return next(new AppError("No such task found in the db !", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Task was updated successfully",
    data: task,
  });
});

exports.createTask = catchAsyncError(async (req, res, next) => {
  const taskToBeSaved = new Task(req.body);

  await taskToBeSaved.save();
  res.status(201).json({
    status: "success",
    message: "Task was created successfully!",
    data: taskToBeSaved,
  });
});

exports.deleteTask = catchAsyncError(async (req, res, next) => {
  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) {
    return next(
      new AppError(`Task with id ${req.params.id} does not exists !`, 404)
    );
  }

  res.status(204).json({
    status: "success",
    message: "Task was deleted successfully!",
    data: task,
  });
});
