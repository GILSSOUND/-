const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order');

// --- 결제 정보 검증 및 주문 저장 ---
router.post('/complete', async (req, res) => {
  try {
    const { imp_uid, merchant_uid, items, totalAmount, shippingFee, shippingInfo, userId } = req.body;

    // 1. 포트원 API 액세스 토큰 발급
    const getTokenResponse = await axios.post('https://api.iamport.kr/users/getToken', {
      imp_key: process.env.PORTONE_API_KEY,
      imp_secret: process.env.PORTONE_API_SECRET
    });
    const { access_token } = getTokenResponse.data.response;

    // 2. 포트원 결제 내역 단건조회
    const getPaymentData = await axios.get(`https://api.iamport.kr/payments/${imp_uid}`, {
      headers: { 
        Authorization: access_token,
        tier: process.env.PORTONE_TIER_CODE || '002'
      }
    });
    const paymentData = getPaymentData.data.response;

    // 3. 결제 금액 검증
    const amountToBePaid = totalAmount + shippingFee; // 프론트에서 계산한 총액
    if (amountToBePaid === paymentData.amount) {
      // 결제 금액 일치: DB에 주문 정보 저장
      const newOrder = new Order({
        userId,
        imp_uid,
        merchant_uid,
        items,
        totalAmount,
        shippingFee,
        shippingInfo,
        status: '결제완료'
      });
      await newOrder.save();
      
      res.json({ status: 'success', message: '일반 결제 성공' });
    } else {
      // 결제 금액 불일치: 위변조 의심 (실제 서비스에서는 여기서 환불 처리 필요)
      res.status(400).json({ status: 'forgery', message: '위조된 결제시도' });
    }
  } catch (error) {
    console.error('Order Complete Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ status: 'error', message: '결제 검증 및 저장 실패' });
  }
});

// --- 유저별 주문 내역 조회 (마이페이지용) ---
router.get('/my/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// --- 전체 주문 내역 조회 (관리자용) ---
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('userId', 'name email phone');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all orders' });
  }
});

// --- 주문 상태 변경 (관리자용) ---
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
