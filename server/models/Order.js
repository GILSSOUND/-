const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: { type: String }, // ObjectId 대신 String으로 변경하여 더미 데이터 호환
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
    hasReview: { type: Boolean, default: false },
  shippingFee: { type: Number, default: 3000 },
  
  shippingInfo: {
    receiverName: { type: String, required: true },
    receiverPhone: { type: String, required: true },
    zonecode: { type: String, required: true },
    address: { type: String, required: true },
    detailAddress: { type: String, required: true },
    memo: { type: String, default: '' },
    doorPassword: { type: String, default: '' },
    extraMemo: { type: String, default: '' }
  },
  
  // 송장 정보
  courier: { type: String, default: '' },
  trackingNumber: { type: String, default: '' },

  // 클레임(교환/반품) 정보
  claim: {
    type: { type: String, enum: ['exchange', 'return'], default: null }, // 교환 또는 반품
    reason: { type: String, default: '' },
    customReason: { type: String, default: '' },
    imageUrl: { type: String, default: '' }, // 첨부사진
    exchangeShipping: {
      receiverName: { type: String, default: '' },
      receiverPhone: { type: String, default: '' },
      zonecode: { type: String, default: '' },
      address: { type: String, default: '' },
      detailAddress: { type: String, default: '' },
      extraMemo: { type: String, default: '' }
    }
  },
  
  status: { 
    type: String, 
    enum: ['결제대기', '결제완료', '상품준비중', '배송중', '배송완료', '취소됨', '환불됨', '반품요청', '교환요청'],
    default: '결제완료' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
