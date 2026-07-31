import React from 'react';

function Cart({ cartItems }) {
  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR');
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

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
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', marginTop: '0.5rem' }}>
                    <div className="cart-item-price">{formatPrice(item.price)}원</div>
                    <div style={{ color: 'var(--text-muted)' }}>{item.quantity || 1}개</div>
                  </div>
                </div>
                <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--primary-color)' }}>
                  {formatPrice(item.price * (item.quantity || 1))}원
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
              <span>{totalPrice > 50000 ? '무료' : '3,000원'}</span>
            </div>
            <div className="summary-total">
              <span>총 결제 금액</span>
              <span>{formatPrice(totalPrice + (totalPrice > 50000 ? 0 : 3000))}원</span>
            </div>
            <button className="primary-btn checkout-btn">구매하기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
