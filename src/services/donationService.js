import { DONATION_HISTORY, DONATION_FUND_DATA } from '../data/mockData';

const GLOBAL_DONATION_KEY = 'petsogram_global_donations';

export function getGlobalDonations() {
  try {
    const raw = localStorage.getItem(GLOBAL_DONATION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse donations from localStorage", e);
  }
  // Fallback to seeding with mock data if missing
  localStorage.setItem(GLOBAL_DONATION_KEY, JSON.stringify(DONATION_HISTORY));
  return DONATION_HISTORY;
}

export function getTotalDonated() {
  const donations = getGlobalDonations();
  return donations.reduce((sum, d) => sum + (d.amount || 0), 0);
}

export function getUserDonations(userId) {
  if (!userId) return [];
  const donations = getGlobalDonations();
  return donations.filter(d => d.userId === userId);
}

export function addDonation(donation) {
  const donations = getGlobalDonations();
  const entry = {
    id: `PS-DON-${Math.floor(100000 + Math.random() * 900000)}`,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: 'Completed',
    beneficiary: 'Petsogram Fund',
    ...donation
  };
  donations.unshift(entry);
  localStorage.setItem(GLOBAL_DONATION_KEY, JSON.stringify(donations));
  return entry;
}

const CATEGORY_FUNDS_KEY = 'petsogram_category_funds';

// Ensure data is synced with mockData initially if empty


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
