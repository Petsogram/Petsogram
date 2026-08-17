const fs = require('fs');
const path = require('path');

const destFile = path.join(__dirname, 'src', 'App.jsx');
let destCode = fs.readFileSync(destFile, 'utf8');

const donationServiceImports = `import { getGlobalDonations, getTotalDonated, addDonation as addGlobalDonation } from './services/donationService';`;

if (!destCode.includes("from './services/donationService'")) {
    destCode = destCode.replace(
        "import { useAuth } from \"./contexts/AuthContext\";",
        `import { useAuth } from "./contexts/AuthContext";\n${donationServiceImports}`
    );
}

// 1. Replace DonationProvider
const providerStartIdx = destCode.indexOf('function DonationProvider({ children }) {');
const providerEndIdx = destCode.indexOf('/* ---------------------------------- NAV ITEMS', providerStartIdx);

if (providerStartIdx !== -1 && providerEndIdx !== -1) {
    const newProvider = `function DonationProvider({ children }) {
  const [funds, setFunds] = useState(DONATION_FUND_DATA);
  const [history, setHistory] = useState([]);
  const [globalTotal, setGlobalTotal] = useState(0);
  const auth = useAuth();
  
  const refreshDonations = () => {
    setHistory(getGlobalDonations());
    setGlobalTotal(getTotalDonated());
  };
  
  useEffect(() => {
    refreshDonations();
  }, [auth.user]);

  const makeDonation = (category, amount) => {
    setFunds(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        received: prev[category].received + amount
      }
    }));
    
    addGlobalDonation({
      category,
      amount,
      purpose: \`\${category} support\`,
      userId: auth.user?.id || null
    });
    
    refreshDonations();
  };
  
  const value = { 
    funds, 
    history: auth.user ? history.filter(d => d.userId === auth.user.id) : [], 
    globalHistory: history,
    totalDonated: globalTotal, 
    makeDonation 
  };
  return <DonationContext.Provider value={value}>{children}</DonationContext.Provider>;
}

`;
    destCode = destCode.substring(0, providerStartIdx) + newProvider + destCode.substring(providerEndIdx);
}

// 2. Replace DonatePage
const donateStartIdx = destCode.indexOf('function DonatePage({ toast }) {');
const donateEndIdx = destCode.indexOf('/* ---------------------------------- SERVICES', donateStartIdx);

