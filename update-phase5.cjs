const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'App.jsx');
let src = fs.readFileSync(srcPath, 'utf8');

// 1. Pass setPage to MarketplacePage and EventsPage
src = src.replace(
  'events: <EventsPage toast={toast} />',
  'events: <EventsPage setPage={setPage} toast={toast} />'
);
src = src.replace(
  'marketplace: <MarketplacePage toast={toast} />',
  'marketplace: <MarketplacePage setPage={setPage} toast={toast} />'
);

// 2. Update EventsPage signature
src = src.replace(
  'function EventsPage({ toast }) {',
  'function EventsPage({ setPage, toast }) {'
);
src = src.replace(
  '<EventCard key={e.id} e={e} toast={toast} />',
  '<EventCard key={e.id} e={e} setPage={setPage} toast={toast} />'
);

// 3. Update MarketplacePage signature
src = src.replace(
  'function MarketplacePage({ toast }) {',
  'function MarketplacePage({ setPage, toast }) {'
);
src = src.replace(
  '<ProductCard key={p.id} p={p} tab={tab} toast={toast} />',
  '<ProductCard key={p.id} p={p} tab={tab} setPage={setPage} toast={toast} />'
);

// 4. Update ProductCard
src = src.replace(
  'function ProductCard({ p, tab, toast }) {',
  'function ProductCard({ p, tab, setPage, toast }) {\n    const auth = useAuth();'
);
src = src.replace(
  `const confirm = (tier) => {
      const { discount, finalPrice, maxDiscount } = calculateMarketplaceDiscount(tier.points, p.price);
      const ok = rewards.redeemPoints(tier.points, "marketplace", \`PROD-\${p.id}\`, discount);
      if (ok) { setRedemption({ points: tier.points, discount, finalPrice, maxDiscount }); setOpen(false); }
    };`,
  `const confirm = (tier) => {
      auth.requireAuthAction(() => {
        const { discount, finalPrice, maxDiscount } = calculateMarketplaceDiscount(tier.points, p.price);
        const ok = rewards.redeemPoints(tier.points, "marketplace", \`PROD-\${p.id}\`, discount);
        if (ok) { setRedemption({ points: tier.points, discount, finalPrice, maxDiscount }); setOpen(false); }
      }, setPage);
    };`
);

// 5. Update EventCard
src = src.replace(
  'function EventCard({ e, toast }) {',
  'function EventCard({ e, setPage, toast }) {\n    const auth = useAuth();'
);
src = src.replace(
  `const register = () => {
      if (applied) rewards.redeemPoints(applied.points, "event", \`EVENT-\${e.id}\`, applied.discount);
      setRegistered(true);
      toast.push(\`Registration confirmed for \${e.name}\`);
    };`,
  `const register = () => {
      auth.requireAuthAction(() => {
        if (applied) {
          const ok = rewards.redeemPoints(applied.points, "event", \`EVENT-\${e.id}\`, applied.discount);
          if (!ok) return; // Stop registration if they don't have enough points
        }
        setRegistered(true);
        toast.push(\`Registration confirmed for \${e.name}\`);
      }, setPage);
    };`
);

// We need to also wrap the markAttended function in EventCard just in case
src = src.replace(
  `const markAttended = () => {
      setAttendanceSubmitted(true);
      rewards.submitForVerification("event_attendance", \`EVENT-\${e.id}\`, \`Community event attendance — \${e.name}\`);
    };`,
  `const markAttended = () => {
      auth.requireAuthAction(() => {
        setAttendanceSubmitted(true);
        rewards.submitForVerification("event_attendance", \`EVENT-\${e.id}\`, \`Community event attendance — \${e.name}\`);
      }, setPage);
    };`
);

fs.writeFileSync(srcPath, src);
console.log("Updated Phase 5 Rewards logic in Marketplace & Events");
