require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const Product = require('./models/Product');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 프론트엔드 빌드 폴더를 정적 파일로 서빙
app.use(express.static(path.join(__dirname, '../dist')));

// MongoDB Connection
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("==========================================");
  console.error("🚨 치명적 에러: MONGO_URI 환경 변수가 없습니다!");
  console.error("렌더(Render) 대시보드의 Environment Variables에 MONGO_URI를 꼭 추가해주세요.");
  console.error("==========================================");
  // process.exit(1); 대신 서버는 살려두고 안내 메시지 출력
} else {
  mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));
}

// Multer Setup (Memory Storage for ImgBB upload)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- Image Upload Route (ImgBB) ---
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imgbbKey = process.env.IMGBB_API_KEY;
    if (!imgbbKey) {
       return res.status(500).json({ error: 'ImgBB API key is not configured' });
    }

    // ImgBB requires base64 string
    const base64Image = req.file.buffer.toString('base64');
    
    // form-data 패키지 대신 네이티브 URLSearchParams 사용 (안정성 강화)
    const params = new URLSearchParams();
    params.append('image', base64Image);

    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    res.json({
      success: true,
      imageUrl: response.data.data.url
    });
  } catch (error) {
    const errorDetails = error.response?.data?.error?.message || error.message;
    console.error('Image Upload Error:', errorDetails);
    res.status(500).json({ error: `ImgBB 에러: ${errorDetails}` });
  }
});

// --- Product CRUD Routes ---

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create product
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product', details: error.message });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// React Router 대응: API 외의 모든 요청은 index.html로 전송
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
