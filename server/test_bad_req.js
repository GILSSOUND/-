const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 5001,
  path: '/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data'
  }
}, (res) => {
  console.log('Status:', res.statusCode);
  res.on('data', d => process.stdout.write(d));
});

req.on('error', e => console.error('Error:', e));
req.write('dummy data');
req.end();
