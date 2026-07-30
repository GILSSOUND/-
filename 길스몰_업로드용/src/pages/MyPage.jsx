import React from 'react';

function MyPage() {
  return (
    <div className="page-container">
      <h2 className="page-title">마이페이지</h2>
      
      <div className="mypage-dashboard">
        <div className="profile-section">
          <div className="profile-avatar">👤</div>
          <div className="profile-info">
            <h3>홍길동 님</h3>
            <p>일반회원</p>
          </div>
        </div>
        
        <div className="mypage-grid">
          <div className="mypage-card">
            <h4>주문/배송조회</h4>
            <div className="mypage-count">0건</div>
          </div>
          <div className="mypage-card">
            <h4>쿠폰</h4>
            <div className="mypage-count">2장</div>
          </div>
          <div className="mypage-card">
            <h4>적립금</h4>
            <div className="mypage-count">3,000원</div>
          </div>
          <div className="mypage-card">
            <h4>찜한 상품</h4>
            <div className="mypage-count">0개</div>
          </div>
        </div>

        <div className="mypage-menu">
          <ul>
            <li>개인정보 수정</li>
            <li>배송지 관리</li>
            <li>1:1 문의</li>
            <li>공지사항</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MyPage;
