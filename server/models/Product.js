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
  isNewProduct: {
    type: Boolean,
    default: false,
  },
  isBest: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
