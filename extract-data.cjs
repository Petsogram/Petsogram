const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'App.jsx');
const src = fs.readFileSync(srcPath, 'utf8');

const parts = src.split(/\/\* -+ (.*?) -+ \*\//g);
const sections = {};
for (let i = 1; i < parts.length; i += 2) {
    sections[parts[i].trim()] = parts[i+1];
}

// 1. Extract Mock Data
let mockDataContent = `// Auto-extracted mock data
`;
mockDataContent += sections['MOCK DATA'] || '';
mockDataContent += sections['REWARDS: CONFIG & RULES'] || '';

// Export all the constants
mockDataContent = mockDataContent.replace(/const /g, 'export const ');
mockDataContent = mockDataContent.replace(/function parseRupees/g, 'export function parseRupees');
mockDataContent = mockDataContent.replace(/function pointsToDiscountValue/g, 'export function pointsToDiscountValue');
mockDataContent = mockDataContent.replace(/function calculateMarketplaceDiscount/g, 'export function calculateMarketplaceDiscount');
mockDataContent = mockDataContent.replace(/function calculateEventDiscount/g, 'export function calculateEventDiscount');
mockDataContent = mockDataContent.replace(/function canRedeemPoints/g, 'export function canRedeemPoints');
mockDataContent = mockDataContent.replace(/export export const/g, 'export const'); // fixing double exports if any

fs.mkdirSync(path.join(__dirname, 'src', 'data'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'src', 'data', 'mockData.js'), mockDataContent);

console.log("Extracted mockData.js");
