const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'App.jsx');
let src = fs.readFileSync(srcPath, 'utf8');

// Replace mock data sections with imports
const mockDataRegex = /\/\* ---------------------------------- MOCK DATA ---------------------------------- \*\/[\s\S]*?\/\* ---------------------------------- REWARDS: CONTEXT \/ PROVIDER ---------------------------------- \*\//;

const importStatement = `/* ---------------------------------- REWARDS: CONTEXT / PROVIDER ---------------------------------- */\nimport { ANIMALS, PROVIDERS, EVENTS, POSTS, PRODUCTS, SERVICES, rewardsConfig, REWARD_RULES, parseRupees, pointsToDiscountValue, calculateMarketplaceDiscount, calculateEventDiscount, canRedeemPoints } from './data/mockData';\n`;

src = src.replace(mockDataRegex, importStatement);

fs.writeFileSync(srcPath, src);
console.log("Updated App.jsx with mockData imports");
