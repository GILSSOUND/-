import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Cart from './pages/Cart';
import MyPage from './pages/MyPage';
import CategoryPage from './pages/CategoryPage';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/Admin';
import { fetchProducts } from './api';
import './index.css';

function App() {
  const [cartItems, setCartItems] = useState([]);
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

  const handleAddToCart = (product, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setCartItems(prev => [...prev, product]);
    alert(`${product.name}이(가) 장바구니에 담겼습니다!`);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout cartCount={cartItems.length} products={products} />}>
          <Route index element={<Home handleAddToCart={handleAddToCart} products={products} refreshGlobalProducts={loadProducts} />} />
          <Route path="category/:categoryId" element={<CategoryPage handleAddToCart={handleAddToCart} products={products} />} />
          <Route path="product/:id" element={<ProductDetail handleAddToCart={handleAddToCart} products={products} />} />
          <Route path="cart" element={<Cart cartItems={cartItems} />} />
          <Route path="mypage" element={<MyPage />} />
          <Route path="admin" element={<Admin refreshGlobalProducts={loadProducts} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
