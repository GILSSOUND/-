import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, CreditCard, Trash2 } from 'lucide-react';

function Wishlist({ wishlistItems, handleAddToCart, handleToggleWishlist }) {
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR');
  };

  const onBuyClick = (product) => {
    navigate(`/product/${product._id || product.id}`);
  };

  return (
    <div className="page-container">
      <h2 className="page-title">찜한 상품</h2>
      
      {wishlistItems.length === 0 ? (
        <div className="empty-state">
          <h3>찜한 상품이 없습니다.</h3>
          <p>관심있는 상품에 하트를 눌러보세요!</p>
        </div>
      ) : (
        <div className="wishlist-container">
          {wishlistItems.map((item, index) => (
            <div key={index} className="wishlist-item">
              <img src={item.imageUrl} alt={item.name} className="wishlist-item-img" onClick={() => navigate(`/product/${item._id || item.id}`)} />
              
              <div className="wishlist-item-info" onClick={() => navigate(`/product/${item._id || item.id}`)}>
                <h4 className="wishlist-item-title">{item.name}</h4>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  {item.discount && (
                    <span style={{color: 'var(--primary-color)', fontWeight: '800', fontSize: '1.1rem'}}>{item.discount}</span>
                  )}
                  <div className="wishlist-item-price">{formatPrice(item.price)}원</div>
                </div>
              </div>

              <div className="wishlist-item-actions">
                <button 
                  className="icon-btn wishlist-trash-btn" 
                  onClick={(e) => handleToggleWishlist(item, e)}
                  title="삭제"
                >
                  <Trash2 size={20} />
                </button>
                <button 
                  className="outline-btn wishlist-action-btn" 
                  onClick={(e) => handleAddToCart(item, e)}
                >
                  <ShoppingCart size={18} /> 장바구니
                </button>
                <button 
                  className="primary-btn wishlist-action-btn"
                  onClick={() => onBuyClick(item)}
                >
                  <CreditCard size={18} /> 구매하기
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
