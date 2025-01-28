const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { handleResponse } = require('../utils/handlers');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(
        new AppError(`No document found with id : ${req.params.id}`, 404)
      );
    }
    handleResponse(res, null, 'success', 204);
  });
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const updated = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedTour) {
      return next(new AppError(`No doc found with id : ${req.params.id}`, 404));
    }
    handleResponse(res, updated);
  });
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const created = await Model.create(req.body);
    handleResponse(res, created, 'success', 201);
  });
