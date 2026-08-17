const fs = require('fs');
const path = require('path');

const destFile = path.join(__dirname, 'src', 'services', 'donationService.js');
let destCode = fs.readFileSync(destFile, 'utf8');

const newLogic = `
const CATEGORY_FUNDS_KEY = 'petsogram_category_funds';

// Ensure data is synced with mockData initially if empty
import { DONATION_FUND_DATA } from '../data/mockData';

export function getCategoryFunds() {
  try {
    const raw = localStorage.getItem(CATEGORY_FUNDS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse category funds", e);
  }
  
  // Create an initial structure from mockData
  const initial = {};
  for (const [cat, data] of Object.entries(DONATION_FUND_DATA)) {
    initial[cat] = {
      totalFund: data.received,
      usedFund: data.utilized,
      targetFund: data.target
    };
  }
  
  localStorage.setItem(CATEGORY_FUNDS_KEY, JSON.stringify(initial));
  return initial;
}

export function getCategoryFund(category) {
  const funds = getCategoryFunds();
  return funds[category] || { totalFund: 0, usedFund: 0, targetFund: 0 };
}

export function updateCategoryFund(category, amount) {
  const funds = getCategoryFunds();
  if (!funds[category]) {
    funds[category] = { totalFund: 0, usedFund: 0, targetFund: 0 };
  }
  funds[category].totalFund += amount;
  localStorage.setItem(CATEGORY_FUNDS_KEY, JSON.stringify(funds));
  return funds;
}

export function calculateAvailableFund(totalFund, usedFund) {
  return Math.max(0, totalFund - usedFund);
}

export function calculateRequiredFund(targetFund, availableFund) {
  return Math.max(0, targetFund - availableFund);
}

export function calculateUtilization(totalFund, usedFund) {
  if (totalFund === 0) return 0;
  return Math.min(100, Math.max(0, (usedFund / totalFund) * 100));
}
`;

if (!destCode.includes("CATEGORY_FUNDS_KEY")) {
    // Replace the first line to include DONATION_FUND_DATA
    destCode = destCode.replace(
        "import { DONATION_HISTORY } from '../data/mockData';",
        "import { DONATION_HISTORY, DONATION_FUND_DATA } from '../data/mockData';"
    );
    // Remove the redundant import inside newLogic
    const cleanLogic = newLogic.replace("import { DONATION_FUND_DATA } from '../data/mockData';", "");
    
    destCode += cleanLogic;
    fs.writeFileSync(destFile, destCode);
    console.log("Successfully updated donationService.js with category fund logic.");
} else {
    console.log("Category fund logic already exists in donationService.js.");
}
