const fs = require('fs');
let s = fs.readFileSync('src/data/mockData.js', 'utf8');

const constants = ['ANIMALS', 'PROVIDERS', 'EVENTS', 'POSTS', 'PRODUCTS', 'SERVICES', 'rewardsConfig', 'REWARD_RULES'];
constants.forEach(c => {
    s = s.replace(new RegExp(`^const ${c}`, 'm'), `export const ${c}`);
});

fs.writeFileSync('src/data/mockData.js', s);
