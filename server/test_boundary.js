const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
async function testBoundary() {
  const form = new FormData();
  form.append('image', fs.createReadStream('test_real.jpg'));
  
  try {
    const res = await axios.post('http://localhost:5000/api/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
      if (typeof err.response.data === 'string') {
        console.error('HTML Snippet:', err.response.data.slice(0, 100));
      }
    }
  }
}
testBoundary();
