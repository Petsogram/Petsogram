const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'App.jsx');
const src = fs.readFileSync(srcPath, 'utf8');

const lines = src.split('\n');
const start = lines.findIndex(l => l.includes('function EmergencyPage'));
const block = lines.slice(start, start + 300).join('\n');
fs.writeFileSync(path.join(__dirname, 'emergencypage.txt'), block);
