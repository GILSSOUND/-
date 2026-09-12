const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
  try {
    const formData = new FormData();
    formData.append('image', fs.createReadStream('test_real.jpg'));
    
    console.log('Sending request...');
    const res = await axios.post('http://localhost:5000/api/upload', formData, {
      headers: formData.getHeaders()
    });
    console.log('Success:', res.data);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) console.error(error.response.data);
  }
}
testUpload();
