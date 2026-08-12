const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  selectedOptionName: { type: String, default: '' },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  imageUrl: { type: String }
});

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imp_uid: { type: String, required: true, unique: true }, // 포트원 결제 고유번호
  merchant_uid: { type: String, required: true, unique: true }, // 가맹점 주문번호
  
  items: [OrderItemSchema],
  
  totalAmount: { type: Number, required: true },
  shippingFee: { type: Number, default: 3000 },
  
  shippingInfo: {
    receiverName: { type: String, required: true },
    receiverPhone: { type: String, required: true },
    zonecode: { type: String, required: true },
    address: { type: String, required: true },
    detailAddress: { type: String, required: true },
    memo: { type: String, default: '' }
  },
  
  status: { 
    type: String, 
    enum: ['결제대기', '결제완료', '상품준비중', '배송중', '배송완료', '취소됨', '환불됨'],
    default: '결제완료' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
