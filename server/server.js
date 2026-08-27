require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const Product = require('./models/Product');
const Review = require('./models/Review');
const User = require('./models/User'); // ensure User is available
const Order = require('./models/Order'); // ensure Order is available
const Config = require('./models/Config');
const authRoutes = require('./routes/auth');
require('./config/passport')();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust the proxy (Render uses a reverse proxy) to correctly identify https
app.set('trust proxy', 1);

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'gilsmall_session_secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// 라우터 연결
app.use('/api/auth', authRoutes);

const orderRoutes = require('./routes/order');
app.use('/api/orders', orderRoutes);

// 프론트엔드 빌드 폴더를 정적 파일로 서빙 (index.html은 동적 제공을 위해 제외)
const fs = require('fs');
app.use(express.static(path.join(__dirname, '../dist'), { index: false }));

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


// --- Review Routes ---
app.post('/api/reviews', async (req, res) => {
  try {
    const { userId, userName, orderId, productIds, rating, content, images } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(400).json({ error: '유효하지 않은 주문입니다.' });
    }
    if (order.hasReview) {
      return res.status(400).json({ error: '이미 리뷰를 작성한 주문입니다.' });
    }

    const pointsToAward = (images && images.length >= 3) ? 1000 : 500;

    
    const purchasedItems = order.items.map(item => ({ name: item.name, option: item.selectedOptionName || '' }));
    const newReview = new Review({
      userId, userName, orderId, productIds, purchasedItems, rating, content, images, pointsAwarded: pointsToAward
    });
    await newReview.save();

    order.hasReview = true;
    await order.save();

    const user = await User.findById(userId);
    if (user) {
      user.points = (user.points || 0) + pointsToAward;
      await user.save();
    }

    res.json({ success: true, review: newReview, pointsAwarded: pointsToAward });
  } catch (err) {
    res.status(500).json({ error: '리뷰 등록 실패', details: err.message });
  }
});

app.get('/api/reviews/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productIds: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: '리뷰 조회 실패' });
  }
});

// --- Config Routes ---
app.get('/api/config/:key', async (req, res) => {
  try {
    const config = await Config.findOne({ key: req.params.key });
    res.json(config ? config.value : null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

app.post('/api/config/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const config = await Config.findOneAndUpdate(
      { key },
      { value },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: config.value });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update config' });
  }
});

// --- Product CRUD Routes ---

// --- Product Cache Setup ---
let cachedProducts = null;
let lastCacheTime = 0;

async function getProductsCached() {
  if (!cachedProducts || Date.now() - lastCacheTime > 5000) { // 5초 캐시
    try {
      cachedProducts = await Product.find().sort({ createdAt: -1 });
      lastCacheTime = Date.now();
    } catch (e) {
      if (!cachedProducts) cachedProducts = [];
    }
  }
  return cachedProducts;
}

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await getProductsCached();
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
    cachedProducts = null; // 캐시 초기화
    res.json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product', details: error.message });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    cachedProducts = null; // 캐시 초기화
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    cachedProducts = null; // 캐시 초기화
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// React Router 대응 및 초기 데이터 인젝션
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  try {
    let html = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');
    const products = await getProductsCached();
    // 안전하게 스크립트 태그로 데이터 주입
    const scriptTag = `<script>window.__INITIAL_PRODUCTS__ = ${JSON.stringify(products).replace(/</g, '\\u003c')};</script>`;
    html = html.replace('</head>', `${scriptTag}</head>`);
    res.send(html);
  } catch (err) {
    console.error("HTML Injection failed, serving raw file", err);
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
