import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Cart from './pages/Cart';
import MyPage from './pages/MyPage';
import CategoryPage from './pages/CategoryPage';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/Admin';
import Wishlist from './pages/Wishlist';
import { fetchProducts } from './api';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginModal from './components/LoginModal';
import RegisterPage from './pages/RegisterPage';
import './index.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('gilsmall_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlistItems, setWishlistItems] = useState([]);
  const [products, setProducts] = useState(window.__INITIAL_PRODUCTS__ || []);
  const [toastMessage, setToastMessage] = useState('');
  const { requireAuth } = useAuth();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem('gilsmall_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products. Backend might not be running.", error);
    }
  };

  const handleAddToCart = (product, e, quantity = 1) => {
    if (e && e.stopPropagation) e.stopPropagation();
    requireAuth(() => {
      setCartItems(prev => {
        const existingIndex = prev.findIndex(item => {
          const isSameId = (item._id && product._id && item._id === product._id) || (item.id && product.id && item.id === product.id);
          return isSameId && item.name === product.name;
        });
        if (existingIndex >= 0) {
          const newCart = [...prev];
          newCart[existingIndex].quantity = (newCart[existingIndex].quantity || 1) + quantity;
          return newCart;
        } else {
          return [...prev, { ...product, quantity }];
        }
      });
      showToast(`장바구니에 담겼습니다!`);
    });
  };

  const handleRemoveFromCart = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index, delta) => {
    setCartItems(prev => {
      const newCart = [...prev];
      const newQuantity = (newCart[index].quantity || 1) + delta;
      if (newQuantity >= 1) {
        newCart[index].quantity = newQuantity;
      }
      return newCart;
    });
  };

  const handleChangeCartItemOption = (index, newOptionName) => {
    setCartItems(prev => {
      const newCart = [...prev];
      const item = { ...newCart[index] };
      const origId = item._originalId || item._id || item.id;
      const originalProduct = products.find(p => p._id === origId || p.id === origId);
      
      if (!originalProduct) return prev;
      
      const newOption = originalProduct.options?.find(o => o.name === newOptionName) || null;
      const additionalPrice = newOption ? newOption.additionalPrice : 0;
      
      item.name = newOption ? `${originalProduct.name} [옵션: ${newOption.name}]` : originalProduct.name;
      item.price = originalProduct.price + additionalPrice;
      item.selectedOptionName = newOptionName;
      
      newCart[index] = item;
      return newCart;
    });
  };

  const handleToggleWishlist = (product, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    requireAuth(() => {
      setWishlistItems(prev => {
        const isExist = prev.some(item => {
          if (item._id && product._id && item._id === product._id) return true;
          if (item.id && product.id && item.id === product.id) return true;
          return false;
        });
        if (isExist) {
          return prev.filter(item => {
            if (item._id && product._id && item._id === product._id) return false;
            if (item.id && product.id && item.id === product.id) return false;
            return true;
          });
        } else {
          showToast(`찜 목록에 추가되었습니다!`);
          return [...prev, product];
        }
      });
    });
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout cartCount={cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)} products={products} wishlistCount={wishlistItems.length} />}>
          <Route index element={<Home handleAddToCart={handleAddToCart} handleToggleWishlist={handleToggleWishlist} products={products} refreshGlobalProducts={loadProducts} />} />
          <Route path="category/:categoryId" element={<CategoryPage handleAddToCart={handleAddToCart} handleToggleWishlist={handleToggleWishlist} products={products} />} />
          <Route path="product/:id" element={<ProductDetail handleAddToCart={handleAddToCart} handleToggleWishlist={handleToggleWishlist} products={products} />} />
          <Route path="cart" element={<Cart cartItems={cartItems} handleRemoveFromCart={handleRemoveFromCart} handleUpdateQuantity={handleUpdateQuantity} handleChangeCartItemOption={handleChangeCartItemOption} products={products} />} />
          <Route path="wishlist" element={<Wishlist wishlistItems={wishlistItems} handleAddToCart={handleAddToCart} handleToggleWishlist={handleToggleWishlist} />} />
          <Route path="mypage" element={<MyPage />} />
          <Route path="admin" element={<Admin refreshGlobalProducts={loadProducts} />} />
          <Route path="register" element={<RegisterPage showToast={showToast} />} />
        </Route>
      </Routes>
      <div className={`toast-notification ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>
      <LoginModal />
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
