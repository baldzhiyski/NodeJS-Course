// When an error is passed to the next() here the global error handler is triggered
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
