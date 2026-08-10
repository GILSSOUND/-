import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, User, Lock } from 'lucide-react';
import './LoginModal.css';

const KakaoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
    <path d="M12 3c-5.52 0-10 3.58-10 8 0 2.59 1.48 4.88 3.75 6.3l-1 3.65c-.09.34.28.62.58.45l4.3-2.73c.77.17 1.56.26 2.37.26 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
  </svg>
);

const NaverIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF">
    <path d="M16.27 3.32L10.3 12.35V3.32H5v17.36h5.73l5.97-9.03v9.03H22V3.32h-5.73z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const LoginModal = () => {
  const navigate = useNavigate();
  const { showLoginModal, setShowLoginModal, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!showLoginModal) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      setShowLoginModal(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('아이디(이메일)와 비밀번호를 입력해주세요.');

    const res = await login(email, password);
    if (res.success) {
      setShowLoginModal(false);
    } else {
      setError(res.error);
    }
  };

  const handleSocialLogin = (provider) => {
    // Open a popup for social login
    const width = 500;
    const height = 600;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;
    // Use relative URL to work on both dev (via proxy) and production (same origin)
    window.open(`/api/auth/${provider}`, '소셜로그인', `width=${width},height=${height},top=${top},left=${left}`);
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content login-modal">
        <button className="close-btn" onClick={() => setShowLoginModal(false)}><X size={24} /></button>
        <h2 className="modal-title">로그인</h2>
        <p className="modal-subtitle">길스몰에 오신 것을 환영합니다.</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <User size={20} className="input-icon" />
            <input type="text" placeholder="아이디 또는 이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="input-group">
            <Lock size={20} className="input-icon" />
            <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="primary-btn login-btn">로그인</button>
        </form>

        <div className="divider"><span>또는</span></div>

        <div className="social-login-group">
          <button className="social-btn kakao" onClick={() => handleSocialLogin('kakao')}>
            <KakaoIcon />
            카카오 로그인
          </button>
          <button className="social-btn naver" onClick={() => handleSocialLogin('naver')}>
            <NaverIcon />
            네이버 로그인
          </button>
          <button className="social-btn google" onClick={() => handleSocialLogin('google')}>
            <GoogleIcon />
            구글 로그인
          </button>
        </div>

        <div className="modal-footer">
          아직 회원이 아니신가요? 
          <span className="text-link" onClick={() => {
            setShowLoginModal(false);
            navigate('/register');
          }}>회원가입</span>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
