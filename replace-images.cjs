const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data', 'mockData.js');
let src = fs.readFileSync(filePath, 'utf8');

const replacements = [
  {
    old: '"https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600"', // Bruno (Dog)
    newImg: '"https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80"'
  },
  {
    old: '"https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600"', // Luna (Cat)
    newImg: '"https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80"'
  },
  {
    old: '"https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600"', // Milo (Dog)
    newImg: '"https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80"'
  },
  // Skip Coco (Bird) 1452570053594
  {
    old: '"https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600"', // Max (Dog)
    newImg: '"https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=80"'
  },
  {
    old: '"https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600"', // Simba (Cat/Kitten)
    newImg: '"https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&w=900&q=80"'
  }
];

replacements.forEach(r => {
  src = src.replace(r.old, r.newImg);
});

fs.writeFileSync(filePath, src);
