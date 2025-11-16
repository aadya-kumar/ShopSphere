const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
// Use new session middleware that supports all session types
const { authenticate, authorize } = require('../middlewares/sessionMiddleware');

// Public routes - must be before /:id route
router.post('/register', userCtrl.registerUser);
router.post('/login', userCtrl.loginUser);

// Protected routes
router.get('/profile', authenticate, userCtrl.getUserProfile);

// Admin only - update user role (must be before /:id route)
router.put('/:id/role', authenticate, authorize('admin'), userCtrl.updateUserRole);

// Get user by ID (public, but returns limited info)
router.get('/:id', userCtrl.getUserProfile);

module.exports = router;
