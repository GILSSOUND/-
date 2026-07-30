import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, CreditCard } from 'lucide-react';

function ProductDetail({ handleAddToCart, products }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('detail');

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
            {product.isNewProduct && <span className="badge badge-new">NEW</span>}
          </div>
          <h2 className="detail-title">{product.name}</h2>
          {product.subtitle && <p style={{fontSize: '1.1rem', color: '#888', marginBottom: '1.5rem', marginTop: '-0.5rem'}}>{product.subtitle}</p>}
          
          <div className="detail-price-box">
            {(product.originalPrice || product.discount) && (
              <div className="detail-price-top-row">
                {product.originalPrice && <span className="detail-original-price">{formatPrice(product.originalPrice)}원</span>}
                {product.discount && <span className="detail-discount">{product.discount}</span>}
              </div>
            )}
            <span className="detail-price">{formatPrice(product.price)}원</span>
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
            <button className="outline-btn wish" style={{flex: 1}}><Heart size={20} /> 찜하기</button>
            <button className="outline-btn cart" style={{flex: 1}} onClick={onAddToCartClick}><ShoppingCart size={20} /> 장바구니</button>
            <button className="primary-btn" style={{flex: 2}}><CreditCard size={20} /> 바로 구매하기</button>
          </div>
        </div>

      </div>

      {/* 하단: 상세 설명 탭 */}
      <div className="product-description-section">
        <div className="desc-tabs" style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: '2rem' }}>
          <div className={`desc-tab ${activeTab === 'detail' ? 'active' : ''}`} onClick={() => setActiveTab('detail')} style={{ flex: 1, textAlign: 'center', padding: '1rem', cursor: 'pointer', fontWeight: activeTab === 'detail' ? 'bold' : 'normal', borderBottom: activeTab === 'detail' ? '3px solid var(--primary-color)' : 'none', color: activeTab === 'detail' ? 'var(--primary-color)' : '#666' }}>상품상세정보</div>
          <div className={`desc-tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')} style={{ flex: 1, textAlign: 'center', padding: '1rem', cursor: 'pointer', fontWeight: activeTab === 'info' ? 'bold' : 'normal', borderBottom: activeTab === 'info' ? '3px solid var(--primary-color)' : 'none', color: activeTab === 'info' ? 'var(--primary-color)' : '#666' }}>구매안내</div>
          <div className={`desc-tab ${activeTab === 'review' ? 'active' : ''}`} onClick={() => setActiveTab('review')} style={{ flex: 1, textAlign: 'center', padding: '1rem', cursor: 'pointer', fontWeight: activeTab === 'review' ? 'bold' : 'normal', borderBottom: activeTab === 'review' ? '3px solid var(--primary-color)' : 'none', color: activeTab === 'review' ? 'var(--primary-color)' : '#666' }}>상품후기</div>
        </div>
        <div className="desc-content">
          {activeTab === 'detail' && (
            product.detailImageUrl ? (
              <div style={{width: '100%', marginTop: '2rem', textAlign: 'center'}}>
                <img src={product.detailImageUrl} alt="상품 상세 설명" style={{maxWidth: '100%', height: 'auto', borderRadius: '8px'}} />
              </div>
            ) : (
              <>
                <h3>상세 정보</h3>
                <p>이곳에 상품의 자세한 설명이나 조리 방법, 영양 정보 등의 이미지가 들어갑니다.</p>
                <div style={{width: '100%', height: '500px', backgroundColor: '#f1f2f6', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#747d8c', borderRadius: '8px'}}>
                  [판매자가 상세 설명 이미지를 등록하지 않았습니다]
                </div>
              </>
            )
          )}
          {activeTab === 'info' && (
            <div style={{ padding: '2rem', background: '#f9f9f9', borderRadius: '8px' }}>
              <h3>교환 및 반품 안내</h3>
              <ul style={{ marginTop: '1rem', lineHeight: '1.8', color: '#555' }}>
                <li>상품 수령 후 7일 이내 교환/반품이 가능합니다.</li>
                <li>신선식품의 경우 단순 변심에 의한 교환/반품은 불가합니다.</li>
                <li>상품에 하자가 있는 경우 배송비는 무료입니다.</li>
                <li>자세한 사항은 고객센터(1588-0000)로 문의 바랍니다.</li>
              </ul>
            </div>
          )}
          {activeTab === 'review' && (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#888', background: '#f9f9f9', borderRadius: '8px' }}>
              아직 등록된 후기가 없습니다.<br/>첫 번째 후기를 남겨주세요!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
