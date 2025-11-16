// backend/src/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/orderController');
const { protect, admin, authorize } = require('../middlewares/authMiddleware');

// Customer can create orders (protected)
router.post('/', protect, orderCtrl.createOrder);

// Get user's own orders (customers) or all orders (admin)
router.get('/my', protect, orderCtrl.getMyOrders);

// Admin can view all orders
router.get('/', ...admin, orderCtrl.getAllOrders);

// Protected - users can view their own orders, admin can view any
router.get('/:id', protect, orderCtrl.getOrderById);

// Admin can update order status
router.put('/:id/status', ...admin, orderCtrl.updateOrderStatus);

module.exports = router;
