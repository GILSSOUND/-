import React, { useState, useEffect } from 'react';
import { fetchProducts, createProduct, deleteProduct, uploadImage } from '../api';
import { LayoutDashboard, PackagePlus, List, Image as ImageIcon, Bell } from 'lucide-react';

function Admin() {
  const [activeTab, setActiveTab] = useState('register'); // register, list, banner, notice
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    category: 'mealkit',
    originalPrice: '',
    price: '',
    isNewProduct: false,
    isBest: false
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [detailImageFile, setDetailImageFile] = useState(null);
  const [detailImagePreview, setDetailImagePreview] = useState(null);
  
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // 미리보기 생성
    }
  };

  const handleDetailFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDetailImageFile(file);
      setDetailImagePreview(URL.createObjectURL(file)); // 미리보기 생성
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert("이미지를 먼저 선택해주세요.");
      return;
    }

    try {
      setUploading(true);
      
      const uploadRes = await uploadImage(imageFile);
      const imageUrl = uploadRes.imageUrl;

      let detailImageUrl = null;
      if (detailImageFile) {
        const detailUploadRes = await uploadImage(detailImageFile);
        detailImageUrl = detailUploadRes.imageUrl;
      }

      let calculatedDiscount = '';
      if (formData.originalPrice && formData.price) {
        const orig = Number(formData.originalPrice);
        const curr = Number(formData.price);
        if (orig > curr) {
          calculatedDiscount = Math.round(((orig - curr) / orig) * 100) + '%';
        }
      }

      const newProduct = {
        ...formData,
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        price: Number(formData.price),
        discount: calculatedDiscount,
        imageUrl,
        detailImageUrl
      };

      await createProduct(newProduct);
      alert("상품이 성공적으로 등록되었습니다!");
      
      // 초기화
      setFormData({ name: '', subtitle: '', category: 'mealkit', originalPrice: '', price: '', isNewProduct: false, isBest: false });
      setImageFile(null);
      setImagePreview(null);
      setDetailImageFile(null);
      setDetailImagePreview(null);
      e.target.reset();
      loadProducts();
      setActiveTab('list'); // 등록 완료 후 리스트로 이동
      
    } catch (error) {
      console.error(error);
      alert("상품 등록 실패: API 키 설정이나 서버 상태를 확인해주세요. (" + (error.response?.data?.error || error.message) + ")");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("정말로 이 상품을 삭제하시겠습니까?")) {
      try {
        await deleteProduct(id);
        alert("삭제되었습니다.");
        loadProducts();
      } catch (error) {
        alert("삭제 실패");
      }
    }
  };

  // 금액 포맷
  const formatPrice = (price) => {
    if (!price) return '0';
    return Number(price).toLocaleString('ko-KR');
  };

  return (
    <div style={{display: 'flex', minHeight: '100vh', background: '#f8f9fa'}}>
      
      {/* 1. 왼쪽 사이드바 메뉴 */}
      <div style={{width: '260px', background: 'white', padding: '2rem 0', borderRight: '1px solid #eee', position: 'fixed', height: '100vh', top: '80px'}}>
        <h2 style={{padding: '0 2rem', marginBottom: '2rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)'}}>
          <LayoutDashboard /> 관리자 홈
        </h2>
        
        <ul style={{listStyle: 'none', padding: 0}}>
          {[
            { id: 'register', label: '상품 등록', icon: <PackagePlus size={20} /> },
            { id: 'list', label: `상품 목록 (${products.length})`, icon: <List size={20} /> },
            { id: 'banner', label: '메인 배너 관리', icon: <ImageIcon size={20} /> },
            { id: 'notice', label: '공지사항 관리', icon: <Bell size={20} /> },
          ].map(tab => (
            <li key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '1rem 2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem',
                  background: activeTab === tab.id ? '#f1f2f6' : 'transparent',
                  color: activeTab === tab.id ? 'var(--primary-color)' : '#333',
                  fontWeight: activeTab === tab.id ? '700' : '500',
                  borderRight: activeTab === tab.id ? '4px solid var(--primary-color)' : '4px solid transparent',
                  transition: 'all 0.2s'
                }}>
              {tab.icon} {tab.label}
            </li>
          ))}
        </ul>
      </div>

      {/* 2. 메인 컨텐츠 영역 */}
      <div style={{flex: 1, marginLeft: '260px', padding: '3rem 5%', marginTop: '80px', maxWidth: '1400px'}}>
        
        {/* ========================================================================================= */}
        {/* 상품 등록 탭 (폼 + 실시간 미리보기) */}
        {/* ========================================================================================= */}
        {activeTab === 'register' && (
          <div>
            <h2 style={{fontSize: '1.8rem', marginBottom: '2rem', fontWeight: '800'}}>신규 상품 등록 (실시간 미리보기)</h2>
            <div style={{display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'flex-start'}}>
              
              {/* 왼쪽: 등록 폼 */}
              <div style={{flex: 1, minWidth: '400px', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                <h3 style={{marginBottom: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '1rem'}}>상품 정보 입력</h3>
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>상품명</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}} />
                  </div>

                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>상품 한 줄 설명 (서브타이틀)</label>
                    <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} placeholder="예: 바다의 신선함을 그대로 담은" style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}} />
                  </div>
                  
                  <div style={{display: 'flex', gap: '1rem'}}>
                    <div style={{flex: 1}}>
                      <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>카테고리</label>
                      <select name="category" value={formData.category} onChange={handleChange} style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}}>
                        <option value="mealkit">밀키트</option>
                        <option value="new">신상품</option>
                        <option value="local">산지직송</option>
                        <option value="direct">업체직송</option>
                        <option value="sale">특가할인</option>
                      </select>
                    </div>
                    <div style={{flex: 1}}>
                      <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>판매가 (원)</label>
                      <input type="number" name="price" value={formData.price} onChange={handleChange} required style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}} />
                    </div>
                  </div>

                  <div style={{display: 'flex', gap: '1rem'}}>
                    <div style={{flex: 1}}>
                      <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>원래 가격 (원)</label>
                      <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} placeholder="예: 30000" style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}} />
                      <p style={{fontSize: '0.8rem', color: '#888', marginTop: '0.5rem'}}>원래 가격을 적으면 할인율은 자동 계산됩니다.</p>
                    </div>
                  </div>

                  <div style={{display: 'flex', gap: '2rem', margin: '1rem 0'}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600'}}>
                      <input type="checkbox" name="isNewProduct" checked={formData.isNewProduct} onChange={handleChange} />
                      🆕 NEW 배지 달기
                    </label>
                    <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600'}}>
                      <input type="checkbox" name="isBest" checked={formData.isBest} onChange={handleChange} />
                      🔥 BEST 배지 달기
                    </label>
                  </div>

                  <div style={{background: '#f8f9fa', padding: '1rem', borderRadius: '8px'}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>📸 상품 메인 사진 (정사각형 권장)</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{width: '100%', padding: '0.5rem', background: 'white', border: '1px dashed #ccc', borderRadius: '8px'}} />
                  </div>

                  <div style={{background: '#f8f9fa', padding: '1rem', borderRadius: '8px'}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>📜 상품 상세 페이지 긴 사진 (옵션)</label>
                    <input type="file" accept="image/*" onChange={handleDetailFileChange} style={{width: '100%', padding: '0.5rem', background: 'white', border: '1px dashed #ccc', borderRadius: '8px'}} />
                  </div>

                  <button type="submit" className="primary-btn" disabled={uploading} style={{marginTop: '1.5rem', fontSize: '1.1rem', padding: '1rem'}}>
                    {uploading ? '업로드 및 저장 중...' : '이 내용으로 상품 등록하기'}
                  </button>
                </form>
              </div>

              {/* 오른쪽: 실시간 상세페이지 미리보기 */}
              <div style={{flex: 1.5, minWidth: '500px'}}>
                <h3 style={{marginBottom: '1rem', color: '#666', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  👀 이렇게 보입니다 (실시간 미리보기)
                </h3>
                
                {/* Product Detail Layout Mockup */}
                <div style={{background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', pointerEvents: 'none'}}>
                  
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
                    {/* 미리보기 이미지 */}
                    <div style={{borderRadius: '12px', overflow: 'hidden', background: '#f1f2f6', aspectRatio: '1/1'}}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      ) : (
                        <div style={{display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#999'}}>메인 사진 없음</div>
                      )}
                    </div>
                    
                    {/* 미리보기 텍스트 */}
                    <div>
                      <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem'}}>
                        {formData.isBest && <span style={{padding: '0.3rem 0.6rem', background: 'var(--primary-color)', color: 'white', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '4px'}}>BEST</span>}
                        {formData.isNewProduct && <span style={{padding: '0.3rem 0.6rem', background: '#2ed573', color: 'white', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '4px'}}>NEW</span>}
                      </div>
                      <h2 style={{fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem', lineHeight: '1.3'}}>{formData.name || '상품명을 입력하세요'}</h2>
                      <p style={{fontSize: '1rem', color: '#888', marginBottom: '1.5rem'}}>{formData.subtitle || '한 줄 설명이 여기에 표시됩니다.'}</p>
                      
                      <div style={{display: 'flex', alignItems: 'baseline', gap: '0.8rem', paddingBottom: '1.5rem', borderBottom: '1px solid #eee'}}>
                        {formData.originalPrice && formData.price && Number(formData.originalPrice) > Number(formData.price) && (
                          <span style={{fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-color)'}}>
                            {Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)}%
                          </span>
                        )}
                        <span style={{fontSize: '1.8rem', fontWeight: '800'}}>{formatPrice(formData.price)}원</span>
                        {formData.originalPrice && <span style={{fontSize: '1rem', color: '#999', textDecoration: 'line-through'}}>{formatPrice(formData.originalPrice)}원</span>}
                      </div>
                      
                      <div style={{marginTop: '2rem', display: 'flex', gap: '1rem'}}>
                        <div style={{flex: 1, padding: '1rem', textAlign: 'center', border: '1px solid #ddd', borderRadius: '8px', color: '#666'}}>찜하기</div>
                        <div style={{flex: 2, padding: '1rem', textAlign: 'center', background: 'var(--primary-color)', color: 'white', borderRadius: '8px', fontWeight: 'bold'}}>장바구니 담기</div>
                      </div>
                    </div>
                  </div>

                  {/* 하단 상세 탭 및 이미지 미리보기 */}
                  <div style={{marginTop: '3rem', borderTop: '2px solid #333', paddingTop: '1rem'}}>
                    <div style={{display: 'flex', gap: '2rem', marginBottom: '2rem'}}>
                      <span style={{fontWeight: '800', color: 'var(--primary-color)'}}>상품상세정보</span>
                      <span style={{color: '#999'}}>구매안내</span>
                      <span style={{color: '#999'}}>상품후기</span>
                    </div>
                    
                    {detailImagePreview ? (
                      <img src={detailImagePreview} alt="detail preview" style={{width: '100%', borderRadius: '8px'}} />
                    ) : (
                      <div style={{width: '100%', height: '300px', background: '#f1f2f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999'}}>
                        상세 페이지용 사진을 등록하면 여기에 나타납니다.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ========================================================================================= */}
        {/* 상품 목록 탭 */}
        {/* ========================================================================================= */}
        {activeTab === 'list' && (
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
              <h2 style={{fontSize: '1.8rem', fontWeight: '800'}}>등록된 상품 목록 ({products.length}개)</h2>
              <button className="primary-btn" onClick={() => setActiveTab('register')}>+ 새 상품 등록</button>
            </div>
            
            {products.length === 0 ? (
              <div style={{textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '16px', color: '#888'}}>
                등록된 상품이 없습니다. 백엔드 서버가 켜져있는지 확인하세요.
              </div>
            ) : (
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem'}}>
                {products.map(p => (
                  <div key={p._id} style={{background: 'white', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'}}>
                    <div style={{position: 'relative'}}>
                      <img src={p.imageUrl} alt={p.name} style={{width: '100%', aspectRatio: '1/1', objectFit: 'cover'}} />
                      <div style={{position: 'absolute', top: '0.5rem', left: '0.5rem', display: 'flex', gap: '0.3rem'}}>
                        {p.isBest && <span style={{padding: '0.2rem 0.5rem', background: 'var(--primary-color)', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '4px'}}>BEST</span>}
                        {p.isNewProduct && <span style={{padding: '0.2rem 0.5rem', background: '#2ed573', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '4px'}}>NEW</span>}
                      </div>
                    </div>
                    <div style={{padding: '1.25rem'}}>
                      <p style={{fontSize: '0.8rem', color: '#999', marginBottom: '0.25rem'}}>카테고리: {p.category}</p>
                      <h4 style={{fontSize: '1.1rem', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{p.name}</h4>
                      <p style={{fontWeight: '800', color: 'var(--text-main)', fontSize: '1.2rem'}}>{p.price.toLocaleString()}원</p>
                      <button 
                        onClick={() => handleDelete(p._id)}
                        style={{marginTop: '1rem', width: '100%', padding: '0.75rem', background: '#fff0f0', color: '#ff4757', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s'}}
                      >
                        휴지통으로 보내기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================================= */}
        {/* 공사중인 탭들 */}
        {/* ========================================================================================= */}
        {(activeTab === 'banner' || activeTab === 'notice') && (
          <div style={{textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '16px', color: '#888', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'}}>
            <h2 style={{fontSize: '1.8rem', fontWeight: '800', color: '#333', marginBottom: '1rem'}}>
              {activeTab === 'banner' ? '메인 배너 관리' : '공지사항 관리'}
            </h2>
            <p style={{fontSize: '1.1rem'}}>이 기능은 추후 업데이트 될 예정입니다.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Admin;
