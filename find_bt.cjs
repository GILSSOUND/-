const fs = require('fs');
const lines = fs.readFileSync('src/pages/Admin.jsx', 'utf8').split('\n');
let bt = 0;
for(let i=0; i<lines.length; i++) {
  let count = 0;
  for(let c of lines[i]) if (c === '`') count++;
  bt += count;
  if(count > 0 && bt % 2 !== 0) console.log(i+1, lines[i].trim());
}
