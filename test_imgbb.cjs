const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testImgBB() {
  try {
    const formData = new FormData();
    formData.append('image', Buffer.from('test'), 'test.jpg');
    const IMGBB_KEY = 'aaa7883871d2df3a5f6e47a2ed97e0f8';
    const res = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, formData, {
      headers: formData.getHeaders()
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
testImgBB();
