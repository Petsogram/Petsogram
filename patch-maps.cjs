const fs = require('fs');
const path = require('path');

const filesToPatch = [
  path.join(__dirname, 'src', 'App.jsx'),
  path.join(__dirname, 'src', 'components', 'MikoChatbot.jsx'),
  path.join(__dirname, 'src', 'contexts', 'NotificationContext.jsx')
];

for (const filePath of filesToPatch) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace array maps with optional chaining where array might be dynamic
    content = content.replace(/\b(results|items|notifications|nearby|filtered|cases|joinedCommunities|messages|quickActions|stats|journey|tabs|filtered|providers|rows|sections)\.map\(/g, '$1?.map(');
    content = content.replace(/\b(results\.slice\([^)]+\))\.map\(/g, '$1?.map(');
    content = content.replace(/\b(items\.slice\([^)]+\))\.map\(/g, '$1?.map(');
    
    fs.writeFileSync(filePath, content);
    console.log(`Patched maps in ${path.basename(filePath)}`);
  }
}
