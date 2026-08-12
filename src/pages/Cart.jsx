import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api';
import { useNavigate } from 'react-router-dom';

function Cart({ cartItems, handleRemoveFromCart, handleUpdateQuantity, handleChangeCartItemOption, products }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    receiverName: user?.name || '',
    receiverPhone: user?.phone || '',
    zonecode: '',
    address: '',
    detailAddress: '',
    memo: ''
  });

  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR');
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

  const baseShippingFee = cartItems.length > 0 
    ? Math.max(...cartItems.map(item => {
        const origId = item._originalId || item._id || item.id;
        const originalProduct = products?.find(p => p._id === origId || p.id === origId);
        return originalProduct && originalProduct.shippingFee !== undefined ? Number(originalProduct.shippingFee) : 3000;
      }))
    : 0;

  const finalShippingFee = totalPrice > 50000 ? 0 : baseShippingFee;

  const handleDaumPostcode = () => {
    new window.daum.Postcode({
      oncomplete: function(data) {
        let fullAddr = data.address;
        let extraAddr = '';

        if (data.addressType === 'R') {
          if (data.bname !== '') extraAddr += data.bname;
          if (data.buildingName !== '') extraAddr += (extraAddr !== '' ? `, ${data.buildingName}` : data.buildingName);
          fullAddr += (extraAddr !== '' ? ` (${extraAddr})` : '');
        }

        setShippingInfo(prev => ({
          ...prev,
          zonecode: data.zonecode,
          address: fullAddr
        }));
      }
    }).open();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const requestPay = () => {
    if (!shippingInfo.receiverName || !shippingInfo.receiverPhone || !shippingInfo.address || !shippingInfo.detailAddress) {
      alert('배송지 정보를 모두 입력해주세요.');
      return;
    }

    if (!window.IMP) {
      alert('결제 모듈을 불러오지 못했습니다.');
      return;
    }

    const IMP = window.IMP;
    // 하위 상점 티어코드 적용 (init 대신 agency 사용)
    IMP.agency('imp28885142', '002');

    const merchant_uid = `order_${new Date().getTime()}`;
    const amount = totalPrice + finalShippingFee;

    const data = {
      pg: 'kakaopay', // 설정된 카카오페이 테스트 채널 지정
      pay_method: 'card',
      merchant_uid: merchant_uid,
      name: cartItems.length > 1 ? `${cartItems[0].name} 외 ${cartItems.length - 1}건` : cartItems[0].name,
      amount: amount,
      buyer_email: user?.email || '',
      buyer_name: user?.name || shippingInfo.receiverName,
      buyer_tel: user?.phone || shippingInfo.receiverPhone,
      buyer_addr: `${shippingInfo.address} ${shippingInfo.detailAddress}`,
      buyer_postcode: shippingInfo.zonecode
    };

    IMP.request_pay(data, async (response) => {
      if (response.success) {
        try {
          // 결제 성공 시 서버에 내역 저장
          const orderData = {
            userId: user?._id || user?.id,
            imp_uid: response.imp_uid,
            merchant_uid: response.merchant_uid,
            items: cartItems.map(item => ({
              productId: item._originalId || item._id || item.id,
              name: item.name,
              selectedOptionName: item.selectedOptionName || '',
              price: item.price,
              quantity: item.quantity || 1,
              imageUrl: item.imageUrl
            })),
            totalAmount: totalPrice,
            shippingFee: finalShippingFee,
            shippingInfo
          };

          const result = await createOrder(orderData);
          if (result.status === 'success') {
            alert('결제가 완료되었습니다!');
            // 장바구니 비우기 처리(App.js에서 localStorage 초기화 필요)
            window.location.href = '/mypage'; 
          } else {
            alert('결제 검증에 실패했습니다. 관리자에게 문의하세요.');
          }
        } catch (error) {
          console.error(error);
          alert('주문 저장 중 오류가 발생했습니다: ' + (error.response?.data?.message || error.message));
        }
      } else {
        alert(`결제 실패: ${response.error_msg}`);
      }
    });
  };

  return (
    <div className="page-container">
      <h2 className="page-title">{checkoutMode ? '주문/결제' : '장바구니'}</h2>
      
      {cartItems.length === 0 ? (
        <div className="empty-state">
          <h3>장바구니가 비어있습니다.</h3>
          <p>원하는 상품을 찾아 장바구니에 담아보세요!</p>
        </div>
      ) : (
        <div className="cart-content" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div className="cart-items" style={{ flex: '1 1 60%' }}>
            {!checkoutMode ? (
              cartItems.map((item, index) => (
                <div key={index} className="cart-item">
                  <img src={item.imageUrl} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <div className="cart-item-controls">
                      <div className="cart-item-price">{formatPrice(item.price)}원</div>
                      
                      {/* 수량 조절 컨트롤러 */}
                      <div className="cart-qty-ctrl">
                        <button onClick={() => handleUpdateQuantity(index, -1)}>-</button>
                        <span>{item.quantity || 1}</span>
                        <button onClick={() => handleUpdateQuantity(index, 1)}>+</button>
                      </div>

                      {/* 옵션 변경 컨트롤러 */}
                      {(() => {
                        const origId = item._originalId || item._id || item.id;
                        const originalProduct = products?.find(p => p._id === origId || p.id === origId);
                        if (originalProduct && originalProduct.options && originalProduct.options.length > 0) {
                          return (
                            <select
                              className="cart-opt-select"
                              value={item.selectedOptionName || ''}
                              onChange={(e) => handleChangeCartItemOption(index, e.target.value)}
                            >
                              <option value="">옵션 선택안함</option>
                              {originalProduct.options.map((opt, i) => (
                                <option key={i} value={opt.name}>{opt.name} {opt.additionalPrice > 0 ? `(+${formatPrice(opt.additionalPrice)}원)` : ''}</option>
                              ))}
                            </select>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                  
                  <div className="cart-item-actions">
                    <button 
                      onClick={() => handleRemoveFromCart(index)}
                      className="cart-trash-btn"
                      title="삭제"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="cart-item-total">
                      {formatPrice(item.price * (item.quantity || 1))}원
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="shipping-info-form" style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginBottom: '1.5rem', borderBottom: '2px solid #333', paddingBottom: '0.8rem' }}>배송지 정보</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>받으시는 분</label>
                    <input type="text" name="receiverName" value={shippingInfo.receiverName} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>휴대폰 번호</label>
                    <input type="text" name="receiverPhone" value={shippingInfo.receiverPhone} onChange={handleInputChange} placeholder="010-0000-0000" style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>배송 주소</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input type="text" readOnly value={shippingInfo.zonecode} placeholder="우편번호" style={{ width: '150px', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd', background: '#f5f5f5' }} />
                      <button type="button" onClick={handleDaumPostcode} style={{ padding: '0.8rem 1.5rem', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>주소 찾기</button>
                    </div>
                    <input type="text" readOnly value={shippingInfo.address} placeholder="기본 주소" style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd', background: '#f5f5f5', marginBottom: '0.5rem' }} />
                    <input type="text" name="detailAddress" value={shippingInfo.detailAddress} onChange={handleInputChange} placeholder="상세 주소 입력" style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>배송 메모 (선택)</label>
                    <input type="text" name="memo" value={shippingInfo.memo} onChange={handleInputChange} placeholder="문 앞에 놓아주세요" style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="cart-summary" style={{ flex: '1 1 30%', minWidth: '300px' }}>
            <h3>결제 예상 금액</h3>
            <div className="summary-row">
              <span>상품 금액</span>
              <span>{formatPrice(totalPrice)}원</span>
            </div>
            <div className="summary-row">
              <span>배송비</span>
              <span>{finalShippingFee === 0 ? '무료' : `${formatPrice(finalShippingFee)}원`}</span>
            </div>
            <div className="summary-total">
              <span>총 결제 금액</span>
              <span>{formatPrice(totalPrice + finalShippingFee)}원</span>
            </div>
            
            {!checkoutMode ? (
              <button className="primary-btn checkout-btn" onClick={() => setCheckoutMode(true)}>구매하기</button>
            ) : (
              <button className="primary-btn checkout-btn" onClick={requestPay} style={{ background: '#e53935' }}>{formatPrice(totalPrice + finalShippingFee)}원 결제하기</button>
            )}
            
            {checkoutMode && (
              <button className="outline-btn checkout-btn" onClick={() => setCheckoutMode(false)} style={{ marginTop: '0.5rem' }}>장바구니로 돌아가기</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
