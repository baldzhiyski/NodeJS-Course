const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { handleResponse } = require('../utils/handlers');
const APIFeatures = require('../utils/apiFeatures');

// When we delete user , we want to delete all reviews from him/her.
// When we delete tour , we want to delete all reviews associate with the tour
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

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const data = await query;
    if (!data) {
      return next(new AppError(`No doc found with id : ${req.params.id}`, 404));
    }
    handleResponse(res, data);
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // This filters is needed so that the route for the reviews for specific tour can also work
    let filter = {};

    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .limitFields()
      .paginate()
      .sort();
    const data = await features.query;

    handleResponse(res, data, 'success');
  });
