exports.handleResponse = (res, data, message = 'success', status = 200) => {
  res.status(status).json({
    status: message,
    results: data?.length,
    data,
  });
};
