const fs = require('fs');

const path = 'c:/Users/kimsj/Desktop/songildong/gilsmall/src/pages/Admin.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Insert "품절관리" button
const btnSearch = `<List size={16} /><span className="action-text">리뷰관리</span>
                      </button>`;
const btnReplace = btnSearch + `
                      <button 
                        onClick={() => openStockManager(p)}
                        style={{padding: '0.6rem 1rem', background: '#fff3cd', color: '#856404', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600'}}
                      >
                        <PackagePlus size={16} /><span className="action-text">품절관리</span>
                      </button>`;
content = content.replace(btnSearch, btnReplace);

// 2. Insert `openStockManager` and `handleSaveStock` functions
const funcSearch = `  const handleReviewDelete = async (reviewId) => {`;
const funcInsert = `  const openStockManager = (product) => {
    setStockModalProduct(product);
    setStockOptions(product.options || []);
    setIsAllSoldOut(product.isSoldOut || false);
  };

  const handleStockOptionChange = (idx, checked) => {
    const newOptions = [...stockOptions];
    newOptions[idx].isSoldOut = checked;
    setStockOptions(newOptions);
    setIsAllSoldOut(newOptions.every(opt => opt.isSoldOut));
  };

  const handleAllSoldOutChange = (checked) => {
    setIsAllSoldOut(checked);
    setStockOptions(stockOptions.map(opt => ({...opt, isSoldOut: checked})));
  };

  const handleSaveStock = async () => {
    try {
      const updatedProduct = {
        ...stockModalProduct,
        options: stockOptions,
        isSoldOut: isAllSoldOut || (stockOptions.length > 0 && stockOptions.every(opt => opt.isSoldOut))
      };
      await updateProduct(stockModalProduct._id || stockModalProduct.id, updatedProduct);
      alert('품절 상태가 저장되었습니다.');
      setStockModalProduct(null);
      loadProducts();
      if (typeof refreshGlobalProducts === 'function') refreshGlobalProducts();
    } catch (error) {
      alert('품절 상태 저장 실패');
    }
  };

`;
content = content.replace(funcSearch, funcInsert + funcSearch);

// 3. Insert Modal JSX at the end of the return statement
const modalSearch = `      {/* 관리자 회원 주문 내역 모달 */}`;
const modalInsert = `      {/* 품절 관리 모달 */}
      {stockModalProduct && (
        <div className="modal-overlay" onClick={() => setStockModalProduct(null)} style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h3 style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{stockModalProduct.name} - 품절 관리</h3>
              <button onClick={() => setStockModalProduct(null)} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem'}}>&times;</button>
            </div>
            
            <div style={{marginBottom: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd'}}>
              <label style={{display: 'flex', alignItems: 'center', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem'}}>
                <input 
                  type="checkbox" 
                  checked={isAllSoldOut}
                  onChange={(e) => handleAllSoldOutChange(e.target.checked)}
                  style={{marginRight: '0.8rem', width: '20px', height: '20px'}}
                />
                전체 품절 (선택 시 상품 전체 구매 불가)
              </label>
            </div>

            <div style={{marginBottom: '1.5rem'}}>
              <h4 style={{marginBottom: '1rem', fontWeight: 'bold'}}>옵션별 품절 설정</h4>
              {stockOptions.length === 0 ? (
                <p style={{color: '#666'}}>이 상품은 옵션이 없습니다. (위의 '전체 품절'만 사용 가능)</p>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
                  {stockOptions.map((opt, idx) => (
                    <label key={idx} style={{display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.8rem', border: '1px solid #eee', borderRadius: '6px'}}>
                      <input 
                        type="checkbox" 
                        checked={opt.isSoldOut || false}
                        onChange={(e) => handleStockOptionChange(idx, e.target.checked)}
                        style={{marginRight: '0.8rem', width: '18px', height: '18px'}}
                      />
                      {opt.name} {opt.additionalPrice > 0 ? \`(+ \${opt.additionalPrice}원)\` : ''}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
              <button onClick={() => setStockModalProduct(null)} style={{padding: '0.8rem 1.5rem', background: '#f1f2f6', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>취소</button>
              <button onClick={handleSaveStock} style={{padding: '0.8rem 1.5rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>저장하기</button>
            </div>
          </div>
        </div>
      )}

`;
content = content.replace(modalSearch, modalInsert + modalSearch);

fs.writeFileSync(path, content);
console.log('Admin.jsx fully updated for Stock Management.');
