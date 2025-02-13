const Task = require("../models/taskModel");
const APIFeatures = require("../utils/apiFeatures");

exports.getAllTasks = async (req, res, next) => {
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
};

exports.getSingleTask = async (req, res, next) => {
  res.send("Success");
};

exports.updateTask = async (req, res, next) => {
  req.body.updatedAt = Date.now();
  const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
  }

  res.staus(200).json({
    status: "success",
    message: "Tour was updated successfully",
    data: updated,
  });
};

exports.createTask = async (req, res, next) => {
  res.send("Success");
};

exports.deleteTask = async (req, res, next) => {
  res.send("Success");
};
