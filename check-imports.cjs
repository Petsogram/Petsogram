const fs = require('fs');

const code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Extract the lucide-react import block
const importMatch = code.match(/import\s*{([^}]+)}\s*from\s*['"]lucide-react['"]/);
if (!importMatch) {
  console.log("No lucide-react import found");
  process.exit(1);
}
const importedIcons = importMatch[1]
  .split(',')
  .map(i => i.trim().split(/\s+as\s+/)[0]) // handle 'Home as HomeIcon'
  .map(i => i.trim())
  .filter(Boolean);

// Handle aliases specifically if needed (e.g., Home as HomeIcon means HomeIcon is used in code)
const aliases = importMatch[1].split(',').map(i => i.trim()).filter(i => i.includes(' as '));
const aliasMap = {};
aliases.forEach(a => {
  const [orig, alias] = a.split(/\s+as\s+/);
  aliasMap[alias] = orig;
});
const availableIcons = [...importedIcons, ...Object.keys(aliasMap)];

// 2. Extract all JSX components starting with uppercase <MyComp
const jsxMatch = code.matchAll(/<([A-Z][A-Za-z0-9]+)/g);
const usedComponents = new Set();
for (const match of jsxMatch) {
  usedComponents.add(match[1]);
}

// 3. Extract all component references like `icon: Shield`
const propMatch = code.matchAll(/(?:icon|return)\s*:?\s*([A-Z][A-Za-z0-9]+)/g);
for (const match of propMatch) {
  usedComponents.add(match[1]);
}

// Internal components defined in App.jsx
const internalComponents = [
  'ErrorBoundary', 'LocationProvider', 'MikoChatbot', 'RelativeTime', 
  'ImageWithFallback', 'RewardsProvider', 'BadgeProvider', 'DonationProvider',
  'DonationContext', 'BadgeContext', 'RewardsContext',
  'SectionHeading', 'Badge', 'Button', 'Card', 'Counter', 'NotificationPanel',
  'SearchOverlay', 'Navbar', 'Footer', 'PetsogramApp',
  'DiscoverPage', 'ServicesPage', 'DonatePage', 'EmergencyPage', 'AdoptPage',
  'AnimalProfilePage', 'RehomingPage', 'DashboardPage', 'ProfilePage',
  'CommunityPage', 'MarketplacePage', 'EventsPage', 'ProviderDashboard', 'RankIcon'
];

// Add react/routing things
internalComponents.push('React', 'Router', 'Routes', 'Route', 'Link', 'Provider');

const missing = [];
for (const comp of usedComponents) {
  if (internalComponents.includes(comp)) continue;
  if (!availableIcons.includes(comp)) {
    missing.push(comp);
  }
}

console.log("MISSING POTENTIAL ICONS:", missing);
