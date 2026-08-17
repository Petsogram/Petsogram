const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');

const pIdx = content.indexOf('function ProfilePage');
const sIdx = content.indexOf('function SettingsPage');
console.log(content.substring(sIdx - 100, sIdx + 50));
