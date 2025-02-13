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
  const data = await features.query;

  res.status(200).json({
    status: "success",
    message: "All tours",
    data,
  });
});

exports.getSingleTask = catchAsyncError(async (req, res, next) => {
  const task = Task.find({ _id: req.params.id });

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

  const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    return next(new AppError("No such task found in the db !", 404));
  }

  res.staus(200).json({
    status: "success",
    message: "Task was updated successfully",
    data: updated,
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
  const task = Task.findByIdAndDelete(req.params.id);

  if (!task) {
    return next(
      new AppError(`Task with id ${req.params.id} does not exists !`, 404)
    );
  }

  res.staus(204).json({
    status: "success",
    message: "Task was deleted successfully!",
    data: updated,
  });
});
