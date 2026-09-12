const express = require('express');
const multer = require('multer');
const app = express();

app.post('/upload', multer().single('image'), (req, res) => {
  res.send('ok');
});

// Express default error handler
app.listen(5001, () => {
  console.log('Test server running');
});
