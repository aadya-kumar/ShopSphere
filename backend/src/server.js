// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const offerRoutes = require('./routes/offerRoutes');
const errorHandler = require('./middlewares/errorMiddleware');
const { getSessionType, SESSION_TYPES, serverSessionConfig, cookieConfig } = require('./config/sessionConfig');

const app = express();

// -------------------------------
// GLOBAL MIDDLEWARE
// -------------------------------

// Security headers
app.use(helmet());

// JSON parser
app.use(express.json({ limit: '10kb' }));

// Cookie parser (needed for cookie-based and server-side sessions)
app.use(cookieParser(process.env.COOKIE_SECRET || 'your-cookie-secret-change-in-production'));

// Enable CORS with credentials for cookies
// Allow multiple origins for production (Vercel) and development
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim().replace(/\/$/, ''))
  : ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    const isExactMatch = allowedOrigins.some(allowed => origin === allowed);
    const isVercelDomain = origin.includes('.vercel.app');
    
    if (isExactMatch || isVercelDomain) {
      callback(null, true);
    } else {
      // In development, be more permissive
      if (process.env.NODE_ENV !== 'production') {
        console.log(`⚠️  CORS: Allowing origin ${origin} (development mode)`);
        callback(null, true);
      } else {
        console.log(`❌ CORS: Blocked origin ${origin}. Allowed origins:`, allowedOrigins);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true // Allow cookies to be sent
}));

// Gzip compression
app.use(compression());

// Session management setup (based on SESSION_TYPE env variable)
// Note: Server-side sessions will be initialized after DB connection
const sessionType = getSessionType();
console.log(`🔐 Session Management Type: ${sessionType.toUpperCase()}`);

if (sessionType === SESSION_TYPES.SERVER_SIDE) {
  // Server-side sessions will be initialized after DB connection
  console.log('⏳ Server-side sessions will be enabled after DB connection');
} else if (sessionType === SESSION_TYPES.COOKIE) {
  console.log('✅ Cookie-based sessions enabled');
} else {
  console.log('✅ JWT token-based authentication enabled');
}

// Logging (dev-friendly)
app.use(morgan('tiny'));

// Rate Limiter (applies to all /api/* routes)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,            // limit each IP to 100 requests per minute
  message: { message: 'Too many requests, try again later' }
});
app.use('/api', limiter);

// -------------------------------
// ROUTES
// -------------------------------

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Mount your existing modular routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/users', require('./routes/userRoutes'));

// Session management routes
try {
  const sessionRoutes = require('./routes/sessionRoutes');
  app.use('/api/session', sessionRoutes);
  console.log('✅ Session routes mounted at /api/session');
  console.log('   Available endpoints: GET /api/session/compare, GET /api/session/info, POST /api/session/logout');
} catch (error) {
  console.error('❌ Error loading session routes:', error.message);
  console.error(error.stack);
}

// 404 handler (if no route matches)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Central error handler
app.use(errorHandler);

// -------------------------------
// SERVER + DB CONNECTION
// -------------------------------
const PORT = process.env.PORT || 5001;

connectDB(process.env.MONGO_URI).then(() => {
  // Initialize server-side sessions after DB connection (if needed)
  if (sessionType === SESSION_TYPES.SERVER_SIDE) {
    const session = require('express-session');
    app.use(session(serverSessionConfig(process.env.MONGO_URI)));
    console.log('✅ Server-side sessions enabled with MongoDB store');
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`\n📚 Session Management Guide: See SESSION_MANAGEMENT_GUIDE.md`);
    console.log(`🔧 Change SESSION_TYPE in .env to switch methods (jwt/cookie/server-side)\n`);
  });
});
