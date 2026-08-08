import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User } from 'lucide-react';
import './LoginModal.css';

const RegisterModal = () => {
  const { showRegisterModal, setShowRegisterModal, setShowLoginModal, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!showRegisterModal) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      setShowRegisterModal(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password || !name) return setError('모든 항목을 입력해주세요.');
    if (password !== passwordConfirm) return setError('비밀번호가 일치하지 않습니다.');

    const res = await register(email, password, name);
    if (res.success) {
      setSuccessMsg(res.message || '가입되셨습니다. 인증 이메일을 확인해주세요!');
      setTimeout(() => {
        setShowRegisterModal(false);
        setShowLoginModal(true);
      }, 3000);
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content login-modal">
        <button className="close-btn" onClick={() => setShowRegisterModal(false)}><X size={24} /></button>
        <h2 className="modal-title">회원가입</h2>
        <p className="modal-subtitle">이메일 인증 후 가입이 완료됩니다.</p>

        {error && <div className="error-message">{error}</div>}
        {successMsg && <div className="error-message" style={{ background: '#d4efdf', color: '#27ae60' }}>{successMsg}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="input-group">
            <User size={20} className="input-icon" />
            <input type="text" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="input-group">
            <Mail size={20} className="input-icon" />
            <input type="email" placeholder="이메일 주소" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="input-group">
            <Lock size={20} className="input-icon" />
            <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="input-group">
            <Lock size={20} className="input-icon" />
            <input type="password" placeholder="비밀번호 확인" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
          </div>
          <button type="submit" className="primary-btn login-btn">가입하기</button>
        </form>

        <div className="modal-footer">
          이미 계정이 있으신가요? 
          <span className="text-link" onClick={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}>로그인</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