if (donateStartIdx !== -1 && donateEndIdx !== -1) {
    const newDonatePage = `function DonatePage({ toast }) {
  const { totalDonated, globalHistory, makeDonation } = useDonations();
  const [amount, setAmount] = useState(500);
  const [custom, setCustom] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cat, setCat] = useState("Medical Treatment");
  const auth = useAuth();
  const rewards = useRewards();
  const { notify } = useNotifications();

  const categories = [
    { l: "Medical Treatment", icon: Stethoscope }, { l: "Food", icon: Package }, { l: "Rescue", icon: Truck },
    { l: "Shelter", icon: HomeIcon }, { l: "Vaccination", icon: ShieldCheck }, { l: "Emergency Care", icon: Siren },
  ];

  const handleDonate = () => {
    const finalAmount = custom ? parseInt(custom, 10) : amount;
    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) {
      toast.push("Please enter a valid donation amount.");
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate network delay
    setTimeout(() => {
      makeDonation(cat, finalAmount);
      
      notify({
        title: "Donation successful",
        message: \`Your ₹\${finalAmount} donation for \${cat} was recorded successfully.\`,
        type: "reward"
      });
      
      if (rewards && rewards.logActivity) {
        rewards.logActivity('donate_supplies'); // Hooking into existing reward logic
      }
      
      toast.push(\`Thank you! ₹\${finalAmount} donated toward \${cat}\`);
      setCustom("");
      setAmount(500);
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <SectionHeading eyebrow="Make an impact" title="Your support can save a life" subtitle="100% of donations are routed to verified organizations. Track exactly where your contribution goes." />
      
      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="p-6 lg:col-span-2">
          <p className="font-semibold text-stone-800 mb-3" style={fontDisplay}>Choose a category</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {categories.map((c) => (
              <button key={c.l} onClick={() => setCat(c.l)} className={\`flex flex-col items-center gap-2 rounded-xl p-4 border text-xs font-semibold transition-all \${cat === c.l ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm" : "bg-white border-stone-200 text-stone-600 hover:border-emerald-200 hover:bg-stone-50"}\`}>
                <c.icon size={20} /> {c.l}
              </button>
            ))}
          </div>
          <p className="font-semibold text-stone-800 mb-3" style={fontDisplay}>Choose an amount</p>
          <div className="flex gap-2 flex-wrap mb-4">
            {[100, 500, 1000, 2500].map((v) => (
              <button key={v} onClick={() => { setAmount(v); setCustom(""); }} className={\`px-5 py-2.5 rounded-lg text-sm font-semibold border transition-all \${amount === v && !custom ? "bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-900/10" : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"}\`}>₹{v}</button>
            ))}
            <input type="number" min="1" value={custom} onChange={(e) => { setCustom(e.target.value); setAmount(0); }} placeholder="Custom amount" className="px-4 py-2.5 rounded-lg border border-stone-200 text-sm w-36 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
          </div>
          <Button variant="primary" className="w-full py-3 mt-2 text-base font-bold shadow-md shadow-emerald-900/10" onClick={handleDonate} disabled={isProcessing}>
            {isProcessing ? "Processing..." : \`Donate ₹\${custom || amount || 0} now\`}
          </Button>
        </Card>
        
        <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-emerald-700 to-emerald-900 text-white shadow-xl shadow-emerald-900/20 border-none">
              <p className="text-emerald-100 font-semibold mb-1">Total Donated</p>
              <p className="text-4xl font-bold" style={fontDisplay}>₹{totalDonated.toLocaleString()}</p>
              <p className="text-xs text-emerald-200/80 mt-3 border-t border-emerald-600 pt-3">Every rupee makes a difference.</p>
            </Card>
            
            <Card className="p-6">
              <p className="font-semibold text-stone-800 mb-3" style={fontDisplay}>Donation impact</p>
              {[["₹100", "Feeds a rescued animal for a week"], ["₹500", "Covers a basic vet checkup"], ["₹1,000", "Supports emergency rescue transport"], ["₹2,500", "Funds full vaccination for 5 animals"]].map(([amt, txt]) => (
                <div key={amt} className="flex gap-3 py-2.5 border-b border-stone-100 last:border-0">
                  <span className="font-bold text-emerald-700 text-sm w-14">{amt}</span>
                  <span className="text-xs text-stone-500">{txt}</span>
                </div>
              ))}
            </Card>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="font-bold text-stone-900 text-lg mb-4" style={fontDisplay}>My Donation History</h3>
        <Card className="p-0 overflow-hidden">
          {globalHistory.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-sm">No donations recorded yet. Be the first to donate!</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-500 text-xs uppercase"><tr><th className="text-left p-4">Category</th><th className="text-left p-4">Date</th><th className="text-left p-4">Reference ID</th><th className="text-left p-4">Status</th><th className="text-right p-4">Amount</th></tr></thead>
              <tbody>
                {globalHistory.map((t, i) => (
                  <tr key={t.id || i} className="border-t border-stone-100">
                    <td className="p-4 font-semibold text-stone-800 flex items-center gap-2">
                        {(() => {
                            const CatIcon = categories.find(c => c.l === t.category)?.icon || Heart;
                            return <CatIcon size={16} className="text-stone-400" />;
                        })()}
                        {t.category}
                    </td>
                    <td className="p-4 text-stone-500">{t.date}</td>
                    <td className="p-4 text-stone-400 text-xs font-mono">{t.id}</td>
                    <td className="p-4"><Badge tone={t.status === "Completed" ? "emerald" : "amber"}>{t.status || 'Completed'}</Badge></td>
                    <td className="p-4 font-bold text-emerald-700 text-right">₹{(t.amount || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}

`;
    destCode = destCode.substring(0, donateStartIdx) + newDonatePage + destCode.substring(donateEndIdx);
}

fs.writeFileSync(destFile, destCode);
console.log("Successfully refactored App.jsx (DonationProvider & DonatePage)");
