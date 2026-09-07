import React, { useState, useEffect } from 'react';
import { fetchProducts, createProduct, updateProduct, deleteProduct, uploadImage, uploadSlicedImage, fetchConfig, updateConfig, fetchUsers, fetchAllOrders, updateOrderStatus, getReviewsByProduct, deleteReview } from '../api';
import { LayoutDashboard, PackagePlus, List, Image as ImageIcon, Bell, Edit, Trash2, ChevronLeft, ChevronRight, Plus, X, Image as ImgIcon, Type, ShoppingCart, Menu, RefreshCcw } from 'lucide-react';

function Admin({ refreshGlobalProducts }) {
  const [activeTab, setActiveTab] = useState('register');
  const [selectedProductForReviews, setSelectedProductForReviews] = useState(null);
  const [productReviews, setProductReviews] = useState([]);

  const openReviewManager = async (product) => {
    setSelectedProductForReviews(product);
    try {
      const res = await getReviewsByProduct(product._id || product.id);
      setProductReviews(res.data || []);
    } catch (e) {
      alert('ë¦¬ë·° ë¡œë“œ ?¤íŒ¨');
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (window.confirm('?•ë§ ??ë¦¬ë·°ë¥??? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?')) {
      try {
        await deleteReview(reviewId);
        setProductReviews(productReviews.filter(r => r._id !== reviewId));
        alert('?? œ?˜ì—ˆ?µë‹ˆ??');
      } catch (e) {
        alert('?? œ ?¤íŒ¨');
      }
    }
  };

  const handleFeaturePhoto = async (photoUrl) => {
    if (!selectedProductForReviews) return;
    try {
      const currentFeatured = selectedProductForReviews.featuredPhotos || [];
      if (currentFeatured.includes(photoUrl)) {
        if (window.confirm('?´ë? ? ì •???¬ì§„?…ë‹ˆ?? ? ì •???´ì œ?˜ì‹œê² ìŠµ?ˆê¹Œ?')) {
          const updatedProductData = {
            ...selectedProductForReviews,
            featuredPhotos: currentFeatured.filter(url => url !== photoUrl)
          };
          await updateProduct(selectedProductForReviews._id || selectedProductForReviews.id, updatedProductData);
          setSelectedProductForReviews(updatedProductData);
          alert('?¬í† ë¦¬ë·° ? ì •???´ì œ?˜ì—ˆ?µë‹ˆ??');
          loadProducts();
          if (typeof refreshGlobalProducts === 'function') refreshGlobalProducts();
        }
        return;
      }
      const updatedProductData = {
        ...selectedProductForReviews,
        featuredPhotos: [...currentFeatured, photoUrl]
      };
      await updateProduct(selectedProductForReviews._id || selectedProductForReviews.id, updatedProductData);
      setSelectedProductForReviews(updatedProductData);
      alert('?¬í† ë¦¬ë·°ë¡?? ì •?˜ì—ˆ?µë‹ˆ??');
      loadProducts();
      if (typeof refreshGlobalProducts === 'function') refreshGlobalProducts();
    } catch (e) {
      alert('?¬í† ë¦¬ë·° ? ì • ?¤íŒ¨');
    }
  }; // register, list, banner, rec_banner, notice, order, claims, member
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // ?˜ì´ì§?(ëª©ë¡)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [productSearchKeyword, setProductSearchKeyword] = useState('');
  
  const [currentUsersPage, setCurrentUsersPage] = useState(1);
  const usersPerPage = 10;
  
  // ?˜ì • ëª¨ë“œ ?íƒœ
  const [editingProductId, setEditingProductId] = useState(null);
  
  // ? íƒ???í’ˆ ?íƒœ (?¼ê´„ ?? œ??
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  
  // ê´€ë¦¬ì ?Œì› ì£¼ë¬¸ ?´ì—­ ëª¨ë‹¬ ?íƒœ
  const [selectedUserForOrders, setSelectedUserForOrders] = useState(null);
  const [selectedUserOrders, setSelectedUserOrders] = useState([]);
  const [userOrderStartDate, setUserOrderStartDate] = useState('');
  const [userOrderEndDate, setUserOrderEndDate] = useState('');
  const [chargePointsAmount, setChargePointsAmount] = useState('');
  
  // ì£¼ë¬¸ ê´€ë¦??˜ì´ì§€?¤ì´??ë°??ì„¸ ëª¨ë‹¬ ?íƒœ
  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);
  const ordersPerPage = 10;
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  
  // ì£¼ë¬¸ ?œë¸Œ???íƒœ
  const [orderSubTab, setOrderSubTab] = useState('ê²°ì œ?„ë£Œ');
  const [claimsSubTab, setClaimsSubTab] = useState('ì·¨ì†Œê´€ë¦?);
  const [trackingInputs, setTrackingInputs] = useState({});
  const defaultEndDate = new Date().toISOString().split('T')[0];
  const defaultStartDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [orderStartDate, setOrderStartDate] = useState(defaultStartDate);
  const [orderEndDate, setOrderEndDate] = useState(defaultEndDate);

  // ê¸°ë³¸ ??
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

  // ???íƒœ
  const [formData, setFormData] = useState(initialFormData);
  
  // ë©”ì¸ ?¸ë„¤???íƒœ
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // êµ¬ë²„???ì„¸ ?´ë?ì§€ (?˜ìœ„ ?¸í™˜)
  const [detailImagePreview, setDetailImagePreview] = useState(null);
  const [detailImageFile, setDetailImageFile] = useState(null);

  // êµ¬ë§¤ ?ˆë‚´ ?´ë?ì§€
  const [purchaseImagePreview, setPurchaseImagePreview] = useState(null);
  const [purchaseImageFile, setPurchaseImageFile] = useState(null);

  // ?œë¸Œ ?´ë?ì§€ (ìµœë? 5ê°?
  const [subImageFiles, setSubImageFiles] = useState([null, null, null, null, null]);
  const [subImagePreviews, setSubImagePreviews] = useState([null, null, null, null, null]);

  // ?¤ì¤‘ ë¸”ë¡ (?¬ì§„/ê¸€) ?íƒœ
  const [detailBlocks, setDetailBlocks] = useState([]); 
  // êµ¬ì¡°: { type: 'text' | 'image', content: '...', file?: File, preview?: string }
  
  const [options, setOptions] = useState([]);
  const [uploading, setUploading] = useState(false);

  // ë°°ë„ˆ ê´€ë¦??íƒœ
  const [heroBanners, setHeroBanners] = useState([]);
  const [recBanners, setRecBanners] = useState([]);
  
  // ?ë””??ëª¨ë‹¬ ?íƒœ
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
      alert('ì£¼ë¬¸ ?´ì—­??ë¶ˆëŸ¬?¤ëŠ”???¤íŒ¨?ˆìŠµ?ˆë‹¤.');
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
  // ?„ë¡ ?¸ì—”???´ë?ì§€ ?•ì¶• ?”ì§„ (WebP ë³€?? ìµœë? 1200px)
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
            resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpeg", {
              type: 'image/jpeg',
              lastModified: Date.now()
            }));
          }, 'image/jpeg', 0.8);
        };
        img.onerror = () => resolve(file);
      };
    });
  };

  // ê³µí†µ ?´ë?ì§€ ?…ë¡œ???¸ë“¤??
  const handleImageUpload = async (file) => {
    try {
      setUploading(true);
      const compressedFile = await compressImage(file);
      const res = await uploadImage(compressedFile);
      return res.imageUrl;
    } catch (error) {
      console.error(error);
      alert("?…ë¡œ???ì„¸ ?ëŸ¬ ?•ë³´:\n" + error.message);
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
      // handled in handleImageUpload
    } finally {
      e.target.value = '';
    }
  };

  const handleSaveBannerEditor = async () => {
    if (!editingBanner.imageUrl) {
      alert("ë°°ë„ˆ ?´ë?ì§€ë¥??…ë¡œ?œí•´ì£¼ì„¸??");
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
      alert('ë°°ë„ˆê°€ ?€?¥ë˜?ˆìŠµ?ˆë‹¤.');
    } catch(err) {
      alert("?€???¤íŒ¨: " + err.message);
    }
  };

  const handleDeleteBanner = async (id, type) => {
    if(!window.confirm("??ë°°ë„ˆë¥??? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?")) return;
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
      alert("ë°°ë„ˆ ?? œ ?¤íŒ¨");
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

  // ?ì„¸ ë¸”ë¡ ì¶”ê?
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

  // ?˜ì • ë²„íŠ¼ ?´ë¦­ ???°ì´??ë¡œë“œ
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
    
    // ?¸í™˜??ê¸°ì¡´ ?¨ì¼ ?´ë?ì§€
    setDetailImageFile(null);
    setDetailImagePreview(product.detailImageUrl || null);
    
    // êµ¬ë§¤ ?ˆë‚´ ?´ë?ì§€
    setPurchaseImageFile(null);
    setPurchaseImagePreview(product.purchaseInfoImageUrl || null);
    
    // ?œë¸Œ ?´ë?ì§€
    const previews = [null, null, null, null, null];
    if (product.subImageUrls && product.subImageUrls.length > 0) {
      product.subImageUrls.forEach((url, i) => {
        if(i < 5) previews[i] = url;
      });
    }
    setSubImageFiles([null, null, null, null, null]);
    setSubImagePreviews(previews);

    // ë¸”ë¡ ?°ì´??
    if (product.detailBlocks && product.detailBlocks.length > 0) {
      setDetailBlocks(product.detailBlocks.map(b => ({
        type: b.type,
        content: b.content,
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
      alert("ë©”ì¸ ?¸ë„¤???´ë?ì§€ë¥??±ë¡?´ì£¼?¸ìš”.");
      return;
    }

    try {
      setUploading(true);
      
      let imageUrl = imagePreview; // ?˜ì •ëª¨ë“œ?ì„œ ë³€ê²½ì•ˆ?ˆìœ¼ë©?ê¸°ì¡´ URL ? ì?
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      // ë¸”ë¡ ?´ë?ì§€ ?…ë¡œ???œì°¨ ì²˜ë¦¬
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

      // ?˜ìœ„ ?¸í™˜ ?¨ì¼ ?”í…Œ???´ë?ì§€ ì²˜ë¦¬
      let oldDetailImageUrl = detailImagePreview;
      if (detailImageFile) {
         try {
           const slicedUrls = await uploadSlicedImage(detailImageFile);
           slicedUrls.forEach(url => {
             processedBlocks.push({ type: 'image', content: url });
           });
           oldDetailImageUrl = ''; // Clear it out so it doesn't render as a single compressed image
           setDetailImagePreview(null);
           setDetailImageFile(null);
         } catch (e) {
           console.error("Auto slice failed, falling back to normal upload", e);
           oldDetailImageUrl = await handleImageUpload(detailImageFile);
         }
      }

      // êµ¬ë§¤ ?ˆë‚´ ?´ë?ì§€ ì²˜ë¦¬
      let oldPurchaseImageUrl = purchaseImagePreview;
      if (purchaseImageFile) {
         oldPurchaseImageUrl = await handleImageUpload(purchaseImageFile);
      }

      // ?œë¸Œ ?´ë?ì§€ ?œì°¨ ì²˜ë¦¬
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
        alert("?í’ˆ???±ê³µ?ìœ¼ë¡??˜ì •?˜ì—ˆ?µë‹ˆ??");
      } else {
        await createProduct(productPayload);
        alert("?í’ˆ???±ê³µ?ìœ¼ë¡??±ë¡?˜ì—ˆ?µë‹ˆ??");
      }
      
      if (refreshGlobalProducts) refreshGlobalProducts();
      loadProducts();
      resetForm();
      setActiveTab('list');
      
    } catch (error) {
      console.error(error);
      alert("ì²˜ë¦¬ ?¤íŒ¨: " + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("?•ë§ ???í’ˆ???? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?")) {
      try {
        setProducts(prev => prev.filter(p => (p._id || p.id) !== id));
        await deleteProduct(id);
        alert("?? œ?˜ì—ˆ?µë‹ˆ??");
        loadProducts();
        if (refreshGlobalProducts) refreshGlobalProducts();
      } catch (error) {
        alert("?? œ ?¤íŒ¨");
        loadProducts();
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return alert("?? œ???í’ˆ??? íƒ?´ì£¼?¸ìš”.");
    if (window.confirm(`? íƒ??${selectedProductIds.length}ê°œì˜ ?í’ˆ???•ë§ë¡??? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?`)) {
      try {
        setProducts(prev => prev.filter(p => !selectedProductIds.includes(p._id || p.id)));
        await Promise.all(selectedProductIds.map(id => deleteProduct(id)));
        alert("? íƒ???í’ˆ???? œ?˜ì—ˆ?µë‹ˆ??");
        setSelectedProductIds([]);
        loadProducts();
        if (refreshGlobalProducts) refreshGlobalProducts();
      } catch (error) {
        alert("?¼ë? ?í’ˆ ?? œ???¤íŒ¨?ˆìŠµ?ˆë‹¤.");
        loadProducts();
      }
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    return Number(price).toLocaleString('ko-KR');
  };

  // Pagination Logic (Products)
  const filteredProducts = products.filter(p => !productSearchKeyword || p.name.includes(productSearchKeyword) || p.category.includes(productSearchKeyword));
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    if (orderSubTab === 'ë°°ì†¡?„ë£Œ') {
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

        @media (max-width: 768px) {
          .admin-list-item {
            flex-wrap: nowrap !important;
            padding: 0.6rem 0.4rem !important;
            gap: 0.3rem !important;
          }
          .admin-list-item > input[type="checkbox"] {
            margin-right: 0 !important;
            width: 16px !important;
            height: 16px !important;
          }
          .admin-list-item > img {
            width: 40px !important;
            height: 40px !important;
            margin-right: 0 !important;
            margin-bottom: 0 !important;
            border-radius: 4px !important;
          }
          .admin-list-info {
            flex: 1 1 0% !important;
            min-width: 0 !important; /* CRITICAL for text-overflow to work in flex */
            text-align: left !important;
            margin-bottom: 0 !important;
            overflow: hidden;
          }
          .admin-list-info > div:first-child {
            display: none !important; /* Hide category/best labels to save space */
          }
          .admin-list-info h4 {
            font-size: 0.7rem !important;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .admin-list-price {
            width: auto !important;
            flex: 0 0 auto !important;
            flex-shrink: 0 !important;
            font-size: 0.7rem !important; /* Make font size even smaller */
            text-align: right !important;
            margin-right: 0 !important;
            margin-top: 0 !important;
            padding-left: 0 !important;
            white-space: nowrap !important; /* Prevent vertical wrapping! */
          }
          .admin-list-actions {
            width: auto !important;
            flex-shrink: 0 !important;
            margin-top: 0 !important;
            justify-content: flex-end !important;
            gap: 0.3rem !important;
          }
          .admin-list-actions button {
            flex: 0 0 auto !important;
            padding: 0.4rem !important;
            font-size: 0 !important; /* Hide text, only show icon */
          }
          .admin-list-actions button svg {
            width: 14px;
            height: 14px;
          }
          .admin-list-actions button .action-text {
            display: none !important;
          }

          .admin-order-tabs {
            flex-wrap: nowrap !important;
            gap: 0.3rem !important;
            padding-bottom: 0.5rem !important;
            justify-content: space-between;
          }
          .admin-order-tabs button {
            flex: 1 1 0%;
            padding: 0.5rem 0.2rem !important;
            font-size: 0.75rem !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            min-width: 0 !important;
          }
        

          .member-table {
            min-width: 0 !important;
          }
          .hide-on-mobile {
            display: none !important;
          }
          .member-table th, .member-table td {
            padding: 0.5rem !important;
            font-size: 0.75rem !important;
            white-space: nowrap;
          }
        }
  
      `}
    </style>
    <div className="admin-page" style={{display: 'flex', minHeight: '100vh', background: '#f8f9fa'}}>
      
      {/* 1. ?¼ìª½ ?¬ì´?œë°” ë©”ë‰´ */}
      {isSidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999}}></div>
      )}
      <div className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <h2 style={{padding: '0 2rem', marginBottom: '2rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)'}}>
          <LayoutDashboard /> ê´€ë¦¬ì ?¨ë„
        </h2>
        
        <ul style={{listStyle: 'none', padding: 0}}>
          {[
            { id: 'register', label: '?í’ˆ ?±ë¡', icon: <PackagePlus size={20} /> },
            { id: 'list', label: '?í’ˆ ëª©ë¡', icon: <List size={20} /> },
            { id: 'banner', label: 'ë©”ì¸ ?ë‹¨ ë°°ë„ˆ ê´€ë¦?, icon: <ImageIcon size={20} /> },
            { id: 'rec_banner', label: 'ì¶”ì²œ?í’ˆ ë°°ë„ˆ ê´€ë¦?, icon: <ImageIcon size={20} /> },
            { id: 'notice', label: 'ê³µì??¬í•­ ê´€ë¦?, icon: <Bell size={20} /> },
            { id: 'order', label: 'ì£¼ë¬¸ ê´€ë¦?, icon: <ShoppingCart size={20} />, badge: allOrders.filter(o => o.status === 'ê²°ì œ?„ë£Œ').length },
            { id: 'claims', label: 'ì·¨ì†Œë°˜í’ˆê´€ë¦?, icon: <RefreshCcw size={20} /> },
            { id: 'member', label: '?Œì› ê´€ë¦?, icon: <LayoutDashboard size={20} /> },
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

      {/* 2. ë©”ì¸ ì»¨í…ì¸??ì—­ */}
      <div className="admin-main-content">
        
        <div className="admin-mobile-header" style={{ display: 'none', alignItems: 'center', padding: '1rem', background: 'white', borderBottom: '1px solid #eee', marginBottom: '1rem' }}>
          <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Menu size={24} />
          </button>
          <span style={{ marginLeft: '1rem', fontWeight: 'bold', fontSize: '1.2rem' }}>ê´€ë¦¬ì ?˜ì´ì§€</span>
        </div>

        {/* ========================================================================================= */}
        {/* ?í’ˆ ?±ë¡/?˜ì • ??*/}
        {/* ========================================================================================= */}
        {activeTab === 'register' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{fontSize: '1.8rem', fontWeight: '800'}}>
                {editingProductId ? '?í’ˆ ?˜ì •' : '? ê·œ ?í’ˆ ?±ë¡'}
              </h2>
              {editingProductId && (
                <button className="outline-btn" onClick={handleCancelEdit}>?˜ì • ì·¨ì†Œ (? ê·œ ?±ë¡?¼ë¡œ ?„í™˜)</button>
              )}
            </div>

            <div style={{display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'flex-start'}}>
              
              {/* ?¼ìª½: ?±ë¡ ??*/}
              <div style={{flex: 1, minWidth: '280px', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>?í’ˆëª?/label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}} />
                  </div>

                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>?í’ˆ ?Œì œëª?/label>
                    <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} placeholder="?? ë°”ë‹¤??? ì„ ?¨ì„ ê·¸ë?ë¡??´ì?" style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}} />
                  </div>
                  
                  <div style={{display: 'flex', gap: '1rem'}}>
                    <div style={{flex: 1}}>
                      <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>ì¹´í…Œê³ ë¦¬</label>
                      <select name="category" value={formData.category} onChange={handleChange} style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}}>
                        <option value="mealkit">ë°€?¤íŠ¸</option>
                        <option value="new">? ìƒ??/option>
                        <option value="local">?°ì?ì§ì†¡</option>
                        <option value="direct">?…ì²´ì§ì†¡</option>
                        <option value="sale">?¹ê?? ì¸</option>
                      </select>
                    </div>
                    <div style={{flex: 1}}>
                      <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>?ë§¤ê°€ê²?(??</label>
                      <input type="number" name="price" value={formData.price} onChange={handleChange} required style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}} />
                    </div>
                  </div>

                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>?•ìƒê°€ê²?(??</label>
                    <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} placeholder="? ì¸ ??ê°€ê²©ì„ ?ìœ¼ë©?? ì¸???ë™ ê³„ì‚°" style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}} />
                  </div>

                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>ë°°ì†¡ë¹?(??</label>
                    <input type="number" name="shippingFee" value={formData.shippingFee} onChange={handleChange} placeholder="ê¸°ë³¸ 3,000?? 0 ?…ë ¥ ??ë¬´ë£Œë°°ì†¡" style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}} />
                  </div>

                  <div style={{display: 'flex', gap: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px'}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600'}}>
                      <input type="checkbox" name="isNewProduct" checked={formData.isNewProduct} onChange={handleChange} />
                      [NEW ë±ƒì?]
                    </label>
                    <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600'}}>
                      <input type="checkbox" name="isBest" checked={formData.isBest} onChange={handleChange} />
                      [BEST ë±ƒì?]
                    </label>
                  </div>

                  {/* ?¸ë„¤??*/}
                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>?€???¸ë„¤???´ë?ì§€</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{width: '100%', padding: '0.5rem', border: '1px dashed #ccc', borderRadius: '8px'}} />
                  </div>

                  {/* ?œë¸Œ ?´ë?ì§€ (ìµœë? 5ê°? */}
                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>ì¶”ê? ?œë¸Œ ?´ë?ì§€ (ìµœë? 5ê°?</label>
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

                  {/* êµ¬ë§¤ ?ˆë‚´ ?´ë?ì§€ */}
                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>êµ¬ë§¤ ?ˆë‚´ ?´ë?ì§€</label>
                    <input type="file" accept="image/*" onChange={handlePurchaseFileChange} style={{width: '100%', padding: '0.5rem', border: '1px dashed #ccc', borderRadius: '8px'}} />
                    {purchaseImagePreview && (
                      <div style={{marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--primary-color)'}}>
                        ?´ë?ì§€ê°€ ?±ë¡?˜ì–´ ?ˆìŠµ?ˆë‹¤.
                      </div>
                    )}
                  </div>

                  {/* ?µì…˜ */}
                  <div style={{background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                      <label style={{fontWeight: 'bold'}}>?í’ˆ ?µì…˜ ?¤ì • (? íƒ?¬í•­)</label>
                      <button type="button" onClick={handleAddOption} style={{padding: '0.4rem 0.8rem', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>+ ì¶”ê?</button>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
                      {options.map((opt, idx) => (
                        <div key={idx} style={{display: 'flex', gap: '0.5rem'}}>
                          <input type="text" placeholder="?µì…˜ëª? value={opt.name} onChange={(e) => handleOptionChange(idx, "name", e.target.value)} style={{flex: 2, padding: "0.5rem", border: "1px solid #ddd", borderRadius: "4px"}} />
                          <input type='number' placeholder='ì¶”ê?ê¸ˆì•¡(+)' value={opt.additionalPrice} onChange={(e) => handleOptionChange(idx, 'additionalPrice', e.target.value)} style={{flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px'}} />
                          <button type="button" onClick={() => handleRemoveOption(idx)} style={{padding: '0.5rem', background: '#ff4757', color: 'white', border: 'none', borderRadius: '4px'}}>X</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ?™ì  ?ì„¸ ë¸”ë¡ ì¶”ê? (?¬ì§„+ê¸€ ?°ê¸°) */}
                  <div style={{border: '1px solid var(--primary-color)', padding: '1.5rem', borderRadius: '8px'}}>
                    <h3 style={{marginBottom: '1rem', color: 'var(--primary-color)', fontSize: '1.1rem'}}>?ì„¸?˜ì´ì§€ êµ¬ì„± (ë¸”ë¡ ?ë””??</h3>
                    <p style={{fontSize: '0.85rem', color: '#666', marginBottom: '1rem'}}>
                      ?¬ì§„ê³??ìŠ¤?¸ë? ?í•˜???œì„œ?€ë¡??ìœ ë¡?²Œ ì¶”ê??´ë³´?¸ìš”.
                    </p>
                    
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem'}}>
                      {detailBlocks.map((block, idx) => (
                        <div key={idx} style={{background: '#f8f9fa', padding: '1rem', borderRadius: '8px', position: 'relative', border: '1px solid #ddd'}}>
                          <button type="button" onClick={() => handleRemoveBlock(idx)} style={{position: 'absolute', top: '-10px', right: '-10px', background: '#ff4757', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', zIndex: 10}}><X size={14}/></button>
                          
                          {block.type === 'text' ? (
                            <div>
                              <div style={{fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#555'}}><Type size={14}/> ?ìŠ¤??ë¸”ë¡</div>
                              <textarea 
                                value={block.content} 
                                onChange={(e) => handleBlockTextChange(idx, e.target.value)}
                                placeholder="?¬ê¸°???ì„¸ ?¤ëª…???ì–´ì£¼ì„¸??.."
                                style={{width: '100%', minHeight: '80px', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical'}}
                              />
                            </div>
                          ) : (
                            <div>
                              <div style={{fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#555'}}><ImgIcon size={14}/> ?´ë?ì§€ ë¸”ë¡</div>
                              <input type="file" accept="image/*" onChange={(e) => handleBlockImageChange(idx, e)} style={{marginBottom: '0.5rem'}} />
                              {block.preview && <img src={block.preview} alt="preview" style={{maxWidth: '100%', maxHeight: '150px', display: 'block', borderRadius: '4px'}} />}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button type="button" onClick={() => handleAddBlock('image')} style={{flex: 1, padding: '0.8rem', background: '#e1e5eb', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '600'}}>
                        <ImgIcon size={16}/> ?¬ì§„ ì¶”ê?
                      </button>
                      <button type="button" onClick={() => handleAddBlock('text')} style={{flex: 1, padding: '0.8rem', background: '#e1e5eb', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '600'}}>
                        <Type size={16}/> ê¸€ ì¶”ê?
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="primary-btn" disabled={uploading} style={{marginTop: '1rem', fontSize: '1.2rem', padding: '1rem'}}>
                    {uploading ? '?œë²„?µì‹ ì¤?.' : (editingProductId ? '?˜ì • ?´ìš© ?€?? : '?í’ˆ ?±ë¡')}
                  </button>
                </form>
              </div>

              {/* ?¤ë¥¸ìª??¼í•‘ëª?ë¯¸ë¦¬ë³´ê¸° */}
              <div style={{flex: 1.5, minWidth: '280px', position: 'sticky', top: '100px'}}>
                <h3 style={{marginBottom: '1rem', color: '#666', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  [?¼í•‘ëª?ë¯¸ë¦¬ë³´ê¸°]
                </h3>
                
                <div style={{background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', pointerEvents: 'none'}}>
                  <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
                    {/* ?¸ë„¤??ë¯¸ë¦¬ë³´ê¸° */}
                    <div style={{flex: 1, borderRadius: '12px', overflow: 'hidden', background: '#f1f2f6', aspectRatio: '1/1'}}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      ) : (
                        <div style={{display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#999'}}>ë©”ì¸ ?¬ì§„</div>
                      )}
                    </div>
                    {/* ?•ë³´ ë¯¸ë¦¬ë³´ê¸° */}
                    <div style={{flex: 1}}>
                      <div style={{display: 'flex', gap: '0.5rem', marginBottom: '0.5rem'}}>
                        {formData.isBest && <span style={{padding: '0.2rem 0.5rem', background: 'var(--primary-color)', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '4px'}}>BEST</span>}
                        {formData.isNewProduct && <span style={{padding: '0.2rem 0.5rem', background: '#2ed573', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '4px'}}>NEW</span>}
                      </div>
                      <h3 style={{fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.2rem'}}>{formData.name || '?í’ˆëª?}</h3>
                      <p style={{fontSize: '0.9rem', color: '#888', marginBottom: '1rem'}}>{formData.subtitle || '?í’ˆ ?Œì œëª?}</p>
                      
                      <div style={{display: 'flex', alignItems: 'baseline', gap: '0.5rem'}}>
                        <span style={{fontSize: '1.4rem', color: '#e74c3c', letterSpacing: '-0.5px', fontWeight: '900'}}>{formatPrice(formData.price)}??/span>
                        {formData.originalPrice && <span style={{fontSize: '1rem', color: '#999', textDecoration: 'line-through'}}>{formatPrice(formData.originalPrice)}??/span>}
                      </div>
                    </div>
                  </div>

                  <div style={{marginTop: '2rem', borderTop: '2px solid #eee', paddingTop: '1rem'}}>
                    <h4 style={{marginBottom: '1rem', color: 'var(--primary-color)'}}>?ì„¸?˜ì´ì§€ ë³¸ë¬¸</h4>
                    <div style={{background: '#fafafa', padding: '1rem', borderRadius: '8px', minHeight: '200px'}}>
                      {detailBlocks.length === 0 ? (
                        <div style={{textAlign: 'center', color: '#aaa', marginTop: '3rem'}}>?ì„¸ ë¸”ë¡???¬ê¸°???œì‹œ?©ë‹ˆ??</div>
                      ) : (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                          {detailBlocks.map((block, idx) => (
                            <div key={idx}>
                              {block.type === 'text' && (
                                <p style={{whiteSpace: 'pre-wrap', color: '#444', lineHeight: '1.6'}}>{block.content || '(?ìŠ¤??'}</p>
                              )}
                              {block.type === 'image' && block.preview && (
                                <img src={block.preview} alt="?ì„¸ë¯¸ë¦¬ë³´ê¸°" style={{width: '100%', borderRadius: '8px'}} />
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
        {/* ?í’ˆ ëª©ë¡ ??*/}
        {/* ========================================================================================= */}
        {activeTab === 'list' && (
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'}}>
              <h2 style={{fontSize: '1.8rem', fontWeight: '800'}}>?±ë¡???í’ˆ ëª©ë¡ ({filteredProducts.length}ê°?</h2>
              <div style={{display: 'flex', gap: '0.5rem', flex: 1, minWidth: '200px', maxWidth: '300px'}}>
                 <input type="text" value={productSearchKeyword} onChange={(e) => {setProductSearchKeyword(e.target.value); setCurrentPage(1);}} placeholder="?í’ˆëª??ëŠ” ì¹´í…Œê³ ë¦¬ ê²€?? style={{padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #ddd', width: '100%'}} />
              </div>
              <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                {selectedProductIds.length > 0 && (
                  <button onClick={handleBulkDelete} style={{padding: '0.6rem 1.2rem', background: '#ff4757', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>
                    ? íƒ ?? œ ({selectedProductIds.length})
                  </button>
                )}
                <button className="primary-btn" onClick={() => {resetForm(); setActiveTab('register');}}>+ ???í’ˆ ?±ë¡</button>
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
                <label htmlFor="selectAll" style={{cursor: 'pointer', fontWeight: '600'}}>?„ì¬ ?˜ì´ì§€ ?„ì²´ ? íƒ</label>
              </div>
            )}
            
            {products.length === 0 ? (
              <div style={{textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '16px', color: '#888'}}>
                ?±ë¡???í’ˆ???†ìŠµ?ˆë‹¤.
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
                    
                    <div className="admin-list-info" style={{flex: 2}}>
                      <div style={{display: 'flex', gap: '0.5rem', marginBottom: '0.2rem'}}>
                        <span style={{fontSize: '0.8rem', color: '#999'}}>[{p.category}]</span>
                        {p.isBest && <span style={{fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 'bold'}}>BEST</span>}
                        {p.isNewProduct && <span style={{fontSize: '0.7rem', color: '#2ed573', fontWeight: 'bold'}}>NEW</span>}
                      </div>
                      <h4 style={{fontSize: '1.1rem', fontWeight: '600', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{p.name}</h4>
                    </div>

                    <div className="admin-list-price" style={{flex: 1, fontWeight: '700', fontSize: '1.1rem', textAlign: 'right', marginRight: '2rem'}}>
                      {formatPrice(p.price)}??
                    </div>

                    <div className="admin-list-actions" style={{display: 'flex', gap: '0.5rem'}}>
                      <button 
                        onClick={() => handleEditClick(p)}
                        style={{padding: '0.6rem 1rem', background: '#f1f2f6', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600'}}
                      >
                        <Edit size={16} /><span className="action-text">?˜ì •</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(p._id || p.id)}
                        style={{padding: '0.6rem 1rem', background: '#fff0f0', color: '#ff4757', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600'}}
                      >
                        <Trash2 size={16} /><span className="action-text">?? œ</span>
                      </button>
                      <button 
                        onClick={() => openReviewManager(p)}
                        style={{padding: '0.6rem 1rem', background: '#e3f2fd', color: '#1976d2', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600'}}
                      >
                        <List size={16} /><span className="action-text">ë¦¬ë·°ê´€ë¦?/span>
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

        {/* ========================================================================================= */}
        {/* ë©”ì¸ ?ë‹¨ ë°°ë„ˆ ê´€ë¦???*/}
        {/* ========================================================================================= */}
        {activeTab === 'banner' && (
          <div style={{background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}}>
            <h2 style={{fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem', color: '#333'}}>ë©”ì¸ ?ë‹¨ ë°°ë„ˆ ê´€ë¦?/h2>
            <div style={{padding: '1rem', background: '#fff3e0', color: '#e65100', borderRadius: '8px', marginBottom: '2rem', fontWeight: '600'}}>
              ê¶Œì¥ ?´ë?ì§€ ?¬ì´ì¦? ê°€ë¡?1920px Ã— ?¸ë¡œ 500px
            </div>
            
            <div style={{marginBottom: '2rem'}}>
              <button onClick={() => handleOpenBannerEditor('hero')} style={{padding: '0.8rem 1.5rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'}}>
                + ???ë‹¨ ë°°ë„ˆ ì¶”ê?
              </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              {heroBanners.length === 0 ? (
                <p style={{color: '#888'}}>?±ë¡???ë‹¨ ë°°ë„ˆê°€ ?†ìŠµ?ˆë‹¤.</p>
              ) : heroBanners.map((banner, idx) => (
                <div key={banner.id} className="admin-banner-card" style={{border: '1px solid #ddd', borderRadius: '12px', padding: '1.5rem', background: '#fafafa', position: 'relative'}}>
                  <div className="admin-banner-item" style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
                    <span style={{fontWeight: '900', fontSize: '1.5rem', color: 'var(--primary-color)'}}>{idx + 1}</span>
                    <img src={banner.imageUrl} alt="banner" style={{width: '240px', height: '62px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc'}} />
                    <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', justifyContent: 'center'}}>
                      <strong style={{fontSize: '1.1rem'}}>{banner.title || '(ë¬¸êµ¬ ?†ìŒ)'}</strong>
                      <span style={{color: '#888', fontSize: '0.9rem'}}>{banner.subtitle}</span>
                    </div>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button onClick={() => handleOpenBannerEditor('hero', banner)} style={{padding: '0.6rem 1rem', background: '#4bcffa', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>
                        ?˜ì •
                      </button>
                      <button onClick={() => handleDeleteBanner(banner.id, 'hero')} style={{padding: '0.6rem 1rem', background: '#ff4757', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>
                        ?? œ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================================= */}
        {/* ì¶”ì²œ?í’ˆ ë°°ë„ˆ ê´€ë¦???*/}
        {/* ========================================================================================= */}
        {activeTab === 'rec_banner' && (
          <div style={{background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}}>
            <h2 style={{fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem', color: '#333'}}>ì¶”ì²œ?í’ˆ ë°°ë„ˆ ê´€ë¦?/h2>
            <div style={{padding: '1rem', background: '#fff3e0', color: '#e65100', borderRadius: '8px', marginBottom: '2rem', fontWeight: '600'}}>
              ê¶Œì¥ ?´ë?ì§€ ?¬ì´ì¦? ê°€ë¡?1200px Ã— ?¸ë¡œ 300px (ë¹„ìœ¨ 4:1)
            </div>
            
            <div style={{marginBottom: '2rem'}}>
              <button onClick={() => handleOpenBannerEditor('rec')} style={{padding: '0.8rem 1.5rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'}}>
                + ??ì¶”ì²œ?í’ˆ ë°°ë„ˆ ì¶”ê?
              </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              {recBanners.length === 0 ? (
                <p style={{color: '#888'}}>?±ë¡??ì¶”ì²œ?í’ˆ ë°°ë„ˆê°€ ?†ìŠµ?ˆë‹¤.</p>
              ) : recBanners.map((banner, idx) => (
                <div key={banner.id} className="admin-banner-card" style={{border: '1px solid #ddd', borderRadius: '12px', padding: '1.5rem', background: '#fafafa', position: 'relative'}}>
                  <div className="admin-banner-item" style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
                    <span style={{fontWeight: '900', fontSize: '1.5rem', color: 'var(--primary-color)'}}>{idx + 1}</span>
                    <img src={banner.imageUrl} alt="banner" style={{width: '240px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc'}} />
                    <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', justifyContent: 'center'}}>
                      <strong style={{fontSize: '1.1rem'}}>{banner.title || '(ë¬¸êµ¬ ?†ìŒ)'}</strong>
                    </div>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button onClick={() => handleOpenBannerEditor('rec', banner)} style={{padding: '0.6rem 1rem', background: '#4bcffa', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>
                        ?˜ì •
                      </button>
                      <button onClick={() => handleDeleteBanner(banner.id, 'rec')} style={{padding: '0.6rem 1rem', background: '#ff4757', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>
                        ?? œ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================================= */}
        {/* ê³µì??¬í•­ ê´€ë¦???*/}
        {/* ========================================================================================= */}
        {activeTab === 'notice' && (
          <div style={{textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '16px', color: '#888'}}>
            <h2 style={{fontSize: '1.8rem', fontWeight: '800', color: '#333', marginBottom: '1rem'}}>
              ê³µì??¬í•­ ê´€ë¦?
            </h2>
            <p>??ê¸°ëŠ¥?€ ì¶”í›„ ?…ë°?´íŠ¸ ?ˆì •?…ë‹ˆ??</p>
          </div>
        )}

        {/* ========================================================================================= */}
        {/* ì£¼ë¬¸ ê´€ë¦???*/}
        {/* ========================================================================================= */}
        {activeTab === 'order' && (
          <div className="admin-orders-card" style={{background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}}>
            <h2 style={{fontSize: '1.8rem', fontWeight: '800', color: '#333', marginBottom: '1.5rem'}}>
              ì£¼ë¬¸ ê´€ë¦?({allOrders.filter(o => ['ê²°ì œ?„ë£Œ', '?í’ˆì¤€ë¹„ì¤‘', 'ë°°ì†¡ì¤?].includes(o.status)).length}ê±?
            </h2>
            
            {/* ?œë¸Œ??*/}
            <div className="admin-order-tabs" style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', overflowX: 'auto', whiteSpace: 'nowrap', marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '1rem'}}>
              {['ê²°ì œ?„ë£Œ', '?í’ˆì¤€ë¹„ì¤‘', 'ë°°ì†¡ì¤?, 'ë°°ì†¡?„ë£Œ'].map(status => (
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
                  {status === 'ê²°ì œ?„ë£Œ' ? '1. ê²°ì œ?„ë£Œ' : status === '?í’ˆì¤€ë¹„ì¤‘' ? '2. ë°°ì†¡ì²˜ë¦¬(ì¤€ë¹„ì¤‘)' : status === 'ë°°ì†¡ì¤? ? '3. ë°°ì†¡ì¤? : '4. ë°°ì†¡?„ë£Œ'}
                  {status !== 'ë°°ì†¡?„ë£Œ' && (
                    <span style={{marginLeft: '0.5rem', background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.9rem'}}>
                      {allOrders.filter(o => o.status === status).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {orderSubTab === 'ë°°ì†¡?„ë£Œ' && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                
                <input 
                  type="date" 
                  value={orderStartDate} 
                  onChange={(e) => { setOrderStartDate(e.target.value); setCurrentOrdersPage(1); }}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', flex: 1, minWidth: 0 }}
                />
                <span style={{color: '#888', flexShrink: 0}}>~</span>
                <input 
                  type="date" 
                  value={orderEndDate} 
                  onChange={(e) => { setOrderEndDate(e.target.value); setCurrentOrdersPage(1); }}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', flex: 1, minWidth: 0 }}
                />
                <span style={{ marginLeft: 0, marginTop: '0.5rem', width: '100%', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  ê¸°ê°„ ??ë°°ì†¡?„ë£Œ: {filteredOrders.length}ê±?
                </span>
              </div>
            )}

            <div style={{overflowX: 'auto'}}>
              <table className="admin-orders-table" style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px'}}>
                <thead>
                  <tr style={{background: '#f8f9fa', borderBottom: '2px solid #ddd'}}>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>ì£¼ë¬¸?¼ì‹œ</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>ì£¼ë¬¸ë²ˆí˜¸/ì£¼ë¬¸??/th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>?í’ˆëª?/th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>ê²°ì œê¸ˆì•¡</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>
                      {orderSubTab === '?í’ˆì¤€ë¹„ì¤‘' ? '?¡ì¥?…ë ¥' : orderSubTab === 'ë°°ì†¡ì¤? || orderSubTab === 'ë°°ì†¡?„ë£Œ' ? '?¡ì¥?•ë³´' : 'ê´€ë¦?}
                    </th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>?íƒœë³€ê²?/th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map(order => (
                    <tr key={order._id} style={{borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'background 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.background='#f9f9f9'} onMouseLeave={(e) => e.currentTarget.style.background='transparent'} onClick={() => setSelectedOrderDetails(order)}>
                      <td className="admin-order-date" style={{padding: '1rem', color: '#666'}}>
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td className="admin-order-user" style={{padding: '1rem'}}>
                        <div className="order-user-name" style={{fontWeight: 'bold', color: '#333'}}>{order.userId?.name || order.shippingInfo?.receiverName || '?´ë¦„ ?†ìŒ'}</div>
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
                                ? `${order.items[0].name} ??${order.items.length - 1}ê±? 
                                : order.items[0].name
                            ) : '?í’ˆ ?†ìŒ'}
                          </div>
                        </div>
                      </td>
                      <td className="admin-order-price" style={{padding: '1rem', fontWeight: 'bold', color: 'var(--primary-color)'}}>
                        {(order.totalAmount + order.shippingFee).toLocaleString()}??
                      </td>
                      <td className="admin-order-tracking" style={{padding: '1rem'}} onClick={e => e.stopPropagation()}>
                        {orderSubTab === '?í’ˆì¤€ë¹„ì¤‘' ? (
                          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                            <input 
                              type="text" 
                              placeholder="?ë°°??(?? CJ?€?œí†µ??"
                              value={trackingInputs[order._id]?.courier || ''}
                              onChange={e => setTrackingInputs(prev => ({...prev, [order._id]: {...prev[order._id], courier: e.target.value}}))}
                              style={{padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.9rem'}}
                            />
                            <input 
                              type="text" 
                              placeholder="?¡ì¥ë²ˆí˜¸ ?…ë ¥"
                              value={trackingInputs[order._id]?.trackingNumber || ''}
                              onChange={e => setTrackingInputs(prev => ({...prev, [order._id]: {...prev[order._id], trackingNumber: e.target.value}}))}
                              style={{padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.9rem'}}
                            />
                          </div>
                        ) : (orderSubTab === 'ë°°ì†¡ì¤? || orderSubTab === 'ë°°ì†¡?„ë£Œ') ? (
                          <div style={{fontSize: '0.95rem'}}>
                            <div style={{fontWeight: 'bold', color: '#555'}}>{order.courier || '?ë°°??ë¯¸ìƒ'}</div>
                            <div style={{color: '#888'}}>{order.trackingNumber || '?¡ì¥ë²ˆí˜¸ ?†ìŒ'}</div>
                          </div>
                        ) : (
                          <span style={{color: '#aaa'}}>-</span>
                        )}
                      </td>
                      <td className="admin-order-action" style={{padding: '1rem'}} onClick={e => e.stopPropagation()}>
                        {orderSubTab === 'ê²°ì œ?„ë£Œ' && (
                          <button onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await updateOrderStatus(order._id, { status: '?í’ˆì¤€ë¹„ì¤‘' });
                              loadAllOrders();
                            } catch (err) { alert('ë³€ê²??¤íŒ¨'); }
                          }} style={{padding: '0.6rem 1rem', background: '#34495e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit'}}>
                            ë°°ì†¡ì²˜ë¦¬(ì¤€ë¹„ì¤‘)ë¡??´ë™
                          </button>
                        )}
                        {orderSubTab === '?í’ˆì¤€ë¹„ì¤‘' && (
                          <button onClick={async (e) => {
                            e.stopPropagation();
                            const trackingInfo = trackingInputs[order._id];
                            if (!trackingInfo?.courier || !trackingInfo?.trackingNumber) {
                              if (!window.confirm('?ë°°?¬ë‚˜ ?¡ì¥ë²ˆí˜¸ê°€ ?…ë ¥?˜ì? ?Šì•˜?µë‹ˆ?? ê·¸ë˜??ë°°ì†¡ì¤‘ìœ¼ë¡??´ë™?˜ì‹œê² ìŠµ?ˆê¹Œ?')) return;
                            }
                            try {
                              await updateOrderStatus(order._id, { 
                                status: 'ë°°ì†¡ì¤?, 
                                courier: trackingInfo?.courier || '',
                                trackingNumber: trackingInfo?.trackingNumber || ''
                              });
                              loadAllOrders();
                            } catch (err) { alert('ë³€ê²??¤íŒ¨'); }
                          }} style={{padding: '0.6rem 1rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit'}}>
                            ?¡ì¥?…ë ¥ ??ë°°ì†¡ì¤??´ë™
                          </button>
                        )}
                        {orderSubTab === 'ë°°ì†¡ì¤? && (
                          <button onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await updateOrderStatus(order._id, { status: 'ë°°ì†¡?„ë£Œ' });
                              loadAllOrders();
                            } catch (err) { alert('ë³€ê²??¤íŒ¨'); }
                          }} style={{padding: '0.6rem 1rem', background: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit'}}>
                            ë°°ì†¡?„ë£Œ ì²˜ë¦¬
                          </button>
                        )}
                        {orderSubTab === 'ë°°ì†¡?„ë£Œ' && (
                          <span style={{color: '#27ae60', fontWeight: 'bold'}}>ë°°ì†¡?„ë£Œ ??/span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {currentOrders.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{padding: '3rem', textAlign: 'center', color: '#999', fontSize: '1.1rem'}}>
                        ì£¼ë¬¸ ?´ì—­???†ìŠµ?ˆë‹¤.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ì£¼ë¬¸ ?˜ì´ì§?*/}
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

        {/* ========================================================================================= */}
        {/* ì·¨ì†Œë°˜í’ˆê´€ë¦???*/}
        {/* ========================================================================================= */}
        {activeTab === 'claims' && (
          <div className="admin-orders-card" style={{background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}}>
            <h2 style={{fontSize: '1.8rem', fontWeight: '800', color: '#333', marginBottom: '1.5rem'}}>
              ì·¨ì†Œë°˜í’ˆê´€ë¦?            </h2>
            <div className="admin-order-tabs" style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', overflowX: 'auto', whiteSpace: 'nowrap', marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '1rem'}}>
              {['ì·¨ì†Œê´€ë¦?, 'ë°˜í’ˆê´€ë¦?].map(status => (
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

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
              
              <input type="date" value={orderStartDate} onChange={(e) => { setOrderStartDate(e.target.value); setCurrentOrdersPage(1); }} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', flex: 1, minWidth: 0 }} />
              <span style={{color: '#888', flexShrink: 0}}>~</span>
              <input type="date" value={orderEndDate} onChange={(e) => { setOrderEndDate(e.target.value); setCurrentOrdersPage(1); }} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', flex: 1, minWidth: 0 }} />
            </div>
            
            <div style={{overflowX: 'auto'}}>
              <table className="admin-orders-table" style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px'}}>
                <thead>
                  <tr style={{background: '#f8f9fa', borderBottom: '2px solid #ddd'}}>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>? ì²­?¼ì‹œ</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>ì£¼ë¬¸ë²ˆí˜¸/ì£¼ë¬¸??/th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>?í’ˆëª?/th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>ê²°ì œê¸ˆì•¡</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>?íƒœ</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>ê´€ë¦?/th>
                  </tr>
                </thead>
                <tbody>
                  {allOrders.filter(o => {
                    let ok = false;
                    if (claimsSubTab === 'ì·¨ì†Œê´€ë¦?) ok = o.status === 'ì·¨ì†Œ?? || (o.status === '?˜ë¶ˆ?„ë£Œ' && !o.claim);
                    if (claimsSubTab === 'ë°˜í’ˆê´€ë¦?) ok = o.status === 'ë°˜í’ˆ?”ì²­' || (o.status === '?˜ë¶ˆ?„ë£Œ' && !!o.claim);
                    if (!ok) return false;
                    if (orderStartDate || orderEndDate) {
                      const oDate = new Date(o.updatedAt || o.createdAt);
                      if (orderStartDate) {
                        const sDate = new Date(orderStartDate);
                        sDate.setHours(0,0,0,0);
                        if (oDate < sDate) return false;
                      }
                      if (orderEndDate) {
                        const eDate = new Date(orderEndDate);
                        eDate.setHours(23,59,59,999);
                        if (oDate > eDate) return false;
                      }
                    }
                    return true;
                  }).length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{padding: '3rem', textAlign: 'center', color: '#999', fontSize: '1.1rem'}}>
                        ?´ë‹¹ ?´ì—­???†ìŠµ?ˆë‹¤.
                      </td>
                    </tr>
                  ) : (
                    allOrders.filter(o => {
                      let ok = false;
                    if (claimsSubTab === 'ì·¨ì†Œê´€ë¦?) ok = o.status === 'ì·¨ì†Œ?? || (o.status === '?˜ë¶ˆ?„ë£Œ' && !o.claim);
                    if (claimsSubTab === 'ë°˜í’ˆê´€ë¦?) ok = o.status === 'ë°˜í’ˆ?”ì²­' || (o.status === '?˜ë¶ˆ?„ë£Œ' && !!o.claim);
                    if (!ok) return false;
                    if (orderStartDate || orderEndDate) {
                      const oDate = new Date(o.updatedAt || o.createdAt);
                      if (orderStartDate) {
                        const sDate = new Date(orderStartDate);
                        sDate.setHours(0,0,0,0);
                        if (oDate < sDate) return false;
                      }
                      if (orderEndDate) {
                        const eDate = new Date(orderEndDate);
                        eDate.setHours(23,59,59,999);
                        if (oDate > eDate) return false;
                      }
                    }
                    return true;
                    }).map(order => (
                      <tr key={order._id} style={{borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'background 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.background='#f9f9f9'} onMouseLeave={(e) => e.currentTarget.style.background='transparent'} onClick={() => setSelectedOrderDetails(order)}>
                        <td className="admin-order-date" style={{padding: '1rem', color: '#666'}}>
                          {new Date(order.updatedAt || order.createdAt).toLocaleString()}
                        </td>
                        <td className="admin-order-user" style={{padding: '1rem'}}>
                          <div className="order-user-name" style={{fontWeight: 'bold', color: '#333'}}>{order.userId?.name || order.shippingInfo?.receiverName || '?????†ìŒ'}</div>
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
                                  ? `${order.items[0].name} ??${order.items.length - 1}ê±?
                                  : order.items[0].name
                              ) : '?í’ˆ ?†ìŒ'}
                            </div>
                          </div>
                        </td>
                        <td className="admin-order-price" style={{padding: '1rem', fontWeight: 'bold', color: 'var(--primary-color)'}}>
                          {(order.totalAmount + order.shippingFee).toLocaleString()}??
                        </td>
                        <td className="admin-order-tracking" style={{padding: '1rem'}}>
                          <div style={{color: '#e74c3c', fontWeight: 'bold'}}>{order.status}</div>
                        </td>
                        <td className="admin-order-action" style={{padding: '1rem'}} onClick={e => e.stopPropagation()}>
                          {order.status === 'ì·¨ì†Œ?? || order.status === 'ë°˜í’ˆ?”ì²­' ? (
                            <button onClick={async (e) => {
                              e.stopPropagation();
                              if(window.confirm('?˜ë¶ˆ ?„ë£Œ ì²˜ë¦¬?˜ì‹œê² ìŠµ?ˆê¹Œ?')) {
                                try {
                                  await updateOrderStatus(order._id, { status: '?˜ë¶ˆ?„ë£Œ' });
                                  loadAllOrders();
                                } catch (err) { alert('ì²˜ë¦¬ ?¤íŒ¨'); }
                              }
                            }} style={{padding: '0.6rem 1rem', background: '#ff4757', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'bold'}}>
                              ?˜ë¶ˆ?„ë£Œ
                            </button>
                          ) : order.status === '?˜ë¶ˆ?„ë£Œ' ? (
                            <button disabled style={{padding: '0.6rem 1rem', background: '#ddd', color: '#666', border: 'none', borderRadius: '6px', fontFamily: 'inherit', fontWeight: 'bold'}}>?„ë£Œ</button>
                          ) : null}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================================= */}
        {/* ?Œì› ê´€ë¦???*/}
        {/* ========================================================================================= */}
        {activeTab === 'member' && (
          <div style={{background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}}>
            <h2 style={{fontSize: '1.8rem', fontWeight: '800', color: '#333', marginBottom: '2rem'}}>?Œì› ê´€ë¦?({users.length}ëª?</h2>
            <div style={{overflowX: 'auto'}}>
              <table className="member-table" style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px'}}>
                <thead>
                  <tr style={{background: '#f8f9fa', borderBottom: '2px solid #ddd'}}>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>?´ë¦„</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>?„ì´???Œì…œ)</th>
                    <th className="hide-on-mobile" style={{padding: '1rem', fontWeight: 'bold'}}>?´ë©”??/th>
                    <th className="hide-on-mobile" style={{padding: '1rem', fontWeight: 'bold'}}>?„í™”ë²ˆí˜¸</th>
                    <th className="hide-on-mobile" style={{padding: '1rem', fontWeight: 'bold'}}>ë§ˆì????˜ì‹ ?™ì˜</th>
                    <th style={{padding: '1rem', fontWeight: 'bold'}}>ê°€?…ì¼</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{padding: '3rem', textAlign: 'center', color: '#777'}}>ê°€?…í•œ ?Œì›???†ìŠµ?ˆë‹¤.</td>
                    </tr>
                  ) : (
                    currentUsers.map(u => (
                      <tr key={u._id} onClick={() => handleUserClick(u)} style={{borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'background 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.background='#f9f9f9'} onMouseLeave={(e) => e.currentTarget.style.background='transparent'}>
                        <td style={{padding: '1rem'}}>{u.name} {u.role === 'admin' ? '(ê´€ë¦¬ì)' : ''}</td>
                        <td style={{padding: '1rem'}}>{u.provider !== 'local' ? `${u.provider.toUpperCase()} ë¡œê·¸?? : u.loginId}</td>
                        <td className="hide-on-mobile" style={{padding: '1rem'}}>{u.email}</td>
                        <td className="hide-on-mobile" style={{padding: '1rem'}}>{u.phone || '-'}</td>
                        <td className="hide-on-mobile" style={{padding: '1rem'}}>
                          {u.agreements?.sns ? (
                            <span style={{background: '#e8f5e9', color: '#2e7d32', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem'}}>?™ì˜</span>
                          ) : (
                            <span style={{background: '#ffebee', color: '#c62828', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem'}}>ë¯¸ë™??/span>
                          )}
                        </td>
                        <td style={{padding: '1rem'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ?Œì›ê´€ë¦??˜ì´ì§?*/}
            {totalUsersPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', gap: '0.5rem' }}>
                <button 
                  onClick={() => handleUsersPageChange(Math.max(1, currentUsersPage - 1))}
                  disabled={currentUsersPage === 1}
                  style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', background: currentUsersPage === 1 ? '#f8f9fa' : 'white', cursor: currentUsersPage === 1 ? 'not-allowed' : 'pointer', borderRadius: '8px' }}
                >
                  ?´ì „
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
                  ?¤ìŒ
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>

    {/* ?ë””??ëª¨ë‹¬ */}
    {editingBanner && (
      <div className="modal-overlay" onClick={handleCloseBannerEditor}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={handleCloseBannerEditor}>&times;</button>
          <h2 style={{fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem', color: '#333'}}>
            {editorType === 'hero' ? '?ë‹¨ ë°°ë„ˆ ?ë””?? : 'ì¶”ì²œ?í’ˆ ë°°ë„ˆ ?ë””??}
          </h2>
          
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'inline-block', padding: '0.8rem 1.5rem', background: 'var(--primary-color)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>
              {uploading ? '?œë²„?µì‹ ì¤?.' : 'ë°°ë„ˆ ?´ë?ì§€ ? íƒ'}
              <input type="file" accept="image/*" style={{display: 'none'}} disabled={uploading} onChange={handleModalImageUpload} />
            </label>
          </div>

          <div className="modal-preview-box">
            {editorType === 'hero' ? (
              <div className="hero-slide" style={{ width: '100%', height: '300px', position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                <img src={editingBanner.imageUrl || 'https://via.placeholder.com/1920x500?text=ë°°ë„ˆ?´ë?ì§€'} alt="ë¯¸ë¦¬ë³´ê¸°" className="hero-slide-bg" style={{width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0}} />
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
                      title="?œë˜ê·¸í•˜???„ì¹˜ ë³€ê²?
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
                  src={editingBanner.imageUrl || 'https://via.placeholder.com/1200x300?text=ë°°ë„ˆ?´ë?ì§€'} 
                  alt="ë¯¸ë¦¬ë³´ê¸°"
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
                    title="?œë˜ê·¸í•˜???„ì¹˜ ë³€ê²?
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
            {/* ?°ê²°???í’ˆ ?¤ì • */}
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem', background: '#fafafa', padding: '1rem', borderRadius: '8px', border: '1px solid #eee'}}>
              <div style={{flex: '1 1 100%'}}><strong style={{color: '#555'}}>?°ê²°???í’ˆ (ë°°ë„ˆ ?´ë¦­ ???´ë‹¹ ?í’ˆ ?˜ì´ì§€ë¡??´ë™)</strong></div>
              <select value={editingBanner.linkProductId || ''} onChange={(e) => setEditingBanner({...editingBanner, linkProductId: e.target.value})} style={{width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer'}}>
                <option value="">-- ?°ê²° ????(?´ë¦­ ?¨ê³¼ ?†ìŒ) --</option>
                {products.map(p => (
                  <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* ë©”ì¸ ë¬¸êµ¬ ?¤ì • */}
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem', background: '#fafafa', padding: '1rem', borderRadius: '8px', border: '1px solid #eee'}}>
              <div style={{flex: '1 1 100%'}}><strong style={{color: '#555'}}>{editorType === 'hero' ? 'ë©”ì¸ ë¬¸êµ¬' : 'ë°°ë„ˆ ë¬¸êµ¬'}</strong></div>
              <input type="text" placeholder="ë¬¸êµ¬ ?…ë ¥" value={editingBanner.title} onChange={(e) => setEditingBanner({...editingBanner, title: e.target.value})} style={{flex: '3', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px'}} />
              <input type="number" placeholder="?¬ê¸°(?«ì)" value={editingBanner.titleSize} onChange={(e) => setEditingBanner({...editingBanner, titleSize: e.target.value})} style={{flex: '1', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px'}} title="ê¸€???¬ê¸°(px)" />
              <input type="color" value={editingBanner.titleColor} onChange={(e) => setEditingBanner({...editingBanner, titleColor: e.target.value})} style={{width: '50px', height: '40px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer'}} title="ê¸€???‰ìƒ" />
              <select value={editingBanner.titleFontFamily} onChange={(e) => setEditingBanner({...editingBanner, titleFontFamily: e.target.value})} style={{flex: '2', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px'}}>
                <option value="'Noto Sans KR', sans-serif">ê³ ë”• (Noto Sans)</option>
                <option value="'Noto Serif KR', serif">ëª…ì¡° (Noto Serif)</option>
                <option value="'Nanum Gothic', sans-serif">?˜ëˆ”ê³ ë”•</option>
                <option value="'Nanum Myeongjo', serif">?˜ëˆ”ëª…ì¡°</option>
                <option value="'Black Han Sans', sans-serif">ê²€?€ê³ ë”• (?êº¼?€)</option>
                <option value="'Jua', sans-serif">ì£¼ì•„ì²?(?™ê??™ê?)</option>
                <option value="'Do Hyeon', sans-serif">?„í˜„ì²?(ê°ì§„?œëª©)</option>
                <option value="'Gowun Dodum', sans-serif">ê³ ìš´?‹ì?</option>
                <option value="'Gowun Batang', serif">ê³ ìš´ë°”íƒ•</option>
                <option value="'Dongle', sans-serif">?™ê? (ë§¤ìš°ê·€?¬ì?)</option>
                <option value="'Nanum Pen Script', cursive">?˜ëˆ”?ê???/option>
              </select>
            </div>

            {/* ?œë¸Œ ë¬¸êµ¬ ?¤ì • (?ë‹¨ ë°°ë„ˆ ?„ìš©) */}
            {editorType === 'hero' && (
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem', background: '#fafafa', padding: '1rem', borderRadius: '8px', border: '1px solid #eee'}}>
                <div style={{flex: '1 1 100%'}}><strong style={{color: '#555'}}>?œë¸Œ ë¬¸êµ¬</strong></div>
                <input type="text" placeholder="?œë¸Œ ë¬¸êµ¬ ?…ë ¥" value={editingBanner.subtitle} onChange={(e) => setEditingBanner({...editingBanner, subtitle: e.target.value})} style={{flex: '3', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px'}} />
                <input type="number" placeholder="?¬ê¸°(?«ì)" value={editingBanner.subtitleSize} onChange={(e) => setEditingBanner({...editingBanner, subtitleSize: e.target.value})} style={{flex: '1', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px'}} title="ê¸€???¬ê¸°(px)" />
                <input type="color" value={editingBanner.subtitleColor} onChange={(e) => setEditingBanner({...editingBanner, subtitleColor: e.target.value})} style={{width: '50px', height: '40px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer'}} title="ê¸€???‰ìƒ" />
                <select value={editingBanner.subtitleFontFamily} onChange={(e) => setEditingBanner({...editingBanner, subtitleFontFamily: e.target.value})} style={{flex: '2', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px'}}>
                  <option value="'Noto Sans KR', sans-serif">ê³ ë”• (Noto Sans)</option>
                  <option value="'Noto Serif KR', serif">ëª…ì¡° (Noto Serif)</option>
                  <option value="'Nanum Gothic', sans-serif">?˜ëˆ”ê³ ë”•</option>
                  <option value="'Nanum Myeongjo', serif">?˜ëˆ”ëª…ì¡°</option>
                  <option value="'Black Han Sans', sans-serif">ê²€?€ê³ ë”• (?êº¼?€)</option>
                  <option value="'Jua', sans-serif">ì£¼ì•„ì²?(?™ê??™ê?)</option>
                  <option value="'Do Hyeon', sans-serif">?„í˜„ì²?(ê°ì§„?œëª©)</option>
                  <option value="'Gowun Dodum', sans-serif">ê³ ìš´?‹ì?</option>
                  <option value="'Gowun Batang', serif">ê³ ìš´ë°”íƒ•</option>
                  <option value="'Dongle', sans-serif">?™ê? (ë§¤ìš°ê·€?¬ì?)</option>
                  <option value="'Nanum Pen Script', cursive">?˜ëˆ”?ê???/option>
                </select>
              </div>
            )}
          </div>

          <div style={{marginTop: '2rem', textAlign: 'center'}}>
            <button onClick={handleSaveBannerEditor} style={{padding: '1rem 4rem', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold'}}>
              ?€?¥í•˜ê¸?
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ?Œì› ì£¼ë¬¸ ?´ì—­ ëª¨ë‹¬ */}
    {selectedUserForOrders && (
      <div className="modal-overlay" onClick={() => setSelectedUserForOrders(null)}>
        <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto'}}>
          <button className="modal-close-btn" onClick={() => setSelectedUserForOrders(null)}>&times;</button>
          <h2 style={{fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', color: '#333'}}>
            {selectedUserForOrders.name} ?˜ì˜ ?Œì›?•ë³´ ë°?ì£¼ë¬¸?´ì—­
          </h2>
          
          <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '1.1rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>?Œì› ?•ë³´</h3>
            <p style={{marginBottom: '0.5rem'}}><strong>?´ë©”??(ID):</strong> {selectedUserForOrders.email}</p>
            <p style={{marginBottom: '0.5rem'}}><strong>?„í™”ë²ˆí˜¸:</strong> {selectedUserForOrders.phone || '?•ë³´ ?†ìŒ'}</p>
            <p style={{marginBottom: '0.5rem'}}><strong>ì£¼ì†Œì§€ ?•ë³´:</strong> {selectedUserForOrders.address ? `${selectedUserForOrders.address} ${selectedUserForOrders.detailAddress || ''}` : '?•ë³´ ?†ìŒ'}</p>
            <p style={{marginBottom: '0.5rem'}}><strong>ê°€?…ì¼:</strong> {new Date(selectedUserForOrders.createdAt).toLocaleDateString()}</p>
            <p style={{marginBottom: '0.5rem'}}><strong>ë³´ìœ  ?¬ì¸??</strong> {(selectedUserForOrders.points || 0).toLocaleString()} P</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>ì£¼ë¬¸ ?´ì—­</h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
              <input type="date" value={userOrderStartDate} onChange={e => setUserOrderStartDate(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', flex: 1, minWidth: 0 }} />
              <span style={{flexShrink: 0}}>~</span>
              <input type="date" value={userOrderEndDate} onChange={e => setUserOrderEndDate(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', flex: 1, minWidth: 0 }} />
            </div>
          </div>
          {selectedUserOrders.length === 0 ? (
            <p style={{textAlign: 'center', padding: '2rem', color: '#666'}}>ì£¼ë¬¸ ?´ì—­???†ìŠµ?ˆë‹¤.</p>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {selectedUserOrders.filter(order => {
                if (!userOrderStartDate && !userOrderEndDate) return true;
                const oDate = new Date(order.createdAt);
                if (userOrderStartDate) {
                  const sDate = new Date(userOrderStartDate);
                  sDate.setHours(0,0,0,0);
                  if (oDate < sDate) return false;
                }
                if (userOrderEndDate) {
                  const eDate = new Date(userOrderEndDate);
                  eDate.setHours(23,59,59,999);
                  if (oDate > eDate) return false;
                }
                return true;
              }).map(order => (
                <div key={order._id} style={{border: '1px solid #eee', borderRadius: '8px', padding: '1.5rem'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '0.8rem', marginBottom: '0.8rem'}}>
                    <div>
                      <span style={{fontWeight: 'bold', marginRight: '1rem'}}>{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span style={{color: '#666', fontSize: '0.9rem'}}>ì£¼ë¬¸ë²ˆí˜¸: {order.merchant_uid}</span>
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
                        {item.selectedOptionName && <div style={{fontSize: '0.85rem', color: '#666'}}>?µì…˜: {item.selectedOptionName}</div>}
                        <div style={{fontSize: '0.9rem'}}>{item.price.toLocaleString()}??x {item.quantity}ê°?/div>
                      </div>
                    </div>
                  ))}
                  <div style={{marginTop: '1.5rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-color)'}}>
                    ì´?ê²°ì œê¸ˆì•¡: {order.totalAmount.toLocaleString()}??
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '2rem', background: '#fff3cd', padding: '1.5rem', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#856404' }}>?¬ì¸??ì¶©ì „</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <input type="number" value={chargePointsAmount} onChange={e => setChargePointsAmount(e.target.value)} placeholder="ì¶©ì „???¬ì¸???…ë ¥" style={{ flex: 1, padding: '0.8rem', borderRadius: '4px', border: '1px solid #ffeeba' }} />
              <button onClick={async () => {
                if(!chargePointsAmount) return;
                try {
                  const api = await import('../api');
                  if (api.adminUpdateUser) {
                    await api.adminUpdateUser(selectedUserForOrders._id || selectedUserForOrders.id, { points: (selectedUserForOrders.points || 0) + Number(chargePointsAmount) });
                  } else {
                    console.log('adminUpdateUser API needed for backend persistence');
                  }
                  alert('?¬ì¸?¸ê? ì¶©ì „?˜ì—ˆ?µë‹ˆ??');
                  setSelectedUserForOrders({...selectedUserForOrders, points: (selectedUserForOrders.points || 0) + Number(chargePointsAmount)});
                  setUsers(prev => prev.map(u => (u._id === selectedUserForOrders._id || u.id === selectedUserForOrders.id) ? {...u, points: (u.points || 0) + Number(chargePointsAmount)} : u));
                  setChargePointsAmount('');
                } catch(e) {
                  alert('?¬ì¸??ì¶©ì „???¤íŒ¨?ˆìŠµ?ˆë‹¤.');
                }
              }} style={{ width: '100%', padding: '1rem', background: '#ffc107', color: '#212529', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>
                ì¶©ì „?˜ê¸°
              </button>
            </div>
          </div>

        </div>
      </div>
    )}

    {/* ì£¼ë¬¸ ?ì„¸(ë°°ì†¡ì§€ ?•ë³´) ëª¨ë‹¬ */}
    
      {/* ë¦¬ë·° ê´€ë¦?ëª¨ë‹¬ */}
      {selectedProductForReviews && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200}} onClick={() => setSelectedProductForReviews(null)}>
          <div style={{background: 'white', borderRadius: '16px', padding: '2.5rem', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', fontFamily: '"Pretendard", "Noto Sans KR", sans-serif'}} onClick={e => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
              <h2 style={{fontSize: '1.6rem', fontWeight: 'bold'}}>{selectedProductForReviews.name} - ë¦¬ë·° ê´€ë¦?/h2>
              <button onClick={() => setSelectedProductForReviews(null)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><X size={28} /></button>
            </div>
            
            {productReviews.length === 0 ? (
              <p style={{textAlign: 'center', color: '#888', padding: '3rem 0'}}>?‘ì„±??ë¦¬ë·°ê°€ ?†ìŠµ?ˆë‹¤.</p>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                {productReviews.map(review => (
                  <div key={review._id} style={{padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px dashed #ddd', paddingBottom: '0.5rem'}}>
                      <strong style={{fontSize: '1.1rem'}}>{review.userName} <span style={{color: '#999', fontSize: '0.9rem'}}>({review.rating}??</span></strong>
                      <button onClick={() => handleReviewDelete(review._id)} style={{background: '#ff4757', color: 'white', border: 'none', borderRadius: '4px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.9rem'}}>ë¦¬ë·° ?? œ</button>
                    </div>
                    <p style={{margin: '0 0 1rem 0', whiteSpace: 'pre-wrap', color: '#444'}}>{review.content}</p>
                    {review.images && review.images.length > 0 && (
                      <div style={{display: 'flex', gap: '0.5rem', overflowX: 'auto'}}>
                        {review.images.map((img, idx) => {
                          const isFeatured = (selectedProductForReviews.featuredPhotos || []).includes(img);
                          return (
                            <div key={idx} style={{position: 'relative', flexShrink: 0}}>
                              <img src={img} alt="review" style={{width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: isFeatured ? '3px solid #ffc107' : '1px solid #ddd'}} />
                              <button onClick={() => handleFeaturePhoto(img)} style={{position: 'absolute', bottom: '5px', left: '50%', transform: 'translateX(-50%)', background: isFeatured ? '#ffc107' : 'rgba(0,0,0,0.6)', color: isFeatured ? '#000' : 'white', border: 'none', borderRadius: '20px', padding: '0.2rem 0.6rem', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap'}}>
                                {isFeatured ? '? ì •?? : '?¬í† ??}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedOrderDetails && (
      <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}} onClick={() => setSelectedOrderDetails(null)}>
        <div style={{background: 'white', borderRadius: '16px', padding: '2.5rem', width: '90%', maxWidth: '650px', maxHeight: '85vh', overflowY: 'auto', fontFamily: '"Jua", "Pretendard", sans-serif'}} onClick={e => e.stopPropagation()}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
            <h2 style={{fontSize: '1.6rem', fontWeight: 'bold'}}>ì£¼ë¬¸ ?ì„¸ ?´ì—­</h2>
            <button onClick={() => setSelectedOrderDetails(null)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><X size={28} /></button>
          </div>
          
          {/* ?í’ˆ ?•ë³´ ?´ì—­ */}
          <div style={{marginBottom: '2rem'}}>
            <h3 style={{fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)', borderBottom: '2px solid #eee', paddingBottom: '0.8rem', marginBottom: '1.5rem'}}>ì£¼ë¬¸ ?í’ˆ ?•ë³´</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {selectedOrderDetails.items.map((item, idx) => (
                <div key={idx} style={{display: 'flex', alignItems: 'center', gap: '1.2rem', background: '#f8f9fa', padding: '1.2rem', borderRadius: '8px'}}>
                  {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px'}} />}
                  <div style={{flex: 1}}>
                    <div style={{fontWeight: 'bold', fontSize: '1.2rem', color: '#333'}}>{item.name}</div>
                    {item.selectedOptionName && <div style={{fontSize: '1rem', color: '#666', marginTop: '0.3rem'}}>?µì…˜: {item.selectedOptionName}</div>}
                    <div style={{fontSize: '1.1rem', color: '#444', marginTop: '0.3rem'}}>{item.price.toLocaleString()}??x <strong style={{color: 'var(--primary-color)'}}>{item.quantity}ê°?/strong></div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop: '1.5rem', textAlign: 'right', fontSize: '1.4rem', fontWeight: 'bold'}}>
              ì´?ê²°ì œê¸ˆì•¡: <span style={{color: 'var(--primary-color)'}}>{selectedOrderDetails.totalAmount.toLocaleString()}??/span>
            </div>
          </div>

          {/* ë°°ì†¡ì§€ ?•ë³´ ?´ì—­ */}
          <div>
            <h3 style={{fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)', borderBottom: '2px solid #eee', paddingBottom: '0.8rem', marginBottom: '1.5rem'}}>ë°°ì†¡ì§€ ?•ë³´</h3>
            <div style={{padding: '1.8rem', background: '#f8f9fa', borderRadius: '8px', fontSize: '1.1rem'}}>
              <p style={{marginBottom: '1rem', display: 'flex', justifyContent: 'space-between'}}>
                <strong style={{color: '#555', minWidth: '100px'}}>?˜ë ¹??/strong> 
                <span style={{textAlign: 'right'}}>{selectedOrderDetails.shippingInfo?.receiverName || '?•ë³´ ?†ìŒ'}</span>
              </p>
              <p style={{marginBottom: '1rem', display: 'flex', justifyContent: 'space-between'}}>
                <strong style={{color: '#555', minWidth: '100px'}}>?°ë½ì²?/strong> 
                <span style={{textAlign: 'right'}}>{selectedOrderDetails.shippingInfo?.receiverPhone || '?•ë³´ ?†ìŒ'}</span>
              </p>
              <p style={{marginBottom: '1rem', display: 'flex', justifyContent: 'space-between'}}>
                <strong style={{color: '#555', minWidth: '100px'}}>?°í¸ë²ˆí˜¸</strong> 
                <span style={{textAlign: 'right'}}>{selectedOrderDetails.shippingInfo?.zonecode || '?•ë³´ ?†ìŒ'}</span>
              </p>
              <div style={{marginBottom: '1rem'}}>
                <strong style={{color: '#555', display: 'block', marginBottom: '0.5rem'}}>ì£¼ì†Œ</strong> 
                <div style={{background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #ddd', lineHeight: '1.5'}}>
                  {selectedOrderDetails.shippingInfo?.address || '?•ë³´ ?†ìŒ'}<br/>
                  {selectedOrderDetails.shippingInfo?.detailAddress || ''}
                </div>
              </div>
              <div style={{marginBottom: '1rem'}}>
                <strong style={{color: '#555', display: 'block', marginBottom: '0.5rem'}}>ê³µë™?„ê? ë¹„ë?ë²ˆí˜¸</strong> 
                <div style={{background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #ddd', color: 'var(--primary-color)', fontWeight: 'bold'}}>
                  {selectedOrderDetails.shippingInfo?.doorPassword || '?†ìŒ'}
                </div>
              </div>
              <div style={{marginBottom: '1rem'}}>
                <strong style={{color: '#555', display: 'block', marginBottom: '0.5rem'}}>ë°°ì†¡ ë©”ëª¨</strong> 
                <div style={{background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #ddd', minHeight: '60px'}}>
                  {selectedOrderDetails.shippingInfo?.memo || '?†ìŒ'}
                </div>
              </div>
              <div>
                <strong style={{color: '#555', display: 'block', marginBottom: '0.5rem'}}>ê¸°í? ë©”ëª¨</strong> 
                <div style={{background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #ddd', minHeight: '60px'}}>
                  {selectedOrderDetails.shippingInfo?.extraMemo || '?†ìŒ'}
                </div>
              </div>
            </div>
          </div>

          {/* ?´ë ˆ??ë°˜í’ˆ) ?•ë³´ ?´ì—­ */}
          {selectedOrderDetails.claim && selectedOrderDetails.claim.type && (
            <div style={{marginTop: '2rem'}}>
              <h3 style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#e74c3c', borderBottom: '2px solid #eee', paddingBottom: '0.8rem', marginBottom: '1.5rem'}}>
                ë°˜í’ˆ(?˜ë¶ˆ) ?”ì²­ ?•ë³´
              </h3>
              <div style={{padding: '1.8rem', background: '#fff5f5', borderRadius: '8px', border: '1px solid #ffcece', fontSize: '1.1rem'}}>
                <p style={{marginBottom: '1rem', display: 'flex', justifyContent: 'space-between'}}>
                  <strong style={{color: '#555', minWidth: '100px'}}>?”ì²­ ?¬ìœ </strong> 
                  <span style={{textAlign: 'right'}}>{selectedOrderDetails.claim.reason} {selectedOrderDetails.claim.reason === 'ê¸°í?' ? `(${selectedOrderDetails.claim.customReason})` : ''}</span>
                </p>
                {(selectedOrderDetails.claim.imageUrls || (selectedOrderDetails.claim.imageUrl ? [selectedOrderDetails.claim.imageUrl] : [])).length > 0 && (
                  <div style={{marginBottom: '1rem'}}>
                    <strong style={{color: '#555', display: 'block', marginBottom: '0.5rem'}}>ì²¨ë? ?¬ì§„</strong>
                    <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                      {(selectedOrderDetails.claim.imageUrls || (selectedOrderDetails.claim.imageUrl ? [selectedOrderDetails.claim.imageUrl] : [])).map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noreferrer">
                          <img src={url} alt={`?´ë ˆ???´ë?ì§€ ${idx+1}`} style={{width: '120px', height: '120px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd'}} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                

              </div>
            </div>
          )}

          <button onClick={() => setSelectedOrderDetails(null)} style={{width: '100%', padding: '1rem', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', fontFamily: 'inherit', marginTop: '2rem'}}>
            ?«ê¸°
          </button>
        </div>
      </div>
    )}
  </>
  );
}

export default Admin;
