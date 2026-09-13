const fs = require('fs');
const path = 'c:/Users/kimsj/Desktop/songildong/gilsmall/src/pages/ProductDetail.jsx';
let content = fs.readFileSync(path, 'utf8');

// Update Option Dropdown
const optionSearch = `<option value="">옵션을 선택하세요</option>
                  {product.options.map((opt, idx) => (
                    <option key={idx} value={opt.name}>
                      {opt.name} {opt.additionalPrice > 0 ? \`(+\${formatPrice(opt.additionalPrice)}원)\` : ''}
                    </option>
                  ))}`;
const optionReplace = `<option value="">옵션을 선택하세요</option>
                  {product.options.map((opt, idx) => (
                    <option key={idx} value={opt.name} disabled={opt.isSoldOut}>
                      {opt.name} {opt.additionalPrice > 0 ? \`(+\${formatPrice(opt.additionalPrice)}원)\` : ''} {opt.isSoldOut ? '[품절]' : ''}
                    </option>
                  ))}`;
content = content.replace(optionSearch, optionReplace);

// Update Desktop Buttons
const desktopBtnSearch = `<button className="outline-btn cart" onClick={onAddToCartClick} style={{ flex: 1, height: '54px', borderRadius: '8px', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', background: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
                장바구니 담기
              </button>
              <button className="primary-btn buy" onClick={(e) => { requireAuth(() => { const success = onAddToCartClick(e); if(success) navigate('/cart'); }); }} style={{ flex: 1, height: '54px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
                구매하기
              </button>`;
const desktopBtnReplace = `{product.isSoldOut ? (
                <button disabled style={{ flex: 2, height: '54px', borderRadius: '8px', border: 'none', background: '#ccc', color: '#fff', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'not-allowed' }}>
                  일시품절
                </button>
              ) : (
                <>
                  <button className="outline-btn cart" onClick={onAddToCartClick} style={{ flex: 1, height: '54px', borderRadius: '8px', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', background: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
                    장바구니 담기
                  </button>
                  <button className="primary-btn buy" onClick={(e) => { requireAuth(() => { const success = onAddToCartClick(e); if(success) navigate('/cart'); }); }} style={{ flex: 1, height: '54px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
                    구매하기
                  </button>
                </>
              )}`;
content = content.replace(desktopBtnSearch, desktopBtnReplace);

// Update Mobile Buttons
const mobileBtnSearch = `<div className="mobile-action-buttons" style={{
        position: 'fixed', bottom: 0, left: 0, width: '100%', height: '70px', background: 'white', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.5rem', zIndex: 1000, boxShadow: '0 -2px 10px rgba(0,0,0,0.05)', boxSizing: 'border-box'
      }}>
        <button onClick={(e) => handleToggleWishlist(product, e)} style={{ flex: '0 0 50px', height: '50px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff6b00', cursor: 'pointer' }}>
          <Heart size={24} />
        </button>
        <button onClick={onAddToCartClick} style={{ flex: 1, height: '50px', borderRadius: '8px', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', background: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>장바구니</button>
        <button onClick={(e) => { requireAuth(() => { const success = onAddToCartClick(e); if(success) navigate('/cart'); }); }} style={{ flex: 1, height: '50px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>바로구매</button>
      </div>`;

const mobileBtnReplace = `<div className="mobile-action-buttons" style={{
        position: 'fixed', bottom: 0, left: 0, width: '100%', height: '70px', background: 'white', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.5rem', zIndex: 1000, boxShadow: '0 -2px 10px rgba(0,0,0,0.05)', boxSizing: 'border-box'
      }}>
        <button onClick={(e) => handleToggleWishlist(product, e)} style={{ flex: '0 0 50px', height: '50px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff6b00', cursor: 'pointer' }}>
          <Heart size={24} />
        </button>
        {product.isSoldOut ? (
          <button disabled style={{ flex: 2, height: '50px', borderRadius: '8px', border: 'none', background: '#ccc', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'not-allowed' }}>일시품절</button>
        ) : (
          <>
            <button onClick={onAddToCartClick} style={{ flex: 1, height: '50px', borderRadius: '8px', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', background: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>장바구니</button>
            <button onClick={(e) => { requireAuth(() => { const success = onAddToCartClick(e); if(success) navigate('/cart'); }); }} style={{ flex: 1, height: '50px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>바로구매</button>
          </>
        )}
      </div>`;
content = content.replace(mobileBtnSearch, mobileBtnReplace);

fs.writeFileSync(path, content);
console.log('ProductDetail.jsx updated for sold out state');
