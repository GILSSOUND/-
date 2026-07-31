import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, CreditCard, Utensils, Sparkles, MapPin, Truck, Percent, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';

function CategoryPage({ handleAddToCart, handleToggleWishlist, products }) {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // 카테고리가 바뀔 때마다 첫 페이지로 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId]);

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
      filteredProducts = products.filter(p => p.isNewProduct);
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

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        <>
          <div className="product-grid">
            {currentProducts.map(product => (
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
                    onClick={(e) => handleToggleWishlist(product, e)}
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
        </>
      )}
    </div>
  );
}

export default CategoryPage;
