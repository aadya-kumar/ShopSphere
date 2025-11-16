// backend/src/routes/sessionRoutes.js
const express = require('express');
const router = express.Router();

try {
  const sessionCtrl = require('../controllers/sessionController');
  const { authenticate } = require('../middlewares/sessionMiddleware');

  // Get current session information (protected)
  router.get('/info', authenticate, sessionCtrl.getSessionInfo);

  // Logout (protected)
  router.post('/logout', authenticate, sessionCtrl.logout);

  // Compare session management methods (public)
  router.get('/compare', sessionCtrl.compareMethods);

  console.log('Session routes registered: /info, /logout, /compare');
} catch (error) {
  console.error('Error loading session routes:', error);
}

module.exports = router;

