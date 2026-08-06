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
    // 렌더 서버(IP 차단)를 거치지 않고, 사용자 브라우저에서 직접 ImgBB로 쏩니다! (차단 확률 0%)
    const imgbbKey = '272a28545c8744b89bb8bfacae772d6d'; // 확인된 정상 키
    const res = await axios.post(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, formData);
    
    return {
      success: true,
      imageUrl: res.data.data.url
    };
  } catch (error) {
    // 프론트엔드에서 바로 잡은 에러
    const message = error.response?.data?.error?.message || error.message;
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
