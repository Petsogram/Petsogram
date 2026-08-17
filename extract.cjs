const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'src', 'App.jsx'), 'utf8');

// We will split the file by the comment headers
const parts = src.split(/\/\* -+ (.*?) -+ \*\//g);

const sections = {};
let currentKey = 'imports';
sections[currentKey] = parts[0];

for (let i = 1; i < parts.length; i += 2) {
    const key = parts[i].trim();
    const content = parts[i+1];
    sections[key] = content;
}

// Log keys to verify
console.log(Object.keys(sections));
