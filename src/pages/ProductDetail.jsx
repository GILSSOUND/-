import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, CreditCard, Star, X, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getReviewsByProduct } from '../api';

function ProductDetail({ handleAddToCart, handleToggleWishlist, products }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requireAuth } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('detail');
  const [selectedOption, setSelectedOption] = useState('');
  const [displayImage, setDisplayImage] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);

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

  const [reviews, setReviews] = useState([]);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [reviewImagePopup, setReviewImagePopup] = useState({ isOpen: false, images: [], currentIndex: 0 });
  
  useEffect(() => {
    if (id) {
      getReviewsByProduct(id).then(res => {
        if (res.data) setReviews(res.data);
      }).catch(err => console.error(err));
    }
  }, [id]);


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

  const allImages = [product.imageUrl, ...(product.subImageUrls || [])].filter(Boolean);
  
  
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `길스몰에서 ${product.name}을(를) 만나보세요!`,
          url: window.location.href,
        });
      } else {
        throw new Error('Not supported');
      }
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      alert('상품 링크가 복사되었습니다! 원하는 곳에 붙여넣기 하세요.');
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };
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
      return false;
    }

    const productWithOption = {
      ...product,
      name: currentOption ? `${product.name} [옵션: ${currentOption.name}]` : product.name,
      price: finalUnitPrice,
      _originalId: product._id || product.id, // 장바구니에서 원본 아이디 참조용
      selectedOptionName: selectedOption // 장바구니에서 옵션 변경을 위해 저장
    };

    handleAddToCart(productWithOption, { stopPropagation: () => {} }, quantity);
    return true;
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
          .quantity-price-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 3rem;
            padding: 1.2rem 1.5rem;
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
          }
          .total-price-wrapper {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          .desktop-sub-images { display: block; }
          .mobile-sub-images { display: none; }
          
          @media (max-width: 1024px) {
            .desktop-sub-images { display: none !important; }
            .mobile-sub-images { display: block !important; margin-top: 1rem; }
            
            .product-detail-layout {
              display: flex !important;
              flex-direction: column !important;
            }
            .product-detail-img-wrapper { order: 1; }
            .mobile-sub-images { order: 2; }
            .product-detail-info { order: 3; }
            .photo-reviews-section { order: 4; margin-top: 2rem; }
            
            .quantity-price-container {
              justify-content: space-between !important;
              gap: 1rem !important;
              padding: 1.2rem 0.5rem !important;
            }
            .total-price-wrapper {
              flex-direction: column !important;
              align-items: flex-end !important;
              gap: 0.2rem !important;
            }
          }
        `}
      </style>
    <div className="page-container detail-page-container" style={{ width: '100%', maxWidth: 'var(--max-width)', margin: '0 auto', paddingTop: 'calc(var(--nav-height) + 60px)', paddingBottom: '5rem', paddingLeft: '5%', paddingRight: '5%', boxSizing: 'border-box' }}>
      <div className="product-detail-layout" style={{ width: '100%' }}>
        
        {/* 메인 이미지 영역 (왼쪽 상단) */}
        <div className="product-detail-img-wrapper" style={{ minWidth: 0, maxWidth: '100%', position: 'relative', paddingBottom: '20px' }}>
            <div style={{position: 'relative', width: '100%', aspectRatio: '1/1', overflow: 'hidden', borderRadius: '12px'}}>
              <img src={allImages[currentImageIndex]} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} fetchPriority="high" />
              <div className="detail-image-badges" style={{position: 'absolute', top: '15px', left: '15px'}}>
                {product.isBest && <span className="badge badge-best" style={{background: 'var(--primary-color)', color: 'white', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold'}}>BEST</span>}
              </div>
              
              {allImages.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage}
                    style={{
                      position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255,255,255,0.85)', color: '#333', border: '1px solid #ddd', 
                      borderRadius: '50%', width: '45px', height: '45px', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                    }}
                  ><ChevronLeft size={28} /></button>
                  <button 
                    onClick={handleNextImage}
                    style={{
                      position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255,255,255,0.85)', color: '#333', border: '1px solid #ddd', 
                      borderRadius: '50%', width: '45px', height: '45px', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                    }}
                  ><ChevronRight size={28} /></button>
                </>
              )}
            </div>
            
            
          </div>
          <div className="product-detail-info" style={{ marginTop: 0, borderRadius: 0, boxShadow: 'none', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.2rem' }}>
              <h2 className="detail-title" style={{ marginBottom: 0, marginTop: 0, textAlign: 'left', flex: 1, paddingRight: '10px' }}>{product.name}</h2>
              <button 
                onClick={handleShare} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', color: '#555', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                title="공유하기"
              >
                <Share2 size={24} />
              </button>
            </div>
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
          <div className="detail-benefits-box" style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid #eee', marginBottom: '0' }}>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.3rem', fontSize: '0.95rem' }}>추가 혜택</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#555', lineHeight: '1.4', fontSize: '0.9rem' }}>
              <li>• 일반 후기 작성 시 500포인트 지급</li>
              <li>• 포토 후기(3장 이상) 작성 시 1000포인트 지급</li>
            </ul>
          </div>

          {/* 데스크톱 서브 이미지 */}
          <div className="desktop-sub-images">
            {product.subImageUrls && product.subImageUrls.length > 0 && (
              <div style={{ display: 'flex', gap: '0.6rem', margin: '0.5rem 0', overflowX: 'auto', paddingBottom: '0', justifyContent: 'center' }}>
                {/* 메인 이미지 (썸네일) */}
                <div 
                  onClick={() => setCurrentImageIndex(0)}
                  style={{ flex: '0 0 auto', width: '90px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: currentImageIndex === 0 ? '3px solid var(--primary-color)' : '1px solid #eee', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  <img src={product.imageUrl} alt="main thumbnail" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                
                {/* 서브 이미지들 */}
                {product.subImageUrls.map((url, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setCurrentImageIndex(idx + 1)}
                    style={{ flex: '0 0 auto', width: '90px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: currentImageIndex === idx + 1 ? '3px solid var(--primary-color)' : '1px solid #eee', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    <img src={url} alt={`sub ${idx}`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

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
            <div className="quantity-price-container">
              
              {/* 수량 선택 */}
              <div className="quantity-selector" style={{ margin: 0, padding: 0, border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.8rem', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '1rem', color: '#555', fontWeight: 'bold' }}>수량</span>
                <div className="quantity-controls" style={{ display: 'flex', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden', background: 'white' }}>
                  <button onClick={handleDecrease} style={{ width: '36px', height: '36px', border: 'none', background: '#f8f9fa', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>-</button>
                  <span style={{ width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>{quantity}</span>
                  <button onClick={handleIncrease} style={{ width: '36px', height: '36px', border: 'none', background: '#f8f9fa', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>+</button>
                </div>
              </div>

              {/* 총 결제금액 */}
              <div className="total-price-wrapper">
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
              <button className="primary-btn buy" onClick={(e) => { requireAuth(() => { const success = onAddToCartClick(e); if(success) navigate('/cart'); }); }} style={{ flex: 1, height: '54px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
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
            <div style={{
              position: 'relative',
              maxHeight: isDetailExpanded ? 'none' : '1500px',
              overflow: 'hidden',
              transition: 'max-height 0.3s ease-out'
            }}>
            {/* 구버전 단일 이미지 지원 */}
            {product.detailImageUrl && (
              <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                <img src={product.detailImageUrl} alt="상품 상세 설명" loading="lazy" style={{maxWidth: '100%', height: 'auto', borderRadius: '8px'}} />
              </div>
            )}
            
            {/* 신규 다중 블록 지원 */}
            {product.detailBlocks && product.detailBlocks.length > 0 ? (
              <div style={{display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center'}}>
                {product.detailBlocks.map((block, idx) => (
                  <div key={idx} style={{width: '100%', maxWidth: '800px', margin: '0 auto'}}>
                    {block.type === 'image' && (
                      <img src={block.content} alt={`상세 이미지 ${idx}`} loading="lazy" style={{width: '100%', height: 'auto', display: 'block'}} />
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
                <img src={product.purchaseInfoImageUrl} alt="구매 안내" loading="lazy" style={{maxWidth: '100%', height: 'auto', borderRadius: '8px'}} />
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
            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: 'bold' }}>상품 후기</h3>

            
  
            
            {(() => {
              const totalReviews = reviews.length;
              const avgRating = totalReviews > 0 ? (reviews.reduce((acc, cur) => acc + cur.rating, 0) / totalReviews).toFixed(1) : "0.0";
              const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
              reviews.forEach(r => { if (ratingCounts[r.rating] !== undefined) ratingCounts[r.rating]++; });

              return (
                <>
                  {/* 리뷰 통계 박스 */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee', marginBottom: '2rem', overflow: 'hidden' }}>
                    
                    {/* 왼쪽: 총평점 */}
                    <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#fff' }}>
                      <h4 style={{ fontSize: '1.2rem', margin: '0 0 1rem 0', color: '#333' }}>총 평점</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Star size={40} fill="#ffc107" color="#ffc107" />
                        <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#000', lineHeight: 1 }}>{avgRating}</span>
                      </div>
                      <p style={{ color: '#666', margin: '1rem 0 0 0', fontSize: '1rem' }}>구매후기 <strong style={{color: 'var(--primary-color)'}}>{totalReviews}</strong>건</p>
                    </div>

                    {/* 구분선 (데스크탑은 세로, 모바일은 가로) */}
                    <div style={{ width: '1px', background: '#eee' }} className="desktop-divider"></div>

                    {/* 오른쪽: 별점 분포 */}
                    <div style={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem', gap: '0.8rem', background: '#fafafa' }}>
                      {[
                        { stars: 5, label: '완전좋아요' },
                        { stars: 4, label: '좋아요' },
                        { stars: 3, label: '괜찮아요' },
                        { stars: 2, label: '그저그래요' },
                        { stars: 1, label: '별로에요' },
                      ].map(item => (
                        <div key={item.stars} style={{ display: 'flex', alignItems: 'center', fontSize: '1rem' }}>
                          <span style={{ width: '90px', color: '#444', fontWeight: 'bold' }}>{item.label}</span>
                          <div style={{ flex: 1, height: '10px', background: '#e9ecef', borderRadius: '5px', margin: '0 1rem', overflow: 'hidden' }}>
                            <div style={{ width: `${totalReviews > 0 ? (ratingCounts[item.stars] / totalReviews) * 100 : 0}%`, height: '100%', background: '#ffc107', borderRadius: '5px' }}></div>
                          </div>
                          <span style={{ width: '30px', textAlign: 'right', color: '#666' }}>{ratingCounts[item.stars]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 리뷰 리스트 */}
                  {totalReviews === 0 ? (
                    <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#888', background: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ddd' }}>
                      아직 등록된 후기가 없습니다.<br/>첫 번째 후기를 남겨주세요!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {reviews.map(review => (
                        <div key={review._id} style={{ padding: '2rem', background: '#fff', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                          
                          {/* 작성자 및 별점 헤더 */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px dashed #eee', paddingBottom: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                              <div style={{ display: 'flex', color: '#ffc107', gap: '0.1rem' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star key={star} size={18} fill={review.rating >= star ? '#ffc107' : 'none'} color={review.rating >= star ? '#ffc107' : '#ddd'} />
                                ))}
                              </div>
                              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'baseline' }}>
                                <strong style={{ fontSize: '1.1rem', color: '#333' }}>{review.userName.slice(0,1) + '*'.repeat(review.userName.length - 1)}</strong>
                                <span style={{ color: '#999', fontSize: '0.85rem' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                              </div>
                              {review.purchasedItems && review.purchasedItems.length > 0 && (
                                <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.2rem', padding: '0.4rem', background: '#f5f5f5', borderRadius: '4px', display: 'inline-block' }}>
                                  {review.purchasedItems.map((item, i) => (
                                    <div key={i}>{item.name} {item.option ? `(${item.option})` : ''}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 1. 사진 영역 (먼저 표시) */}
                          {review.images && review.images.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
                              {review.images.map((img, idx) => (
                                <img key={idx} src={img} alt="리뷰 사진" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer' }} onClick={() => setReviewImagePopup({ isOpen: true, images: review.images, currentIndex: idx })} />
                              ))}
                            </div>
                          )}

                          {/* 2. 텍스트 영역 (나중에 표시) */}
                          <p style={{ lineHeight: '1.7', color: '#222', margin: 0, whiteSpace: 'pre-wrap', fontSize: '1.1rem', fontWeight: 500, fontFamily: '"Pretendard", "Noto Sans KR", sans-serif', wordBreak: 'keep-all' }}>
                            {review.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        </div>
      </div>

      {/* 리뷰 이미지 확대 모달 */}
      {reviewImagePopup.isOpen && reviewImagePopup.images.length > 0 && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1300}} onClick={() => setReviewImagePopup({ ...reviewImagePopup, isOpen: false })}>
          
          {reviewImagePopup.images.length > 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setReviewImagePopup(prev => ({ ...prev, currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1 })); }} 
              style={{position: 'absolute', left: '5%', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', color: 'white', padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s'}}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              <ChevronLeft size={40} />
            </button>
          )}

          <img src={reviewImagePopup.images[reviewImagePopup.currentIndex]} alt="확대된 리뷰 이미지" style={{maxWidth: '80%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'}} onClick={e => e.stopPropagation()} />
          
          {reviewImagePopup.images.length > 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setReviewImagePopup(prev => ({ ...prev, currentIndex: prev.currentIndex === prev.images.length - 1 ? 0 : prev.currentIndex + 1 })); }} 
              style={{position: 'absolute', right: '5%', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', color: 'white', padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s'}}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              <ChevronRight size={40} />
            </button>
          )}

          <button onClick={() => setReviewImagePopup({ ...reviewImagePopup, isOpen: false })} style={{position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', border: 'none', cursor: 'pointer', color: 'white', padding: '0.5rem', display: 'flex', transition: 'background 0.2s'}} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,0,0,0.8)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}><X size={32} /></button>
          
          {reviewImagePopup.images.length > 1 && (
            <div style={{position: 'absolute', bottom: '30px', color: 'white', fontSize: '1.1rem', background: 'rgba(0,0,0,0.6)', padding: '0.6rem 1.2rem', borderRadius: '20px', letterSpacing: '2px', fontWeight: 'bold'}}>
              {reviewImagePopup.currentIndex + 1} / {reviewImagePopup.images.length}
            </div>
          )}
        </div>
      )}

      {/* 하단 고정 바 (Sticky Bottom Bar) */}
      <div className="sticky-bottom-bar">
        <button className="outline-btn wish" onClick={(e) => handleToggleWishlist(product, e)}>
          <Heart size={24} />
        </button>
        <button className="outline-btn cart" onClick={onAddToCartClick}>장바구니 담기</button>
        <button className="primary-btn buy" onClick={(e) => { requireAuth(() => { const success = onAddToCartClick(e); if(success) navigate('/cart'); }); }}>구매하기</button>
      </div>

    </div>
    </>
  );
}

export default ProductDetail;
