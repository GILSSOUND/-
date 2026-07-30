import React, { useState, useEffect } from 'react';
import { fetchProducts, createProduct, deleteProduct, uploadImage } from '../api';

function Admin() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'mealkit',
    originalPrice: '',
    price: '',
    discount: '',
    isNewProduct: false,
    isBest: false
  });
  const [imageFile, setImageFile] = useState(null);
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
      setImageFile(e.target.files[0]);
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
      // 1. 이미지 업로드 (ImgBB)
      const uploadRes = await uploadImage(imageFile);
      const imageUrl = uploadRes.imageUrl;

      // 2. 상품 데이터 저장 (MongoDB)
      const newProduct = {
        ...formData,
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        price: Number(formData.price),
        imageUrl
      };

      await createProduct(newProduct);
      alert("상품이 성공적으로 등록되었습니다!");
      
      // 폼 초기화 및 목록 갱신
      setFormData({
        name: '', category: 'mealkit', originalPrice: '', price: '', discount: '', isNewProduct: false, isBest: false
      });
      setImageFile(null);
      e.target.reset();
      loadProducts();
    } catch (error) {
      console.error(error);
      alert("상품 등록 실패: " + (error.response?.data?.error || error.message));
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

  return (
    <div className="page-container" style={{maxWidth: '1400px'}}>
      <h2 className="page-title">⚙️ 관리자 대시보드 (풀스택)</h2>
      
      <div style={{display: 'flex', gap: '3rem', flexWrap: 'wrap'}}>
        
        {/* 왼쪽: 등록 폼 */}
        <div style={{flex: 1, minWidth: '400px', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
          <h3 style={{marginBottom: '1.5rem'}}>신규 상품 등록</h3>
          <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>상품명</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}} />
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
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>원래 가격 (원, 옵션)</label>
                <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}} />
              </div>
              <div style={{flex: 1}}>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>할인 문구 (옵션)</label>
                <input type="text" name="discount" value={formData.discount} onChange={handleChange} placeholder="예: 30%" style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}} />
              </div>
            </div>

            <div style={{display: 'flex', gap: '2rem', margin: '1rem 0'}}>
              <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                <input type="checkbox" name="isNewProduct" checked={formData.isNewProduct} onChange={handleChange} />
                NEW 배지 달기
              </label>
              <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                <input type="checkbox" name="isBest" checked={formData.isBest} onChange={handleChange} />
                BEST 배지 달기
              </label>
            </div>

            <div>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>상품 사진 (내 컴퓨터에서 선택)</label>
              <input type="file" accept="image/*" onChange={handleFileChange} required style={{width: '100%', padding: '0.5rem', border: '1px dashed #ccc', borderRadius: '8px'}} />
              <p style={{fontSize: '0.85rem', color: '#888', marginTop: '0.5rem'}}>사진은 서버를 거쳐 클라우드(ImgBB)에 안전하게 영구 저장됩니다.</p>
            </div>

            <button type="submit" className="primary-btn" disabled={uploading} style={{marginTop: '1rem'}}>
              {uploading ? '업로드 및 저장 중...' : '상품 등록하기'}
            </button>
          </form>
        </div>

        {/* 오른쪽: 상품 목록 */}
        <div style={{flex: 2, minWidth: '500px', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
          <h3 style={{marginBottom: '1.5rem'}}>등록된 상품 목록 ({products.length}개)</h3>
          
          {products.length === 0 ? (
            <div style={{textAlign: 'center', padding: '3rem', color: '#888'}}>
              등록된 상품이 없습니다. 백엔드 서버가 켜져있는지, DB 연결이 정상인지 확인하세요.
            </div>
          ) : (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', maxHeight: '700px', overflowY: 'auto', paddingRight: '1rem'}}>
              {products.map(p => (
                <div key={p._id} style={{border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden'}}>
                  <img src={p.imageUrl} alt={p.name} style={{width: '100%', height: '150px', objectFit: 'cover'}} />
                  <div style={{padding: '1rem'}}>
                    <h4 style={{fontSize: '1rem', marginBottom: '0.5rem'}}>{p.name}</h4>
                    <p style={{fontWeight: 'bold', color: 'var(--primary-color)'}}>{p.price.toLocaleString()}원</p>
                    <button 
                      onClick={() => handleDelete(p._id)}
                      style={{marginTop: '1rem', width: '100%', padding: '0.5rem', background: '#f5f6fa', color: '#ff4757', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}
                    >
                      삭제하기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Admin;
