const fs = require('fs');
const path = require('path');

const appFile = path.join(__dirname, 'src', 'App.jsx');
const content = fs.readFileSync(appFile, 'utf8');

const profileIdx = content.indexOf('function ProfilePage');
const settingsIdx = content.indexOf('function SettingsPage');

const profileStr = content.substring(profileIdx, settingsIdx);
console.log(profileStr);
