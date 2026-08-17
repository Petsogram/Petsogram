const fs = require('fs');
const path = require('path');

const destFile = path.join(__dirname, 'src', 'App.jsx');
let destCode = fs.readFileSync(destFile, 'utf8');

// 1. Update imports
const oldImport = "import { getGlobalDonations, getTotalDonated, addDonation as addGlobalDonation } from './services/donationService';";
const newImport = "import { getGlobalDonations, getTotalDonated, addDonation as addGlobalDonation, getCategoryFunds, updateCategoryFund, calculateAvailableFund, calculateRequiredFund, calculateUtilization } from './services/donationService';";

if (destCode.includes(oldImport)) {
    destCode = destCode.replace(oldImport, newImport);
} else if (!destCode.includes("getCategoryFunds")) {
    console.error("Could not find the donationService import to modify.");
}

// 2. Rewrite DonationProvider
const providerStartIdx = destCode.indexOf('function DonationProvider({ children }) {');
const providerEndIdx = destCode.indexOf('/* ---------------------------------- NAV ITEMS', providerStartIdx);

if (providerStartIdx !== -1 && providerEndIdx !== -1) {
    const newProvider = `function DonationProvider({ children }) {
  const [funds, setFunds] = useState(getCategoryFunds());
  const [history, setHistory] = useState([]);
  const [globalTotal, setGlobalTotal] = useState(0);
  const auth = useAuth();
  
  const refreshDonations = () => {
    setHistory(getGlobalDonations());
    setGlobalTotal(getTotalDonated());
    setFunds(getCategoryFunds());
  };
  
  useEffect(() => {
    refreshDonations();
  }, [auth.user]);

  const makeDonation = (category, amount) => {
    updateCategoryFund(category, amount);
    
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
    makeDonation,
    calculateAvailableFund,
    calculateRequiredFund,
    calculateUtilization
  };
  return <DonationContext.Provider value={value}>{children}</DonationContext.Provider>;
}

`;
    destCode = destCode.substring(0, providerStartIdx) + newProvider + destCode.substring(providerEndIdx);
}

// 3. Rewrite DonatePage
const donateStartIdx = destCode.indexOf('function DonatePage({ toast }) {');
const donateEndIdx = destCode.indexOf('/* ---------------------------------- SERVICES', donateStartIdx);

if (donateStartIdx !== -1 && donateEndIdx !== -1) {
    let donatePageCode = destCode.substring(donateStartIdx, donateEndIdx);
    
    // Add helpers from hook
    donatePageCode = donatePageCode.replace(
        "const { totalDonated, globalHistory, makeDonation } = useDonations();",
        "const { totalDonated, globalHistory, makeDonation, funds, calculateAvailableFund, calculateRequiredFund, calculateUtilization } = useDonations();"
    );
    
    // Add descriptions map
    const descStr = `
  const categoryDescriptions = {
    "Medical Treatment": "Supports veterinary treatment, medicines, surgeries and recovery.",
    "Food": "Supports food and nutritional supplies for rescued animals.",
    "Rescue": "Supports rescue operations, transportation and field response.",
    "Shelter": "Supports shelter operations, care and essential infrastructure.",
    "Vaccination": "Supports vaccination and preventive healthcare.",
    "Emergency Care": "Supports urgent medical and emergency response."
  };
`;
    donatePageCode = donatePageCode.replace(
        "const categories = [",
        descStr + "\n  const categories = ["
    );
    
    // Add the new card right after the Total Donated card
    const targetInsertionPoint = `</Card>
            
            <Card className="p-6">
              <p className="font-semibold text-stone-800 mb-3" style={fontDisplay}>Donation impact</p>`;
              
    const newCard = `</Card>
            
            <Card className="p-6 border border-stone-200">
              <h3 className="font-bold text-stone-900 mb-2" style={fontDisplay}>{cat} Fund</h3>
              <p className="text-xs text-stone-500 mb-4">{categoryDescriptions[cat]}</p>
              
              {(() => {
                  const fundData = funds[cat] || { totalFund: 0, usedFund: 0, targetFund: 0 };
                  const available = calculateAvailableFund(fundData.totalFund, fundData.usedFund);
                  const required = calculateRequiredFund(fundData.targetFund, available);
                  const utilization = calculateUtilization(fundData.totalFund, fundData.usedFund);
                  
                  return (
                      <>
                          <div className="grid grid-cols-2 gap-4 mb-5">
                              <div>
                                  <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Total Fund</p>
                                  <p className="text-sm font-bold text-stone-800">₹{fundData.totalFund.toLocaleString()}</p>
                              </div>
                              <div>
                                  <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Used</p>
                                  <p className="text-sm font-bold text-stone-800">₹{fundData.usedFund.toLocaleString()}</p>
                              </div>
                              <div>
                                  <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Available</p>
                                  <p className="text-sm font-bold text-emerald-700">₹{available.toLocaleString()}</p>
                              </div>
                              <div>
                                  <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Required</p>
                                  <p className="text-sm font-bold text-amber-600">₹{required.toLocaleString()}</p>
                              </div>
                          </div>
                          
                          <div>
                              <div className="flex justify-between text-xs font-semibold mb-1.5">
                                  <span className="text-stone-600">Fund utilization</span>
                                  <span className="text-emerald-700">{Math.round(utilization)}% utilized</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: \`\${utilization}%\` }} />
                              </div>
                              <p className="text-xs text-center font-semibold mt-3 text-stone-500">
                                  {required > 0 ? \`₹\${required.toLocaleString()} still required\` : 'Fully funded'}
                              </p>
                          </div>
                      </>
                  );
              })()}
            </Card>
            
            <Card className="p-6">
              <p className="font-semibold text-stone-800 mb-3" style={fontDisplay}>Donation impact</p>`;

    donatePageCode = donatePageCode.replace(targetInsertionPoint, newCard);
    
    destCode = destCode.substring(0, donateStartIdx) + donatePageCode + destCode.substring(donateEndIdx);
}

fs.writeFileSync(destFile, destCode);
console.log("Successfully refactored App.jsx with the new Category Fund Status card.");
