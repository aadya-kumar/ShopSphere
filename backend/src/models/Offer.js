// backend/src/models/Offer.js
const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  discountPercent: { type: Number, required: true },
  validFrom: Date,
  validUntil: Date,
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
