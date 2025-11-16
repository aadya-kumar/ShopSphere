// backend/src/controllers/orderController.js
const Order = require('../models/Order');
const Product = require('../models/Product');

// -------------------------------------------------------
// CREATE ORDER (Merged: your logic + safer stock handling)
// -------------------------------------------------------
exports.createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // -------------------------
    // 1. Calculate prices
    // -------------------------
    const itemsPrice = orderItems.reduce(
      (sum, it) => sum + it.price * it.qty,
      0
    );

    const taxPrice = +(itemsPrice * 0.05).toFixed(2);     // 5% tax
    const shippingPrice = itemsPrice > 1000 ? 0 : 50;     // shipping rule
    const totalPrice = +(itemsPrice + taxPrice + shippingPrice).toFixed(2);

    // -------------------------
    // 2. Validate stock BEFORE creating order
    // -------------------------
    for (const item of orderItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }

      if (product.countInStock < item.qty) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Available: ${product.countInStock}`
        });
      }
    }

    // -------------------------
    // 3. Create order document
    // -------------------------
    const order = new Order({
      user: req.user._id,  // Associate order with logged-in user
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      status: "Pending"     // default status (can change later)
    });

    const saved = await order.save();

    // -------------------------
    // 4. Decrement stock safely AFTER order is saved
    // -------------------------
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { countInStock: -item.qty } }
      );
    }

    res.status(201).json(saved);

  } catch (err) {
    next(err);
  }
};

// -------------------------------------------------------
// GET ALL ORDERS (Admin / Dashboard)
// -------------------------------------------------------
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('orderItems.product', 'name price');

    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// Alias for RESTfulness (optional)
exports.getAllOrders = exports.getOrders;

// -------------------------------------------------------
// GET MY ORDERS (Customer's own orders)
// -------------------------------------------------------
exports.getMyOrders = async (req, res, next) => {
  try {
    // Admin can see all, customers see only their own
    const query = req.user.role === 'admin' ? {} : { user: req.user._id };
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('orderItems.product', 'name price image');

    res.json(orders);
  } catch (err) {
    next(err);
  }
};


// -------------------------------------------------------
// GET ORDER BY ID
// -------------------------------------------------------
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('orderItems.product', 'name price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Customers can only view their own orders, Admin can view any
    if (req.user.role !== 'admin' && order.user && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
};

// -------------------------------------------------------
// UPDATE ORDER STATUS (Admin)
// -------------------------------------------------------
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status || order.status;
    const updated = await order.save();

    res.json(updated);
  } catch (err) {
    next(err);
  }
};
