// backend/src/middlewares/sessionMiddleware.js
// Middleware for different session management strategies

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getSessionType, SESSION_TYPES, jwtConfig } = require('../config/sessionConfig');

/**
 * Universal authentication middleware that works with all session types
 */
exports.authenticate = async (req, res, next) => {
  const sessionType = getSessionType();
  
  try {
    switch (sessionType) {
      case SESSION_TYPES.JWT:
        return await authenticateJWT(req, res, next);
      
      case SESSION_TYPES.COOKIE:
        return await authenticateCookie(req, res, next);
      
      case SESSION_TYPES.SERVER_SIDE:
        return await authenticateServerSession(req, res, next);
      
      default:
        return await authenticateJWT(req, res, next);
    }
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

/**
 * JWT Authentication (Token in Authorization header)
 */
async function authenticateJWT(req, res, next) {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.sessionType = SESSION_TYPES.JWT;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
}

/**
 * Cookie-based Authentication (Token in signed cookie)
 */
async function authenticateCookie(req, res, next) {
  const token = req.signedCookies?.shop_sphere_token;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no cookie token' });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.sessionType = SESSION_TYPES.COOKIE;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, cookie token failed' });
  }
}

/**
 * Server-side Session Authentication
 */
async function authenticateServerSession(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'Not authorized, no session' });
  }

  try {
    req.user = await User.findById(req.session.userId).select('-password');
    
    if (!req.user) {
      // Clear invalid session
      req.session.destroy();
      return res.status(401).json({ message: 'User not found' });
    }

    req.sessionType = SESSION_TYPES.SERVER_SIDE;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Session authentication failed' });
  }
}

/**
 * Role-based authorization (works with all session types)
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this route. Required roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

// Convenience middleware
exports.protect = exports.authenticate;
exports.admin = [exports.authenticate, exports.authorize('admin')];
exports.vendor = [exports.authenticate, exports.authorize('vendor')];
exports.adminOrVendor = [exports.authenticate, exports.authorize('admin', 'vendor')];

