// backend/src/routes/offerRoutes.js
const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', offerController.getOffers);
router.post('/apply', offerController.applyOffer);

// Admin only routes
router.post('/', ...admin, offerController.createOffer);
router.put('/:id', ...admin, offerController.updateOffer);
router.delete('/:id', ...admin, offerController.deleteOffer);

module.exports = router;
