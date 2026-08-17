const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');

const sIdx = content.indexOf('function SettingsPage');
const pIdx = content.indexOf('function PetsogramApp');
console.log(content.substring(sIdx, pIdx));
