// backend/src/routes/productRoutes.js
const express = require('express');
const { body, param, query } = require('express-validator');

const asyncHandler = require('../middlewares/asyncHandler');
const { runValidation } = require('../middlewares/validators');
const { protect, admin, vendor, adminOrVendor } = require('../middlewares/authMiddleware');
const productController = require('../controllers/productController');

const router = express.Router();

/**
 * Public routes
 */

// GET /api/products
// supports optional `search` query (name partial match) and `limit` for quick demo
router.get(
  '/',
  [
    query('search').optional().isString().trim().escape(),
    query('limit').optional().isInt({ min: 1, max: 200 }).toInt()
  ],
  runValidation,
  asyncHandler(async (req, res, next) => {
    // If you want server-side filtering, we handle it here while still using controller
    const { search, limit } = req.query;
    if (!search && !limit) {
      // call existing controller function
      return productController.getProducts(req, res, next);
    }

    // simple ad-hoc filtered query to avoid changing controller
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };

    const Product = require('../models/Product');
    const q = Product.find(filter).sort({ createdAt: -1 });
    if (limit) q.limit(limit);
    const products = await q.exec();
    res.json(products);
  })
);

// GET /api/products/vendor/my - Get vendor's own products
router.get('/vendor/my',
  ...vendor,
  asyncHandler(productController.getVendorProducts)
);

// GET /api/products/:id
router.get('/:id',
  param('id').isMongoId().withMessage('Invalid product id'),
  runValidation,
  asyncHandler(productController.getProductById)
);

/**
 * Protected routes - RBAC
 * - POST create product: Admin or Vendor
 * - PUT update product: Admin or Vendor (vendors can only update their own)
 * - DELETE product: Admin only
 */

// POST /api/products - Admin or Vendor can create products
router.post('/',
  ...adminOrVendor,
  [
    body('name').isString().notEmpty().withMessage('name required').trim().escape(),
    body('price').isNumeric().withMessage('price must be a number'),
    body('countInStock').optional().isInt({ min: 0 }).withMessage('stock must be integer >=0').toInt(),
    body('image').optional().isString(),
    body('category').optional().isString().trim().escape()
  ],
  runValidation,
  asyncHandler(productController.createProduct)
);

// PUT /api/products/:id - Admin or Vendor (vendors can only update their own)
router.put('/:id',
  ...adminOrVendor,
  [
    param('id').isMongoId().withMessage('Invalid product id'),
    body('name').optional().isString().trim().escape(),
    body('price').optional().isNumeric(),
    body('countInStock').optional().isInt({ min: 0 }).toInt(),
    body('image').optional().isString(),
    body('category').optional().isString().trim().escape()
  ],
  runValidation,
  asyncHandler(productController.updateProduct)
);

// DELETE /api/products/:id - Admin only
router.delete('/:id',
  ...admin,
  param('id').isMongoId().withMessage('Invalid product id'),
  runValidation,
  asyncHandler(productController.deleteProduct)
);

module.exports = router;
