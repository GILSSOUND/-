import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ProductDetail({ handleAddToCart, products }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const product = products.find(p => p._id === id || p.id === parseInt(id));

  if (!product) {
    return (
      <div className="page-container empty-state">
        <h3>상품을 찾을 수 없습니다.</h3>
        <button className="primary-btn" onClick={() => navigate(-1)} style={{marginTop: '2rem'}}>뒤로 가기</button>
      </div>
    );
  }

  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR');
  };

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const onAddToCartClick = () => {
    // 상품 객체에 수량을 추가해서 장바구니로 보낼 수도 있지만, 현재는 기본 상품만 넘깁니다.
    // 여러 개 담기를 처리하려면 App.jsx의 handleAddToCart 수정 필요. (현재는 간소화)
    for(let i=0; i<quantity; i++) {
      handleAddToCart(product, { stopPropagation: () => {} });
    }
  };

  return (
    <div className="page-container">
      <div className="product-detail-layout">
        
        {/* 왼쪽: 상품 이미지 */}
        <div className="product-detail-img-wrapper">
          <img src={product.imageUrl} alt={product.name} className="product-detail-img" />
        </div>

        {/* 오른쪽: 상품 정보 */}
        <div className="product-detail-info">
          <div className="detail-badges">
            {product.isBest && <span className="badge badge-best">BEST</span>}
            {product.isNew && <span className="badge badge-new">NEW</span>}
          </div>
          <h2 className="detail-title">{product.name}</h2>
          
          <div className="detail-price-box">
            {product.discount && <span className="detail-discount">{product.discount}</span>}
            <span className="detail-price">{formatPrice(product.price)}원</span>
            {product.originalPrice && <span className="detail-original-price">{formatPrice(product.originalPrice)}원</span>}
          </div>

          <div className="detail-desc">
            신선한 재료로 정성을 다해 준비했습니다. <br/>
            집에서도 간편하게 맛있는 한 끼를 즐겨보세요!
          </div>

          {/* 수량 선택 */}
          <div className="quantity-selector">
            <span className="quantity-label">수량</span>
            <div className="quantity-controls">
              <button onClick={handleDecrease}>-</button>
              <span>{quantity}</span>
              <button onClick={handleIncrease}>+</button>
            </div>
          </div>

          <div className="total-price-box">
            <span>총 상품 금액</span>
            <span className="total-price-val">{formatPrice(product.price * quantity)}원</span>
          </div>

          <div className="detail-actions">
            <button className="action-btn wish" style={{flex: 1}}>❤️ 찜하기</button>
            <button className="primary-btn" style={{flex: 2}} onClick={onAddToCartClick}>🛒 장바구니 담기</button>
          </div>
        </div>

      </div>

      {/* 하단: 상세 설명 탭 (더미) */}
      <div className="product-description-section">
        <div className="desc-tabs">
          <div className="desc-tab active">상품상세정보</div>
          <div className="desc-tab">구매안내</div>
          <div className="desc-tab">상품후기 (0)</div>
          <div className="desc-tab">상품문의 (0)</div>
        </div>
        <div className="desc-content">
          <h3>상세 정보</h3>
          <p>이곳에 상품의 자세한 설명이나 조리 방법, 영양 정보 등의 이미지가 들어갑니다.</p>
          <div style={{width: '100%', height: '500px', backgroundColor: '#f1f2f6', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#747d8c'}}>
            [상세 설명 이미지 영역]
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
