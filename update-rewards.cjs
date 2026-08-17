const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'App.jsx');
let src = fs.readFileSync(srcPath, 'utf8');

const regex = /function RewardsProvider\(\{ children, toast \}\) \{[\s\S]*?return \(\s*<RewardsContext\.Provider/;

const newProvider = `function RewardsProvider({ children, toast }) {
  const auth = useAuth();
  
  const defaultMockState = {
    balance: 850,
    lifetime: 1250,
    redeemed: 400,
    impact: { animalsHelped: 8, rescues: 3, eventsAttended: 4, volunteerHours: 12, contributions: 12 },
    transactions: [
      { id: "t1", action_type: "rescue", reference_id: "PS-RQ-7710", points: 100, description: "Verified animal rescue", status: "credited", created_at: "3 days ago" },
      { id: "t2", action_type: "volunteer", reference_id: "POST-1", points: 75, description: "Volunteer participation", status: "credited", created_at: "2 days ago" },
      { id: "t3", action_type: "event_attendance", reference_id: "EVENT-102", points: 30, description: "Community event attendance", status: "credited", created_at: "Yesterday" },
      { id: "t4", action_type: "marketplace_redeem", reference_id: "ORDER-442", points: -250, description: "Marketplace discount redemption", status: "redeemed", created_at: "10 Aug" },
    ],
    awardedKeys: ["rescue:PS-RQ-7710", "volunteer:POST-1", "event_attendance:EVENT-102", "marketplace_redeem:ORDER-442"],
    pendingVerifications: []
  };

  const blankState = {
    balance: 0, lifetime: 0, redeemed: 0,
    impact: { animalsHelped: 0, rescues: 0, eventsAttended: 0, volunteerHours: 0, contributions: 0 },
    transactions: [], awardedKeys: [], pendingVerifications: []
  };

  const [state, setState] = useState(blankState);

  // Load user data on auth change
  useEffect(() => {
    if (auth?.user) {
      const stored = localStorage.getItem('petsogram_rewards_' + auth.user.id);
      if (stored) {
        try { 
          const parsed = JSON.parse(stored);
          // Rehydrate awardedKeys as Set
          parsed.awardedKeys = new Set(parsed.awardedKeys || []);
          setState(parsed);
        } catch (e) { setState(blankState); }
      } else {
        // Seed first user with mock data, subsequent with blank
        const isFirst = !localStorage.getItem('petsogram_first_user_seeded');
        if (isFirst) {
          localStorage.setItem('petsogram_first_user_seeded', 'true');
          const seeded = { ...defaultMockState };
          setState({ ...seeded, awardedKeys: new Set(seeded.awardedKeys) });
        } else {
          setState({ ...blankState, awardedKeys: new Set() });
        }
      }
    } else {
      setState({ ...blankState, awardedKeys: new Set() });
    }
  }, [auth?.user]);

  // Sync to localStorage
  useEffect(() => {
    if (auth?.user) {
      const toSave = { ...state, awardedKeys: Array.from(state.awardedKeys || []) };
      localStorage.setItem('petsogram_rewards_' + auth.user.id, JSON.stringify(toSave));
    }
  }, [state, auth?.user]);

  const ruleFor = (actionType) => REWARD_RULES.find((r) => r.action_type === actionType);

  const addTransaction = (tx) => {
    setState(s => ({ ...s, transactions: [{ id: Math.random().toString(36).slice(2), created_at: "Just now", ...tx }, ...s.transactions] }));
  };

  const submitForVerification = (actionType, referenceId, description) => {
    if (!auth?.user) return false;
    const key = \`\${actionType}:\${referenceId}\`;
    if (state.awardedKeys.has(key)) { toast?.push("This activity has already been rewarded", "amber"); return false; }
    if (state.pendingVerifications.some((p) => \`\${p.action_type}:\${p.reference_id}\` === key)) { toast?.push("Already pending verification", "amber"); return false; }
    
    const rule = ruleFor(actionType);
    setState(s => ({
      ...s, 
      pendingVerifications: [...s.pendingVerifications, { id: Math.random().toString(36).slice(2), action_type: actionType, reference_id: referenceId, description: description || rule?.label, points: rule?.points || 0 }]
    }));
    toast?.push("Your reward is pending verification.", "amber");
    return true;
  };

  const awardPoints = (actionType, referenceId, description, pointsOverride) => {
    if (!auth?.user) return false;
    const key = \`\${actionType}:\${referenceId}\`;
    if (state.awardedKeys.has(key)) { toast?.push("Already rewarded", "amber"); return false; }
    const rule = ruleFor(actionType);
    const points = pointsOverride ?? rule?.points ?? 0;
    
    setState(s => {
      const newKeys = new Set(s.awardedKeys);
      newKeys.add(key);
      const newTx = { id: Math.random().toString(36).slice(2), created_at: "Just now", action_type: actionType, reference_id: referenceId, points, description: description || rule?.label, status: "credited" };
      return {
        ...s,
        balance: s.balance + points,
        lifetime: s.lifetime + points,
        awardedKeys: newKeys,
        pendingVerifications: s.pendingVerifications.filter((p) => \`\${p.action_type}:\${p.reference_id}\` !== key),
        transactions: [newTx, ...s.transactions]
      };
    });
    toast?.push(\`🎉 You earned \${points} P-Points!\`);
    return true;
  };

  const approveVerification = (id) => {
    const item = state.pendingVerifications.find((p) => p.id === id);
    if (item) awardPoints(item.action_type, item.reference_id, item.description, item.points);
  };

  const rejectVerification = (id) => {
    setState(s => ({ ...s, pendingVerifications: s.pendingVerifications.filter((p) => p.id !== id) }));
    toast?.push("Reward request rejected", "amber");
  };

  const redeemPoints = (points, referenceType, referenceId, discountAmount) => {
    if (!auth?.user) return false;
    if (!canRedeemPoints(state.balance, points)) { toast?.push("Not enough P-Points", "amber"); return false; }
    
    setState(s => {
      const newTx = { id: Math.random().toString(36).slice(2), created_at: "Just now", action_type: \`\${referenceType}_redeem\`, reference_id: referenceId, points: -points, description: \`\${referenceType === "marketplace" ? "Marketplace" : "Event"} discount redemption\`, status: "redeemed" };
      return {
        ...s,
        balance: s.balance - points,
        redeemed: s.redeemed + points,
        transactions: [newTx, ...s.transactions]
      };
    });
    toast?.push(\`\${points} P-Points redeemed for ₹\${discountAmount} off.\`);
    return true;
  };

  const { balance, lifetime, redeemed, impact, transactions, pendingVerifications, awardedKeys } = state;

  return (
    <RewardsContext.Provider`;

src = src.replace(regex, newProvider);
fs.writeFileSync(srcPath, src);
console.log("Updated RewardsProvider with user-specific isolation");
