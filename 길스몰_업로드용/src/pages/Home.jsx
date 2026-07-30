import React from 'react';
import { useNavigate } from 'react-router-dom';
import { storeConfig } from '../data/products';

function Home({ handleAddToCart, products }) {
  const navigate = useNavigate();
  
  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR');
  };

  return (
    <>
      {/* Hero Section */}
      <header className="hero">
        <img src={storeConfig.mainBanner.imageUrl} alt="Main Banner" className="hero-bg" />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">{storeConfig.mainBanner.title}</h1>
          <p className="hero-subtitle">{storeConfig.mainBanner.subtitle}</p>
          <button className="primary-btn">특가 상품 보기</button>
        </div>
      </header>

      {/* Products Section */}
      <main className="section">
        <h2 className="section-title">✨ 이주의 추천상품</h2>
        <div className="product-grid">
          {products.map(product => (
            <div key={product.id} className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
              <div className="card-img-container">
                <img src={product.imageUrl} alt={product.name} className="card-img" />
                <div className="badges">
                  {product.isBest && <span className="badge badge-best">BEST</span>}
                  {product.isNew && <span className="badge badge-new">NEW</span>}
                </div>
              </div>
              <div className="card-info">
                <h3 className="card-title">{product.name}</h3>
                <div className="price-container">
                  {product.discount && <span className="discount">{product.discount}</span>}
                  <span className="price">{formatPrice(product.price)}원</span>
                  {product.originalPrice && <span className="original-price">{formatPrice(product.originalPrice)}원</span>}
                </div>
                <div className="card-actions">
                  <button className="action-btn wish" onClick={(e) => e.stopPropagation()}>❤️ 찜하기</button>
                  <button className="action-btn cart" onClick={(e) => handleAddToCart(product, e)}>🛒 담기</button>
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
