const fs = require('fs');

const appFile = 'src/App.jsx';
const appEndFile = 'AppEnd.jsx';

let content = fs.readFileSync(appFile, 'utf8');
const endContent = fs.readFileSync(appEndFile, 'utf8');

const pIdx = content.lastIndexOf('function ProfilePage({ setPage }) {');
if (pIdx !== -1) {
  content = content.substring(0, pIdx) + endContent;
  fs.writeFileSync(appFile, content);
  console.log("Successfully rebuilt App.jsx!");
} else {
  console.log("Could not find ProfilePage in App.jsx");
}
