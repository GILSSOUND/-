import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, CreditCard, Utensils, Sparkles, MapPin, Truck, Percent, LayoutGrid } from 'lucide-react';

function CategoryPage({ handleAddToCart, products }) {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR');
  };

  // 카테고리 필터링 로직
  let filteredProducts = [];
  let categoryName = "";
  let categoryIcon = null;

  switch(categoryId) {
    case 'mealkit':
      filteredProducts = products.filter(p => p.category === 'mealkit');
      categoryName = "밀키트";
      categoryIcon = <Utensils size={32} style={{marginRight: '0.5rem', color: 'var(--primary-color)'}} />;
      break;
    case 'new':
      filteredProducts = products.filter(p => p.isNew);
      categoryName = "신상품";
      categoryIcon = <Sparkles size={32} style={{marginRight: '0.5rem', color: 'var(--primary-color)'}} />;
      break;
    case 'local':
      filteredProducts = products.filter(p => p.category === 'local');
      categoryName = "산지직송";
      categoryIcon = <MapPin size={32} style={{marginRight: '0.5rem', color: 'var(--primary-color)'}} />;
      break;
    case 'direct':
      filteredProducts = products.filter(p => p.category === 'direct');
      categoryName = "업체직송";
      categoryIcon = <Truck size={32} style={{marginRight: '0.5rem', color: 'var(--primary-color)'}} />;
      break;
    case 'sale':
      filteredProducts = products.filter(p => p.discount);
      categoryName = "특가할인";
      categoryIcon = <Percent size={32} style={{marginRight: '0.5rem', color: 'var(--primary-color)'}} />;
      break;
    default:
      filteredProducts = products;
      categoryName = "전체상품";
      categoryIcon = <LayoutGrid size={32} style={{marginRight: '0.5rem', color: 'var(--primary-color)'}} />;
  }

  return (
    <div className="page-container">
      <h2 className="page-title" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3rem'}}>
        {categoryIcon} {categoryName}
      </h2>
      
      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <h3>상품 준비중입니다.</h3>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map(product => (
            <div key={product._id || product.id} className="product-card" onClick={() => navigate(`/product/${product._id || product.id}`)}>
              <div className="card-img-container">
                <img src={product.imageUrl} alt={product.name} className="card-img" />
                <div className="badges">
                  {product.isBest && <span className="badge badge-best">BEST</span>}
                  {product.isNew && <span className="badge badge-new">NEW</span>}
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
                {product.subtitle && <p style={{fontSize: '0.85rem', color: '#888', marginTop: '-0.3rem', marginBottom: '0.5rem'}}>{product.subtitle}</p>}
                <div className="price-container">
                  <span className="price">{formatPrice(product.price)}원</span>
                  {product.discount && <span className="discount">{product.discount}</span>}
                  {product.originalPrice && <span className="original-price">{formatPrice(product.originalPrice)}원</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryPage;
