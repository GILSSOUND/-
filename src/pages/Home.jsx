import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { storeConfig } from '../data/products';

// 임시 배너 데이터 (실제로는 DB나 storeConfig에서 가져올 수 있음)
const bannerData = [
  {
    id: 1,
    title: storeConfig.mainBanner.title,
    subtitle: storeConfig.mainBanner.subtitle,
    imageUrl: storeConfig.mainBanner.imageUrl
  },
  {
    id: 2,
    title: "신선함이 그대로, 갓 수확한 채소",
    subtitle: "산지직송 기획전 최대 30% 할인",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: 3,
    title: "프리미엄 홈파티 스테이크 세트",
    subtitle: "이번 주말엔 내가 요리사! 한정수량 특가",
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1200"
  }
];

function Home({ handleAddToCart, handleToggleWishlist, products, refreshGlobalProducts }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // 5 columns * 3 rows
  
  useEffect(() => {
    // 렌더 서버가 슬립 상태일 때 App.jsx의 초기 fetch가 실패해서 products가 비어있을 수 있음.
    // 홈 화면 진입 시 products가 없으면 다시 한 번 불러오기 시도.
    if (products.length === 0 && refreshGlobalProducts) {
      refreshGlobalProducts();
    }
  }, [products.length, refreshGlobalProducts]);
  
  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR');
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const recommendedProducts = products.filter(p => p.isBest).slice(0, 5);
  if (recommendedProducts.length === 0 && products.length > 0) {
    recommendedProducts.push(...products.slice(0, 5));
  }

  return (
    <>
      {/* Hero Slider Section */}
      <div className="hero-slider-container">
        <Swiper
          modules={[Pagination, Autoplay, Navigation]}
          pagination={{ clickable: true }}
          navigation={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          className="mySwiper"
        >
          {bannerData.map((banner) => (
            <SwiperSlide key={banner.id}>
              <div className="hero-slide">
                <img src={banner.imageUrl} alt={banner.title} className="hero-slide-bg" />
                <div className="hero-slide-overlay"></div>
                <div className="hero-slide-content">
                  <h1 className="hero-slide-title">{banner.title}</h1>
                  <p className="hero-slide-subtitle">{banner.subtitle}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Products Section */}
      <main className="section">
        <h2 className="section-title">이주의 추천상품</h2>
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={20}
          slidesPerView={2.2}
          navigation={true}
          breakpoints={{
            768: { slidesPerView: 3.5, spaceBetween: 20 },
            1024: { slidesPerView: 5, spaceBetween: 30 },
          }}
          className="recommended-swiper"
          style={{ padding: '0.5rem', marginBottom: '4rem' }}
        >
          {recommendedProducts.map(product => (
            <SwiperSlide key={`rec-${product._id || product.id}`}>
              <div className="product-card" onClick={() => navigate(`/product/${product._id || product.id}`)}>
                <div className="card-img-container">
                  <img src={product.imageUrl} alt={product.name} className="card-img" />
                  <div className="badges">
                    {product.isBest && <span className="badge badge-best">BEST</span>}
                    {product.isNewProduct && <span className="badge badge-new">NEW</span>}
                  </div>
                  <div className="card-hover-actions">
                    <button className="cart-circle-btn" onClick={(e) => handleToggleWishlist(product, e)} title="찜하기"><Heart size={20} /></button>
                    <button className="cart-circle-btn" onClick={(e) => handleAddToCart(product, e)} title="장바구니 담기"><ShoppingCart size={20} /></button>
                    <button className="cart-circle-btn" onClick={(e) => { e.stopPropagation(); navigate(`/product/${product._id || product.id}`); }} title="구매하기"><CreditCard size={20} /></button>
                  </div>
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="price-container">
                    {product.originalPrice && (
                      <div className="price-top-row" style={{ justifyContent: 'flex-start' }}>
                        <span className="original-price">{formatPrice(product.originalPrice)}원</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '0.5rem' }}>
                      <span className="price">{formatPrice(product.price)}원</span>
                      {product.discount && <span className="discount">{product.discount}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <h2 className="section-title">전체상품</h2>
        <div className="product-grid">
          {currentProducts.map(product => (
            <div key={product._id || product.id} className="product-card" onClick={() => navigate(`/product/${product._id || product.id}`)}>
              <div className="card-img-container">
                <img src={product.imageUrl} alt={product.name} className="card-img" />
                <div className="badges">
                  {product.isBest && <span className="badge badge-best">BEST</span>}
                  {product.isNewProduct && <span className="badge badge-new">NEW</span>}
                </div>
                <div className="card-hover-actions">
                  <button className="cart-circle-btn" onClick={(e) => handleToggleWishlist(product, e)} title="찜하기"><Heart size={20} /></button>
                  <button className="cart-circle-btn" onClick={(e) => handleAddToCart(product, e)} title="장바구니 담기"><ShoppingCart size={20} /></button>
                  <button className="cart-circle-btn" onClick={(e) => { e.stopPropagation(); navigate(`/product/${product._id || product.id}`); }} title="구매하기"><CreditCard size={20} /></button>
                </div>
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <div className="price-container">
                  {product.originalPrice && (
                    <div className="price-top-row" style={{ justifyContent: 'flex-start' }}>
                      <span className="original-price">{formatPrice(product.originalPrice)}원</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '0.5rem' }}>
                    <span className="price">{formatPrice(product.price)}원</span>
                    {product.discount && <span className="discount">{product.discount}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="page-btn" 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              <ChevronLeft size={20} />
            </button>
            
            {[...Array(totalPages)].map((_, idx) => (
              <button 
                key={idx + 1} 
                className={`page-btn ${currentPage === idx + 1 ? 'active' : ''}`}
                onClick={() => handlePageChange(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}

            <button 
              className="page-btn" 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </main>
    </>
  );
}

export default Home;
