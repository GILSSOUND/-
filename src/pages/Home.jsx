import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, CreditCard } from 'lucide-react';
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

function Home({ handleAddToCart, products }) {
  const navigate = useNavigate();
  
  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR');
  };

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
        <div className="product-grid">
          {products.map(product => (
            <div key={product._id || product.id} className="product-card" onClick={() => navigate(`/product/${product._id || product.id}`)}>
              <div className="card-img-container">
                <img src={product.imageUrl} alt={product.name} className="card-img" />
                <div className="badges">
                  {product.isBest && <span className="badge badge-best">BEST</span>}
                  {product.isNewProduct && <span className="badge badge-new">NEW</span>}
                </div>
                {/* 둥근 장바구니/찜/구매 버튼 (마우스 호버 시 등장) */}
                <div className="card-hover-actions">
                  <button 
                    className="cart-circle-btn" 
                    onClick={(e) => { e.stopPropagation(); alert('찜 목록에 추가되었습니다!'); }}
                    title="찜하기"
                  >
                    <Heart size={20} />
                  </button>
                  <button 
                    className="cart-circle-btn" 
                    onClick={(e) => handleAddToCart(product, e)}
                    title="장바구니 담기"
                  >
                    <ShoppingCart size={20} />
                  </button>
                  <button 
                    className="cart-circle-btn" 
                    onClick={(e) => { e.stopPropagation(); navigate(`/product/${product._id || product.id}`); }}
                    title="구매하기"
                  >
                    <CreditCard size={20} />
                  </button>
                </div>
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                {product.subtitle && <p style={{fontSize: '0.9rem', color: '#888', marginTop: '-0.3rem', marginBottom: '0.5rem'}}>{product.subtitle}</p>}
                <div className="price-container">
                  {(product.originalPrice || product.discount) && (
                    <div className="price-top-row">
                      {product.originalPrice && <span className="original-price">{formatPrice(product.originalPrice)}원</span>}
                      {product.discount && <span className="discount">{product.discount}</span>}
                    </div>
                  )}
                  <span className="price">{formatPrice(product.price)}원</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

export default Home;
