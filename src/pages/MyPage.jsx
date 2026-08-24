import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { ShoppingBag, RefreshCcw, RotateCcw, User, ChevronRight, X, Star } from 'lucide-react';
import { fetchMyOrders, updateMyInfo, updateOrderStatus, uploadImage, createReview } from '../api';

function MyPage() {
  const { user, setUser, loading: authLoading } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [claimOrder, setClaimOrder] = useState(null);
  const [claimForm, setClaimForm] = useState({
    type: 'return',
    reason: '',
    customReason: '',
    imageFiles: []
  });
  const [claimLoading, setClaimLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    email: '',
    zonecode: '',
    address: '',
    detailAddress: '',
    doorPassword: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'orders') {
      setActiveTab('orders');
    }
  }, [location]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        zonecode: user.zonecode || '',
        address: user.address || '',
        detailAddress: user.detailAddress || '',
        doorPassword: user.doorPassword || ''
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

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('정말 구매를 취소하시겠습니까?')) {
      try {
        await updateOrderStatus(orderId, { status: '취소됨' });
        alert('구매가 취소되었습니다.');
        loadOrders();
      } catch (error) {
        alert('구매 취소 중 오류가 발생했습니다.');
        console.error(error);
      }
    }
  };

  
  const submitReview = async () => {
    if (!reviewForm.content.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }
    setReviewLoading(true);
    try {
      let imageUrls = [];
      if (reviewForm.imageFiles.length > 0) {
        for (let file of reviewForm.imageFiles) {
          const formData = new FormData();
          formData.append('image', file);
          const res = await fetch(import.meta.env.VITE_API_URL + '/upload', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.url) imageUrls.push(data.url);
        }
      }

      // get productIds from order
      const productIds = reviewOrder.items.map(i => i.productId).filter(Boolean);

      const res = await createReview({
        userId: user._id || user.id,
        userName: user.name,
        orderId: reviewOrder._id,
        productIds,
        rating: reviewForm.rating,
        content: reviewForm.content,
        images: imageUrls
      });
      
      alert('리뷰가 등록되었습니다! ' + res.data.pointsAwarded + '포인트가 적립되었습니다.');
      
      // Update local orders state to reflect hasReview
      setOrders(prev => prev.map(o => o._id === reviewOrder._id ? { ...o, hasReview: true } : o));
      
      // Update local user points
      if (setUser) {
        setUser({ ...user, points: (user.points || 0) + res.data.pointsAwarded });
      }

      setReviewOrder(null);
      setReviewForm({ rating: 5, content: '', imageFiles: [] });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || '리뷰 등록 중 오류가 발생했습니다.');
    } finally {
      setReviewLoading(false);
    }
  };

  const submitClaim = async () => {
    if(!claimForm.reason) return alert('사유를 선택해주세요.');
    if(claimForm.reason === '기타' && !claimForm.customReason) return alert('상세 사유를 적어주세요.');
    if(!claimForm.imageFiles || claimForm.imageFiles.length === 0) return alert('사진을 1장 이상 업로드해주세요.');

    setClaimLoading(true);
    try {
      const imageUrls = [];
      if(claimForm.imageFiles && claimForm.imageFiles.length > 0) {
        for (const file of claimForm.imageFiles) {
          const res = await uploadImage(file);
          const url = res.data?.url || res.data || '';
          if (url) imageUrls.push(url);
        }
      }

      const claimData = {
        type: 'return',
        reason: claimForm.reason,
        customReason: claimForm.customReason,
        imageUrls
      };

      await updateOrderStatus(claimOrder._id, { 
        status: '반품요청',
        claim: claimData
      });

      alert('신청이 완료되었습니다.');
      setClaimOrder(null);
      loadOrders();
    } catch(err) {
      alert('오류가 발생했습니다.');
      console.error(err);
    } finally {
      setClaimLoading(false);
    }
  };

  const formatPrice = (price) => price.toLocaleString('ko-KR');
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('ko-KR');

  if (authLoading) {
    return <div style={{ padding: '5rem', textAlign: 'center' }}>사용자 정보를 불러오는 중입니다...</div>;
  }

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
            ) : orders.filter(o => !o.claim || o.claim.type !== 'return').length === 0 ? (
              <div className="mypage-empty-state">
                <ShoppingBag size={48} color="#ddd" />
                <p>주문한 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.filter(o => !o.claim || o.claim.type !== 'return').map((order) => (
                  <div key={order._id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1.5rem', cursor: 'pointer', transition: 'box-shadow 0.2s' }} onClick={() => setSelectedOrder(order)} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ fontWeight: 'bold' }}>{formatDate(order.createdAt)}</span>
                        <span style={{ color: '#888', fontSize: '0.85rem' }}>주문번호: {order.merchant_uid}</span>
                      </div>
                      <div style={{ whiteSpace: 'nowrap', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                          {order.status === '환불됨' || (order.status === '환불완료' && !order.claim) ? '취소됨' : 
                           (order.status === '환불완료' && order.claim) ? '반품요청' : order.status}
                        </span>
                        {(order.status === '환불됨' || order.status === '환불완료') && (
                          <span style={{ color: '#ff4757', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '0.2rem' }}>환불완료</span>
                        )}
                      </div>
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
                    
                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #eee' }}>
                      {order.trackingNumber && (
                        <div style={{ color: '#555', fontSize: '0.95rem', textAlign: 'left', marginBottom: '0.5rem' }}>
                          {order.courier ? `${order.courier} ` : ''}송장번호: <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{order.trackingNumber}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div style={{ textAlign: 'left', fontWeight: 'bold', fontSize: '1.1rem' }}>
                          총 결제 금액: <span style={{ color: 'var(--primary-color)' }}>{formatPrice(order.totalAmount + order.shippingFee)}원</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          {order.status === '결제완료' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleCancelOrder(order._id); }}
                              className="pc-cancel-btn"
                            >
                              구매취소
                            </button>
                          )}
                          {order.status === '배송완료' && (new Date() - new Date(order.updatedAt || order.createdAt) <= 48 * 60 * 60 * 1000) && (
                            <span 
                              style={{ color: '#888', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', marginTop: '0.5rem' }}
                              onClick={(e) => { e.stopPropagation(); setClaimOrder(order); }}
                            >
                              *상품에 문제가 있으면 여기를 클릭해주세요
                            </span>
                          )}

                          {order.status === '배송완료' && !order.hasReview && (
                            <span 
                              style={{ color: '#ff9800', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 'bold', marginTop: '0.5rem', display: 'block' }}
                              onClick={(e) => { e.stopPropagation(); setReviewOrder(order); }}
                            >
                              ☆리뷰쓰고포인트받기
                            </span>
                          )}

                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'returns':
        const returnOrders = orders.filter(o => o.claim && o.claim.type === 'return');
        return (
          <div className="mypage-tab-content">
            <h3>반품내역</h3>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</div>
            ) : returnOrders.length === 0 ? (
              <div className="mypage-empty-state">
                <RotateCcw size={48} color="#ddd" />
                <p>반품 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {returnOrders.map((order) => (
                  <div key={order._id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1.5rem', cursor: 'pointer', transition: 'box-shadow 0.2s' }} onClick={() => setSelectedOrder(order)} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ fontWeight: 'bold' }}>{formatDate(order.createdAt)}</span>
                        <span style={{ color: '#888', fontSize: '0.85rem' }}>주문번호: {order.merchant_uid}</span>
                      </div>
                      <div style={{ whiteSpace: 'nowrap', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                          {order.status === '환불됨' || (order.status === '환불완료' && !order.claim) ? '취소됨' : 
                           (order.status === '환불완료' && order.claim) ? '반품요청' : order.status}
                        </span>
                        {(order.status === '환불됨' || order.status === '환불완료') && (
                          <span style={{ color: '#ff4757', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '0.2rem' }}>환불완료</span>
                        )}
                      </div>
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
                    
                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #eee' }}>
                      {order.trackingNumber && (
                        <div style={{ color: '#555', fontSize: '0.95rem', textAlign: 'left', marginBottom: '0.5rem' }}>
                          {order.courier ? `${order.courier} ` : ''}송장번호: <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{order.trackingNumber}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div style={{ textAlign: 'left', fontWeight: 'bold', fontSize: '1.1rem' }}>
                          총 결제 금액: <span style={{ color: 'var(--primary-color)' }}>{formatPrice(order.totalAmount + order.shippingFee)}원</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'points':
        return (
          <div className="mypage-tab-content">
            <h3>포인트 관리</h3>
            <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '12px', textAlign: 'center', marginBottom: '2rem', border: '1px solid #eee' }}>
              <h4 style={{ color: '#555', marginBottom: '0.5rem', fontWeight: 'normal' }}>보유 포인트</h4>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {(user.points || 0).toLocaleString()} <span style={{ fontSize: '1.2rem', color: '#333' }}>P</span>
              </div>
            </div>
            <div style={{ padding: '3rem', textAlign: 'center', color: '#888', background: '#fafafa', borderRadius: '12px', border: '1px dashed #ddd' }}>
              포인트 적립 및 사용 내역이 없습니다.
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
                <input type="text" name="doorPassword" value={profileForm.doorPassword} onChange={handleProfileChange} disabled={!isEditingProfile} placeholder="현관 출입비밀번호 (선택)" style={inputStyle} />
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
            <button className={`menu-btn ${activeTab === 'points' ? 'active' : ''}`} onClick={() => setActiveTab('points')}>
              포인트관리 <ChevronRight size={18} />
            </button>
          </nav>
        </aside>

        {/* Right Content */}
        <main className="mypage-content">
          {renderContent()}
        </main>
      </div>
      
      {/* 클레임 팝업 */}
      {claimOrder && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100}} onClick={() => setClaimOrder(null)}>
          <div style={{background: 'white', borderRadius: '16px', padding: '2.5rem', width: '90%', maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto', fontFamily: '"Jua", "Pretendard", sans-serif'}} onClick={e => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h2 style={{fontSize: '1.6rem', fontWeight: 'bold'}}>반품(환불) 신청</h2>
              <button onClick={() => setClaimOrder(null)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><X size={28} /></button>
            </div>
            
            <div style={{marginBottom: '1.5rem'}}>
              <strong style={{display: 'block', marginBottom: '0.5rem', color: '#c0392b'}}>신청 유형: 반품(환불)</strong>
            </div>

            <div style={{marginBottom: '1.5rem'}}>
              <strong style={{display: 'block', marginBottom: '0.5rem'}}>1. 사유 선택</strong>
              <select style={{width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'inherit'}} value={claimForm.reason} onChange={e => setClaimForm(prev => ({...prev, reason: e.target.value}))}>
                <option value="">사유를 선택해주세요</option>
                <option value="포장상태불량">포장상태불량</option>
                <option value="잘못된주소로배송">잘못된주소로배송</option>
                <option value="내용물불량">내용물불량</option>
                <option value="잘못된상품도착">잘못된상품도착</option>
                <option value="기타">기타</option>
              </select>
              {claimForm.reason === '기타' && (
                <input type="text" placeholder="상세 사유를 적어주세요" style={{width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'inherit', marginTop: '0.5rem'}} value={claimForm.customReason} onChange={e => setClaimForm(prev => ({...prev, customReason: e.target.value}))} />
              )}
            </div>

            <div style={{marginBottom: '1.5rem'}}>
              <strong style={{display: 'block', marginBottom: '0.5rem'}}>2. 사진 업로드 (필수)</strong>
              <input type="file" accept="image/*" multiple onChange={e => setClaimForm(prev => ({...prev, imageFiles: Array.from(e.target.files)}))} />
              <div style={{fontSize: '0.85rem', color: '#666', marginTop: '0.5rem'}}>* 사진을 반드시 1장 이상 첨부해주세요. (여러 장 선택 가능)</div>
              {claimForm.imageFiles?.length > 0 && (
                <div style={{fontSize: '0.9rem', color: 'var(--primary-color)', marginTop: '0.3rem'}}>
                  {claimForm.imageFiles.length}장의 사진이 선택되었습니다.
                </div>
              )}
            </div>

            <button onClick={submitClaim} disabled={claimLoading} style={{width: '100%', padding: '1rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'inherit'}}>
              {claimLoading ? '처리중...' : '신청하기'}
            </button>
          </div>
        </div>
      )}

      {/* 주문 상세 팝업 */}
      {selectedOrder && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}} onClick={() => setSelectedOrder(null)}>
          <div style={{background: 'white', borderRadius: '16px', padding: '2.5rem', width: '90%', maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto', fontFamily: '"Jua", "Pretendard", sans-serif'}} onClick={e => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h2 style={{fontSize: '1.6rem', fontWeight: 'bold'}}>주문 상세 정보</h2>
              <button onClick={() => setSelectedOrder(null)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><X size={28} /></button>
            </div>
            
            <div style={{marginBottom: '2rem', fontSize: '1.1rem'}}>
              <p style={{marginBottom: '1rem', display: 'flex', justifyContent: 'space-between'}}>
                <strong style={{color: '#555', minWidth: '100px'}}>수령인</strong> 
                <span style={{textAlign: 'right'}}>{selectedOrder.shippingInfo?.receiverName || '정보 없음'}</span>
              </p>
              <p style={{marginBottom: '1rem', display: 'flex', justifyContent: 'space-between'}}>
                <strong style={{color: '#555', minWidth: '100px'}}>연락처</strong> 
                <span style={{textAlign: 'right'}}>{selectedOrder.shippingInfo?.receiverPhone || '정보 없음'}</span>
              </p>
              <p style={{marginBottom: '1rem', display: 'flex', justifyContent: 'space-between'}}>
                <strong style={{color: '#555', minWidth: '100px'}}>우편번호</strong> 
                <span style={{textAlign: 'right'}}>{selectedOrder.shippingInfo?.zonecode || '정보 없음'}</span>
              </p>
              <div style={{marginBottom: '1rem'}}>
                <strong style={{color: '#555', display: 'block', marginBottom: '0.5rem'}}>배송 주소</strong> 
                <div style={{background: '#f8f9fa', padding: '1rem', borderRadius: '6px', border: '1px solid #eee', lineHeight: '1.5'}}>
                  {selectedOrder.shippingInfo?.address || '정보 없음'}<br/>
                  {selectedOrder.shippingInfo?.detailAddress || ''}
                </div>
              </div>
              <div style={{marginBottom: '1rem'}}>
                <strong style={{color: '#555', display: 'block', marginBottom: '0.5rem'}}>현관 출입비밀번호</strong> 
                <div style={{background: '#f8f9fa', padding: '1rem', borderRadius: '6px', border: '1px solid #eee', color: 'var(--primary-color)', fontWeight: 'bold'}}>
                  {selectedOrder.shippingInfo?.doorPassword || '없음'}
                </div>
              </div>
              <div style={{marginBottom: '1rem'}}>
                <strong style={{color: '#555', display: 'block', marginBottom: '0.5rem'}}>배송 메모</strong> 
                <div style={{background: '#f8f9fa', padding: '1rem', borderRadius: '6px', border: '1px solid #eee', minHeight: '60px'}}>
                  {selectedOrder.shippingInfo?.memo || '없음'}
                </div>
              </div>
              <div>
                <strong style={{color: '#555', display: 'block', marginBottom: '0.5rem'}}>기타 메모</strong> 
                <div style={{background: '#f8f9fa', padding: '1rem', borderRadius: '6px', border: '1px solid #eee', minHeight: '60px'}}>
                  {selectedOrder.shippingInfo?.extraMemo || '없음'}
                </div>
              </div>
            </div>

            <button onClick={() => setSelectedOrder(null)} style={{width: '100%', padding: '1rem', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', fontFamily: 'inherit'}}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default MyPage;
