const fs = require('fs');

const path = 'c:/Users/kimsj/Desktop/songildong/gilsmall/src/pages/Home.jsx';
let content = fs.readFileSync(path, 'utf8');

// The product card img container
const searchStr = `<div className="card-img-container">
                <img src={product.imageUrl} alt={product.name} loading="lazy" decoding="async" className="card-img" />`;

const replaceStr = `<div className="card-img-container">
                <img src={product.imageUrl} alt={product.name} loading="lazy" decoding="async" className="card-img" />
                {product.isSoldOut && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '1.5rem', fontWeight: 'bold', zIndex: 10, letterSpacing: '2px'
                  }}>
                    일시품절
                  </div>
                )}`;

content = content.replace(searchStr, replaceStr);

fs.writeFileSync(path, content);
console.log('Home.jsx updated for sold out overlay');
