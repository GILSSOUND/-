import React, { useState, useEffect } from 'react';
import { fetchProducts, createProduct, updateProduct, deleteProduct, uploadImage, fetchConfig, updateConfig, fetchUsers, fetchAllOrders, updateOrderStatus } from '../api';
import { LayoutDashboard, PackagePlus, List, Image as ImageIcon, Bell, Edit, Trash2, ChevronLeft, ChevronRight, Plus, X, Image as ImgIcon, Type, ShoppingCart, Menu, RefreshCcw } from 'lucide-react';

function Admin({ refreshGlobalProducts }) {
  const [activeTab, setActiveTab] = useState('register'); // register, list, banner, notice, order
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // ?_이_?(목록??
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [currentUsersPage, setCurrentUsersPage] = useState(1);
  const usersPerPage = 10;
  
  // ?_정 모드 ?_태
  const [editingProductId, setEditingProductId] = useState(null);
  
  // ?_택???_품 ?_태 (?_괄 ??__??
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  
  // 관리자 ?_원 주문 ?_역 모달 ?_태
  const [selectedUserForOrders, setSelectedUserForOrders] = useState(null);
  const [selectedUserOrders, setSelectedUserOrders] = useState([]);
  
  // 주문 관_??_이지?_이??_??_세 모달 ?_태
  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);
  const ordersPerPage = 20;
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  
  // 주문 _??_레?????_태
  const [orderSubTab, setOrderSubTab] = useState('결제?_료');
  const [claimsSubTab, setClaimsSubTab] = useState('취소관리');
  const [trackingInputs, setTrackingInputs] = useState({});
  const defaultEndDate = new Date().toISOString().split('T')[0];
  const defaultStartDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [orderStartDate, setOrderStartDate] = useState(defaultStartDate);
  const [orderEndDate, setOrderEndDate] = useState(defaultEndDate);

  
  // 기본 폼
  const initialFormData = {
    name: '',
    category: 'mealkit',
    originalPrice: '',
    price: '',
    shippingFee: 3000,
    isNewProduct: false,
    isBest: false
  };

  // ???_태
  const [formData, setFormData] = useState(initialFormData);
  
  // 메인 ?_네???_태
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // 구버???_세 ?__?지 (?_위 ?_환)
  const [detailImagePreview, setDetailImagePreview] = useState(null);
  const [detailImageFile, setDetailImageFile] = useState(null);

  // 구매 ?_내 ?__?지
  const [purchaseImagePreview, setPurchaseImagePreview] = useState(null);
  const [purchaseImageFile, setPurchaseImageFile] = useState(null);

  // ?_브 ?__?지 (최_? 5_?
  const [subImageFiles, setSubImageFiles] = useState([null, null, null, null, null]);
  const [subImagePreviews, setSubImagePreviews] = useState([null, null, null, null, null]);

  // ?_중 블록 (?_진/글) ?_태
  const [detailBlocks, setDetailBlocks] = useState([]); 
  // 구조: { type: 'text' | 'image', content: '...', file?: File, preview?: string }
  
  const [options, setOptions] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 배너 관_??_태
  const [heroBanners, setHeroBanners] = useState([]);
  const [recBanners, setRecBanners] = useState([]);
  
  // ?_디??모달 ?_태
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
      alert('주문 ?_역??불러?_는???_패?_습?_다.');
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
  // ?_론?_엔???__?지 ?_축 ?_진 (WebP 변?? 최_? 1200px)
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
      alert("?_로???_세 ?_러 ?_보:\n" + error.message);
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
      alert("배너 ?__?지_??_로?_해주세??");
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
      alert('배너가 ?_?_되?_습?_다.');
    } catch(err) {
      alert("?_???_패: " + err.message);
    }
  };

  const handleDeleteBanner = async (id, type) => {
    if(!window.confirm("??배너_???__?_시겠습?_까?")) return;
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
      alert("배너 ??__ ?_패");
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

  // 상세 블록 추가
  // 상세 블록 추가
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

  // ?_정 버튼 ?_릭???_이??로드
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
    
    // ?_환?? 기존 ?_일 ?__?지
    setDetailImageFile(null);
    setDetailImagePreview(product.detailImageUrl || null);
    
    // 구매 ?_내 ?__?지
    setPurchaseImageFile(null);
    setPurchaseImagePreview(product.purchaseInfoImageUrl || null);
    
    // ?_브 ?__?지
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
        preview: b.type === "image" ? b.content : null,
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
      alert("메인 ?_네???__?지_??_록?_주?_요.");
      return;
    }

    try {
      setUploading(true);
      
      let imageUrl = imagePreview; // ?_정모드?_서 변경안?_으_?기존 URL ?__?
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      // 블록 ?__?지 ?_로???_차 처리 (병렬 처리 ??ImgBB/Cloudflare 차단 방_?)
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

      // ?_위 ?_환 ?_일 ?_테???__?지 처리 (?_택?_항)
      let oldDetailImageUrl = detailImagePreview;
      if (detailImageFile) {
         oldDetailImageUrl = await handleImageUpload(detailImageFile);
      }

      // 구매 ?_내 ?__?지 처리
      let oldPurchaseImageUrl = purchaseImagePreview;
      if (purchaseImageFile) {
         oldPurchaseImageUrl = await handleImageUpload(purchaseImageFile);
      }

      // ?_브 ?__?지 ?_차 처리
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
        alert("?_품???_공?_으_??_정?_었?_니??");
      } else {
        await createProduct(productPayload);
        alert("?_품???_공?_으_??_록?_었?_니??");
      }
      
      if (refreshGlobalProducts) refreshGlobalProducts();
      loadProducts();
      resetForm();
      setActiveTab('list');
      
    } catch (error) {
      console.error(error);
      alert("처리 ?_패: " + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("?_말_????_품????__?_시겠습?_까?")) {
      try {
        // 즉시 반영???_한 Optimistic UI ?_데?_트
        setProducts(prev => prev.filter(p => (p._id || p.id) !== id));
        await deleteProduct(id);
        alert("??__?_었?_니??");
        loadProducts();
        if (refreshGlobalProducts) refreshGlobalProducts();
      } catch (error) {
        alert("??__ ?_패");
        loadProducts(); // ?_러 ??복구
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return alert("??__???_품???_택?_주?_요.");
    if (window.confirm(`?_택??${selectedProductIds.length}개의 ?_품???_말_???__?_시겠습?_까?`)) {
      try {
        // 즉시 반영
        setProducts(prev => prev.filter(p => !selectedProductIds.includes(p._id || p.id)));
        await Promise.all(selectedProductIds.map(id => deleteProduct(id)));
        alert("?_택???_품????__?_었?_니??");
        setSelectedProductIds([]);
        loadProducts();
        if (refreshGlobalProducts) refreshGlobalProducts();
      } catch (error) {
        alert("?__? ?_품 ??__???_패?_습?_다.");
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
    if (orderSubTab === '배송?_료') {
      let orderDate = '';
      try {
        const dateObj = new Date(o.updatedAt || o.createdAt);
        if (!isNaN(dateObj.getTime())) {
          const kstDate = new Date(dateObj.getTime() + 9 * 60 * 60 * 1000);
          orderDate = kstDate.toISOString().split('T')[0];
        }
      } catch (e) {}
      
      if (orderDate && (orderDate < orderStartDate || orderDate > orderEndDate)) {
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
      
      {/* 1. ?_쪽 ?_이?_바 메뉴 */}
      {isSidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999}}></div>
      )}
      <div className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <h2 style={{padding: '0 2rem', marginBottom: '2rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)'}}>
          <LayoutDashboard /> 관리자 ??        </h2>
        
        <ul style={{listStyle: 'none', padding: 0}}>
          {[
            { id: 'register', label: '상품 등록', icon: <PackagePlus size={20} /> },
            { id: 'list', label: '상품 목록', icon: <List size={20} /> },
            { id: 'banner', label: '메인 상단 배너 관리', icon: <ImageIcon size={20} /> },
            { id: 'rec_banner', label: '추천상품 배너 관리', icon: <ImageIcon size={20} /> },
            { id: 'notice', label: '공지사항 관리', icon: <Bell size={20} /> },
            { id: 'order', label: '주문 관리', icon: <ShoppingCart size={20} />, badge: allOrders.filter(o => o.status === '결제완료').length },
            { id: 'claims', label: '취소반품교환관리', icon: <RefreshCcw size={20} /> },
            { id: 'member', label: '회원 관리', icon: <LayoutDashboard size={20} /> },
          ].map(tab => (
            <li key={tab.id} 
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsSidebarOpen(false);
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

      {/* 2. 메인 컨텐_??_역 */}
      <div className="admin-main-content">
        
        <div className="admin-mobile-header" style={{ display: 'none', alignItems: 'center', padding: '1rem', background: 'white', borderBottom: '1px solid #eee', marginBottom: '1rem' }}>
          <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Menu size={24} />
          </button>
          <span style={{ marginLeft: '1rem', fontWeight: 'bold', fontSize: '1.2rem' }}>관리자 ?_이지</span>
        </div>
        {/* ========================================================================================= */}
        {/* ?_품 ?_록/?_정 ??*/}
        {/* ========================================================================================= */}
        {activeTab === 'register' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{fontSize: '1.8rem', fontWeight: '800'}}>
                {editingProductId ? '?_품 ?_정' : '?_규 ?_품 ?_록'}
              </h2>
              {editingProductId && (
                <button className="outline-btn" onClick={handleCancelEdit}>?_정 취소 (?_규 ?_록?_로 ?_환)</button>
              )}
            </div>

            <div style={{display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'flex-start'}}>
              
              {/* ?_쪽: ?_록 ??*/}
              <div style={{flex: 1, minWidth: '280px', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>상품명</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}} />
                  </div>

                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>상품명</label>
                    <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} placeholder="?? 바다???_선?_을 그_?_??__?" style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}} />
                  </div>
                  
                  <div style={{display: 'flex', gap: '1rem'}}>
                    <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>상품명</label>
                      <select name="category" value={formData.category} onChange={handleChange} style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}}>
                        <option value="mealkit">밀키트</option>
                        <option value="new">신상품</option>
                        <option value="local">?__?직송</option>
                        <option value="direct">?_체직송</option>
                        <option value="sale">?__??_인</option>
                      </select>
                    </div>
                    <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>상품명</label>
                      <input type="number" name="price" value={formData.price} onChange={handleChange} required style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}} />
                    </div>
                  </div>

                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>상품명</label>
                    <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} placeholder="?_인 ??가격을 ?_으_??_인???_동 계산" style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}} />
                  </div>

                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>상품명</label>
                    <input type="number" name="shippingFee" value={formData.shippingFee} onChange={handleChange} placeholder="기본 3,000?? 0 ?_력 ??무료배송" style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}} />
                  </div>

                  <div style={{display: 'flex', gap: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px'}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600'}}>
                      <input type="checkbox" name="isNewProduct" checked={formData.isNewProduct} onChange={handleChange} />
                      [NEW 배_?]
                    </label>
                    <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600'}}>
                      <input type="checkbox" name="isBest" checked={formData.isBest} onChange={handleChange} />
                      [BEST 배_?]
                    </label>
                  </div>

                  {/* ?_네??*/}
                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>상품명</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{width: '100%', padding: '0.5rem', border: '1px dashed #ccc', borderRadius: '8px'}} />
                  </div>

                  {/* ?_브 ?__?지 (최_? 5_? */}
                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>상품명</label>
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

                  {/* 구매 ?_내 ?__?지 */}
                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>상품명</label>
                    <input type="file" accept="image/*" onChange={handlePurchaseFileChange} style={{width: '100%', padding: '0.5rem', border: '1px dashed #ccc', borderRadius: '8px'}} />
                    {purchaseImagePreview && (
                      <div style={{marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--primary-color)'}}>
                        ?__?지가 ?_록?_어 ?_습?_다.
                      </div>
                    )}
                  </div>

                  {/* ?_션 */}
                  <div style={{background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                      <label style={{fontWeight: 'bold'}}>???_품 ?_션 ?_정 (?_택?_항)</label>
                      <button type="button" onClick={handleAddOption} style={{padding: '0.4rem 0.8rem', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>+ 추_?</button>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
                      {options.map((opt, idx) => (
                        <div key={idx} style={{display: 'flex', gap: '0.5rem'}}>
                          <input type="text" placeholder="옵션명" value={opt.name} onChange={(e) => handleOptionChange(idx, "name", e.target.value)} style={{flex: 2, padding: "0.5rem", border: "1px solid #ddd", borderRadius: "4px"}} />
                          <input type='number' placeholder='추가금액(+)' value={opt.additionalPrice} onChange={(e) => handleOptionChange(idx, 'additionalPrice', e.target.value)} style={{flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px'}} />
                          <button type="button" onClick={() => handleRemoveOption(idx)} style={{padding: '0.5rem', background: '#ff4757', color: 'white', border: 'none', borderRadius: '4px'}}>X</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ?_적 ?_세 블록 추_? (?_진+글 ?_기) */}
                  <div style={{border: '1px solid var(--primary-color)', padding: '1.5rem', borderRadius: '8px'}}>
                    <h3 style={{marginBottom: '1rem', color: 'var(--primary-color)', fontSize: '1.1rem'}}>?_세?_이지 구성 (블록 ?_디??</h3>
                    <p style={{fontSize: '0.85rem', color: '#666', marginBottom: '1rem'}}>
                      ?_진_??_스?__? ?_하???_서?__??_유_?__ 추_??_보?_요.
                    </p>
                    
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem'}}>
                      {detailBlocks.map((block, idx) => (
                        <div key={idx} style={{background: '#f8f9fa', padding: '1rem', borderRadius: '8px', position: 'relative', border: '1px solid #ddd'}}>
                          <button type="button" onClick={() => handleRemoveBlock(idx)} style={{position: 'absolute', top: '-10px', right: '-10px', background: '#ff4757', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', zIndex: 10}}><X size={14}/></button>
                          
                          {block.type === 'text' ? (
                            <div>
                              <div style={{fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#555'}}><Type size={14}/> ?_스??블록</div>
                              <textarea 
                                value={block.content} 
                                onChange={(e) => handleBlockTextChange(idx, e.target.value)}
                                placeholder="?_기???_세 ?_명???_어주세??.."
                                style={{width: '100%', minHeight: '80px', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical'}}
                              />
                            </div>
                          ) : (
                            <div>
                              <div style={{fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#555'}}><ImgIcon size={14}/> ?__?지 블록</div>
                              <input type="file" accept="image/*" onChange={(e) => handleBlockImageChange(idx, e)} style={{marginBottom: '0.5rem'}} />
                              {block.preview && <img src={block.preview} alt="preview" style={{maxWidth: '100%', maxHeight: '150px', display: 'block', borderRadius: '4px'}} />}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button type="button" onClick={() => handleAddBlock('image')} style={{flex: 1, padding: '0.8rem', background: '#e1e5eb', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '600'}}>
                        <ImgIcon size={16}/> ?_진 추_?
                      </button>
                      <button type="button" onClick={() => handleAddBlock('text')} style={{flex: 1, padding: '0.8rem', background: '#e1e5eb', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '600'}}>
                        <Type size={16}/> 글 추_?
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="primary-btn" disabled={uploading} style={{marginTop: '1rem', fontSize: '1.2rem', padding: '1rem'}}>
                    {uploading ? '서버통신중..' : (editingProductId ? '수정 내용 저장' : '상품 등록')}
                  </button>
                </form>
              </div>

              {/* ?_른_? 미리보기 */}
              <div style={{flex: 1.5, minWidth: '280px', position: 'sticky', top: '100px'}}>
                <h3 style={{marginBottom: '1rem', color: '#666', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  [?_핑_?미리보기]
                </h3>
                
                <div style={{background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', pointerEvents: 'none'}}>
                  <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
                    {/* ?_네??미리보기 */}
                    <div style={{flex: 1, borderRadius: '12px', overflow: 'hidden', background: '#f1f2f6', aspectRatio: '1/1'}}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      ) : (
                        <div style={{display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#999'}}>메인 ?_진</div>
                      )}
                    </div>
                    {/* ?_보 미리보기 */}
                    <div style={{flex: 1}}>
                      <div style={{display: 'flex', gap: '0.5rem', marginBottom: '0.5rem'}}>
                        {formData.isBest && <span style={{padding: '0.2rem 0.5rem', background: 'var(--primary-color)', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '4px'}}>BEST</span>}
                        {formData.isNewProduct && <span style={{padding: '0.2rem 0.5rem', background: '#2ed573', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '4px'}}>NEW</span>}
                      </div>
                        <h3 style={{fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.2rem'}}>{formData.name || '상품명'}</h3>
                      <p style={{fontSize: '0.9rem', color: '#888', marginBottom: '1rem'}}>{formData.subtitle || '??_??_명'}</p>
                      
                      <div style={{display: 'flex', alignItems: 'baseline', gap: '0.5rem'}}>
                        <span style={{fontSize: '1.4rem', color: '#e74c3c', letterSpacing: '-0.5px', fontWeight: '900'}}>{formatPrice(formData.price)}원</span>
                        {formData.originalPrice && <span style={{fontSize: '1rem', color: '#999', textDecoration: 'line-through'}}>{formatPrice(formData.originalPrice)}원</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{marginTop: '2rem', borderTop: '2px solid #eee', paddingTop: '1rem'}}>
                    <h4 style={{marginBottom: '1rem', color: 'var(--primary-color)'}}>?_세?_이지 본문</h4>
                    <div style={{background: '#fafafa', padding: '1rem', borderRadius: '8px', minHeight: '200px'}}>
                      {detailBlocks.length === 0 ? (
                        <div style={{textAlign: 'center', color: '#aaa', marginTop: '3rem'}}>?_세 블록???_기???_시?_니??</div>
                      ) : (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                          {detailBlocks.map((block, idx) => (
                            <div key={idx}>
                              {block.type === 'text' && (
                                <p style={{whiteSpace: 'pre-wrap', color: '#444', lineHeight: '1.6'}}>{block.content || '(?_스??'}</p>
                              )}
                              {block.type === 'image' && block.preview && (
                                <img src={block.preview} alt="?_세미리보기" style={{width: '100%', borderRadius: '8px'}} />
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
        {/* ?_품 목록 ??(가로형 리스??+ ?_이_? */}
        {/* ========================================================================================= */}
        {activeTab === 'list' && (
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h2 style={{fontSize: '1.8rem', fontWeight: '800'}}>?_록???_품 목록 ({products.length}_?</h2>
              <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                {selectedProductIds.length > 0 && (
                  <button onClick={handleBulkDelete} style={{padding: '0.6rem 1.2rem', background: '#ff4757', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>
                    ?_택 ??__ ({selectedProductIds.length})
                  </button>
                )}
                <button className="primary-btn" onClick={() => {resetForm(); setActiveTab('register');}}>+ ???_품 ?_록</button>
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
                <label htmlFor="selectAll" style={{cursor: 'pointer', fontWeight: '600'}}>?_재 ?_이지 ?_체 ?_택</label>
              </div>
            )}
            
            {products.length === 0 ? (
              <div style={{textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '16px', color: '#888'}}>
                ?_록???_품???_습?_다.
              </div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {currentProducts.map(p => (
                  <div key={p._id || p.id} className="admin-list-item" style={{display: 'flex', alignItems: 'center', background: 'white', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.02)'}}>
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
                      {formatPrice(p.price)}??                    </div>

                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button 
                        onClick={() => handleEditClick(p)}
                        style={{padding: '0.6rem 1rem', background: '#f1f2f6', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600'}}
                      >
                        <Edit size={16} /> ?_정
                      </button>
                      <button 
                        onClick={() => handleDelete(p._id || p.id)}
                        style={{padding: '0.6rem 1rem', background: '#fff0f0', color: '#ff4757', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600'}}
                      >
                        <Trash2 size={16} /> ??__
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
              권장 ?__?지 ?_이_? 가_?1920px × ?_로 500px
            </div>
            
            <div style={{marginBottom: '2rem'}}>
              <button onClick={() => handleOpenBannerEditor('hero')} style={{padding: '0.8rem 1.5rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'}}>
                + ???_단 배너 추_?
              </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              {heroBanners.length === 0 ? (
                <p style={{color: '#888'}}>?_록???_단 배너가 ?_습?_다.</p>
              ) : heroBanners.map((banner, idx) => (
                <div key={banner.id} className="admin-banner-card" style={{border: '1px solid #ddd', borderRadius: '12px', padding: '1.5rem', background: '#fafafa', position: 'relative'}}>
                  <div className="admin-banner-item" style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
                    <span style={{fontWeight: '900', fontSize: '1.5rem', color: 'var(--primary-color)'}}>{idx + 1}</span>
                    <img src={banner.imageUrl} alt="banner" style={{width: '240px', height: '62px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc'}} />
                    <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', justifyContent: 'center'}}>
                      <strong style={{fontSize: '1.1rem'}}>{banner.title || '(문구 ?_음)'}</strong>
                      <span style={{color: '#888', fontSize: '0.9rem'}}>{banner.subtitle}</span>
                    </div>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button onClick={() => handleOpenBannerEditor('hero', banner)} style={{padding: '0.6rem 1rem', background: '#4bcffa', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>
                        ?_정
                      </button>
                      <button onClick={() => handleDeleteBanner(banner.id, 'hero')} style={{padding: '0.6rem 1rem', background: '#ff4757', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>
                        ??__
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
              권장 ?__?지 ?_이_? 가_?1200px × ?_로 300px (비율 4:1)
            </div>
            
            <div style={{marginBottom: '2rem'}}>
              <button onClick={() => handleOpenBannerEditor('rec')} style={{padding: '0.8rem 1.5rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'}}>
                + ??추천?_품 배너 추_?
              </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              {recBanners.length === 0 ? (
                <p style={{color: '#888'}}>?_록??추천?_품 배너가 ?_습?_다.</p>
              ) : recBanners.map((banner, idx) => (
                <div key={banner.id} className="admin-banner-card" style={{border: '1px solid #ddd', borderRadius: '12px', padding: '1.5rem', background: '#fafafa', position: 'relative'}}>
                  <div className="admin-banner-item" style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
                    <span style={{fontWeight: '900', fontSize: '1.5rem', color: 'var(--primary-color)'}}>{idx + 1}</span>
                    <img src={banner.imageUrl} alt="banner" style={{width: '240px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc'}} />
                    <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', justifyContent: 'center'}}>
                      <strong style={{fontSize: '1.1rem'}}>{banner.title || '(문구 ?_음)'}</strong>
                    </div>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button onClick={() => handleOpenBannerEditor('rec', banner)} style={{padding: '0.6rem 1rem', background: '#4bcffa', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>
                        ?_정
                      </button>
                      <button onClick={() => handleDeleteBanner(banner.id, 'rec')} style={{padding: '0.6rem 1rem', background: '#ff4757', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>
                        ??__
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
               공_??_항 관_?            </h2>
            <p>??기능?_ 추후 ?_데?_트 ???_정?_니??</p>
          </div>
        )}

        {activeTab === 'order' && (
          <div className="admin-orders-card" style={{background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}}>
            <h2 style={{fontSize: '1.8rem', fontWeight: '800', color: '#333', marginBottom: '1.5rem'}}>
              주문 관_?({allOrders.filter(o => ['주문완료', '상품준비중', '배송중'].includes(o.status)).length}건
            </h2>
            
            {/* ?_메??(?_브 ?? */}
            <div className="admin-order-tabs" style={{display: 'flex', gap: '0.5rem', flexWrap: 'nowrap', overflowX: 'auto', whiteSpace: 'nowrap', marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '1rem'}}>
              {['결제?_료', '?_품준비중', '배송_?, '배송?_료'].map(status => (
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
                  {status === '결제?_료' ? '1. 주문?_료' : status === '?_품준비중' ? '2. 배송처리' : status === '배송_? ? '3. 배송_? : '4. 배송?_료'}
                  {status !== '배송?_료' && (
                    <span style={{marginLeft: '0.5rem', background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.9rem'}}>
                      {allOrders.filter(o => o.status === status).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {orderSubTab === '배송?_료' && (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
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
                  기간 ??배송?_료: {filteredOrders.length}_?                </span>
              </div>
            )}

            <div style={{overflowX: 'auto'}}>
              <table className="admin-orders-table" style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px'}}>
                <thead>
                  <tr style={{background: '#f8f9fa', borderBottom: '2px solid #ddd'}}>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>주문?_시</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>주문번호/주문??/th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>?_품_?/th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>결제금액</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>
                      {orderSubTab === '?_품준비중' ? '?_장?_력' : orderSubTab === '배송_? || orderSubTab === '배송?_료' ? '?_장?_보' : '관_?}
                    </th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>?_태변_?/th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map(order => (
                    <tr key={order._id} style={{borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'background 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.background='#f9f9f9'} onMouseLeave={(e) => e.currentTarget.style.background='transparent'} onClick={() => setSelectedOrderDetails(order)}>
                      <td className="admin-order-date" style={{padding: '1rem', color: '#666'}}>
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td className="admin-order-user" style={{padding: '1rem'}}>
                        <div className="order-user-name" style={{fontWeight: 'bold', color: '#333'}}>{order.userId?.name || order.shippingInfo?.receiverName || '?????_음'}</div>
                        <div className="order-uid" style={{color: '#666', fontSize: '0.85rem'}}>{order.merchant_uid}</div>
                      </td>
                      <td className="admin-order-item" style={{padding: '1rem', color: '#333'}}>
                        <div className="order-item-cell" style={{display: 'flex', alignItems: 'center', gap: '0.8rem'}}>
                          {order.items.length > 0 && order.items[0].imageUrl ? (
                            <img src={order.items[0].imageUrl} alt="product" style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0}} />
                          ) : (
                            <div style={{width: '40px', height: '40px', background: '#eee', borderRadius: '6px', flexShrink: 0}}></div>
                          )}
                          <div>
                            {order.items.length > 0 ? (
                              order.items.length > 1 
                                ? `${order.items[0].name} ??${order.items.length - 1}_? 
                                : order.items[0].name
                            ) : '?_품 ?_음'}
                          </div>
                        </div>
                      </td>
                      <td className="admin-order-price" style={{padding: '1rem', fontWeight: 'bold', color: 'var(--primary-color)'}}>
                        {(order.totalAmount + order.shippingFee).toLocaleString()}??                      </td>
                      <td className="admin-order-tracking" style={{padding: '1rem'}} onClick={e => e.stopPropagation()}>
                        {orderSubTab === '?_품준비중' ? (
                          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                            <input 
                              type="text" 
                              placeholder="?_배??(?? CJ?_?_통??"
                              value={trackingInputs[order._id]?.courier || ''}
                              onChange={e => setTrackingInputs(prev => ({...prev, [order._id]: {...prev[order._id], courier: e.target.value}}))}
                              style={{padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.9rem'}}
                            />
                            <input 
                              type="text" 
                              placeholder="?_장번호 ?_력"
                              value={trackingInputs[order._id]?.trackingNumber || ''}
                              onChange={e => setTrackingInputs(prev => ({...prev, [order._id]: {...prev[order._id], trackingNumber: e.target.value}}))}
                              style={{padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.9rem'}}
                            />
                          </div>
                        ) : (orderSubTab === '배송_? || orderSubTab === '배송?_료') ? (
                          <div style={{fontSize: '0.95rem'}}>
                            <div style={{fontWeight: 'bold', color: '#555'}}>{order.courier || '?_배??미상'}</div>
                            <div style={{color: '#888'}}>{order.trackingNumber || '?_장번호 ?_음'}</div>
                          </div>
                        ) : (
                          <span style={{color: '#aaa'}}>-</span>
                        )}
                      </td>
                      <td className="admin-order-action" style={{padding: '1rem'}} onClick={e => e.stopPropagation()}>
                        {orderSubTab === '결제?_료' && (
                          <button onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await updateOrderStatus(order._id, { status: '?_품준비중' });
                              loadAllOrders();
                            } catch (err) { alert('변_??_패'); }
                          }} style={{padding: '0.6rem 1rem', background: '#34495e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit'}}>
                            배송처리(준비중)_??_동
                          </button>
                        )}
                        {orderSubTab === '?_품준비중' && (
                          <button onClick={async (e) => {
                            e.stopPropagation();
                            const trackingInfo = trackingInputs[order._id];
                            if (!trackingInfo?.courier || !trackingInfo?.trackingNumber) {
                              if (!window.confirm('?_배?_나 ?_장번호가 ?_력?__? ?_았?_니?? 그래??배송중으_??_동?_시겠습?_까?')) return;
                            }
                            try {
                              await updateOrderStatus(order._id, { 
                                status: '배송_?, 
                                courier: trackingInfo?.courier || '',
                                trackingNumber: trackingInfo?.trackingNumber || ''
                              });
                              loadAllOrders();
                            } catch (err) { alert('변_??_패'); }
                          }} style={{padding: '0.6rem 1rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit'}}>
                            ?_장?_력 ??배송_??_동
                          </button>
                        )}
                        {orderSubTab === '배송_? && (
                          <button onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await updateOrderStatus(order._id, { status: '배송?_료' });
                              loadAllOrders();
                            } catch (err) { alert('변_??_패'); }
                          }} style={{padding: '0.6rem 1rem', background: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit'}}>
                            배송?_료 처리
                          </button>
                        )}
                        {orderSubTab === '배송?_료' && (
                          <span style={{color: '#27ae60', fontWeight: 'bold'}}>배송?_료 ??/span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {currentOrders.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{padding: '3rem', textAlign: 'center', color: '#999', fontSize: '1.1rem'}}>
                        주문 ?_역???_습?_다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 주문 ?_이_?*/}
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

        
        {activeTab === 'claims' && (
          <div className="admin-orders-card" style={{background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}}>
            <h2 style={{fontSize: '1.8rem', fontWeight: '800', color: '#333', marginBottom: '1.5rem'}}>
              취소반품교환관리
            </h2>
            <div className="admin-order-tabs" style={{display: 'flex', gap: '0.5rem', flexWrap: 'nowrap', overflowX: 'auto', whiteSpace: 'nowrap', marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '1rem'}}>
              {['취소관리', '반품관리', '교환관리'].map(status => (
                <button
                  key={status}
                  onClick={() => {
                    setClaimsSubTab(status);
                    setCurrentOrdersPage(1);
                  }}
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: claimsSubTab === status ? 'var(--primary-color)' : '#f1f2f6',
                    color: claimsSubTab === status ? 'white' : '#555',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: claimsSubTab === status ? 'bold' : 'normal',
                    fontSize: '1.1rem'
                  }}>
                  {status}
                </button>
              ))}
            </div>
            
            <div style={{overflowX: 'auto'}}>
              <table className="admin-orders-table" style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px'}}>
                <thead>
                  <tr style={{background: '#f8f9fa', borderBottom: '2px solid #ddd'}}>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>신청일시</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>주문번호/주문자</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>상품명</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>결제금액</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>상태</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {allOrders.filter(o => {
                    if (claimsSubTab === '취소관리') return o.status.includes('취소');
                    if (claimsSubTab === '반품관리') return o.status.includes('반품');
                    if (claimsSubTab === '교환관리') return o.status.includes('교환');
                    return false;
                  }).length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{padding: '3rem', textAlign: 'center', color: '#999', fontSize: '1.1rem'}}>
                        해당 내역이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    allOrders.filter(o => {
                      if (claimsSubTab === '취소관리') return o.status.includes('취소');
                      if (claimsSubTab === '반품관리') return o.status.includes('반품');
                      if (claimsSubTab === '교환관리') return o.status.includes('교환');
                      return false;
                    }).map(order => (
                      <tr key={order._id} style={{borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'background 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.background='#f9f9f9'} onMouseLeave={(e) => e.currentTarget.style.background='transparent'} onClick={() => setSelectedOrderDetails(order)}>
                        <td className="admin-order-date" style={{padding: '1rem', color: '#666'}}>
                          {new Date(order.updatedAt || order.createdAt).toLocaleString()}
                        </td>
                        <td className="admin-order-user" style={{padding: '1rem'}}>
                          <div className="order-user-name" style={{fontWeight: 'bold', color: '#333'}}>{order.userId?.name || order.shippingInfo?.receiverName || '알 수 없음'}</div>
                          <div className="order-uid" style={{color: '#666', fontSize: '0.85rem'}}>{order.merchant_uid}</div>
                        </td>
                        <td className="admin-order-item" style={{padding: '1rem', color: '#333'}}>
                          <div className="order-item-cell" style={{display: 'flex', alignItems: 'center', gap: '0.8rem'}}>
                            {order.items.length > 0 && order.items[0].imageUrl ? (
                              <img src={order.items[0].imageUrl} alt="product" style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0}} />
                            ) : (
                              <div style={{width: '40px', height: '40px', background: '#eee', borderRadius: '6px', flexShrink: 0}}></div>
                            )}
                            <div>
                              {order.items.length > 0 ? (
                                order.items.length > 1 
                                  ? `${order.items[0].name} 외 ${order.items.length - 1}건`
                                  : order.items[0].name
                              ) : '상품 없음'}
                            </div>
                          </div>
                        </td>
                        <td className="admin-order-price" style={{padding: '1rem', fontWeight: 'bold', color: 'var(--primary-color)'}}>
                          {(order.totalAmount + order.shippingFee).toLocaleString()}원
                        </td>
                        <td className="admin-order-tracking" style={{padding: '1rem'}}>
                          <div style={{color: '#e74c3c', fontWeight: 'bold'}}>{order.status}</div>
                        </td>
                        <td className="admin-order-action" style={{padding: '1rem'}} onClick={e => e.stopPropagation()}>
                          <button onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const nextStatus = order.status.replace('요청', '완료');
                              if(nextStatus === order.status) {
                                alert('이미 처리되었습니다.');
                                return;
                              }
                              await updateOrderStatus(order._id, { status: nextStatus });
                              loadAllOrders();
                            } catch (err) { alert('처리 실패'); }
                          }} style={{padding: '0.6rem 1rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit'}}>
                            {order.status.includes('요청') ? '처리 완료하기' : '처리 완료됨'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'member' && (
          <div style={{background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}}>
            <h2 style={{fontSize: '1.8rem', fontWeight: '800', color: '#333', marginBottom: '2rem'}}>?_원 관_?({users.length}_?</h2>
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px'}}>
                <thead>
                  <tr style={{background: '#f8f9fa', borderBottom: '2px solid #ddd'}}>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>?_름</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>?_이???_셜)</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>?_메??/th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>?_화번호</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>마_??_수?_동??/th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>가?_일</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{padding: '3rem', textAlign: 'center', color: '#777'}}>가?_한 ?_원???_습?_다.</td>
                    </tr>
                  ) : (
                    currentUsers.map(u => (
                      <tr key={u._id} onClick={() => handleUserClick(u)} style={{borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'background 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.background='#f9f9f9'} onMouseLeave={(e) => e.currentTarget.style.background='transparent'}>

                        <td style={{padding: '1rem'}}>{u.name} {u.role === 'admin' ? '(관리자)' : ''}</td>
                        <td style={{padding: '1rem'}}>{u.provider !== 'local' ? `${u.provider.toUpperCase()} 로그?? : u.loginId}</td>
                        <td style={{padding: '1rem'}}>{u.email}</td>
                        <td style={{padding: '1rem'}}>{u.phone || '-'}</td>
                        <td style={{padding: '1rem'}}>
                          {u.agreements?.sns ? (
                            <span style={{background: '#e8f5e9', color: '#2e7d32', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem'}}>?_의</span>
                          ) : (
                            <span style={{background: '#ffebee', color: '#c62828', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem'}}>미동??/span>
                          )}
                        </td>
                        <td style={{padding: '1rem'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ?_원관_??_이_?*/}
            {totalUsersPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', gap: '0.5rem' }}>
                <button 
                  onClick={() => handleUsersPageChange(Math.max(1, currentUsersPage - 1))}
                  disabled={currentUsersPage === 1}
                  style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', background: currentUsersPage === 1 ? '#f8f9fa' : 'white', cursor: currentUsersPage === 1 ? 'not-allowed' : 'pointer', borderRadius: '8px' }}
                >
                  ?_전
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
                  ?_음
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>

    {/* ?_디??모달 */}
    {editingBanner && (
      <div className="modal-overlay" onClick={handleCloseBannerEditor}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={handleCloseBannerEditor}>&times;</button>
          <h2 style={{fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem', color: '#333'}}>
            {editorType === 'hero' ? '?_단 배너 ?_디?? : '추천?_품 배너 ?_디??}
          </h2>
          
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'inline-block', padding: '0.8rem 1.5rem', background: 'var(--primary-color)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>
                    {uploading ? '서버통신중..' : (editingProductId ? '수정 내용 저장' : '상품 등록')}
              <input type="file" accept="image/*" style={{display: 'none'}} disabled={uploading} onChange={handleModalImageUpload} />
            </label>
          </div>

          <div className="modal-preview-box">
            {editorType === 'hero' ? (
              <div className="hero-slide" style={{ width: '100%', height: '300px', position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                <img src={editingBanner.imageUrl || 'https://via.placeholder.com/1920x500?text=배너?__?지'} alt="미리보기" className="hero-slide-bg" style={{width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0}} />
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
                      title="?_래그하???_치 변_?
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
                  src={editingBanner.imageUrl || 'https://via.placeholder.com/1200x300?text=배너?__?지'} 
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
                    title="?_래그하???_치 변_?
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
            {/* ?_결???_품 ?_정 */}
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem', background: '#fafafa', padding: '1rem', borderRadius: '8px', border: '1px solid #eee'}}>
              <div style={{flex: '1 1 100%'}}><strong style={{color: '#555'}}>?_결???_품 (배너 ?_릭 ???_당 ?_품 ?_이지_??_동)</strong></div>
              <select value={editingBanner.linkProductId || ''} onChange={(e) => setEditingBanner({...editingBanner, linkProductId: e.target.value})} style={{width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer'}}>
                <option value="">-- ?_결 ????(?_릭 ?_과 ?_음) --</option>
                {products.map(p => (
                  <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* 메인 문구 ?_정 */}
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem', background: '#fafafa', padding: '1rem', borderRadius: '8px', border: '1px solid #eee'}}>
              <div style={{flex: '1 1 100%'}}><strong style={{color: '#555'}}>{editorType === 'hero' ? '메인 문구' : '배너 문구'}</strong></div>
              <input type="text" placeholder="문구 ?_력" value={editingBanner.title} onChange={(e) => setEditingBanner({...editingBanner, title: e.target.value})} style={{flex: '3', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px'}} />
              <input type="number" placeholder="?_기(?_자)" value={editingBanner.titleSize} onChange={(e) => setEditingBanner({...editingBanner, titleSize: e.target.value})} style={{flex: '1', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px'}} title="글???_기(px)" />
              <input type="color" value={editingBanner.titleColor} onChange={(e) => setEditingBanner({...editingBanner, titleColor: e.target.value})} style={{width: '50px', height: '40px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer'}} title="글???_상" />
              <select value={editingBanner.titleFontFamily} onChange={(e) => setEditingBanner({...editingBanner, titleFontFamily: e.target.value})} style={{flex: '2', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px'}}>
                <option value="'Noto Sans KR', sans-serif">고딕 (Noto Sans)</option>
                <option value="'Noto Serif KR', serif">명조 (Noto Serif)</option>
                <option value="'Nanum Gothic', sans-serif">?_눔고딕</option>
                <option value="'Nanum Myeongjo', serif">?_눔명조</option>
                <option value="'Black Han Sans', sans-serif">검?_고딕 (?_꺼?_)</option>
                <option value="'Jua', sans-serif">주아_?(?__??__?)</option>
                <option value="'Do Hyeon', sans-serif">?_현_?(각진?_목)</option>
                <option value="'Gowun Dodum', sans-serif">고운?__?</option>
                <option value="'Gowun Batang', serif">고운바탕</option>
                <option value="'Dongle', sans-serif">?__? (매우귀?__?)</option>
                <option value="'Nanum Pen Script', cursive">?_눔?__???/option>
              </select>
            </div>

            {/* ?_브 문구 ?_정 (?_단 배너 ?_용) */}
            {editorType === 'hero' && (
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem', background: '#fafafa', padding: '1rem', borderRadius: '8px', border: '1px solid #eee'}}>
                <div style={{flex: '1 1 100%'}}><strong style={{color: '#555'}}>?_브 문구</strong></div>
                <input type="text" placeholder="?_브 문구 ?_력" value={editingBanner.subtitle} onChange={(e) => setEditingBanner({...editingBanner, subtitle: e.target.value})} style={{flex: '3', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px'}} />
                <input type="number" placeholder="?_기(?_자)" value={editingBanner.subtitleSize} onChange={(e) => setEditingBanner({...editingBanner, subtitleSize: e.target.value})} style={{flex: '1', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px'}} title="글???_기(px)" />
                <input type="color" value={editingBanner.subtitleColor} onChange={(e) => setEditingBanner({...editingBanner, subtitleColor: e.target.value})} style={{width: '50px', height: '40px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer'}} title="글???_상" />
                <select value={editingBanner.subtitleFontFamily} onChange={(e) => setEditingBanner({...editingBanner, subtitleFontFamily: e.target.value})} style={{flex: '2', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px'}}>
                  <option value="'Noto Sans KR', sans-serif">고딕 (Noto Sans)</option>
                  <option value="'Noto Serif KR', serif">명조 (Noto Serif)</option>
                  <option value="'Nanum Gothic', sans-serif">?_눔고딕</option>
                  <option value="'Nanum Myeongjo', serif">?_눔명조</option>
                  <option value="'Black Han Sans', sans-serif">검?_고딕 (?_꺼?_)</option>
                  <option value="'Jua', sans-serif">주아_?(?__??__?)</option>
                  <option value="'Do Hyeon', sans-serif">?_현_?(각진?_목)</option>
                  <option value="'Gowun Dodum', sans-serif">고운?__?</option>
                  <option value="'Gowun Batang', serif">고운바탕</option>
                  <option value="'Dongle', sans-serif">?__? (매우귀?__?)</option>
                  <option value="'Nanum Pen Script', cursive">?_눔?__???/option>
                </select>
              </div>
            )}
          </div>

          <div style={{marginTop: '2rem', textAlign: 'center'}}>
            <button onClick={handleSaveBannerEditor} style={{padding: '1rem 4rem', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold'}}>
              ?_?_하_?            </button>
          </div>
        </div>
      </div>
    )}
      {selectedUserForOrders && (
      <div className="modal-overlay" onClick={() => setSelectedUserForOrders(null)}>
        <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto'}}>
          <button className="modal-close-btn" onClick={() => setSelectedUserForOrders(null)}>&times;</button>
          <h2 style={{fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', color: '#333'}}>
            {selectedUserForOrders.name} ?_의 주문 ?_역
          </h2>
          {selectedUserOrders.length === 0 ? (
            <p style={{textAlign: 'center', padding: '2rem', color: '#666'}}>주문 ?_역???_습?_다.</p>
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
                        {item.selectedOptionName && <div style={{fontSize: '0.85rem', color: '#666'}}>?_션: {item.selectedOptionName}</div>}
                        <div style={{fontSize: '0.9rem'}}>{item.price.toLocaleString()}??x {item.quantity}_?/div>
                      </div>
                    </div>
                  ))}
                  <div style={{marginTop: '1.5rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-color)'}}>
                    _?결제금액: {order.totalAmount.toLocaleString()}??                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}

      {/* 주문 ?_세(배송지 ?_보) 모달 */}
      {selectedOrderDetails && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}} onClick={() => setSelectedOrderDetails(null)}>
          <div style={{background: 'white', borderRadius: '16px', padding: '2.5rem', width: '90%', maxWidth: '650px', maxHeight: '85vh', overflowY: 'auto', fontFamily: '"Jua", "Pretendard", sans-serif'}} onClick={e => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
              <h2 style={{fontSize: '1.6rem', fontWeight: 'bold'}}>주문 ?_세 ?_역</h2>
              <button onClick={() => setSelectedOrderDetails(null)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><X size={28} /></button>
            </div>
            
            {/* ?_품 ?_보 ?_역 */}
            <div style={{marginBottom: '2rem'}}>
              <h3 style={{fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)', borderBottom: '2px solid #eee', paddingBottom: '0.8rem', marginBottom: '1.5rem'}}>주문 ?_품 ?_보</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {selectedOrderDetails.items.map((item, idx) => (
                  <div key={idx} style={{display: 'flex', alignItems: 'center', gap: '1.2rem', background: '#f8f9fa', padding: '1.2rem', borderRadius: '8px'}}>
                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px'}} />}
                    <div style={{flex: 1}}>
                      <div style={{fontWeight: 'bold', fontSize: '1.2rem', color: '#333'}}>{item.name}</div>
                      {item.selectedOptionName && <div style={{fontSize: '1rem', color: '#666', marginTop: '0.3rem'}}>?_션: {item.selectedOptionName}</div>}
                      <div style={{fontSize: '1.1rem', color: '#444', marginTop: '0.3rem'}}>{item.price.toLocaleString()}??x <strong style={{color: 'var(--primary-color)'}}>{item.quantity}_?/strong></div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{marginTop: '1.5rem', textAlign: 'right', fontSize: '1.4rem', fontWeight: 'bold'}}>
                _?결제금액: <span style={{color: 'var(--primary-color)'}}>{selectedOrderDetails.totalAmount.toLocaleString()}??/span>
              </div>
            </div>

            {/* 배송지 ?_보 ?_역 */}
            <div>
              <h3 style={{fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)', borderBottom: '2px solid #eee', paddingBottom: '0.8rem', marginBottom: '1.5rem'}}>배송지 ?_보</h3>
              <div style={{padding: '1.8rem', background: '#f8f9fa', borderRadius: '8px', fontSize: '1.1rem'}}>
                <p style={{marginBottom: '1rem', display: 'flex', justifyContent: 'space-between'}}>
                  <strong style={{color: '#555', minWidth: '100px'}}>?_령??/strong> 
                  <span style={{textAlign: 'right'}}>{selectedOrderDetails.shippingInfo?.receiverName || '?_보 ?_음'}</span>
                </p>
                <p style={{marginBottom: '1rem', display: 'flex', justifyContent: 'space-between'}}>
                  <strong style={{color: '#555', minWidth: '100px'}}>?_락_?/strong> 
                  <span style={{textAlign: 'right'}}>{selectedOrderDetails.shippingInfo?.receiverPhone || '?_보 ?_음'}</span>
                </p>
                <p style={{marginBottom: '1rem', display: 'flex', justifyContent: 'space-between'}}>
                  <strong style={{color: '#555', minWidth: '100px'}}>?_편번호</strong> 
                  <span style={{textAlign: 'right'}}>{selectedOrderDetails.shippingInfo?.zonecode || '?_보 ?_음'}</span>
                </p>
                <div style={{marginBottom: '1rem'}}>
                  <strong style={{color: '#555', display: 'block', marginBottom: '0.5rem'}}>주소</strong> 
                  <div style={{background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #ddd', lineHeight: '1.5'}}>
                    {selectedOrderDetails.shippingInfo?.address || '?_보 ?_음'}<br/>
                    {selectedOrderDetails.shippingInfo?.detailAddress || ''}
                  </div>
                </div>
                <div style={{marginBottom: '1rem'}}>
                  <strong style={{color: '#555', display: 'block', marginBottom: '0.5rem'}}>?__? 출입비_?번호</strong> 
                  <div style={{background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #ddd', color: 'var(--primary-color)', fontWeight: 'bold'}}>
                    {selectedOrderDetails.shippingInfo?.doorPassword || '?_음'}
                  </div>
                </div>
                <div style={{marginBottom: '1rem'}}>
                  <strong style={{color: '#555', display: 'block', marginBottom: '0.5rem'}}>배송 메모</strong> 
                  <div style={{background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #ddd', minHeight: '60px'}}>
                    {selectedOrderDetails.shippingInfo?.memo || '?_음'}
                  </div>
                </div>
                <div>
                  <strong style={{color: '#555', display: 'block', marginBottom: '0.5rem'}}>기_? 메모</strong> 
                  <div style={{background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #ddd', minHeight: '60px'}}>
                    {selectedOrderDetails.shippingInfo?.extraMemo || '?_음'}
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => setSelectedOrderDetails(null)} style={{width: '100%', padding: '1rem', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', fontFamily: 'inherit', marginTop: '2rem'}}>
              ?_기
            </button>
          </div>
        </div>
      )}
  </>
  );
}

export default Admin;
