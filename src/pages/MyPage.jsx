import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { ShoppingBag, RefreshCcw, RotateCcw, User, ChevronRight } from 'lucide-react';
import { fetchMyOrders, updateMyInfo } from '../api';

function MyPage() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    email: '',
    zonecode: '',
    address: '',
    detailAddress: ''
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        zonecode: user.zonecode || '',
        address: user.address || '',
        detailAddress: user.detailAddress || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === 'orders') {
      loadOrders();
    }
  }, [user, activeTab]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchMyOrders(user._id || user.id);
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => price.toLocaleString('ko-KR');
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('ko-KR');

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'orders':
        return (
          <div className="mypage-tab-content">
            <h3>주문내역</h3>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</div>
            ) : orders.length === 0 ? (
              <div className="mypage-empty-state">
                <ShoppingBag size={48} color="#ddd" />
                <p>주문한 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.map((order) => (
                  <div key={order._id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>{formatDate(order.createdAt)}</span>
                        <span style={{ color: '#888', marginLeft: '0.5rem', fontSize: '0.9rem' }}>주문번호: {order.merchant_uid}</span>
                      </div>
                      <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{order.status}</span>
                    </div>
                    
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: idx !== order.items.length - 1 ? '1rem' : 0 }}>
                        <img src={item.imageUrl} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <span style={{ fontWeight: 'bold', marginBottom: '0.3rem' }}>{item.name}</span>
                          {item.selectedOptionName && <span style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.3rem' }}>옵션: {item.selectedOptionName}</span>}
                          <span>{formatPrice(item.price)}원 / {item.quantity}개</span>
                        </div>
                      </div>
                    ))}
                    
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #eee', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      총 결제 금액: {formatPrice(order.totalAmount + order.shippingFee)}원
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'returns':
        return (
          <div className="mypage-tab-content">
            <h3>반품내역</h3>
            <div className="mypage-empty-state">
              <RotateCcw size={48} color="#ddd" />
              <p>반품 내역이 없습니다.</p>
            </div>
          </div>
        );
      case 'exchanges':
        return (
          <div className="mypage-tab-content">
            <h3>교환내역</h3>
            <div className="mypage-empty-state">
              <RefreshCcw size={48} color="#ddd" />
              <p>교환 내역이 없습니다.</p>
            </div>
          </div>
        );
      case 'profile':
        const handleProfileChange = (e) => setProfileForm(prev => ({...prev, [e.target.name]: e.target.value}));
        const handlePostcode = () => {
          new window.daum.Postcode({
            oncomplete: (data) => {
              let fullAddr = data.address;
              let extraAddr = '';
              if (data.addressType === 'R') {
                if (data.bname !== '') extraAddr += data.bname;
                if (data.buildingName !== '') extraAddr += extraAddr !== '' ? `, ${data.buildingName}` : data.buildingName;
                fullAddr += extraAddr !== '' ? ` (${extraAddr})` : '';
              }
              setProfileForm(prev => ({...prev, zonecode: data.zonecode, address: fullAddr}));
            }
          }).open();
        };
        const handleSave = async () => {
          try {
            const data = await updateMyInfo(profileForm);
            setUser(data.user);
            setIsEditingProfile(false);
            alert('개인정보가 성공적으로 수정되었습니다.');
          } catch(e) {
            alert(e.response?.data?.error || e.message);
          }
        };

        const inputStyle = {
          padding: '0.8rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem',
          background: isEditingProfile ? 'white' : '#f5f5f5',
          color: isEditingProfile ? '#333' : '#666',
          fontFamily: 'inherit'
        };

        return (
          <div className="mypage-tab-content">
            <h3>나의 정보</h3>

            <div style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.5rem'}}>
              <input type="checkbox" id="default-shipping-check" defaultChecked style={{width: '18px', height: '18px', cursor: 'pointer'}} />
              <label htmlFor="default-shipping-check" style={{fontSize: '1.1rem', cursor: 'pointer', color: '#333', fontWeight: 'bold'}}>기본 배송정보로 입력</label>
            </div>

            <div className="profile-edit-form" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
              <div className="form-group" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <label style={{fontWeight: 'bold', color: '#555'}}>이름</label>
                <input type="text" name="name" value={profileForm.name} onChange={handleProfileChange} disabled={!isEditingProfile} style={inputStyle} />
              </div>
              <div className="form-group" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <label style={{fontWeight: 'bold', color: '#555'}}>전화번호</label>
                <input type="text" name="phone" value={profileForm.phone} onChange={handleProfileChange} disabled={!isEditingProfile} style={inputStyle} />
              </div>
              <div className="form-group" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <label style={{fontWeight: 'bold', color: '#555'}}>이메일</label>
                <input type="email" name="email" value={profileForm.email} onChange={handleProfileChange} disabled={!isEditingProfile || user.provider !== 'local'} style={{...inputStyle, background: (!isEditingProfile || user.provider !== 'local') ? '#f5f5f5' : 'white'}} />
                {user.provider !== 'local' && isEditingProfile && <small style={{color: '#888'}}>소셜 로그인 회원은 이메일을 변경할 수 없습니다.</small>}
              </div>
              
              <div className="form-group" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <label style={{fontWeight: 'bold', color: '#555'}}>주소</label>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <input type="text" name="zonecode" value={profileForm.zonecode} readOnly placeholder="우편번호" style={{...inputStyle, flex: 1, background: '#f5f5f5'}} />
                  {isEditingProfile && (
                    <button type="button" onClick={handlePostcode} style={{padding: '0 1.5rem', background: '#333', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'bold'}}>주소찾기</button>
                  )}
                </div>
                <input type="text" name="address" value={profileForm.address} readOnly placeholder="기본주소" style={{...inputStyle, background: '#f5f5f5'}} />
                <input type="text" name="detailAddress" value={profileForm.detailAddress} onChange={handleProfileChange} disabled={!isEditingProfile} placeholder="상세주소를 입력해주세요" style={inputStyle} />
              </div>

              {!isEditingProfile ? (
                <button onClick={() => setIsEditingProfile(true)} style={{marginTop: '1rem', padding: '1rem', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'inherit'}}>기본정보 수정하기</button>
              ) : (
                <button onClick={handleSave} style={{marginTop: '1rem', padding: '1rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'inherit'}}>수정완료</button>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
    <style>
      {`
        .mypage-container * {
          font-family: "Jua", "Pretendard", sans-serif !important;
        }
      `}
    </style>
    <div className="page-container mypage-container">
      <div className="mypage-layout">
        {/* Left Sidebar */}
        <aside className="mypage-sidebar">
          <div className="mypage-sidebar-profile">
            <div className="avatar"><User size={32} /></div>
            <div className="info">
              <h2>{user.name} 님</h2>
              <p>{user.email}</p>
            </div>
          </div>
          <nav className="mypage-sidebar-menu">
            <button className={`menu-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              나의정보 <ChevronRight size={18} />
            </button>
            <button className={`menu-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              주문내역 <ChevronRight size={18} />
            </button>
            <button className={`menu-btn ${activeTab === 'returns' ? 'active' : ''}`} onClick={() => setActiveTab('returns')}>
              반품내역 <ChevronRight size={18} />
            </button>
            <button className={`menu-btn ${activeTab === 'exchanges' ? 'active' : ''}`} onClick={() => setActiveTab('exchanges')}>
              교환내역 <ChevronRight size={18} />
            </button>
          </nav>
        </aside>

        {/* Right Content */}
        <main className="mypage-content">
          {renderContent()}
        </main>
      </div>
    </div>
    </>
  );
}

export default MyPage;
