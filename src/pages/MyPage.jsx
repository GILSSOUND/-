import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { ShoppingBag, RefreshCcw, RotateCcw, User, ChevronRight } from 'lucide-react';

function MyPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'orders':
        return (
          <div className="mypage-tab-content">
            <h3>주문내역</h3>
            <div className="mypage-empty-state">
              <ShoppingBag size={48} color="#ddd" />
              <p>주문한 내역이 없습니다.</p>
            </div>
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
    <div className="page-container">
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
