const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const https = require('https');

async function downloadAndTest() {
  const file = fs.createWriteStream('test.jpg');
  https.get('https://picsum.photos/200/300', function(response) {
    response.pipe(file);
    file.on('finish', async function() {
      file.close();
      try {
        const formData = new FormData();
        formData.append('image', fs.createReadStream('test.jpg'));
        
        console.log('Sending request...');
        const res = await axios.post('http://localhost:5000/api/upload', formData, {
          headers: formData.getHeaders()
        });
        console.log('Success:', res.data);
      } catch (error) {
        console.error('Error:', error.message);
        if (error.response) console.error(error.response.data);
      }
    });
  });
}
downloadAndTest();
