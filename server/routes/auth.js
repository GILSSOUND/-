const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'gilsmall_secret_key', {
    expiresIn: '7d'
  });
};

// --- Local Register ---
router.post('/register', async (req, res) => {
  const { loginId, email, password, name, phone, agreements } = req.body;
  try {
    // Check if loginId is taken
    let userByLoginId = await User.findOne({ loginId });
    if (userByLoginId) {
      return res.status(400).json({ error: '이미 사용 중인 아이디입니다.' });
    }

    // Check if email is taken
    let userByEmail = await User.findOne({ email });
    if (userByEmail) {
      if (userByEmail.provider !== 'local') {
        return res.status(400).json({ error: '소셜 로그인으로 이미 가입된 이메일입니다.' });
      }
      return res.status(400).json({ error: '이미 사용 중인 이메일입니다.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      loginId,
      email,
      password: hashedPassword,
      name,
      phone,
      agreements,
      isVerified: true
    });
    await user.save();

    res.status(200).json({ success: true, message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});


// --- Local Login ---
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ error: info.message });

    req.logIn(user, (err) => {
      if (err) return next(err);
      
      const token = generateToken(user._id);
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.json({ success: true, user: { id: user._id, email: user.email, name: user.name, role: user.role, provider: user.provider } });
    });
  })(req, res, next);
});

// --- Logout ---
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  req.logout(() => {});
  res.json({ success: true, message: '로그아웃 되었습니다.' });
});

// --- Get Current User (Check Auth) ---
router.get('/me', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: '인증되지 않았습니다.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gilsmall_secret_key');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ error: '사용자를 찾을 수 없습니다.' });

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
});

// ==========================================
// Social Login Routes
// ==========================================

const handleSocialCallback = (req, res) => {
  const token = generateToken(req.user._id);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  // Send message to parent window to close popup and update state
  res.send(`
    <script>
      window.opener.postMessage({ type: 'SOCIAL_LOGIN_SUCCESS', user: ${JSON.stringify({ id: req.user._id, email: req.user.email, name: req.user.name, role: req.user.role, provider: req.user.provider })} }, '*');
      window.close();
    </script>
  `);
};

// Kakao
router.get('/kakao', passport.authenticate('kakao'));
router.get('/kakao/callback', (req, res, next) => {
  passport.authenticate('kakao', (err, user, info) => {
    if (err) {
      return res.status(500).send(`<h2>카카오 로그인 서버 에러</h2><p>에러 내용: ${err.message || err}</p><p>전체 에러: ${JSON.stringify(err)}</p>`);
    }
    if (!user) {
      return res.redirect('/?error=kakao_login_failed');
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return res.status(500).send(`<h2>로그인 세션 에러</h2><p>${loginErr.message || loginErr}</p>`);
      }
      return handleSocialCallback(req, res);
    });
  })(req, res, next);
});

// Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/?error=google_login_failed' }), handleSocialCallback);

// Naver
router.get('/naver', passport.authenticate('naver'));
router.get('/naver/callback', passport.authenticate('naver', { failureRedirect: '/?error=naver_login_failed' }), handleSocialCallback);

module.exports = router;
