import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { ShoppingBag, RefreshCcw, RotateCcw, User, ChevronRight } from 'lucide-react';
import { fetchMyOrders } from '../api';

function MyPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

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
        return (
          <div className="mypage-tab-content">
            <h3>개인정보수정</h3>
            <div className="profile-edit-form">
              <div className="form-group">
                <label>이름</label>
                <input type="text" value={user.name} disabled />
              </div>
              <div className="form-group">
                <label>이메일</label>
                <input type="email" value={user.email} disabled />
              </div>
              <button className="primary-btn" style={{marginTop: '1rem'}}>수정하기</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
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
            <button className={`menu-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              주문내역 <ChevronRight size={18} />
            </button>
            <button className={`menu-btn ${activeTab === 'returns' ? 'active' : ''}`} onClick={() => setActiveTab('returns')}>
              반품내역 <ChevronRight size={18} />
            </button>
            <button className={`menu-btn ${activeTab === 'exchanges' ? 'active' : ''}`} onClick={() => setActiveTab('exchanges')}>
              교환내역 <ChevronRight size={18} />
            </button>
            <button className={`menu-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              개인정보수정 <ChevronRight size={18} />
            </button>
          </nav>
        </aside>

        {/* Right Content */}
        <main className="mypage-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default MyPage;
