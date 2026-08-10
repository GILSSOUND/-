import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = ({ showToast }) => {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
    email: '',
  });

  const [agreements, setAgreements] = useState({
    all: false,
    privacy: false,
    sns: false
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAgreementChange = (e) => {
    const { name, checked } = e.target;
    if (name === 'all') {
      setAgreements({
        all: checked,
        privacy: checked,
        sns: checked
      });
    } else {
      const newAgreements = { ...agreements, [name]: checked };
      newAgreements.all = newAgreements.privacy && newAgreements.sns;
      setAgreements(newAgreements);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.loginId) return setError('아이디를 입력해주세요.');
    if (!/^[a-zA-Z0-9]+$/.test(formData.loginId)) return setError('아이디는 영문과 숫자만 사용 가능합니다.');
    if (formData.password.length < 10) return setError('비밀번호는 10자리 이상이어야 합니다.');
    if (formData.password !== formData.passwordConfirm) return setError('비밀번호가 일치하지 않습니다.');
    if (!formData.name) return setError('이름을 입력해주세요.');
    if (!formData.phone) return setError('전화번호를 입력해주세요.');
    if (!formData.email) return setError('이메일을 입력해주세요.');
    if (!agreements.privacy) return setError('개인정보 수집 및 이용에 동의해야 합니다.');

    setLoading(true);
    const res = await register({
      loginId: formData.loginId,
      password: formData.password,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      agreements: {
        privacy: agreements.privacy,
        sns: agreements.sns
      }
    });
    setLoading(false);

    if (res.success) {
      await login(formData.loginId, formData.password);
      if (showToast) showToast('로그인되었습니다!');
      navigate('/');
    } else {
      setError(res.error);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '8rem auto 4rem auto', padding: '0 1rem', fontFamily: '"Jua", "Pretendard", sans-serif' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '2rem' }}>회원가입</h2>
      
      {error && <div style={{ background: '#fdf2f2', color: '#e74c3c', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* 아이디 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '1.1rem' }}>아이디 (영문/숫자) <span style={{color: '#ff4757'}}>*</span></label>
          <div style={{ position: 'relative' }}>
            <input type="text" name="loginId" value={formData.loginId} onChange={handleChange} style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', fontFamily: '"Jua", sans-serif', fontSize: '1.1rem' }} />
          </div>
        </div>

        {/* 비밀번호 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '1.1rem' }}>비밀번호 <span style={{color: '#ff4757'}}>*</span></label>
          <div style={{ position: 'relative' }}>
            <input type="password" name="password" value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', fontFamily: '"Jua", sans-serif', fontSize: '1.1rem' }} />
          </div>
          <div style={{fontSize: '0.85rem', color: '#999', marginTop: '6px', letterSpacing: '-0.5px'}}>(영문/대소문자/특수문자 중 2가지 이상조합. 10자~16자)</div>
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '1.1rem' }}>비밀번호 확인 <span style={{color: '#ff4757'}}>*</span></label>
          <div style={{ position: 'relative' }}>
            <input type="password" name="passwordConfirm" value={formData.passwordConfirm} onChange={handleChange} style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', fontFamily: '"Jua", sans-serif', fontSize: '1.1rem' }} />
          </div>
        </div>

        {/* 이름 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '1.1rem' }}>이름 <span style={{color: '#ff4757'}}>*</span></label>
          <div style={{ position: 'relative' }}>
            <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', fontFamily: '"Jua", sans-serif', fontSize: '1.1rem' }} />
          </div>
        </div>

        {/* 전화번호 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '1.1rem' }}>전화번호 <span style={{color: '#ff4757'}}>*</span></label>
          <div style={{ position: 'relative' }}>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', fontFamily: '"Jua", sans-serif', fontSize: '1.1rem' }} />
          </div>
        </div>

        {/* 이메일 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '1.1rem' }}>이메일 <span style={{color: '#ff4757'}}>*</span></label>
          <div style={{ position: 'relative' }}>
            <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', fontFamily: '"Jua", sans-serif', fontSize: '1.1rem' }} />
          </div>
        </div>

        {/* 약관 동의 */}
        <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px', background: '#fafafa' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', marginBottom: '1rem', paddingBottom: '0.8rem', borderBottom: '1px solid #ddd', cursor: 'pointer' }}>
            <input type="checkbox" name="all" checked={agreements.all} onChange={handleAgreementChange} style={{ width: '18px', height: '18px' }} />
            약관 전체 동의
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#555', cursor: 'pointer' }}>
              <input type="checkbox" name="privacy" checked={agreements.privacy} onChange={handleAgreementChange} style={{ width: '16px', height: '16px' }} />
              [필수] 개인정보 수집 및 이용 동의
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#555', cursor: 'pointer' }}>
              <input type="checkbox" name="sns" checked={agreements.sns} onChange={handleAgreementChange} style={{ width: '16px', height: '16px' }} />
              [선택] SMS/이메일 마케팅 수신 동의
            </label>
          </div>
        </div>

        {/* 가입 버튼 */}
        <button type="submit" disabled={loading} style={{ marginTop: '1rem', padding: '1rem', background: loading ? '#ccc' : '#000', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '가입 중...' : '가입하기'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
