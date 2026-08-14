import React, { useState, useEffect } from 'react';
import { fetchProducts, createProduct, updateProduct, deleteProduct, uploadImage, fetchConfig, updateConfig, fetchUsers, fetchAllOrders, updateOrderStatus } from '../api';
import { LayoutDashboard, PackagePlus, List, Image as ImageIcon, Bell, Edit, Trash2, ChevronLeft, ChevronRight, Plus, X, Image as ImgIcon, Type, ShoppingCart } from 'lucide-react';

function Admin({ refreshGlobalProducts }) {
  const [activeTab, setActiveTab] = useState('register'); // register, list, banner, notice, order
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 페이징 (목록용)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [currentUsersPage, setCurrentUsersPage] = useState(1);
  const usersPerPage = 10;
  
  // 수정 모드 상태
  const [editingProductId, setEditingProductId] = useState(null);
  
  // 선택된 상품 상태 (일괄 삭제용)
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  
  // 관리자 회원 주문 내역 모달 상태
  const [selectedUserForOrders, setSelectedUserForOrders] = useState(null);
  const [selectedUserOrders, setSelectedUserOrders] = useState([]);
  
  // 주문 관리 페이지네이션 및 상세 모달 상태
  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);
  const ordersPerPage = 20;
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  
  // 주문 관리 서브 탭 & 송장 입력 상태
  const [orderSubTab, setOrderSubTab] = useState('결제완료');
  const [trackingInputs, setTrackingInputs] = useState({});
  const defaultEndDate = new Date().toISOString().split('T')[0];
  const defaultStartDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [orderStartDate, setOrderStartDate] = useState(defaultStartDate);
  const [orderEndDate, setOrderEndDate] = useState(defaultEndDate);

  
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

  // 구매 안내 이미지
  const [purchaseImagePreview, setPurchaseImagePreview] = useState(null);
  const [purchaseImageFile, setPurchaseImageFile] = useState(null);

  // 서브 이미지 (최대 5개)
  const [subImageFiles, setSubImageFiles] = useState([null, null, null, null, null]);
  const [subImagePreviews, setSubImagePreviews] = useState([null, null, null, null, null]);

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

  const loadAllOrders = async () => {
    try {
      const data = await fetchAllOrders();
      setAllOrders(data);
    } catch (e) {
      console.error('Failed to load all orders');
    }
  };

  useEffect(() => {
    loadProducts();
    loadBanners();
    loadUsers();
    loadAllOrders();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (e) {
      console.error('Failed to load users');
    }
  };

  const handleUserClick = async (user) => {
    try {
      import('../api').then(async (api) => {
        const orders = await api.fetchMyOrders(user._id || user.id);
        setSelectedUserOrders(orders);
        setSelectedUserForOrders(user);
      });
    } catch (e) {
      alert('주문 내역을 불러오는데 실패했습니다.');
    }
  };


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

  // -------------------------------------------------------------
  // 프론트엔드 이미지 압축 엔진 (WebP 변환, 최대 1200px)
  // -------------------------------------------------------------
  const compressImage = (file) => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) return resolve(file);
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const max = 1200;
          
          if (width > max || height > max) {
            if (width > height) {
              height = Math.round((height *= max / width));
              width = max;
            } else {
              width = Math.round((width *= max / height));
              height = max;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (!blob) return resolve(file);
            resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: 'image/webp',
              lastModified: Date.now()
            }));
          }, 'image/webp', 0.8);
        };
        img.onerror = () => resolve(file);
      };
    });
  };

  // 공통 이미지 업로드 핸들러
  const handleImageUpload = async (file) => {
    try {
      setUploading(true);
      const compressedFile = await compressImage(file);
      const res = await uploadImage(compressedFile);
      // res is { success: true, imageUrl: '...' }
      return res.imageUrl;
    } catch (error) {
      console.error(error);
      alert("업로드 상세 에러 정보:\n" + error.message);
      throw error;
    } finally {
      setUploading(false);
    }
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
    try {
      const url = await handleImageUpload(e.target.files[0]);
      setEditingBanner({...editingBanner, imageUrl: url});
    } catch(err) {
      // error is alerted in handleImageUpload
    } finally {
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
    
    // 구매 안내 이미지
    setPurchaseImageFile(null);
    setPurchaseImagePreview(product.purchaseInfoImageUrl || null);
    
    // 서브 이미지
    const previews = [null, null, null, null, null];
    if (product.subImageUrls && product.subImageUrls.length > 0) {
      product.subImageUrls.forEach((url, i) => {
        if(i < 5) previews[i] = url;
      });
    }
    setSubImageFiles([null, null, null, null, null]);
    setSubImagePreviews(previews);

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
    setPurchaseImageFile(null);
    setPurchaseImagePreview(null);
    setSubImageFiles([null, null, null, null, null]);
    setSubImagePreviews([null, null, null, null, null]);
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

  const handlePurchaseFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPurchaseImageFile(file);
      setPurchaseImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleSubImageChange = (index, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const newFiles = [...subImageFiles];
      newFiles[index] = file;
      setSubImageFiles(newFiles);
      
      const newPreviews = [...subImagePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setSubImagePreviews(newPreviews);
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
        imageUrl = await handleImageUpload(imageFile);
      }

      // 블록 이미지 업로드 순차 처리 (병렬 처리 시 ImgBB/Cloudflare 차단 방지)
      const processedBlocks = [];
      for (const block of detailBlocks) {
        if (block.type === 'image' && block.file) {
          const url = await handleImageUpload(block.file);
          processedBlocks.push({ type: 'image', content: url });
        } else if (block.type === 'image' && block.content) {
          processedBlocks.push({ type: 'image', content: block.content });
        } else {
          processedBlocks.push({ type: 'text', content: block.content });
        }
      }

      // 하위 호환 단일 디테일 이미지 처리 (선택사항)
      let oldDetailImageUrl = detailImagePreview;
      if (detailImageFile) {
         oldDetailImageUrl = await handleImageUpload(detailImageFile);
      }

      // 구매 안내 이미지 처리
      let oldPurchaseImageUrl = purchaseImagePreview;
      if (purchaseImageFile) {
         oldPurchaseImageUrl = await handleImageUpload(purchaseImageFile);
      }

      // 서브 이미지 순차 처리
      const processedSubImages = [];
      for (let index = 0; index < subImageFiles.length; index++) {
        const file = subImageFiles[index];
        if (file) {
          const url = await handleImageUpload(file);
          processedSubImages.push(url);
        } else {
          processedSubImages.push(subImagePreviews[index]);
        }
      }
      const finalSubImageUrls = processedSubImages.filter(url => url !== null);

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
        subImageUrls: finalSubImageUrls,
        detailImageUrl: oldDetailImageUrl,
        purchaseInfoImageUrl: oldPurchaseImageUrl,
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
        // 즉시 반영을 위한 Optimistic UI 업데이트
        setProducts(prev => prev.filter(p => (p._id || p.id) !== id));
        await deleteProduct(id);
        alert("삭제되었습니다.");
        loadProducts();
        if (refreshGlobalProducts) refreshGlobalProducts();
      } catch (error) {
        alert("삭제 실패");
        loadProducts(); // 에러 시 복구
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return alert("삭제할 상품을 선택해주세요.");
    if (window.confirm(`선택한 ${selectedProductIds.length}개의 상품을 정말로 삭제하시겠습니까?`)) {
      try {
        // 즉시 반영
        setProducts(prev => prev.filter(p => !selectedProductIds.includes(p._id || p.id)));
        await Promise.all(selectedProductIds.map(id => deleteProduct(id)));
        alert("선택한 상품이 삭제되었습니다.");
        setSelectedProductIds([]);
        loadProducts();
        if (refreshGlobalProducts) refreshGlobalProducts();
      } catch (error) {
        alert("일부 상품 삭제에 실패했습니다.");
        loadProducts();
      }
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    return Number(price).toLocaleString('ko-KR');
  };

  // Pagination Logic (Products)
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pagination Logic (Users)
  const totalUsersPages = Math.ceil(users.length / usersPerPage);
  const currentUsers = users.slice((currentUsersPage - 1) * usersPerPage, currentUsersPage * usersPerPage);

  const handleUsersPageChange = (page) => {
    setCurrentUsersPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pagination Logic (Orders)
  const filteredOrders = allOrders.filter(o => {
    if (o.status !== orderSubTab) return false;
    if (orderSubTab === '배송완료') {
      const dateObj = new Date(o.updatedAt || o.createdAt);
      const kstDate = new Date(dateObj.getTime() + 9 * 60 * 60 * 1000);
      const orderDate = kstDate.toISOString().split('T')[0];
      if (orderDate < orderStartDate || orderDate > orderEndDate) {
        return false;
      }
    }
    return true;
  });
  const totalOrdersPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const currentOrders = filteredOrders.slice((currentOrdersPage - 1) * ordersPerPage, currentOrdersPage * ordersPerPage);

  const handleOrdersPageChange = (page) => {
    setCurrentOrdersPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
    <style>
      {`
        .admin-page * {
          font-family: "Jua", "Pretendard", sans-serif !important;
        }
      `}
    </style>
    <div className="admin-page" style={{display: 'flex', minHeight: '100vh', background: '#f8f9fa'}}>
      
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
            { id: 'order', label: '주문 관리', icon: <ShoppingCart size={20} />, badge: allOrders.filter(o => o.status === '결제완료').length },
            { id: 'member', label: '회원 관리', icon: <LayoutDashboard size={20} /> },
          ].map(tab => (
            <li key={tab.id} 
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'register') resetForm();
                }}
                style={{
                  padding: '1rem 2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: activeTab === tab.id ? '#f1f2f6' : 'transparent',
                  color: activeTab === tab.id ? 'var(--primary-color)' : '#333',
                  fontWeight: activeTab === tab.id ? '700' : '500',
                  borderRight: activeTab === tab.id ? '4px solid var(--primary-color)' : '4px solid transparent',
                  transition: 'all 0.2s'
                }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {tab.icon} {tab.label}
              </div>
              {tab.badge > 0 && (
                <span style={{
                  background: 'red',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '0.1rem 0.6rem',
                  fontSize: '0.85rem',
                  fontWeight: 'bold'
                }}>
                  {tab.badge}
                </span>
              )}
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

                  {/* 서브 이미지 (최대 5개) */}
                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>• 서브 이미지 (최대 5개)</label>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      {[0, 1, 2, 3, 4].map(idx => (
                        <div key={idx} style={{flex: 1, position: 'relative'}}>
                          <input type="file" accept="image/*" onChange={(e) => handleSubImageChange(idx, e)} style={{width: '100%', padding: '0.5rem', border: '1px dashed #ccc', borderRadius: '8px', fontSize: '0.8rem'}} />
                          {subImagePreviews[idx] && (
                            <img src={subImagePreviews[idx]} alt="sub preview" style={{width: '100%', height: '50px', objectFit: 'cover', marginTop: '0.5rem', borderRadius: '4px'}} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 구매 안내 이미지 */}
                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>• 구매 안내 이미지 (반품/교환 등)</label>
                    <input type="file" accept="image/*" onChange={handlePurchaseFileChange} style={{width: '100%', padding: '0.5rem', border: '1px dashed #ccc', borderRadius: '8px'}} />
                    {purchaseImagePreview && (
                      <div style={{marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--primary-color)'}}>
                        이미지가 등록되어 있습니다.
                      </div>
                    )}
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
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h2 style={{fontSize: '1.8rem', fontWeight: '800'}}>등록된 상품 목록 ({products.length}개)</h2>
              <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                {selectedProductIds.length > 0 && (
                  <button onClick={handleBulkDelete} style={{padding: '0.6rem 1.2rem', background: '#ff4757', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>
                    선택 삭제 ({selectedProductIds.length})
                  </button>
                )}
                <button className="primary-btn" onClick={() => {resetForm(); setActiveTab('register');}}>+ 새 상품 등록</button>
              </div>
            </div>
            
            {products.length > 0 && (
              <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem', paddingLeft: '1.5rem'}}>
                <input 
                  type="checkbox"
                  id="selectAll"
                  style={{marginRight: '0.8rem', width: '18px', height: '18px', cursor: 'pointer'}}
                  checked={currentProducts.length > 0 && selectedProductIds.length === currentProducts.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProductIds(currentProducts.map(p => p._id || p.id));
                    } else {
                      setSelectedProductIds([]);
                    }
                  }}
                />
                <label htmlFor="selectAll" style={{cursor: 'pointer', fontWeight: '600'}}>현재 페이지 전체 선택</label>
              </div>
            )}
            
            {products.length === 0 ? (
              <div style={{textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '16px', color: '#888'}}>
                등록된 상품이 없습니다.
              </div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {currentProducts.map(p => (
                  <div key={p._id || p.id} style={{display: 'flex', alignItems: 'center', background: 'white', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.02)'}}>
                    <input 
                      type="checkbox" 
                      style={{marginRight: '1.5rem', width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0}}
                      checked={selectedProductIds.includes(p._id || p.id)}
                      onChange={(e) => {
                        const id = p._id || p.id;
                        if (e.target.checked) {
                          setSelectedProductIds(prev => [...prev, id]);
                        } else {
                          setSelectedProductIds(prev => prev.filter(item => item !== id));
                        }
                      }}
                    />
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

        {activeTab === 'notice' && (
          <div style={{textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '16px', color: '#888'}}>
            <h2 style={{fontSize: '1.8rem', fontWeight: '800', color: '#333', marginBottom: '1rem'}}>
               공지사항 관리
            </h2>
            <p>이 기능은 추후 업데이트 될 예정입니다.</p>
          </div>
        )}

        {activeTab === 'order' && (
          <div style={{background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}}>
            <h2 style={{fontSize: '1.8rem', fontWeight: '800', color: '#333', marginBottom: '1.5rem'}}>주문 관리 ({allOrders.length}건)</h2>
            
            {/* 소메뉴 (서브 탭) */}
            <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '1rem'}}>
              {['결제완료', '상품준비중', '배송중', '배송완료'].map(status => (
                <button
                  key={status}
                  onClick={() => {
                    setOrderSubTab(status);
                    setCurrentOrdersPage(1);
                  }}
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: orderSubTab === status ? 'var(--primary-color)' : '#f1f2f6',
                    color: orderSubTab === status ? 'white' : '#555',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: orderSubTab === status ? 'bold' : 'normal',
                    fontSize: '1.1rem'
                  }}
                >
                  {status === '결제완료' ? '1. 주문완료' : status === '상품준비중' ? '2. 배송처리' : status === '배송중' ? '3. 배송중' : '4. 배송완료'}
                  {status !== '배송완료' && (
                    <span style={{marginLeft: '0.5rem', background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.9rem'}}>
                      {allOrders.filter(o => o.status === status).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {orderSubTab === '배송완료' && (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#555' }}>조회 기간:</span>
                <input 
                  type="date" 
                  value={orderStartDate} 
                  onChange={(e) => { setOrderStartDate(e.target.value); setCurrentOrdersPage(1); }}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <span style={{color: '#888'}}>~</span>
                <input 
                  type="date" 
                  value={orderEndDate} 
                  onChange={(e) => { setOrderEndDate(e.target.value); setCurrentOrdersPage(1); }}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <span style={{ marginLeft: '1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  기간 내 배송완료: {filteredOrders.length}건
                </span>
              </div>
            )}

            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px'}}>
                <thead>
                  <tr style={{background: '#f8f9fa', borderBottom: '2px solid #ddd'}}>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>주문일시</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>주문번호/주문자</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>상품명</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>결제금액</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>
                      {orderSubTab === '상품준비중' ? '송장입력' : orderSubTab === '배송중' || orderSubTab === '배송완료' ? '송장정보' : '관리'}
                    </th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>상태변경</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map(order => (
                    <tr key={order._id} style={{borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'background 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.background='#f9f9f9'} onMouseLeave={(e) => e.currentTarget.style.background='transparent'} onClick={() => setSelectedOrderDetails(order)}>
                      <td style={{padding: '1rem', color: '#666'}}>
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td style={{padding: '1rem'}}>
                        <div style={{fontWeight: 'bold', color: '#333'}}>{order.userId?.name || order.shippingInfo?.receiverName || '알 수 없음'}</div>
                        <div style={{color: '#666', fontSize: '0.85rem'}}>{order.merchant_uid}</div>
                      </td>
                      <td style={{padding: '1rem', color: '#333'}}>
                        {order.items.length > 0 ? (
                          order.items.length > 1 
                            ? `${order.items[0].name} 외 ${order.items.length - 1}건` 
                            : order.items[0].name
                        ) : '상품 없음'}
                      </td>
                      <td style={{padding: '1rem', fontWeight: 'bold', color: 'var(--primary-color)'}}>
                        {(order.totalAmount + order.shippingFee).toLocaleString()}원
                      </td>
                      <td style={{padding: '1rem'}} onClick={e => e.stopPropagation()}>
                        {orderSubTab === '상품준비중' ? (
                          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                            <input 
                              type="text" 
                              placeholder="택배사 (예: CJ대한통운)"
                              value={trackingInputs[order._id]?.courier || ''}
                              onChange={e => setTrackingInputs(prev => ({...prev, [order._id]: {...prev[order._id], courier: e.target.value}}))}
                              style={{padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.9rem'}}
                            />
                            <input 
                              type="text" 
                              placeholder="송장번호 입력"
                              value={trackingInputs[order._id]?.trackingNumber || ''}
                              onChange={e => setTrackingInputs(prev => ({...prev, [order._id]: {...prev[order._id], trackingNumber: e.target.value}}))}
                              style={{padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.9rem'}}
                            />
                          </div>
                        ) : (orderSubTab === '배송중' || orderSubTab === '배송완료') ? (
                          <div style={{fontSize: '0.95rem'}}>
                            <div style={{fontWeight: 'bold', color: '#555'}}>{order.courier || '택배사 미상'}</div>
                            <div style={{color: '#888'}}>{order.trackingNumber || '송장번호 없음'}</div>
                          </div>
                        ) : (
                          <span style={{color: '#aaa'}}>-</span>
                        )}
                      </td>
                      <td style={{padding: '1rem'}} onClick={e => e.stopPropagation()}>
                        {orderSubTab === '결제완료' && (
                          <button onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await updateOrderStatus(order._id, { status: '상품준비중' });
                              loadAllOrders();
                            } catch (err) { alert('변경 실패'); }
                          }} style={{padding: '0.6rem 1rem', background: '#34495e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit'}}>
                            배송처리(준비중)로 이동
                          </button>
                        )}
                        {orderSubTab === '상품준비중' && (
                          <button onClick={async (e) => {
                            e.stopPropagation();
                            const trackingInfo = trackingInputs[order._id];
                            if (!trackingInfo?.courier || !trackingInfo?.trackingNumber) {
                              if (!window.confirm('택배사나 송장번호가 입력되지 않았습니다. 그래도 배송중으로 이동하시겠습니까?')) return;
                            }
                            try {
                              await updateOrderStatus(order._id, { 
                                status: '배송중', 
                                courier: trackingInfo?.courier || '',
                                trackingNumber: trackingInfo?.trackingNumber || ''
                              });
                              loadAllOrders();
                            } catch (err) { alert('변경 실패'); }
                          }} style={{padding: '0.6rem 1rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit'}}>
                            송장입력 후 배송중 이동
                          </button>
                        )}
                        {orderSubTab === '배송중' && (
                          <button onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await updateOrderStatus(order._id, { status: '배송완료' });
                              loadAllOrders();
                            } catch (err) { alert('변경 실패'); }
                          }} style={{padding: '0.6rem 1rem', background: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit'}}>
                            배송완료 처리
                          </button>
                        )}
                        {orderSubTab === '배송완료' && (
                          <span style={{color: '#27ae60', fontWeight: 'bold'}}>배송완료 됨</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {currentOrders.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{padding: '3rem', textAlign: 'center', color: '#999', fontSize: '1.1rem'}}>
                        주문 내역이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 주문 페이징 */}
            {totalOrdersPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', gap: '0.5rem' }}>
                <button
                  onClick={() => handleOrdersPageChange(currentOrdersPage - 1)}
                  disabled={currentOrdersPage === 1}
                  style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', cursor: currentOrdersPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalOrdersPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handleOrdersPageChange(page)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: currentOrdersPage === page ? 'var(--primary-color)' : '#fff',
                      color: currentOrdersPage === page ? '#fff' : '#333',
                      border: '1px solid',
                      borderColor: currentOrdersPage === page ? 'var(--primary-color)' : '#ddd',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handleOrdersPageChange(currentOrdersPage + 1)}
                  disabled={currentOrdersPage === totalOrdersPages}
                  style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', cursor: currentOrdersPage === totalOrdersPages ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'member' && (
          <div style={{background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}}>
            <h2 style={{fontSize: '1.8rem', fontWeight: '800', color: '#333', marginBottom: '2rem'}}>회원 관리 ({users.length}명)</h2>
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px'}}>
                <thead>
                  <tr style={{background: '#f8f9fa', borderBottom: '2px solid #ddd'}}>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>이름</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>아이디(소셜)</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>이메일</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>전화번호</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>마케팅수신동의</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>가입일</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{padding: '3rem', textAlign: 'center', color: '#777'}}>가입한 회원이 없습니다.</td>
                    </tr>
                  ) : (
                    currentUsers.map(u => (
                      <tr key={u._id} onClick={() => handleUserClick(u)} style={{borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'background 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.background='#f9f9f9'} onMouseLeave={(e) => e.currentTarget.style.background='transparent'}>

                        <td style={{padding: '1rem'}}>{u.name} {u.role === 'admin' ? '(관리자)' : ''}</td>
                        <td style={{padding: '1rem'}}>{u.provider !== 'local' ? `${u.provider.toUpperCase()} 로그인` : u.loginId}</td>
                        <td style={{padding: '1rem'}}>{u.email}</td>
                        <td style={{padding: '1rem'}}>{u.phone || '-'}</td>
                        <td style={{padding: '1rem'}}>
                          {u.agreements?.sns ? (
                            <span style={{background: '#e8f5e9', color: '#2e7d32', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem'}}>동의</span>
                          ) : (
                            <span style={{background: '#ffebee', color: '#c62828', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem'}}>미동의</span>
                          )}
                        </td>
                        <td style={{padding: '1rem'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 회원관리 페이징 */}
            {totalUsersPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', gap: '0.5rem' }}>
                <button 
                  onClick={() => handleUsersPageChange(Math.max(1, currentUsersPage - 1))}
                  disabled={currentUsersPage === 1}
                  style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', background: currentUsersPage === 1 ? '#f8f9fa' : 'white', cursor: currentUsersPage === 1 ? 'not-allowed' : 'pointer', borderRadius: '8px' }}
                >
                  이전
                </button>
                {[...Array(totalUsersPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handleUsersPageChange(i + 1)}
                    style={{
                      padding: '0.5rem 1rem',
                      border: currentUsersPage === i + 1 ? 'none' : '1px solid #ddd',
                      background: currentUsersPage === i + 1 ? '#000' : 'white',
                      color: currentUsersPage === i + 1 ? 'white' : '#333',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      fontWeight: currentUsersPage === i + 1 ? 'bold' : 'normal'
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  onClick={() => handleUsersPageChange(Math.min(totalUsersPages, currentUsersPage + 1))}
                  disabled={currentUsersPage === totalUsersPages}
                  style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', background: currentUsersPage === totalUsersPages ? '#f8f9fa' : 'white', cursor: currentUsersPage === totalUsersPages ? 'not-allowed' : 'pointer', borderRadius: '8px' }}
                >
                  다음
                </button>
              </div>
            )}
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
      {selectedUserForOrders && (
      <div className="modal-overlay" onClick={() => setSelectedUserForOrders(null)}>
        <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto'}}>
          <button className="modal-close-btn" onClick={() => setSelectedUserForOrders(null)}>&times;</button>
          <h2 style={{fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', color: '#333'}}>
            {selectedUserForOrders.name} 님의 주문 내역
          </h2>
          {selectedUserOrders.length === 0 ? (
            <p style={{textAlign: 'center', padding: '2rem', color: '#666'}}>주문 내역이 없습니다.</p>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {selectedUserOrders.map(order => (
                <div key={order._id} style={{border: '1px solid #eee', borderRadius: '8px', padding: '1.5rem'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '0.8rem', marginBottom: '0.8rem'}}>
                    <div>
                      <span style={{fontWeight: 'bold', marginRight: '1rem'}}>{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span style={{color: '#666', fontSize: '0.9rem'}}>주문번호: {order.merchant_uid}</span>
                    </div>
                    <div>
                      <strong style={{color: 'var(--primary-color)'}}>{order.status}</strong>
                    </div>
                  </div>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem'}}>
                      {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px'}} />}
                      <div style={{flex: 1}}>
                        <div style={{fontWeight: 'bold'}}>{item.name}</div>
                        {item.selectedOptionName && <div style={{fontSize: '0.85rem', color: '#666'}}>옵션: {item.selectedOptionName}</div>}
                        <div style={{fontSize: '0.9rem'}}>{item.price.toLocaleString()}원 x {item.quantity}개</div>
                      </div>
                    </div>
                  ))}
                  <div style={{marginTop: '1.5rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-color)'}}>
                    총 결제금액: {order.totalAmount.toLocaleString()}원
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}

      {/* 주문 상세(배송지 정보) 모달 */}
      {selectedOrderDetails && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}} onClick={() => setSelectedOrderDetails(null)}>
          <div style={{background: 'white', borderRadius: '16px', padding: '2.5rem', width: '90%', maxWidth: '650px', maxHeight: '85vh', overflowY: 'auto', fontFamily: '"Jua", "Pretendard", sans-serif'}} onClick={e => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
              <h2 style={{fontSize: '1.6rem', fontWeight: 'bold'}}>주문 상세 내역</h2>
              <button onClick={() => setSelectedOrderDetails(null)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><X size={28} /></button>
            </div>
            
            {/* 상품 정보 영역 */}
            <div style={{marginBottom: '2rem'}}>
              <h3 style={{fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)', borderBottom: '2px solid #eee', paddingBottom: '0.8rem', marginBottom: '1.5rem'}}>주문 상품 정보</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {selectedOrderDetails.items.map((item, idx) => (
                  <div key={idx} style={{display: 'flex', alignItems: 'center', gap: '1.2rem', background: '#f8f9fa', padding: '1.2rem', borderRadius: '8px'}}>
                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px'}} />}
                    <div style={{flex: 1}}>
                      <div style={{fontWeight: 'bold', fontSize: '1.2rem', color: '#333'}}>{item.name}</div>
                      {item.selectedOptionName && <div style={{fontSize: '1rem', color: '#666', marginTop: '0.3rem'}}>옵션: {item.selectedOptionName}</div>}
                      <div style={{fontSize: '1.1rem', color: '#444', marginTop: '0.3rem'}}>{item.price.toLocaleString()}원 x <strong style={{color: 'var(--primary-color)'}}>{item.quantity}개</strong></div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{marginTop: '1.5rem', textAlign: 'right', fontSize: '1.4rem', fontWeight: 'bold'}}>
                총 결제금액: <span style={{color: 'var(--primary-color)'}}>{selectedOrderDetails.totalAmount.toLocaleString()}원</span>
              </div>
            </div>

            {/* 배송지 정보 영역 */}
            <div>
              <h3 style={{fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)', borderBottom: '2px solid #eee', paddingBottom: '0.8rem', marginBottom: '1.5rem'}}>배송지 정보</h3>
              <div style={{padding: '1.8rem', background: '#f8f9fa', borderRadius: '8px', fontSize: '1.1rem'}}>
                <p style={{marginBottom: '1rem', display: 'flex', justifyContent: 'space-between'}}>
                  <strong style={{color: '#555', minWidth: '100px'}}>수령인</strong> 
                  <span style={{textAlign: 'right'}}>{selectedOrderDetails.shippingInfo?.receiverName || '정보 없음'}</span>
                </p>
                <p style={{marginBottom: '1rem', display: 'flex', justifyContent: 'space-between'}}>
                  <strong style={{color: '#555', minWidth: '100px'}}>연락처</strong> 
                  <span style={{textAlign: 'right'}}>{selectedOrderDetails.shippingInfo?.receiverPhone || '정보 없음'}</span>
                </p>
                <p style={{marginBottom: '1rem', display: 'flex', justifyContent: 'space-between'}}>
                  <strong style={{color: '#555', minWidth: '100px'}}>우편번호</strong> 
                  <span style={{textAlign: 'right'}}>{selectedOrderDetails.shippingInfo?.zonecode || '정보 없음'}</span>
                </p>
                <div style={{marginBottom: '1rem'}}>
                  <strong style={{color: '#555', display: 'block', marginBottom: '0.5rem'}}>주소</strong> 
                  <div style={{background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #ddd', lineHeight: '1.5'}}>
                    {selectedOrderDetails.shippingInfo?.address || '정보 없음'}<br/>
                    {selectedOrderDetails.shippingInfo?.detailAddress || ''}
                  </div>
                </div>
                <div style={{marginBottom: '1rem'}}>
                  <strong style={{color: '#555', display: 'block', marginBottom: '0.5rem'}}>현관 출입비밀번호</strong> 
                  <div style={{background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #ddd', color: 'var(--primary-color)', fontWeight: 'bold'}}>
                    {selectedOrderDetails.shippingInfo?.doorPassword || '없음'}
                  </div>
                </div>
                <div style={{marginBottom: '1rem'}}>
                  <strong style={{color: '#555', display: 'block', marginBottom: '0.5rem'}}>배송 메모</strong> 
                  <div style={{background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #ddd', minHeight: '60px'}}>
                    {selectedOrderDetails.shippingInfo?.memo || '없음'}
                  </div>
                </div>
                <div>
                  <strong style={{color: '#555', display: 'block', marginBottom: '0.5rem'}}>기타 메모</strong> 
                  <div style={{background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #ddd', minHeight: '60px'}}>
                    {selectedOrderDetails.shippingInfo?.extraMemo || '없음'}
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => setSelectedOrderDetails(null)} style={{width: '100%', padding: '1rem', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', fontFamily: 'inherit', marginTop: '2rem'}}>
              닫기
            </button>
          </div>
        </div>
      )}
  </>
  );
}

export default Admin;
