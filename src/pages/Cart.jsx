import React from 'react';
import { Trash2 } from 'lucide-react';

function Cart({ cartItems, handleRemoveFromCart, handleUpdateQuantity, handleChangeCartItemOption, products }) {
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

  return (
    <div className="page-container">
      <h2 className="page-title">장바구니</h2>
      
      {cartItems.length === 0 ? (
        <div className="empty-state">
          <h3>장바구니가 비어있습니다.</h3>
          <p>원하는 상품을 찾아 장바구니에 담아보세요!</p>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item, index) => (
              <div key={index} className="cart-item">
                <img src={item.imageUrl} alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                    <div className="cart-item-price" style={{margin: 0}}>{formatPrice(item.price)}원</div>
                    
                    {/* 수량 조절 컨트롤러 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f2f6', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      <button onClick={() => handleUpdateQuantity(index, -1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                      <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '0.9rem', fontWeight: '600' }}>{item.quantity || 1}</span>
                      <button onClick={() => handleUpdateQuantity(index, 1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                    </div>

                    {/* 옵션 변경 컨트롤러 */}
                    {(() => {
                      const origId = item._originalId || item._id || item.id;
                      const originalProduct = products?.find(p => p._id === origId || p.id === origId);
                      if (originalProduct && originalProduct.options && originalProduct.options.length > 0) {
                        return (
                          <select
                            value={item.selectedOptionName || ''}
                            onChange={(e) => handleChangeCartItemOption(index, e.target.value)}
                            style={{ padding: '0.3rem 0.5rem', borderRadius: '4px', border: '1px solid #ddd', background: 'white', outline: 'none', fontSize: '0.9rem' }}
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
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleRemoveFromCart(index)}
                    style={{ background: 'transparent', border: 'none', color: '#ff4757', cursor: 'pointer' }}
                    title="삭제"
                  >
                    <Trash2 size={20} />
                  </button>
                  <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--primary-color)' }}>
                    {formatPrice(item.price * (item.quantity || 1))}원
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
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
            <button className="primary-btn checkout-btn">구매하기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
