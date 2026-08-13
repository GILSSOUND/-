import axios from 'axios';

// 배포 및 프록시 대응 동적 URL
const API_URL = '/api';

export const fetchProducts = async () => {
  const res = await axios.get(`${API_URL}/products`);
  return res.data;
};

export const createProduct = async (productData) => {
  const res = await axios.post(`${API_URL}/products`, productData);
  return res.data;
};

export const updateProduct = async (id, productData) => {
  const res = await axios.put(`${API_URL}/products/${id}`, productData);
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await axios.delete(`${API_URL}/products/${id}`);
  return res.data;
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const res = await axios.post(`${API_URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return {
      success: true,
      imageUrl: res.data.imageUrl
    };
  } catch (error) {
    const message = error.response?.data?.error || error.message;
    throw new Error(message);
  }
};

export const fetchConfig = async (key) => {
  const res = await axios.get(`${API_URL}/config/${key}`);
  return res.data;
};

export const updateConfig = async (key, value) => {
  const res = await axios.post(`${API_URL}/config/${key}`, { value });
  return res.data;
};

export const fetchUsers = async () => {
  const res = await axios.get(`${API_URL}/auth/users`);
  return res.data;
};

// --- Order API ---
export const createOrder = async (orderData) => {
  const res = await axios.post(`${API_URL}/orders/complete`, orderData);
  return res.data;
};

export const fetchMyOrders = async (userId) => {
  const res = await axios.get(`${API_URL}/orders/my/${userId}`);
  return res.data;
};

export const fetchAllOrders = async () => {
  const res = await axios.get(`${API_URL}/orders`);
  return res.data;
};

export const updateOrderStatus = async (orderId, payload) => {
  const res = await axios.put(`${API_URL}/orders/${orderId}/status`, payload);
  return res.data;
};
