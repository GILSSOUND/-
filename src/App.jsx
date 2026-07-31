import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Cart from './pages/Cart';
import MyPage from './pages/MyPage';
import CategoryPage from './pages/CategoryPage';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/Admin';
import Wishlist from './pages/Wishlist';
import { fetchProducts } from './api';
import './index.css';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [products, setProducts] = useState(window.__INITIAL_PRODUCTS__ || []);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  useEffect(() => {
    loadProducts();
  }, []);

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
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => {
        const isSameId = (item._id && product._id && item._id === product._id) || (item.id && product.id && item.id === product.id);
        return isSameId && item.name === product.name;
      });
      if (existingIndex >= 0) {
        const newCart = [...prev];
        newCart[existingIndex].quantity = (newCart[existingIndex].quantity || 1) + quantity;
        return newCart;
      }
      return [...prev, { ...product, quantity }];
    });
    showToast(`장바구니에 담겼습니다!`);
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
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout cartCount={cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)} products={products} wishlistCount={wishlistItems.length} />}>
          <Route index element={<Home handleAddToCart={handleAddToCart} handleToggleWishlist={handleToggleWishlist} products={products} refreshGlobalProducts={loadProducts} />} />
          <Route path="category/:categoryId" element={<CategoryPage handleAddToCart={handleAddToCart} handleToggleWishlist={handleToggleWishlist} products={products} />} />
          <Route path="product/:id" element={<ProductDetail handleAddToCart={handleAddToCart} handleToggleWishlist={handleToggleWishlist} products={products} />} />
          <Route path="cart" element={<Cart cartItems={cartItems} handleRemoveFromCart={handleRemoveFromCart} handleUpdateQuantity={handleUpdateQuantity} handleChangeCartItemOption={handleChangeCartItemOption} products={products} />} />
          <Route path="wishlist" element={<Wishlist wishlistItems={wishlistItems} handleAddToCart={handleAddToCart} handleToggleWishlist={handleToggleWishlist} />} />
          <Route path="mypage" element={<MyPage />} />
          <Route path="admin" element={<Admin refreshGlobalProducts={loadProducts} />} />
        </Route>
      </Routes>
      <div className={`toast-notification ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </BrowserRouter>
  );
}

export default App;
