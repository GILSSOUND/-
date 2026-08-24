const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  productIds: [{ type: String }],
  rating: { type: Number, required: true, min: 1, max: 5 },
  content: { type: String, required: true },
  images: [{ type: String }],
  pointsAwarded: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
