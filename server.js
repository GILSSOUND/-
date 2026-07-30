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
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

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
    
    const formData = new FormData();
    formData.append('image', base64Image);

    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, formData, {
      headers: formData.getHeaders()
    });

    res.json({
      success: true,
      imageUrl: response.data.data.url
    });
  } catch (error) {
    console.error('Image Upload Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Image upload failed' });
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
