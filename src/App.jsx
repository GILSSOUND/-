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
  const [products, setProducts] = useState([]);

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
      const existingIndex = prev.findIndex(item => (item._id === product._id || item.id === product.id) && item.name === product.name);
      if (existingIndex >= 0) {
        const newCart = [...prev];
        newCart[existingIndex].quantity = (newCart[existingIndex].quantity || 1) + quantity;
        return newCart;
      }
      return [...prev, { ...product, quantity }];
    });
    alert(`${product.name}이(가) 장바구니에 담겼습니다!`);
  };

  const handleToggleWishlist = (product, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setWishlistItems(prev => {
      const isExist = prev.some(item => (item._id === product._id || item.id === product.id));
      if (isExist) {
        return prev.filter(item => (item._id !== product._id && item.id !== product.id));
      } else {
        alert(`${product.name}이(가) 찜 목록에 추가되었습니다!`);
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
          <Route path="cart" element={<Cart cartItems={cartItems} />} />
          <Route path="wishlist" element={<Wishlist wishlistItems={wishlistItems} handleAddToCart={handleAddToCart} handleToggleWishlist={handleToggleWishlist} />} />
          <Route path="mypage" element={<MyPage />} />
          <Route path="admin" element={<Admin refreshGlobalProducts={loadProducts} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
