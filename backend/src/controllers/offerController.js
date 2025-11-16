// backend/src/controllers/offerController.js
const Offer = require('../models/Offer');

exports.getOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({ active: true });
    res.json(offers);
  } catch (err) {
    next(err);
  }
};

// Create a new offer
exports.createOffer = async (req, res, next) => {
  try {
    const { title, code, discountPercent, validFrom, validUntil, active } = req.body;
    if (!title || !code || discountPercent === undefined) {
      return res.status(400).json({ message: 'Title, code, and discountPercent are required' });
    }

    const offer = await Offer.create({
      title,
      code: code.toUpperCase(),
      discountPercent,
      validFrom,
      validUntil,
      active: active !== undefined ? active : true
    });

    res.status(201).json(offer);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Offer code already exists' });
    }
    next(err);
  }
};

// Apply an offer to a cart: body { code: string, itemsPrice: number }
exports.applyOffer = async (req, res, next) => {
  try {
    const { code, itemsPrice } = req.body;
    if (!code) return res.status(400).json({ message: 'Code required' });

    const offer = await Offer.findOne({ code: code.toUpperCase(), active: true });
    if (!offer) return res.status(404).json({ message: 'Offer not found or inactive' });

    // optional validity date checks can be added here
    const discount = +(itemsPrice * (offer.discountPercent / 100)).toFixed(2);
    const newTotal = +(itemsPrice - discount).toFixed(2);

    res.json({ offer: { code: offer.code, discountPercent: offer.discountPercent, title: offer.title }, discount, newTotal });
  } catch (err) {
    next(err);
  }
};

// Update an offer
exports.updateOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, code, discountPercent, validFrom, validUntil, active } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (code) updateData.code = code.toUpperCase();
    if (discountPercent !== undefined) updateData.discountPercent = discountPercent;
    if (validFrom !== undefined) updateData.validFrom = validFrom;
    if (validUntil !== undefined) updateData.validUntil = validUntil;
    if (active !== undefined) updateData.active = active;

    const offer = await Offer.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    res.json(offer);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Offer code already exists' });
    }
    next(err);
  }
};

// Delete an offer
exports.deleteOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findByIdAndDelete(id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    res.json({ message: 'Offer deleted successfully' });
  } catch (err) {
    next(err);
  }
};
