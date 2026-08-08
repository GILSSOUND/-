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
  const { email, password, name } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      if (user.provider !== 'local') {
        return res.status(400).json({ error: '소셜 로그인으로 이미 가입된 이메일입니다.' });
      }
      return res.status(400).json({ error: '이미 존재하는 이메일입니다.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken
    });
    await user.save();

    // Send Verification Email
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/api/auth/verify-email?token=${verificationToken}`;
    const message = `
      <h1>길스몰 이메일 인증</h1>
      <p>회원가입을 완료하려면 아래 링크를 클릭해주세요.</p>
      <a href="${verificationUrl}" target="_blank">이메일 인증하기</a>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: '길스몰 회원가입 이메일 인증',
        html: message
      });
      res.status(200).json({ success: true, message: '회원가입 성공. 인증 이메일을 확인해주세요.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: '이메일 발송에 실패했습니다. 관리자에게 문의하세요.' });
    }
  } catch (error) {
    res.status(500).json({ error: '서버 오류' });
  }
});

// --- Email Verification ---
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).send('유효하지 않거나 만료된 인증 토큰입니다.');
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Redirect to login on frontend
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}?verified=true`);
  } catch (error) {
    res.status(500).send('서버 오류');
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
router.get('/kakao/callback', passport.authenticate('kakao', { failureRedirect: '/?error=kakao_login_failed' }), handleSocialCallback);

// Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/?error=google_login_failed' }), handleSocialCallback);

// Naver
router.get('/naver', passport.authenticate('naver'));
router.get('/naver/callback', passport.authenticate('naver', { failureRedirect: '/?error=naver_login_failed' }), handleSocialCallback);

module.exports = router;
