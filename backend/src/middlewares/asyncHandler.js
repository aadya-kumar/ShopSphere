// backend/src/middlewares/asyncHandler.js
// wrapper to catch async errors and forward to errorHandler
module.exports = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
  