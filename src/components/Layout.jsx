import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, X } from 'lucide-react';
import { storeConfig } from '../data/products';

function Layout({ cartCount, products }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
    } else {
      const results = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
      setSearchResults(results);
    }
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleResultClick = (productId) => {
    closeSearch();
    navigate(`/product/${productId}`);
  };

  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR');
  };

  return (
    <div>
      <nav className="navbar">
        <Link to="/" className="logo">{storeConfig.storeName}</Link>
        <div className="nav-links">
          <Link to="/category/mealkit">1.밀키트</Link>
          <Link to="/category/new">2.신상품</Link>
          <Link to="/category/local">3.산지직송</Link>
          <Link to="/category/direct">4.업체직송</Link>
          <Link to="/category/sale">5.특가할인</Link>
        </div>
        <div className="nav-actions">
          <button className="icon-btn" onClick={() => setIsSearchOpen(true)}>
            <Search size={24} />
          </button>
          <button className="icon-btn">
            <Heart size={24} />
          </button>
          <Link to="/cart" className="icon-btn" style={{position: 'relative'}}>
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="cart-badge">
                {cartCount}
              </span>
            )}
          </Link>
          <Link to="/mypage" className="icon-btn">
            <User size={24} />
          </Link>
        </div>
      </nav>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="search-overlay">
          <div className="search-modal">
            <div className="search-header">
              <input 
                type="text" 
                placeholder="상품명을 검색해보세요..." 
                value={searchQuery}
                onChange={handleSearch}
                autoFocus
                className="search-input"
              />
              <button className="close-search-btn" onClick={closeSearch}>
                <X size={28} />
              </button>
            </div>
            <div className="search-results">
              {searchQuery && searchResults.length === 0 && (
                <div className="no-results">검색 결과가 없습니다.</div>
              )}
              {searchResults.map(product => (
                <div key={product._id || product.id} className="search-result-item" onClick={() => handleResultClick(product._id || product.id)}>
                  <img src={product.imageUrl} alt={product.name} />
                  <div>
                    <h4>{product.name}</h4>
                    <span className="price">{formatPrice(product.price)}원</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{minHeight: '70vh'}}>
        <Outlet />
      </div>

      <footer>
        <p className="footer-text">{storeConfig.storeName} | 대표: 홍길동 | 사업자등록번호: 123-45-67890</p>
        <p className="footer-text">고객센터: 1588-0000 | 이메일: support@{storeConfig.storeName.toLowerCase()}.com</p>
        <p className="footer-text" style={{marginTop: '1rem', opacity: 0.5}}>© 2026 {storeConfig.storeName}. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Layout;
