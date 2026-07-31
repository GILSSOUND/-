import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, CreditCard } from 'lucide-react';

function ProductDetail({ handleAddToCart, handleToggleWishlist, products }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('detail');
  const [selectedOption, setSelectedOption] = useState('');

  const product = products.find(p => p._id === id || p.id === parseInt(id));

  if (!product) {
    return (
      <div className="page-container empty-state">
        <h3>상품을 찾을 수 없습니다.</h3>
        <button className="primary-btn" onClick={() => navigate(-1)} style={{marginTop: '2rem'}}>뒤로 가기</button>
      </div>
    );
  }

  // 선택된 옵션 객체 찾기
  const currentOption = product.options?.find(opt => opt.name === selectedOption) || null;
  // 옵션 추가금액 계산
  const additionalPrice = currentOption ? currentOption.additionalPrice : 0;
  // 최종 단가 (기본가 + 옵션가)
  const finalUnitPrice = product.price + additionalPrice;
  // 총 결제 금액
  const totalPrice = finalUnitPrice * quantity;

  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR');
  };

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const onAddToCartClick = (e) => {
    e.stopPropagation();
    if (product.options && product.options.length > 0 && !selectedOption) {
      alert("상품 옵션을 선택해주세요.");
      return;
    }

    const productWithOption = {
      ...product,
      name: currentOption ? `${product.name} [옵션: ${currentOption.name}]` : product.name,
      price: finalUnitPrice,
      _originalId: product._id || product.id, // 장바구니에서 원본 아이디 참조용
      selectedOptionName: selectedOption // 장바구니에서 옵션 변경을 위해 저장
    };

    handleAddToCart(productWithOption, { stopPropagation: () => {} }, quantity);
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
            {product.originalPrice && (
              <div className="detail-price-top-row">
                <span className="detail-original-price">{formatPrice(product.originalPrice)}원</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span className="detail-price">{formatPrice(finalUnitPrice)}원</span>
              {product.discount && <span className="detail-discount">{product.discount}</span>}
            </div>
          </div>

          {/* 추가 혜택 박스 */}
          <div className="detail-benefits-box" style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee', marginBottom: '2rem' }}>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>추가 혜택</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#555', lineHeight: '1.6' }}>
              <li>• 일반 후기 작성 시 100포인트 지급</li>
              <li>• 포토 후기 작성 시 150포인트 지급</li>
            </ul>
          </div>

          <div className="detail-desc">
            <p>배송비: {product.shippingFee === 0 ? '무료' : `${formatPrice(product.shippingFee !== undefined ? product.shippingFee : 3000)}원`} (50,000원 이상 구매 시 무료)</p>
            <p>배송안내: 오후 1시 이전 결제 시 당일 발송</p>
          </div>

          {/* 옵션 선택 */}
          {product.options && product.options.length > 0 && (
            <div className="option-selector-container">
              <span className="quantity-label">옵션</span>
              <select 
                className="option-selector"
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
              >
                <option value="">옵션을 선택하세요</option>
                {product.options.map((opt, idx) => (
                  <option key={idx} value={opt.name}>
                    {opt.name} {opt.additionalPrice > 0 ? `(+${formatPrice(opt.additionalPrice)}원)` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 수량 선택 */}
          <div className="quantity-selector">
            <span className="quantity-label">수량</span>
            <div className="quantity-controls">
              <button onClick={handleDecrease}>-</button>
              <span>{quantity}</span>
              <button onClick={handleIncrease}>+</button>
            </div>
          </div>

          <div className="detail-total">
            <span>총 결제금액</span>
            <span className="total-price">{formatPrice(totalPrice)}원</span>
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
            <div style={{width: '100%', marginTop: '2rem'}}>
              {/* 구버전 단일 이미지 지원 */}
              {product.detailImageUrl && (
                <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                  <img src={product.detailImageUrl} alt="상품 상세 설명" style={{maxWidth: '100%', height: 'auto', borderRadius: '8px'}} />
                </div>
              )}
              
              {/* 신규 다중 블록 지원 */}
              {product.detailBlocks && product.detailBlocks.length > 0 ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center'}}>
                  {product.detailBlocks.map((block, idx) => (
                    <div key={idx} style={{width: '100%', maxWidth: '800px', margin: '0 auto'}}>
                      {block.type === 'image' && (
                        <img src={block.content} alt={`상세 이미지 ${idx}`} style={{width: '100%', height: 'auto', display: 'block'}} />
                      )}
                      {block.type === 'text' && (
                        <p style={{whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '1.1rem', color: '#333', textAlign: 'left', padding: '0 1rem'}}>
                          {block.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                !product.detailImageUrl && (
                  <>
                    <h3>상세 정보</h3>
                    <p>이곳에 상품의 자세한 설명이나 조리 방법, 영양 정보 등의 이미지가 들어갑니다.</p>
                    <div style={{width: '100%', height: '500px', backgroundColor: '#f1f2f6', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#747d8c', borderRadius: '8px'}}>
                      [판매자가 상세 설명을 등록하지 않았습니다]
                    </div>
                  </>
                )
              )}
            </div>
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

      {/* 하단 고정 바 (Sticky Bottom Bar) */}
      <div className="sticky-bottom-bar">
        <button className="outline-btn wish" onClick={(e) => handleToggleWishlist(product, e)}>
          <Heart size={24} />
        </button>
        <button className="outline-btn cart" onClick={onAddToCartClick}>장바구니 담기</button>
        <button className="primary-btn buy" onClick={(e) => { onAddToCartClick(e); navigate('/cart'); }}>구매하기</button>
      </div>

    </div>
  );
}

export default ProductDetail;
