import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, CreditCard } from 'lucide-react';

function ProductDetail({ handleAddToCart, handleToggleWishlist, products }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('detail');
  const [selectedOption, setSelectedOption] = useState('');
  const [displayImage, setDisplayImage] = useState('');

  const detailRef = useRef(null);
  const infoRef = useRef(null);
  const reviewRef = useRef(null);

  const scrollToSection = (ref, tabName) => {
    setActiveTab(tabName);
    if (ref && ref.current) {
      const yOffset = -50; 
      const y = ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.pageYOffset + 100;
      if (reviewRef.current && scrollPos >= reviewRef.current.offsetTop) {
        setActiveTab('review');
      } else if (infoRef.current && scrollPos >= infoRef.current.offsetTop) {
        setActiveTab('info');
      } else if (detailRef.current && scrollPos >= detailRef.current.offsetTop) {
        setActiveTab('detail');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 페이지 진입 시 사진과 포토리뷰가 함께 보이도록 살짝 아래로 스크롤
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({ top: window.innerWidth <= 1024 ? 120 : 0, behavior: 'smooth' });
    }, 100);
  }, [id]);

  const product = products.find(p => p._id === id || p.id === parseInt(id));

  // 상품 변경 시 메인 이미지로 초기화
  useEffect(() => {
    if (product) {
      setDisplayImage(product.imageUrl);
    }
  }, [product]);

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
    <>
      <style>
        {`
          /* 📱 모바일/태블릿(1024px 이하) 강제 화면 맞춤 및 겹침 방지 코드 (절대 우위) */
          @media (max-width: 1024px) {
            html, body {
              overflow-x: hidden !important;
              max-width: 100vw !important;
              width: 100% !important;
            }
            .detail-page-container {
              width: 100vw !important;
              max-width: 100vw !important;
              padding: var(--nav-height) 0 0 0 !important;
              overflow-x: hidden !important;
              box-sizing: border-box !important;
            }
            .product-detail-layout {
              display: flex !important;
              flex-direction: column !important;
              width: 100vw !important;
              max-width: 100vw !important;
              gap: 0 !important;
              margin: 0 !important;
              box-sizing: border-box !important;
            }
            .product-detail-left-col {
              width: 100vw !important;
              max-width: 100vw !important;
              padding: 0 !important;
              box-sizing: border-box !important;
            }
            .product-detail-info {
              position: static !important;
              width: 100vw !important;
              max-width: 100vw !important;
              margin-top: 0 !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              padding: 1.2rem 5% 2rem 5% !important;
              box-sizing: border-box !important;
              border-top: 1px solid #eee !important;
            }
            .detail-title {
              word-break: break-all !important;
              overflow-wrap: break-word !important;
            }
            .product-description-section {
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin: 0 auto !important;
              box-sizing: border-box !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
            }
            .desc-tabs {
              width: 100% !important;
              max-width: 100% !important;
              justify-content: center !important;
            }
            .desc-content {
              width: 100% !important;
              max-width: 100% !important;
            }
          }
          
          @media (min-width: 1025px) {
            .product-detail-layout {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              grid-template-areas: 
                "image info"
                "review ." !important;
              gap: 4rem !important;
            }
            .product-detail-img-wrapper { grid-area: image; }
            .product-detail-info { grid-area: info; }
            .photo-reviews-section { grid-area: review; margin-top: -2rem; }
          }
          @media (max-width: 1024px) {
            .product-detail-layout {
              display: flex !important;
              flex-direction: column !important;
            }
            .product-detail-img-wrapper { order: 1; }
            .photo-reviews-section { order: 2; margin-top: 2rem; }
            .product-detail-info { order: 3; }
          }
        `}
      </style>
    <div className="page-container detail-page-container" style={{ width: '100%', maxWidth: 'var(--max-width)', margin: '0 auto', paddingTop: 'calc(var(--nav-height) + 60px)', paddingBottom: '5rem', paddingLeft: '5%', paddingRight: '5%', boxSizing: 'border-box' }}>
      <div className="product-detail-layout" style={{ width: '100%' }}>
        
        {/* 메인 이미지 영역 (왼쪽 상단) */}
        <div className="product-detail-img-wrapper" style={{ minWidth: 0, maxWidth: '100%' }}>
          <img src={displayImage || product.imageUrl} alt={product.name} className="product-detail-img" />
          <div className="detail-image-badges">
            {product.isBest && <span className="badge badge-best">BEST</span>}
            {product.isNewProduct && <span className="badge badge-new">NEW</span>}
          </div>
        </div>

        {/* 포토 리뷰 영역 (왼쪽 하단) */}
          <div className="photo-reviews-section" style={{ minWidth: 0, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem', borderBottom: '2px solid #333', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0, marginLeft: '1.5rem' }}>포토 리뷰 <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 'normal', marginLeft: '0.4rem', letterSpacing: '0.5px' }}>PHOTO REVIEW</span></h3>
              <span style={{ fontSize: '0.9rem', color: '#666', cursor: 'pointer', marginRight: '1.5rem' }}>전체보기</span>
            </div>
            
            {product.reviews && product.reviews.filter(r => r.photoUrl).length > 0 ? (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', width: '100%', paddingLeft: '1.5rem', paddingRight: '1.5rem', boxSizing: 'border-box' }}>
                {product.reviews.filter(r => r.photoUrl).map((review, idx) => (
                  <div key={idx} style={{ flex: '0 0 auto', width: '72px', height: '72px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #eee' }}>
                    <img src={review.photoUrl} alt="포토리뷰" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            ) : (
              /* 더미 데이터(임시) 또는 빈 상태 */
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', width: '100%', paddingLeft: '1.5rem', paddingRight: '1.5rem', boxSizing: 'border-box' }}>
                {[
                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80",
                  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80",
                  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&q=80",
                  "https://images.unsplash.com/photo-1544025162-d76694265947?w=200&q=80",
                  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=80",
                  "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=200&q=80",
                  "https://images.unsplash.com/photo-1560684352-8497838a2229?w=200&q=80"
                ].map((mockUrl, idx) => (
                  <div key={idx} style={{ flex: '0 0 auto', width: '72px', height: '72px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #eee' }}>
                    <img src={mockUrl} alt="포토리뷰 임시" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
                <div style={{ flex: '0 0 auto', width: '72px', height: '72px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', color: '#888', fontSize: '0.85rem', cursor: 'pointer', border: '1px solid #eee' }}>
                  + 더보기
                </div>
              </div>
            )}
          </div>
        {/* </left-col 제거됨, grid-area로 대체> */}

        {/* 오른쪽: 상품 정보 */}
        <div className="product-detail-info" style={{ marginTop: 0, borderRadius: 0, boxShadow: 'none', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
          <h2 className="detail-title" style={{ marginBottom: '0.2rem' }}>{product.name}</h2>
          {product.subtitle && <p style={{fontSize: '1rem', color: '#888', marginBottom: '1rem', marginTop: 0}}>{product.subtitle}</p>}
          
          <div className="detail-price-box" style={{ marginBottom: '0.8rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '0.6rem' }}>
              {product.originalPrice && (
                <span className="detail-original-price" style={{ textDecoration: 'line-through', color: '#bbb', fontSize: '1.1rem', lineHeight: '1.2' }}>{formatPrice(product.originalPrice)}원</span>
              )}
              <span className="detail-price" style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#000', lineHeight: '1' }}>{formatPrice(finalUnitPrice)}원</span>
              {product.discount && <span className="detail-discount" style={{ color: '#ff6b00', fontWeight: 'bold', fontSize: '1.2rem', lineHeight: '1.1' }}>{product.discount}</span>}
            </div>
          </div>

          {/* 추가 혜택 박스 */}
          <div className="detail-benefits-box" style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid #eee', marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.3rem', fontSize: '0.95rem' }}>추가 혜택</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#555', lineHeight: '1.4', fontSize: '0.9rem' }}>
              <li>• 일반 후기 작성 시 100포인트 지급</li>
              <li>• 포토 후기 작성 시 150포인트 지급</li>
            </ul>
          </div>

          {/* 서브 이미지 (최대 5개 나열) */}
          {product.subImageUrls && product.subImageUrls.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem', justifyContent: 'center' }}>
              {/* 메인 이미지 (썸네일) */}
              <div 
                onClick={() => setDisplayImage(product.imageUrl)}
                style={{ flex: '0 0 auto', width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: (displayImage || product.imageUrl) === product.imageUrl ? '2px solid var(--primary-color)' : '1px solid #eee', cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                <img src={product.imageUrl} alt="main thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              
              {/* 서브 이미지들 */}
              {product.subImageUrls.map((url, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setDisplayImage(url)}
                  style={{ flex: '0 0 auto', width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: displayImage === url ? '2px solid var(--primary-color)' : '1px solid #eee', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  <img src={url} alt={`sub ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}

          {/* 하단 영역 (옵션 + 수량 + 총액 + 버튼) */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            {/* 옵션 선택 (하단으로 이동됨) */}
            {product.options && product.options.length > 0 && (
              <div className="option-selector-container" style={{ margin: 0 }}>
                <select 
                  className="option-selector"
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', borderRadius: '8px', border: '1px solid #ddd' }}
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

            {/* 수량 선택 및 총 결제금액 */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', padding: '1.2rem 1.5rem', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
              
              {/* 수량 선택 */}
              <div className="quantity-selector" style={{ margin: 0, padding: 0, border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ fontSize: '1rem', color: '#555', fontWeight: 'bold' }}>수량</span>
                <div className="quantity-controls" style={{ display: 'flex', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden', background: 'white' }}>
                  <button onClick={handleDecrease} style={{ width: '36px', height: '36px', border: 'none', background: '#f8f9fa', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>-</button>
                  <span style={{ width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>{quantity}</span>
                  <button onClick={handleIncrease} style={{ width: '36px', height: '36px', border: 'none', background: '#f8f9fa', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>+</button>
                </div>
              </div>

              {/* 총 결제금액 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1rem', color: '#666', fontWeight: 'bold' }}>총 결제금액</span>
                <span className="total-price" style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--primary-color)', lineHeight: '1' }}>{formatPrice(totalPrice)}<span style={{fontSize: '1.4rem'}}>원</span></span>
              </div>
            </div>

            {/* 하단 버튼 영역 (데스크톱 용) */}
            <div className="detail-action-buttons-desktop" style={{ display: 'flex', gap: '0.8rem' }}>
              <button className="outline-btn wish" onClick={(e) => handleToggleWishlist(product, e)} style={{ flex: '0 0 auto', padding: '0 1.5rem', height: '54px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff6b00' }}>
                <Heart size={24} />
              </button>
              <button className="outline-btn cart" onClick={onAddToCartClick} style={{ flex: 1, height: '54px', borderRadius: '8px', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', background: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
                장바구니 담기
              </button>
              <button className="primary-btn buy" onClick={(e) => { onAddToCartClick(e); navigate('/cart'); }} style={{ flex: 1, height: '54px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
                구매하기
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 하단: 상세 설명 탭 */}
      <div className="product-description-section">
        <div className="desc-tabs" style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: '1rem', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          <div className={`desc-tab ${activeTab === 'detail' ? 'active' : ''}`} onClick={() => scrollToSection(detailRef, 'detail')} style={{ flex: 1, textAlign: 'center', padding: '0.8rem 0', cursor: 'pointer', fontWeight: activeTab === 'detail' ? 'bold' : 'normal', borderBottom: activeTab === 'detail' ? '3px solid var(--primary-color)' : 'none', color: activeTab === 'detail' ? 'var(--primary-color)' : '#666' }}>상품상세정보</div>
          <div className={`desc-tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => scrollToSection(infoRef, 'info')} style={{ flex: 1, textAlign: 'center', padding: '0.8rem 0', cursor: 'pointer', fontWeight: activeTab === 'info' ? 'bold' : 'normal', borderBottom: activeTab === 'info' ? '3px solid var(--primary-color)' : 'none', color: activeTab === 'info' ? 'var(--primary-color)' : '#666' }}>구매안내</div>
          <div className={`desc-tab ${activeTab === 'review' ? 'active' : ''}`} onClick={() => scrollToSection(reviewRef, 'review')} style={{ flex: 1, textAlign: 'center', padding: '0.8rem 0', cursor: 'pointer', fontWeight: activeTab === 'review' ? 'bold' : 'normal', borderBottom: activeTab === 'review' ? '3px solid var(--primary-color)' : 'none', color: activeTab === 'review' ? 'var(--primary-color)' : '#666' }}>상품후기</div>
        </div>
        <div className="desc-content">
          {/* 상품상세정보 섹션 */}
          <div ref={detailRef} style={{width: '100%', paddingTop: '1rem', paddingBottom: '3rem'}}>
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
                  <h3 style={{textAlign: 'center', marginBottom: '1rem'}}>상세 정보</h3>
                  <p style={{textAlign: 'center'}}>이곳에 상품의 자세한 설명이나 조리 방법, 영양 정보 등의 이미지가 들어갑니다.</p>
                  <div style={{width: '100%', height: '300px', backgroundColor: '#f1f2f6', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#747d8c', borderRadius: '8px'}}>
                    [판매자가 상세 설명을 등록하지 않았습니다]
                  </div>
                </>
              )
            )}
          </div>

          {/* 구매안내 섹션 */}
          <div ref={infoRef} style={{ paddingTop: '2rem', paddingBottom: '3rem', borderTop: '1px solid #eee' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.3rem' }}>구매 안내</h3>
            {product.purchaseInfoImageUrl ? (
              <div style={{textAlign: 'center'}}>
                <img src={product.purchaseInfoImageUrl} alt="구매 안내" style={{maxWidth: '100%', height: 'auto', borderRadius: '8px'}} />
              </div>
            ) : (
              <div style={{ padding: '2rem', background: '#f9f9f9', borderRadius: '8px' }}>
                <h4>교환 및 반품 안내</h4>
                <ul style={{ marginTop: '1rem', lineHeight: '1.8', color: '#555' }}>
                  <li>상품 수령 후 7일 이내 교환/반품이 가능합니다.</li>
                  <li>신선식품의 경우 단순 변심에 의한 교환/반품은 불가합니다.</li>
                  <li>상품에 하자가 있는 경우 배송비는 무료입니다.</li>
                  <li>자세한 사항은 고객센터(1588-0000)로 문의 바랍니다.</li>
                </ul>
              </div>
            )}
          </div>

          {/* 상품후기 섹션 */}
          <div ref={reviewRef} style={{ paddingTop: '2rem', paddingBottom: '5rem', borderTop: '1px solid #eee' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.3rem' }}>상품 후기</h3>
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#888', background: '#f9f9f9', borderRadius: '8px' }}>
              아직 등록된 후기가 없습니다.<br/>첫 번째 후기를 남겨주세요!
            </div>
          </div>
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
    </>
  );
}

export default ProductDetail;
