// backend/src/config/sessionConfig.js
// Configuration for different session management strategies

const session = require('express-session');
const MongoStore = require('connect-mongo');

// Session management strategy types
const SESSION_TYPES = {
  JWT: 'jwt',
  COOKIE: 'cookie',
  SERVER_SIDE: 'server-side'
};

// Get session type from environment variable (default: jwt)
const getSessionType = () => {
  return process.env.SESSION_TYPE || SESSION_TYPES.JWT;
};

// JWT Configuration (already implemented)
const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '30d'
};

// Cookie-based session configuration
const cookieConfig = {
  name: 'shop_sphere_token', // Changed to match middleware
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  signed: true // Use signed cookies
};

// Server-side session configuration
const serverSessionConfig = (mongoUri) => {
  return {
    name: 'shop_sphere_sid',
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    },
    store: MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: 'sessions',
      ttl: 30 * 24 * 60 * 60 // 30 days in seconds
    })
  };
};

module.exports = {
  SESSION_TYPES,
  getSessionType,
  jwtConfig,
  cookieConfig,
  serverSessionConfig
};

