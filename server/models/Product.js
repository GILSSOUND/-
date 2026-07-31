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
  discount: {
    type: String,
    required: false,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  detailImageUrl: {
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
  options: [{
    name: { type: String, required: true },
    additionalPrice: { type: Number, default: 0 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
