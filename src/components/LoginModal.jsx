import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock } from 'lucide-react';
import './LoginModal.css';

const LoginModal = () => {
  const { showLoginModal, setShowLoginModal, setShowRegisterModal, login } = useAuth();
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
    if (!email || !password) return setError('이메일과 비밀번호를 입력해주세요.');

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
    // Backend URL should match proxy or direct
    window.open(`http://localhost:5000/api/auth/${provider}`, '소셜로그인', `width=${width},height=${height},top=${top},left=${left}`);
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
            <Mail size={20} className="input-icon" />
            <input type="email" placeholder="이메일 주소" value={email} onChange={(e) => setEmail(e.target.value)} />
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
            <img src="/kakao-icon.png" alt="카카오" onError={(e) => e.target.style.display='none'} />
            카카오 로그인
          </button>
          <button className="social-btn naver" onClick={() => handleSocialLogin('naver')}>
            <img src="/naver-icon.png" alt="네이버" onError={(e) => e.target.style.display='none'} />
            네이버 로그인
          </button>
          <button className="social-btn google" onClick={() => handleSocialLogin('google')}>
            <img src="/google-icon.png" alt="구글" onError={(e) => e.target.style.display='none'} />
            구글 로그인
          </button>
        </div>

        <div className="modal-footer">
          아직 회원이 아니신가요? 
          <span className="text-link" onClick={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}>회원가입</span>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
