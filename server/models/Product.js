const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['mealkit', 'new', 'local', 'direct', 'sale', 'etc'],
    default: 'mealkit'
  },
  subtitle: {
    type: String,
    required: false,
  },
  originalPrice: {
    type: Number,
    required: false,
  },
  price: {
    type: Number,
    required: true,
  },
  shippingFee: {
    type: Number,
    required: false,
    default: 3000
  },
  discount: {
    type: String,
    required: false,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  subImageUrls: {
    type: [String],
    default: [],
  },
  detailImageUrl: {
    type: String,
    required: false,
  },
  purchaseInfoImageUrl: {
    type: String,
    required: false,
  },
  detailBlocks: [{
    type: { type: String, enum: ['image', 'text'], required: true },
    content: { type: String, required: true }
  }],
  isNewProduct: {
    type: Boolean,
    default: false,
  },
  isBest: {
    type: Boolean,
    default: false,
  },
  featuredPhotos: [{ type: String }],
  reviewCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  options: [{
    name: { type: String, required: true },
    additionalPrice: { type: Number, default: 0 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
