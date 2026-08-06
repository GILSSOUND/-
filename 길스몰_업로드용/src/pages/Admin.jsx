import React, { useState, useEffect } from 'react';
import { fetchProducts, createProduct, updateProduct, deleteProduct, uploadImage, fetchConfig, updateConfig } from '../api';
import { LayoutDashboard, PackagePlus, List, Image as ImageIcon, Bell, Edit, Trash2, ChevronLeft, ChevronRight, Plus, X, Image as ImgIcon, Type } from 'lucide-react';

function Admin({ refreshGlobalProducts }) {
  const [activeTab, setActiveTab] = useState('register'); // register, list, banner, notice
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 페이징 (목록용)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // 수정 모드 상태
  const [editingProductId, setEditingProductId] = useState(null);
  
  // 폼 기본값
  const initialFormData = {
    name: '',
    subtitle: '',
    category: 'mealkit',
    originalPrice: '',
    price: '',
    shippingFee: 3000,
    isNewProduct: false,
    isBest: false
  };

  // 폼 상태
  const [formData, setFormData] = useState(initialFormData);
  
  // 메인 썸네일 상태
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // 구버전 상세 이미지 (하위 호환)
  const [detailImagePreview, setDetailImagePreview] = useState(null);
  const [detailImageFile, setDetailImageFile] = useState(null);

  // 다중 블록 (사진/글) 상태
  const [detailBlocks, setDetailBlocks] = useState([]); 
  // 구조: { type: 'text' | 'image', content: '...', file?: File, preview?: string }
  
  const [options, setOptions] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 배너 관리 상태
  const [heroBanners, setHeroBanners] = useState([]);
  const [recBanners, setRecBanners] = useState([]);
  
  // 에디터 모달 상태
  const [editingBanner, setEditingBanner] = useState(null);
  const [editorType, setEditorType] = useState(null); // 'hero' | 'rec'

  useEffect(() => {
    loadProducts();
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const hero = await fetchConfig('hero_banners');
      if (hero) setHeroBanners(hero);
      const rec = await fetchConfig('recommended_banners');
      if (rec) setRecBanners(rec);
    } catch (e) {
      console.error('Failed to load banners');
    }
  };

  const handleOpenBannerEditor = (type, existingBanner = null) => {
    setEditorType(type);
    if (existingBanner) {
      setEditingBanner({...existingBanner});
    } else {
      setEditingBanner({
        id: Date.now(),
        imageUrl: '',
        title: '',
        subtitle: '',
        titleSize: type === 'hero' ? 40 : 32,
        titleColor: '#ffffff',
        titleFontFamily: "'Noto Sans KR', sans-serif",
        subtitleSize: 20,
        subtitleColor: '#dddddd',
        subtitleFontFamily: "'Noto Sans KR', sans-serif",
      });
    }
  };

  const handleCloseBannerEditor = () => {
    setEditingBanner(null);
    setEditorType(null);
  };

  const handleDragStart = (e) => {
    e.preventDefault();
    const container = e.currentTarget.parentElement;
    const rect = container.getBoundingClientRect();
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    const startX = clientX;
    const startY = clientY;
    const initialPosX = editingBanner.textPosX !== undefined ? editingBanner.textPosX : 50;
    const initialPosY = editingBanner.textPosY !== undefined ? editingBanner.textPosY : 50;

    const handleDragMove = (moveEvent) => {
      const currentX = moveEvent.type.includes('touch') ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentY = moveEvent.type.includes('touch') ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      const dx = currentX - startX;
      const dy = currentY - startY;
      
      const newPosX = Math.max(0, Math.min(100, initialPosX + (dx / rect.width) * 100));
      const newPosY = Math.max(0, Math.min(100, initialPosY + (dy / rect.height) * 100));
      
      setEditingBanner(prev => ({
        ...prev,
        textPosX: newPosX,
        textPosY: newPosY
      }));
    };

    const handleDragEnd = () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
  };

  const handleModalImageUpload = async (e) => {
    if(!e.target.files || !e.target.files[0]) return;
    setUploading(true);
    try {
      const res = await uploadImage(e.target.files[0]);
      setEditingBanner({...editingBanner, imageUrl: res.imageUrl});
    } catch(err) {
      alert("이미지 업로드 실패: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveBannerEditor = async () => {
    if (!editingBanner.imageUrl) {
      alert("배너 이미지를 업로드해주세요.");
      return;
    }
    
    try {
      let updatedList;
      if (editorType === 'hero') {
        const idx = heroBanners.findIndex(b => b.id === editingBanner.id);
        if (idx >= 0) {
          updatedList = [...heroBanners];
          updatedList[idx] = editingBanner;
        } else {
          updatedList = [...heroBanners, editingBanner];
        }
        setHeroBanners(updatedList);
        await updateConfig('hero_banners', updatedList);
      } else {
        const idx = recBanners.findIndex(b => b.id === editingBanner.id);
        if (idx >= 0) {
          updatedList = [...recBanners];
          updatedList[idx] = editingBanner;
        } else {
          updatedList = [...recBanners, editingBanner];
        }
        setRecBanners(updatedList);
        await updateConfig('recommended_banners', updatedList);
      }
      handleCloseBannerEditor();
      alert('배너가 저장되었습니다.');
    } catch(err) {
      alert("저장 실패: " + err.message);
    }
  };

  const handleDeleteBanner = async (id, type) => {
    if(!window.confirm("이 배너를 삭제하시겠습니까?")) return;
    try {
      if(type === 'hero') {
        const updated = heroBanners.filter(b => b.id !== id);
        setHeroBanners(updated);
        await updateConfig('hero_banners', updated);
      } else {
        const updated = recBanners.filter(b => b.id !== id);
        setRecBanners(updated);
        await updateConfig('recommended_banners', updated);
      }
    } catch(err) {
      alert("배너 삭제 실패");
    }
  };

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products", error);
    }
  };

  const handleAddOption = () => {
    setOptions([...options, { name: '', additionalPrice: 0 }]);
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  // 상세 블록 추가/삭제/변경
  const handleAddBlock = (type) => {
    setDetailBlocks([...detailBlocks, { type, content: '', file: null, preview: null }]);
  };
  
  const handleRemoveBlock = (index) => {
    setDetailBlocks(detailBlocks.filter((_, i) => i !== index));
  };
  
  const handleBlockTextChange = (index, text) => {
    const newBlocks = [...detailBlocks];
    newBlocks[index].content = text;
    setDetailBlocks(newBlocks);
  };
  
  const handleBlockImageChange = (index, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newBlocks = [...detailBlocks];
      newBlocks[index].file = file;
      newBlocks[index].preview = URL.createObjectURL(file);
      setDetailBlocks(newBlocks);
    }
  };

  // 수정 버튼 클릭시 데이터 로드
  const handleEditClick = (product) => {
    setEditingProductId(product._id || product.id);
    setFormData({
      name: product.name || '',
      subtitle: product.subtitle || '',
      category: product.category || 'mealkit',
      originalPrice: product.originalPrice || '',
      price: product.price || '',
      shippingFee: product.shippingFee !== undefined ? product.shippingFee : 3000,
      isNewProduct: product.isNewProduct || false,
      isBest: product.isBest || false
    });
    setImageFile(null);
    setImagePreview(product.imageUrl || null);
    
    // 호환성: 기존 단일 이미지
    setDetailImageFile(null);
    setDetailImagePreview(product.detailImageUrl || null);
    
    // 블록 데이터
    if (product.detailBlocks && product.detailBlocks.length > 0) {
      setDetailBlocks(product.detailBlocks.map(b => ({
        type: b.type,
        content: b.content, // 이미지일 경우 URL
        preview: b.type === 'image' ? b.content : null,
        file: null
      })));
    } else {
      setDetailBlocks([]);
    }
    
    setOptions(product.options || []);
    setActiveTab('register');
    window.scrollTo(0, 0);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const resetForm = () => {
    setEditingProductId(null);
    setFormData(initialFormData);
    setImageFile(null);
    setImagePreview(null);
    setDetailImageFile(null);
    setDetailImagePreview(null);
    setDetailBlocks([]);
    setOptions([]);
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
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingProductId && !imageFile && !imagePreview) {
      alert("메인 썸네일 이미지를 등록해주세요.");
      return;
    }

    try {
      setUploading(true);
      
      let imageUrl = imagePreview; // 수정모드에서 변경안했으면 기존 URL 유지
      if (imageFile) {
        const uploadRes = await uploadImage(imageFile);
        imageUrl = uploadRes.imageUrl;
      }

      // 블록 이미지 업로드 병렬 처리
      const processedBlocks = await Promise.all(detailBlocks.map(async (block) => {
        if (block.type === 'image' && block.file) {
          const res = await uploadImage(block.file);
          return { type: 'image', content: res.imageUrl };
        } else if (block.type === 'image' && block.content) {
          return { type: 'image', content: block.content }; // 기존 이미지 URL 유지
        } else {
          return { type: 'text', content: block.content };
        }
      }));

      // 하위 호환 단일 디테일 이미지 처리 (선택사항)
      let oldDetailImageUrl = detailImagePreview;
      if (detailImageFile) {
         const res = await uploadImage(detailImageFile);
         oldDetailImageUrl = res.imageUrl;
      }

      let calculatedDiscount = '';
      if (formData.originalPrice && formData.price) {
        const orig = Number(formData.originalPrice);
        const curr = Number(formData.price);
        if (orig > curr) {
          calculatedDiscount = Math.round(((orig - curr) / orig) * 100) + '%';
        }
      }

      const productPayload = {
        ...formData,
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        price: Number(formData.price),
        shippingFee: formData.shippingFee !== '' ? Number(formData.shippingFee) : 3000,
        discount: calculatedDiscount,
        options: options.filter(o => o.name.trim() !== '').map(o => ({ name: o.name, additionalPrice: Number(o.additionalPrice) })),
        imageUrl,
        detailImageUrl: oldDetailImageUrl,
        detailBlocks: processedBlocks
      };

      if (editingProductId) {
        await updateProduct(editingProductId, productPayload);
        alert("상품이 성공적으로 수정되었습니다!");
      } else {
        await createProduct(productPayload);
        alert("상품이 성공적으로 등록되었습니다!");
      }
      
      if (refreshGlobalProducts) refreshGlobalProducts();
      loadProducts();
      resetForm();
      setActiveTab('list');
      
    } catch (error) {
      console.error(error);
      alert("처리 실패: " + (error.response?.data?.error || error.message));
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
        if (refreshGlobalProducts) refreshGlobalProducts();
      } catch (error) {
        alert("삭제 실패");
      }
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    return Number(price).toLocaleString('ko-KR');
  };

  // Pagination Logic
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
    <div style={{display: 'flex', minHeight: '100vh', background: '#f8f9fa'}}>
      
      {/* 1. 왼쪽 사이드바 메뉴 */}
      <div style={{width: '260px', background: 'white', padding: '2rem 0', borderRight: '1px solid #eee', position: 'fixed', height: '100vh', top: '80px'}}>
        <h2 style={{padding: '0 2rem', marginBottom: '2rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)'}}>
          <LayoutDashboard /> 관리자 홈
        </h2>
        
        <ul style={{listStyle: 'none', padding: 0}}>
          {[
            { id: 'register', label: editingProductId ? '상품 수정' : '상품 등록', icon: <PackagePlus size={20} /> },
            { id: 'list', label: `상품 목록 (${products.length})`, icon: <List size={20} /> },
            { id: 'banner', label: '메인 상단 배너 관리', icon: <ImageIcon size={20} /> },
            { id: 'rec_banner', label: '추천상품 배너 관리', icon: <ImageIcon size={20} /> },
            { id: 'notice', label: '공지사항 관리', icon: <Bell size={20} /> },
            { id: 'order', label: '발주 관리 (준비중)', icon: <LayoutDashboard size={20} /> },
            { id: 'member', label: '회원 관리 (준비중)', icon: <LayoutDashboard size={20} /> },
          ].map(tab => (
            <li key={tab.id} 
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'register') resetForm();
                }}
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
        {/* 상품 등록/수정 탭 */}
        {/* ========================================================================================= */}
        {activeTab === 'register' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{fontSize: '1.8rem', fontWeight: '800'}}>
                {editingProductId ? '상품 수정' : '신규 상품 등록'}
              </h2>
              {editingProductId && (
                <button className="outline-btn" onClick={handleCancelEdit}>수정 취소 (신규 등록으로 전환)</button>
              )}
            </div>

            <div style={{display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'flex-start'}}>
              
              {/* 왼쪽: 등록 폼 */}
              <div style={{flex: 1, minWidth: '400px', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>상품명</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}} />
                  </div>

                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>한 줄 설명 (서브타이틀)</label>
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

                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>원래 가격 (원)</label>
                    <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} placeholder="할인 전 가격을 적으면 할인율 자동 계산" style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}} />
                  </div>

                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>배송비 (원)</label>
                    <input type="number" name="shippingFee" value={formData.shippingFee} onChange={handleChange} placeholder="기본 3,000원. 0 입력 시 무료배송" style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}} />
                  </div>

                  <div style={{display: 'flex', gap: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px'}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600'}}>
                      <input type="checkbox" name="isNewProduct" checked={formData.isNewProduct} onChange={handleChange} />
                      [NEW 배지]
                    </label>
                    <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600'}}>
                      <input type="checkbox" name="isBest" checked={formData.isBest} onChange={handleChange} />
                      [BEST 배지]
                    </label>
                  </div>

                  {/* 썸네일 */}
                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>• 메인 썸네일 사진</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{width: '100%', padding: '0.5rem', border: '1px dashed #ccc', borderRadius: '8px'}} />
                  </div>

                  {/* 옵션 */}
                  <div style={{background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                      <label style={{fontWeight: 'bold'}}>• 상품 옵션 설정 (선택사항)</label>
                      <button type="button" onClick={handleAddOption} style={{padding: '0.4rem 0.8rem', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>+ 추가</button>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
                      {options.map((opt, idx) => (
                        <div key={idx} style={{display: 'flex', gap: '0.5rem'}}>
                          <input type="text" placeholder="옵션명" value={opt.name} onChange={(e) => handleOptionChange(idx, 'name', e.target.value)} style={{flex: 2, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px'}} />
                          <input type="number" placeholder="추가금(+)" value={opt.additionalPrice} onChange={(e) => handleOptionChange(idx, 'additionalPrice', e.target.value)} style={{flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px'}} />
                          <button type="button" onClick={() => handleRemoveOption(idx)} style={{padding: '0.5rem', background: '#ff4757', color: 'white', border: 'none', borderRadius: '4px'}}>X</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 동적 상세 블록 추가 (사진+글 섞기) */}
                  <div style={{border: '1px solid var(--primary-color)', padding: '1.5rem', borderRadius: '8px'}}>
                    <h3 style={{marginBottom: '1rem', color: 'var(--primary-color)', fontSize: '1.1rem'}}>상세페이지 구성 (블록 에디터)</h3>
                    <p style={{fontSize: '0.85rem', color: '#666', marginBottom: '1rem'}}>
                      사진과 텍스트를 원하는 순서대로 자유롭게 추가해보세요.
                    </p>
                    
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem'}}>
                      {detailBlocks.map((block, idx) => (
                        <div key={idx} style={{background: '#f8f9fa', padding: '1rem', borderRadius: '8px', position: 'relative', border: '1px solid #ddd'}}>
                          <button type="button" onClick={() => handleRemoveBlock(idx)} style={{position: 'absolute', top: '-10px', right: '-10px', background: '#ff4757', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', zIndex: 10}}><X size={14}/></button>
                          
                          {block.type === 'text' ? (
                            <div>
                              <div style={{fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#555'}}><Type size={14}/> 텍스트 블록</div>
                              <textarea 
                                value={block.content} 
                                onChange={(e) => handleBlockTextChange(idx, e.target.value)}
                                placeholder="여기에 상세 설명을 적어주세요..."
                                style={{width: '100%', minHeight: '80px', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical'}}
                              />
                            </div>
                          ) : (
                            <div>
                              <div style={{fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#555'}}><ImgIcon size={14}/> 이미지 블록</div>
                              <input type="file" accept="image/*" onChange={(e) => handleBlockImageChange(idx, e)} style={{marginBottom: '0.5rem'}} />
                              {block.preview && <img src={block.preview} alt="preview" style={{maxWidth: '100%', maxHeight: '150px', display: 'block', borderRadius: '4px'}} />}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button type="button" onClick={() => handleAddBlock('image')} style={{flex: 1, padding: '0.8rem', background: '#e1e5eb', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '600'}}>
                        <ImgIcon size={16}/> 사진 추가
                      </button>
                      <button type="button" onClick={() => handleAddBlock('text')} style={{flex: 1, padding: '0.8rem', background: '#e1e5eb', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '600'}}>
                        <Type size={16}/> 글 추가
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="primary-btn" disabled={uploading} style={{marginTop: '1rem', fontSize: '1.2rem', padding: '1rem'}}>
                    {uploading ? '서버에 저장 중...' : (editingProductId ? '수정 내용 저장하기' : '상품 등록하기')}
                  </button>
                </form>
              </div>

              {/* 오른쪽: 미리보기 */}
              <div style={{flex: 1.5, minWidth: '500px', position: 'sticky', top: '100px'}}>
                <h3 style={{marginBottom: '1rem', color: '#666', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  [쇼핑몰 미리보기]
                </h3>
                
                <div style={{background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', pointerEvents: 'none'}}>
                  <div style={{display: 'flex', gap: '2rem'}}>
                    {/* 썸네일 미리보기 */}
                    <div style={{flex: 1, borderRadius: '12px', overflow: 'hidden', background: '#f1f2f6', aspectRatio: '1/1'}}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      ) : (
                        <div style={{display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#999'}}>메인 사진</div>
                      )}
                    </div>
                    {/* 정보 미리보기 */}
                    <div style={{flex: 1}}>
                      <div style={{display: 'flex', gap: '0.5rem', marginBottom: '0.5rem'}}>
                        {formData.isBest && <span style={{padding: '0.2rem 0.5rem', background: 'var(--primary-color)', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '4px'}}>BEST</span>}
                        {formData.isNewProduct && <span style={{padding: '0.2rem 0.5rem', background: '#2ed573', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '4px'}}>NEW</span>}
                      </div>
                      <h3 style={{fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.2rem'}}>{formData.name || '상품명'}</h3>
                      <p style={{fontSize: '0.9rem', color: '#888', marginBottom: '1rem'}}>{formData.subtitle || '한 줄 설명'}</p>
                      
                      <div style={{display: 'flex', alignItems: 'baseline', gap: '0.5rem'}}>
                        <span style={{fontSize: '1.5rem', fontWeight: '900'}}>{formatPrice(formData.price)}원</span>
                        {formData.originalPrice && <span style={{fontSize: '1rem', color: '#999', textDecoration: 'line-through'}}>{formatPrice(formData.originalPrice)}원</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{marginTop: '2rem', borderTop: '2px solid #eee', paddingTop: '1rem'}}>
                    <h4 style={{marginBottom: '1rem', color: 'var(--primary-color)'}}>상세페이지 본문</h4>
                    <div style={{background: '#fafafa', padding: '1rem', borderRadius: '8px', minHeight: '200px'}}>
                      {detailBlocks.length === 0 ? (
                        <div style={{textAlign: 'center', color: '#aaa', marginTop: '3rem'}}>상세 블록이 여기에 표시됩니다.</div>
                      ) : (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                          {detailBlocks.map((block, idx) => (
                            <div key={idx}>
                              {block.type === 'text' && (
                                <p style={{whiteSpace: 'pre-wrap', color: '#444', lineHeight: '1.6'}}>{block.content || '(텍스트)'}</p>
                              )}
                              {block.type === 'image' && block.preview && (
                                <img src={block.preview} alt="상세미리보기" style={{width: '100%', borderRadius: '8px'}} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================================= */}
        {/* 상품 목록 탭 (가로형 리스트 + 페이징) */}
        {/* ========================================================================================= */}
        {activeTab === 'list' && (
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
              <h2 style={{fontSize: '1.8rem', fontWeight: '800'}}>등록된 상품 목록 ({products.length}개)</h2>
              <button className="primary-btn" onClick={() => {resetForm(); setActiveTab('register');}}>+ 새 상품 등록</button>
            </div>
            
            {products.length === 0 ? (
              <div style={{textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '16px', color: '#888'}}>
                등록된 상품이 없습니다.
              </div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {currentProducts.map(p => (
                  <div key={p._id || p.id} style={{display: 'flex', alignItems: 'center', background: 'white', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.02)'}}>
                    <img src={p.imageUrl} alt={p.name} style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', marginRight: '1.5rem', background: '#f8f9fa'}} />
                    
                    <div style={{flex: 2}}>
                      <div style={{display: 'flex', gap: '0.5rem', marginBottom: '0.2rem'}}>
                        <span style={{fontSize: '0.8rem', color: '#999'}}>[{p.category}]</span>
                        {p.isBest && <span style={{fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 'bold'}}>BEST</span>}
                        {p.isNewProduct && <span style={{fontSize: '0.7rem', color: '#2ed573', fontWeight: 'bold'}}>NEW</span>}
                      </div>
                      <h4 style={{fontSize: '1.1rem', fontWeight: '600', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{p.name}</h4>
                    </div>

                    <div style={{flex: 1, fontWeight: '700', fontSize: '1.1rem', textAlign: 'right', marginRight: '2rem'}}>
                      {formatPrice(p.price)}원
                    </div>

                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button 
                        onClick={() => handleEditClick(p)}
                        style={{padding: '0.6rem 1rem', background: '#f1f2f6', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600'}}
                      >
                        <Edit size={16} /> 수정
                      </button>
                      <button 
                        onClick={() => handleDelete(p._id || p.id)}
                        style={{padding: '0.6rem 1rem', background: '#fff0f0', color: '#ff4757', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600'}}
                      >
                        <Trash2 size={16} /> 삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Admin Pagination */}
            {totalPages > 1 && (
              <div className="pagination" style={{marginTop: '3rem'}}>
                <button 
                  className="page-btn" 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={20} />
                </button>
                
                {[...Array(totalPages)].map((_, idx) => (
                  <button 
                    key={idx + 1} 
                    className={`page-btn ${currentPage === idx + 1 ? 'active' : ''}`}
                    onClick={() => handlePageChange(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button 
                  className="page-btn" 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'banner' && (
          <div style={{background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}}>
            <h2 style={{fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem', color: '#333'}}>메인 상단 배너 관리</h2>
            <div style={{padding: '1rem', background: '#fff3e0', color: '#e65100', borderRadius: '8px', marginBottom: '2rem', fontWeight: '600'}}>
              권장 이미지 사이즈: 가로 1920px × 세로 500px
            </div>
            
            <div style={{marginBottom: '2rem'}}>
              <button onClick={() => handleOpenBannerEditor('hero')} style={{padding: '0.8rem 1.5rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'}}>
                + 새 상단 배너 추가
              </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              {heroBanners.length === 0 ? (
                <p style={{color: '#888'}}>등록된 상단 배너가 없습니다.</p>
              ) : heroBanners.map((banner, idx) => (
                <div key={banner.id} style={{border: '1px solid #ddd', borderRadius: '12px', padding: '1.5rem', background: '#fafafa', position: 'relative'}}>
                  <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
                    <span style={{fontWeight: '900', fontSize: '1.5rem', color: 'var(--primary-color)'}}>{idx + 1}</span>
                    <img src={banner.imageUrl} alt="banner" style={{width: '240px', height: '62px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc'}} />
                    <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', justifyContent: 'center'}}>
                      <strong style={{fontSize: '1.1rem'}}>{banner.title || '(문구 없음)'}</strong>
                      <span style={{color: '#888', fontSize: '0.9rem'}}>{banner.subtitle}</span>
                    </div>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button onClick={() => handleOpenBannerEditor('hero', banner)} style={{padding: '0.6rem 1rem', background: '#4bcffa', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>
                        수정
                      </button>
                      <button onClick={() => handleDeleteBanner(banner.id, 'hero')} style={{padding: '0.6rem 1rem', background: '#ff4757', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rec_banner' && (
          <div style={{background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}}>
            <h2 style={{fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem', color: '#333'}}>추천상품 배너 관리</h2>
            <div style={{padding: '1rem', background: '#fff3e0', color: '#e65100', borderRadius: '8px', marginBottom: '2rem', fontWeight: '600'}}>
              권장 이미지 사이즈: 가로 1200px × 세로 300px (비율 4:1)
            </div>
            
            <div style={{marginBottom: '2rem'}}>
              <button onClick={() => handleOpenBannerEditor('rec')} style={{padding: '0.8rem 1.5rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'}}>
                + 새 추천상품 배너 추가
              </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              {recBanners.length === 0 ? (
                <p style={{color: '#888'}}>등록된 추천상품 배너가 없습니다.</p>
              ) : recBanners.map((banner, idx) => (
                <div key={banner.id} style={{border: '1px solid #ddd', borderRadius: '12px', padding: '1.5rem', background: '#fafafa', position: 'relative'}}>
                  <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
                    <span style={{fontWeight: '900', fontSize: '1.5rem', color: 'var(--primary-color)'}}>{idx + 1}</span>
                    <img src={banner.imageUrl} alt="banner" style={{width: '240px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc'}} />
                    <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', justifyContent: 'center'}}>
                      <strong style={{fontSize: '1.1rem'}}>{banner.title || '(문구 없음)'}</strong>
                    </div>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button onClick={() => handleOpenBannerEditor('rec', banner)} style={{padding: '0.6rem 1rem', background: '#4bcffa', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>
                        수정
                      </button>
                      <button onClick={() => handleDeleteBanner(banner.id, 'rec')} style={{padding: '0.6rem 1rem', background: '#ff4757', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {recBanners.length > 0 && (
              <div style={{marginTop: '2rem', textAlign: 'right'}}>
                {/* Save button removed */}
              </div>
            )}
          </div>
        )}

        {(activeTab === 'notice' || activeTab === 'order' || activeTab === 'member') && (
          <div style={{textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '16px', color: '#888'}}>
            <h2 style={{fontSize: '1.8rem', fontWeight: '800', color: '#333', marginBottom: '1rem'}}>
               {activeTab === 'notice' ? '공지사항 관리' : 
                activeTab === 'order' ? '발주 관리' : '회원 관리'}
            </h2>
            <p>이 기능은 추후 업데이트 될 예정입니다.</p>
          </div>
        )}

      </div>
    </div>

    {/* 에디터 모달 */}
    {editingBanner && (
      <div className="modal-overlay" onClick={handleCloseBannerEditor}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={handleCloseBannerEditor}>&times;</button>
          <h2 style={{fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem', color: '#333'}}>
            {editorType === 'hero' ? '상단 배너 에디터' : '추천상품 배너 에디터'}
          </h2>
          
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'inline-block', padding: '0.8rem 1.5rem', background: 'var(--primary-color)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>
              {uploading ? '사진 업로드 중...' : '배경 사진 등록하기'}
              <input type="file" accept="image/*" style={{display: 'none'}} disabled={uploading} onChange={handleModalImageUpload} />
            </label>
          </div>

          <div className="modal-preview-box">
            {editorType === 'hero' ? (
              <div className="hero-slide" style={{ width: '100%', height: '300px', position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                <img src={editingBanner.imageUrl || 'https://via.placeholder.com/1920x500?text=배너이미지'} alt="미리보기" className="hero-slide-bg" style={{width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0}} />
                {editingBanner.title && (
                  <>
                    <div className="hero-slide-overlay" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)'}}></div>
                    <div 
                      className="hero-slide-content" 
                      onMouseDown={handleDragStart}
                      onTouchStart={handleDragStart}
                      style={{
                        position: 'absolute', 
                        left: editingBanner.textPosX !== undefined ? `${editingBanner.textPosX}%` : '50%',
                        top: editingBanner.textPosY !== undefined ? `${editingBanner.textPosY}%` : '50%',
                        transform: 'translate(-50%, -50%)', 
                        textAlign: 'center', 
                        width: '100%',
                        cursor: 'move',
                        padding: '1rem',
                        border: '2px dashed rgba(255,255,255,0.5)',
                        borderRadius: '8px',
                        zIndex: 10
                      }}
                      title="드래그하여 위치 변경"
                    >
                      <h1 style={{
                        color: editingBanner.titleColor,
                        fontSize: `${editingBanner.titleSize}px`,
                        fontFamily: editingBanner.titleFontFamily,
                        margin: 0
                      }}>
                        {editingBanner.title}
                      </h1>
                      {editingBanner.subtitle && (
                        <p style={{
                          color: editingBanner.subtitleColor,
                          fontSize: `${editingBanner.subtitleSize}px`,
                          fontFamily: editingBanner.subtitleFontFamily,
                          marginTop: '1rem',
                          margin: '1rem 0 0 0'
                        }}>
                          {editingBanner.subtitle}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="prep-banner" style={{
                width: '100%',
                aspectRatio: '4 / 1',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <img 
                  src={editingBanner.imageUrl || 'https://via.placeholder.com/1200x300?text=배너이미지'} 
                  alt="미리보기"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                {editingBanner.title && (
                  <div
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                    style={{
                      position: 'absolute',
                      left: editingBanner.textPosX !== undefined ? `${editingBanner.textPosX}%` : '50%',
                      top: editingBanner.textPosY !== undefined ? `${editingBanner.textPosY}%` : '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      width: '100%',
                      cursor: 'move',
                      padding: '1rem',
                      border: '2px dashed rgba(255,255,255,0.5)',
                      borderRadius: '8px',
                      zIndex: 10
                    }}
                    title="드래그하여 위치 변경"
                  >
                    <h3 style={{
                      position: 'relative',
                      color: editingBanner.titleColor,
                      fontWeight: 800,
                      fontSize: `${editingBanner.titleSize}px`,
                      fontFamily: editingBanner.titleFontFamily,
                      letterSpacing: '2px',
                      textShadow: '0 3px 6px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)',
                      margin: 0
                    }}>
                      {editingBanner.title}
                    </h3>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {/* 연결할 상품 설정 */}
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem', background: '#fafafa', padding: '1rem', borderRadius: '8px', border: '1px solid #eee'}}>
              <div style={{flex: '1 1 100%'}}><strong style={{color: '#555'}}>연결할 상품 (배너 클릭 시 해당 상품 페이지로 이동)</strong></div>
              <select value={editingBanner.linkProductId || ''} onChange={(e) => setEditingBanner({...editingBanner, linkProductId: e.target.value})} style={{width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer'}}>
                <option value="">-- 연결 안 함 (클릭 효과 없음) --</option>
                {products.map(p => (
                  <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* 메인 문구 설정 */}
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem', background: '#fafafa', padding: '1rem', borderRadius: '8px', border: '1px solid #eee'}}>
              <div style={{flex: '1 1 100%'}}><strong style={{color: '#555'}}>{editorType === 'hero' ? '메인 문구' : '배너 문구'}</strong></div>
              <input type="text" placeholder="문구 입력" value={editingBanner.title} onChange={(e) => setEditingBanner({...editingBanner, title: e.target.value})} style={{flex: '3', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px'}} />
              <input type="number" placeholder="크기(숫자)" value={editingBanner.titleSize} onChange={(e) => setEditingBanner({...editingBanner, titleSize: e.target.value})} style={{flex: '1', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px'}} title="글자 크기(px)" />
              <input type="color" value={editingBanner.titleColor} onChange={(e) => setEditingBanner({...editingBanner, titleColor: e.target.value})} style={{width: '50px', height: '40px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer'}} title="글자 색상" />
              <select value={editingBanner.titleFontFamily} onChange={(e) => setEditingBanner({...editingBanner, titleFontFamily: e.target.value})} style={{flex: '2', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px'}}>
                <option value="'Noto Sans KR', sans-serif">고딕 (Noto Sans)</option>
                <option value="'Noto Serif KR', serif">명조 (Noto Serif)</option>
                <option value="'Nanum Gothic', sans-serif">나눔고딕</option>
                <option value="'Nanum Myeongjo', serif">나눔명조</option>
                <option value="'Black Han Sans', sans-serif">검은고딕 (두꺼움)</option>
                <option value="'Jua', sans-serif">주아체 (둥글둥글)</option>
                <option value="'Do Hyeon', sans-serif">도현체 (각진제목)</option>
                <option value="'Gowun Dodum', sans-serif">고운돋움</option>
                <option value="'Gowun Batang', serif">고운바탕</option>
                <option value="'Dongle', sans-serif">동글 (매우귀여움)</option>
                <option value="'Nanum Pen Script', cursive">나눔펜글씨</option>
              </select>
            </div>

            {/* 서브 문구 설정 (상단 배너 전용) */}
            {editorType === 'hero' && (
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem', background: '#fafafa', padding: '1rem', borderRadius: '8px', border: '1px solid #eee'}}>
                <div style={{flex: '1 1 100%'}}><strong style={{color: '#555'}}>서브 문구</strong></div>
                <input type="text" placeholder="서브 문구 입력" value={editingBanner.subtitle} onChange={(e) => setEditingBanner({...editingBanner, subtitle: e.target.value})} style={{flex: '3', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px'}} />
                <input type="number" placeholder="크기(숫자)" value={editingBanner.subtitleSize} onChange={(e) => setEditingBanner({...editingBanner, subtitleSize: e.target.value})} style={{flex: '1', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px'}} title="글자 크기(px)" />
                <input type="color" value={editingBanner.subtitleColor} onChange={(e) => setEditingBanner({...editingBanner, subtitleColor: e.target.value})} style={{width: '50px', height: '40px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer'}} title="글자 색상" />
                <select value={editingBanner.subtitleFontFamily} onChange={(e) => setEditingBanner({...editingBanner, subtitleFontFamily: e.target.value})} style={{flex: '2', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px'}}>
                  <option value="'Noto Sans KR', sans-serif">고딕 (Noto Sans)</option>
                  <option value="'Noto Serif KR', serif">명조 (Noto Serif)</option>
                  <option value="'Nanum Gothic', sans-serif">나눔고딕</option>
                  <option value="'Nanum Myeongjo', serif">나눔명조</option>
                  <option value="'Black Han Sans', sans-serif">검은고딕 (두꺼움)</option>
                  <option value="'Jua', sans-serif">주아체 (둥글둥글)</option>
                  <option value="'Do Hyeon', sans-serif">도현체 (각진제목)</option>
                  <option value="'Gowun Dodum', sans-serif">고운돋움</option>
                  <option value="'Gowun Batang', serif">고운바탕</option>
                  <option value="'Dongle', sans-serif">동글 (매우귀여움)</option>
                  <option value="'Nanum Pen Script', cursive">나눔펜글씨</option>
                </select>
              </div>
            )}
          </div>

          <div style={{marginTop: '2rem', textAlign: 'center'}}>
            <button onClick={handleSaveBannerEditor} style={{padding: '1rem 4rem', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold'}}>
              저장하기
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default Admin;
