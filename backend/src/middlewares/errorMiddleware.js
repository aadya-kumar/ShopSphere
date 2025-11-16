// backend/src/middlewares/errorMiddleware.js
function errorHandler(err, req, res, next) {
  console.error(err); // log to console (or a logger)
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  // Optionally include stack trace in non-production
  const payload = { message };
  if (process.env.NODE_ENV !== 'production') payload.stack = err.stack;
  res.status(status).json(payload);
}

module.exports = errorHandler;
