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

export const updateMyInfo = async (data) => {
  const res = await axios.put(`${API_URL}/auth/me`, data);
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

export const adminUpdateUser = async (userId, data) => {
  const res = await axios.put(`${API_URL}/auth/users/${userId}`, data);
  return res.data;
};

export const createReview = (reviewData) => axios.post(`${API_URL}/reviews`, reviewData);
export const getReviewsByProduct = (productId) => axios.get(`${API_URL}/reviews/${productId}`);
export const deleteReview = (reviewId) => axios.delete(`${API_URL}/reviews/${reviewId}`);

export const uploadSlicedImage = async (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      const sliceHeight = 1500;
      const numSlices = Math.ceil(img.height / sliceHeight);
      const urls = [];
      
      try {
        for (let i = 0; i < numSlices; i++) {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          
          let currentSliceHeight = sliceHeight;
          if (i * sliceHeight + sliceHeight > img.height) {
            currentSliceHeight = img.height - (i * sliceHeight);
          }
          
          canvas.height = currentSliceHeight;
          const ctx = canvas.getContext('2d');
          
          // Draw the slice
          ctx.drawImage(img, 0, i * sliceHeight, img.width, currentSliceHeight, 0, 0, img.width, currentSliceHeight);
          
          // Convert canvas to blob
          const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.95));
          const sliceFile = new File([blob], `slice_${i}.jpg`, { type: 'image/jpeg' });
          
          // Upload slice directly to original backend upload route
          const formData = new FormData();
          formData.append('image', sliceFile);
          const response = await axios.post(`${API_URL}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          urls.push(response.data.imageUrl);
        }
        resolve(urls);
      } catch (err) {
        console.error('Canvas slice upload error:', err);
        reject(err);
      }
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
