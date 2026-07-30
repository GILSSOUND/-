import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

function CategoryPage({ handleAddToCart, products }) {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR');
  };

  // 카테고리 필터링 로직
  let filteredProducts = [];
  let categoryName = "";

  switch(categoryId) {
    case 'mealkit':
      filteredProducts = products.filter(p => p.category === 'mealkit');
      categoryName = "1.밀키트";
      break;
    case 'new':
      filteredProducts = products.filter(p => p.isNew);
      categoryName = "2.신상품";
      break;
    case 'local':
      filteredProducts = products.filter(p => p.category === 'local');
      categoryName = "3.산지직송";
      break;
    case 'direct':
      filteredProducts = products.filter(p => p.category === 'direct');
      categoryName = "4.업체직송";
      break;
    case 'sale':
      filteredProducts = products.filter(p => p.discount);
      categoryName = "5.특가할인";
      break;
    default:
      filteredProducts = products;
      categoryName = "전체상품";
  }

  return (
    <div className="page-container">
      <h2 className="page-title" style={{textAlign: 'center', marginBottom: '3rem'}}>{categoryName}</h2>
      
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
                {/* 둥근 장바구니 버튼 (마우스 호버 시 등장) */}
                <div className="card-hover-actions">
                  <button 
                    className="cart-circle-btn" 
                    onClick={(e) => handleAddToCart(product, e)}
                    title="장바구니 담기"
                  >
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
              <div className="card-info">
                <h3 className="card-title">{product.name}</h3>
                <div className="price-container">
                  {product.discount && <span className="discount">{product.discount}</span>}
                  <span className="price">{formatPrice(product.price)}원</span>
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
