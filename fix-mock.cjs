const fs = require('fs');
let s = fs.readFileSync('src/data/mockData.js', 'utf8');
s = s.replace(/(\s+)export const /g, '$1const ');
fs.writeFileSync('src/data/mockData.js', s);
