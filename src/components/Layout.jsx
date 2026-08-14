import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, X, Utensils, Sparkles, MapPin, Truck, Percent, LogOut, LogIn } from 'lucide-react';
import { storeConfig } from '../data/products';
import { useAuth } from '../context/AuthContext';

function Layout({ cartCount, products, wishlistCount }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, requireAuth } = useAuth();
  
  const isProductPage = location.pathname.startsWith('/product/');

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
          <Link to="/category/mealkit" style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}><Utensils size={18} />밀키트</Link>
          <Link to="/category/new" style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}><Sparkles size={18} />신상품</Link>
          <Link to="/category/local" style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}><MapPin size={18} />산지직송</Link>
          <Link to="/category/direct" style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}><Truck size={18} />업체직송</Link>
          <Link to="/category/sale" style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}><Percent size={18} />특가할인</Link>
        </div>
        <div className="nav-actions">
          {user && (
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', marginRight: '0.3rem', color: 'var(--text-main)' }}>
              {user.name}님
            </span>
          )}
          <button className="icon-btn" onClick={() => setIsSearchOpen(true)}>
            <Search size={24} />
          </button>
          <Link to="/wishlist" className="icon-btn" style={{position: 'relative'}}>
            <Heart size={24} />
            {wishlistCount > 0 && (
              <span className="cart-badge" style={{ backgroundColor: '#ff4757' }}>
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link to="/cart" className="icon-btn" style={{position: 'relative'}}>
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="cart-badge">
                {cartCount}
              </span>
            )}
          </Link>
          <div 
            className="icon-btn" 
            onClick={() => requireAuth(() => navigate('/mypage'))} 
            style={{ cursor: 'pointer' }}
          >
            <User size={24} />
          </div>
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
        <p className="footer-text" style={{marginTop: '1rem', opacity: 0.5}}>
          © 2026 {storeConfig.storeName}. All rights reserved. 
          <Link to="/admin" style={{ marginLeft: '1rem', color: 'inherit', textDecoration: 'underline' }}>운영자 페이지</Link>
        </p>
      </footer>

      {/* Floating Login/Logout Button */}
      <div 
        onClick={() => {
          if (user) {
            if (window.confirm("로그아웃하시겠습니까?")) {
              logout();
            }
          } else {
            requireAuth(() => {});
          }
        }}
        style={{
          position: 'fixed',
          bottom: isProductPage ? '100px' : '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-color)',
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'transform 0.2s',
        }}
        title={user ? "로그아웃" : "로그인"}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {user ? <LogOut size={26} /> : <LogIn size={26} />}
      </div>
    </div>
  );
}

export default Layout;
