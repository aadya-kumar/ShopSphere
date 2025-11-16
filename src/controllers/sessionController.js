// backend/src/controllers/sessionController.js
// Controller for session management testing and comparison

const { getSessionType, SESSION_TYPES } = require('../config/sessionConfig');

/**
 * Get current session information
 */
exports.getSessionInfo = (req, res) => {
  const sessionType = getSessionType();
  const info = {
    sessionType: sessionType,
    isAuthenticated: !!req.user,
    user: req.user ? {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    } : null
  };

  // Add session-specific information
  switch (sessionType) {
    case SESSION_TYPES.JWT:
      info.details = {
        method: 'JWT Token in Authorization Header',
        storage: 'Client-side (localStorage/sessionStorage)',
        stateless: true,
        tokenPresent: !!req.headers.authorization
      };
      break;

    case SESSION_TYPES.COOKIE:
      info.details = {
        method: 'JWT Token in Signed HTTP-only Cookie',
        storage: 'Browser Cookie (HTTP-only, signed)',
        stateless: true,
        cookiePresent: !!req.signedCookies?.shop_sphere_token
      };
      break;

    case SESSION_TYPES.SERVER_SIDE:
      info.details = {
        method: 'Server-side Session with MongoDB Store',
        storage: 'MongoDB (server-side)',
        stateless: false,
        sessionId: req.sessionID,
        sessionPresent: !!req.session?.userId
      };
      break;
  }

  res.json(info);
};

/**
 * Logout - handles all session types
 */
exports.logout = (req, res) => {
  const sessionType = getSessionType();

  switch (sessionType) {
    case SESSION_TYPES.JWT:
      // JWT: Client should remove token
      res.json({ message: 'Logged out. Please remove token from client storage.' });
      break;

    case SESSION_TYPES.COOKIE:
      // Cookie: Clear the cookie
      res.clearCookie('shop_sphere_token');
      res.json({ message: 'Logged out. Cookie cleared.' });
      break;

    case SESSION_TYPES.SERVER_SIDE:
      // Server-side: Destroy session
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: 'Error destroying session' });
        }
        res.clearCookie('shop_sphere_sid');
        res.json({ message: 'Logged out. Session destroyed.' });
      });
      break;

    default:
      res.json({ message: 'Logged out' });
  }
};

/**
 * Compare session management methods
 */
exports.compareMethods = (req, res) => {
  const comparison = {
    jwt: {
      name: 'JWT (JSON Web Tokens)',
      pros: [
        'Stateless - no server storage needed',
        'Scalable - works across multiple servers',
        'Mobile-friendly',
        'Can include user data in token'
      ],
      cons: [
        'Token size can be large',
        'Cannot revoke token until expiry',
        'Stored client-side (XSS risk if not handled properly)',
        'Requires secure storage'
      ],
      useCase: 'Best for: APIs, mobile apps, microservices, stateless architectures'
    },
    cookie: {
      name: 'Cookie-based (Signed HTTP-only Cookies)',
      pros: [
        'HTTP-only cookies prevent XSS attacks',
        'Automatic cookie handling by browser',
        'Signed cookies prevent tampering',
        'Stateless (JWT in cookie)'
      ],
      cons: [
        'CSRF vulnerability (mitigated with SameSite)',
        'Cookie size limitations',
        'Browser dependency',
        'Requires HTTPS in production'
      ],
      useCase: 'Best for: Traditional web applications, when you want automatic cookie handling'
    },
    serverSide: {
      name: 'Server-side Sessions',
      pros: [
        'Most secure - session data never leaves server',
        'Can revoke sessions immediately',
        'No size limitations',
        'Works with any client'
      ],
      cons: [
        'Requires server-side storage (database)',
        'Not stateless - harder to scale horizontally',
        'Requires sticky sessions or shared storage',
        'More server resources'
      ],
      useCase: 'Best for: High-security applications, when you need session revocation, traditional web apps'
    }
  };

  res.json({
    currentMethod: getSessionType(),
    comparison: comparison,
    recommendation: 'Choose based on your security requirements, scalability needs, and application type.'
  });
};

