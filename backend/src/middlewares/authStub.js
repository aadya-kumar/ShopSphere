// backend/src/middlewares/authStub.js
// Temporary stub showing how auth middleware would work.
// In later experiments replace with JWT verification.
module.exports = function authStub(req, res, next) {
  // Example: check for "x-admin" header for demo purposes
  const isAdmin = req.headers['x-admin'] === 'true';
  if (!isAdmin) {
    const err = new Error('Unauthorized: admin header missing');
    err.status = 401;
    return next(err);
  }
  // attach stub user
  req.user = { id: 'admin-demo', role: 'admin' };
  next();
};
