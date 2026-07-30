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

export const deleteProduct = async (id) => {
  const res = await axios.delete(`${API_URL}/products/${id}`);
  return res.data;
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const res = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
  return res.data;
};
