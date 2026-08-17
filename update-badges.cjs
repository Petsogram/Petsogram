const fs = require('fs');
const path = require('path');

const appFile = path.join(__dirname, 'src', 'App.jsx');
let appContent = fs.readFileSync(appFile, 'utf8');

// Ensure Lucide icons needed for badges exist
const requiredIcons = ['Medal', 'Trophy', 'Award', 'Activity', 'Shield', 'Star', 'Siren'];
const iconImportMatch = appContent.match(/import \{([\s\S]*?)\} from "lucide-react";/);
if (iconImportMatch) {
  let existingIcons = iconImportMatch[1];
  let missing = requiredIcons.filter(icon => !existingIcons.includes(icon));
  if (missing.length > 0) {
    appContent = appContent.replace(
      /import \{([\s\S]*?)\} from "lucide-react";/,
      `import {$1, ${missing.join(', ')} } from "lucide-react";`
    );
  }
}

// ---------------------------------------------------------
// 1. BADGE ENGINE (Context & Hook)
// ---------------------------------------------------------
const badgeEngineStr = `
/* ---------------------------------- BADGES & RANKS ---------------------------------- */
const RANK_THRESHOLDS = [
  { max: 99, rank: "New Paw", badge: "First Paw", icon: PawPrint },
  { max: 249, rank: "Paw Starter", badge: "First Responder", icon: Activity },
  { max: 499, rank: "Care Giver", badge: "Care Companion", icon: HeartHandshake },
  { max: 999, rank: "Rescue Helper", badge: "Rescue Ally", icon: Siren },
  { max: 2499, rank: "Animal Guardian", badge: "Guardian", icon: ShieldCheck },
  { max: 4999, rank: "Rescue Champion", badge: "Champion", icon: Trophy },
  { max: 9999, rank: "Paw Protector", badge: "Protector", icon: Shield },
  { max: Infinity, rank: "Paw Legend", badge: "Legend", icon: Crown }
];

// Fallback icon for Crown if not available
const RankIcon = ({ rank, ...props }) => {
  const r = RANK_THRESHOLDS.find(t => t.rank === rank);
  if (r && r.icon) return <r.icon {...props} />;
  return <Award {...props} />;
};

const ACHIEVEMENT_BADGES = [
  { id: "rescue_first", name: "First Rescue", desc: "Completed your first verified rescue.", category: "rescue", check: (impact) => impact?.rescues >= 1 },
  { id: "lifesaver", name: "Lifesaver", desc: "Completed 25 verified rescues.", category: "rescue", check: (impact) => impact?.rescues >= 25 },
  { id: "first_adoption", name: "First Adoption", desc: "Completed a successful adoption.", category: "adoption", check: (impact) => impact?.adoptions >= 1 },
  { id: "care_supporter", name: "Care Supporter", desc: "Made your first donation.", category: "donation", check: (impact) => impact?.contributions >= 1 },
  { id: "community_starter", name: "Community Starter", desc: "Participated in the community.", category: "community", check: (impact) => impact?.eventsAttended >= 1 }
];

const BadgeContext = React.createContext(null);

function useBadges() {
  return React.useContext(BadgeContext);
}

function BadgeProvider({ children, toast }) {
  const rewards = useRewards();
  const auth = useAuth();
  const notifs = useNotifications();

  // Settings
  const [badgeSettings, setBadgeSettings] = useState({
    unlockNotifications: true,
    rankNotifications: true,
    publicProfile: true
  });

  // Load unlocked badges from storage
  const [unlockedBadges, setUnlockedBadges] = useState(() => {
    try {
      const stored = localStorage.getItem(\`petsogram_badges_\${auth.user?.id || 'demo'}\`);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // Calculate Current Rank
  const currentPoints = rewards?.balance || 0;
  let currentRankIndex = RANK_THRESHOLDS.findIndex(t => currentPoints <= t.max);
  if (currentRankIndex === -1) currentRankIndex = RANK_THRESHOLDS.length - 1;
  const currentRankInfo = RANK_THRESHOLDS[currentRankIndex];
  const nextRankInfo = currentRankIndex < RANK_THRESHOLDS.length - 1 ? RANK_THRESHOLDS[currentRankIndex + 1] : null;
  
  const prevMax = currentRankIndex > 0 ? RANK_THRESHOLDS[currentRankIndex - 1].max + 1 : 0;
  const pointsRemaining = nextRankInfo ? (nextRankInfo.max + 1) - currentPoints : 0;
  const rankProgress = nextRankInfo ? ((currentPoints - prevMax) / ((nextRankInfo.max + 1) - prevMax)) * 100 : 100;

  useEffect(() => {
    if (!auth.user) return;
    
    // Evaluate achievements
    let newUnlocks = [];
    ACHIEVEMENT_BADGES.forEach(badge => {
      if (!unlockedBadges.find(ub => ub.id === badge.id) && badge.check(rewards.impact)) {
        newUnlocks.push({
          id: badge.id,
          date: Date.now(),
          type: "achievement"
        });
        
        if (badgeSettings.unlockNotifications && notifs?.addNotification) {
          notifs.addNotification("reward", "🏆 Achievement Unlocked!", \`You earned \${badge.name}: \${badge.desc}\`, "/profile", \`badge-\${badge.id}\`);
        }
      }
    });

    // Evaluate Rank Ups
    const currentRankId = \`rank_\${currentRankInfo.rank.replace(/\\s+/g, '')}\`;
    if (!unlockedBadges.find(ub => ub.id === currentRankId)) {
      newUnlocks.push({
        id: currentRankId,
        date: Date.now(),
        type: "rank",
        rankName: currentRankInfo.rank
      });
      
      if (badgeSettings.rankNotifications && notifs?.addNotification) {
        notifs.addNotification("reward", "🌟 Rank Up!", \`You are now a \${currentRankInfo.rank}! \${pointsRemaining ? pointsRemaining + ' points to next rank.' : ''}\`, "/profile", \`rank-\${currentRankInfo.rank}\`);
      }
    }

    if (newUnlocks.length > 0) {
      const updated = [...unlockedBadges, ...newUnlocks];
      setUnlockedBadges(updated);
      localStorage.setItem(\`petsogram_badges_\${auth.user.id}\`, JSON.stringify(updated));
    }
  }, [rewards.balance, rewards.impact, auth.user]); // eslint-disable-line

  const value = {
    unlockedBadges,
    currentRankInfo,
    nextRankInfo,
    pointsRemaining,
    rankProgress,
    badgeSettings,
    setBadgeSettings,
    allRanks: RANK_THRESHOLDS,
    allAchievements: ACHIEVEMENT_BADGES
  };

  return <BadgeContext.Provider value={value}>{children}</BadgeContext.Provider>;
}
`;

if (!appContent.includes('const RANK_THRESHOLDS')) {
  appContent = appContent.replace(
    /const DonationContext = React\.createContext\(null\);/,
    badgeEngineStr.trim() + '\n\nconst DonationContext = React.createContext(null);'
  );
}

// Wrap PetsogramApp Providers with BadgeProvider
if (!appContent.includes('<BadgeProvider toast={toast}>')) {
  appContent = appContent.replace(
    /<RewardsProvider toast=\{toast\}>/,
    '<RewardsProvider toast={toast}>\n      <BadgeProvider toast={toast}>'
  );
  appContent = appContent.replace(
    /<\/RewardsProvider>/,
    '      </BadgeProvider>\n    </RewardsProvider>'
  );
}


// ---------------------------------------------------------
// 2. PROFILE PAGE INJECTIONS
// ---------------------------------------------------------
const profileBadgesStr = `
  const badges = useBadges();
  const [profileTab, setProfileTab] = useState("overview");

  if (!auth.user) return null;
`;

if (appContent.includes('function ProfilePage({ setPage }) {')) {
  // Overwrite ProfilePage starting block
  appContent = appContent.replace(
    /function ProfilePage\(\{ setPage \}\) \{([\s\S]*?)if \(!auth\.user\) return null;/,
    `function ProfilePage({ setPage }) {$1${profileBadgesStr}`
  );
  
  // Inject the advanced profile layout
  const advancedProfileJSX = `
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden shrink-0">
            {auth.user.photoURL ? <img src={auth.user.photoURL} alt="Profile" className="w-full h-full object-cover" /> : <User size={40} className="text-emerald-700" />}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-stone-900" style={fontDisplay}>{auth.user.displayName || "Member"}</h1>
            <p className="text-stone-500 mb-2">{auth.user.email}</p>
            {badges?.currentRankInfo && (
               <Badge tone="emerald"><RankIcon rank={badges.currentRankInfo.rank} size={14} className="mr-1"/> {badges.currentRankInfo.badge} ({badges.currentRankInfo.rank})</Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-8 border-b border-stone-200">
          {["overview", "badges", "history"].map(t => (
            <button key={t} onClick={() => setProfileTab(t)} className={\`px-4 py-3 text-sm font-semibold border-b-2 transition-all \${profileTab === t ? "border-emerald-600 text-emerald-800" : "border-transparent text-stone-500 hover:text-stone-700"}\`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {profileTab === "overview" && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h3 className="font-bold text-stone-900 text-lg mb-4" style={fontDisplay}>Impact & Recognition</h3>
                
                <div className="bg-stone-50 rounded-xl p-5 mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-sm font-semibold text-stone-500">Current Rank</p>
                      <p className="text-2xl font-bold text-emerald-700 flex items-center gap-2"><Award size={24}/> {badges?.currentRankInfo?.rank || "New Paw"}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xl font-bold text-stone-900">{rewards.balance} <span className="text-sm font-medium text-stone-500">P-Points</span></p>
                    </div>
                  </div>
                  
                  {badges?.nextRankInfo && (
                    <div className="mt-4">
                      <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full transition-all duration-1000" style={{ width: \`\${badges.rankProgress}%\` }} />
                      </div>
                      <p className="text-xs text-stone-500 mt-2 font-medium">{badges.pointsRemaining} P-Points to {badges.nextRankInfo.rank}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-center">
                    <p className="text-2xl font-bold text-amber-700">{rewards.impact.rescues}</p>
                    <p className="text-xs text-amber-800 font-medium mt-1">Verified Rescues</p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
                    <p className="text-2xl font-bold text-blue-700">{rewards.impact.contributions}</p>
                    <p className="text-xs text-blue-800 font-medium mt-1">Donations</p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-center">
                    <p className="text-2xl font-bold text-purple-700">{rewards.impact.animalsHelped || 0}</p>
                    <p className="text-xs text-purple-800 font-medium mt-1">Animals Helped</p>
                  </div>
                  <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 text-center">
                    <p className="text-2xl font-bold text-stone-700">{badges?.unlockedBadges?.length || 0}</p>
                    <p className="text-xs text-stone-600 font-medium mt-1">Badges Earned</p>
                  </div>
                </div>
              </Card>
            </div>
            <div className="space-y-6">
               <Card className="p-6">
                 <h3 className="font-bold text-stone-900 mb-4" style={fontDisplay}>Quick Actions</h3>
                 <div className="space-y-3">
                    <Button variant="secondary" className="w-full justify-start" onClick={() => setPage("rewards")}>Redeem P-Points</Button>
                    <Button variant="secondary" className="w-full justify-start" onClick={() => setPage("settings")}>Edit Profile</Button>
                 </div>
               </Card>
            </div>
          </div>
        )}

        {profileTab === "badges" && (
          <div className="space-y-10">
            <section>
              <h3 className="font-bold text-stone-900 text-xl mb-6" style={fontDisplay}>Rank Journey</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {badges?.allRanks.map((r, i) => {
                  const isCurrent = r.rank === badges.currentRankInfo.rank;
                  const isEarned = rewards.balance >= r.max || isCurrent || (i < badges.allRanks.findIndex(x => x.rank === badges.currentRankInfo.rank));
                  
                  return (
                    <div key={r.rank} className={\`relative flex flex-col items-center p-4 rounded-xl border text-center transition-all \${isCurrent ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-md' : isEarned ? 'bg-white border-emerald-200' : 'bg-stone-50 border-stone-200 opacity-60 grayscale'}\`}>
                       {isEarned && !isCurrent && <div className="absolute -top-2 -right-2 bg-emerald-600 text-white rounded-full p-1"><Check size={12}/></div>}
                       <div className={\`w-12 h-12 rounded-full flex items-center justify-center mb-3 \${isCurrent ? 'bg-emerald-600 text-white' : isEarned ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-400'}\`}>
                         <r.icon size={20} />
                       </div>
                       <p className="text-xs font-bold text-stone-900 leading-tight">{r.badge}</p>
                       <p className="text-[10px] text-stone-500 mt-1">{i === 0 ? 'Start' : \`\${badges.allRanks[i-1].max + 1}+\`}</p>
                    </div>
                  );
                })}
              </div>
            </section>
            
            <section>
              <h3 className="font-bold text-stone-900 text-xl mb-6" style={fontDisplay}>Special Achievements</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {badges?.allAchievements.map(a => {
                   const isUnlocked = badges.unlockedBadges.find(ub => ub.id === a.id);
                   return (
                     <Card key={a.id} className={\`p-5 flex gap-4 \${isUnlocked ? 'border-amber-200 bg-amber-50/30' : 'opacity-60 grayscale'}\`}>
                       <div className={\`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 \${isUnlocked ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-400'}\`}>
                         {a.icon ? <a.icon size={24}/> : <Award size={24}/>}
                       </div>
                       <div>
                         <p className="font-bold text-stone-900 text-sm">{a.name}</p>
                         <p className="text-xs text-stone-500 mt-1 leading-relaxed">{a.desc}</p>
                         {isUnlocked && <p className="text-[10px] text-amber-700 font-bold mt-2 uppercase tracking-wider">Earned</p>}
                       </div>
                     </Card>
                   );
                })}
              </div>
            </section>
          </div>
        )}
        
        {profileTab === "history" && (
           <Card className="p-6">
             <h3 className="font-bold text-stone-900 text-xl mb-6" style={fontDisplay}>Badge History</h3>
             <div className="space-y-4">
                {badges?.unlockedBadges.slice().reverse().map(ub => {
                  const bInfo = badges.allAchievements.find(a => a.id === ub.id) || badges.allRanks.find(r => \`rank_\${r.rank.replace(/\\s+/g, '')}\` === ub.id);
                  if (!bInfo) return null;
                  return (
                    <div key={ub.id} className="flex items-center gap-4 p-4 border border-stone-100 rounded-xl bg-stone-50/50">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Award size={18}/>
                      </div>
                      <div>
                        <p className="font-bold text-stone-900 text-sm">{bInfo.name || bInfo.badge}</p>
                        <p className="text-xs text-stone-500">{new Date(ub.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                  );
                })}
                {(!badges?.unlockedBadges || badges.unlockedBadges.length === 0) && (
                  <p className="text-sm text-stone-500 text-center py-8">No badges earned yet.</p>
                )}
             </div>
           </Card>
        )}
      </div>
  `;
  
  appContent = appContent.replace(
    /return \([\s\S]*?\);\n\}/m,
    `return (${advancedProfileJSX});\n}`
  );
}

// ---------------------------------------------------------
// 3. SETTINGS PAGE INJECTIONS
// ---------------------------------------------------------
if (appContent.includes('function SettingsPage({ setPage, toast }) {')) {
  const badgeSettingsStr = `
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Award className="text-emerald-700" size={20} />
              <h3 className="font-bold text-stone-900 text-lg" style={fontDisplay}>Badges & Recognition</h3>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-semibold text-stone-800 text-sm">Badge unlock notifications</p>
                  <p className="text-xs text-stone-500 mt-0.5">Receive alerts when you earn a new achievement</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-semibold text-stone-800 text-sm">Rank-up notifications</p>
                  <p className="text-xs text-stone-500 mt-0.5">Receive alerts when you reach a new rank</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
              </label>
            </div>
          </Card>
  `;
  
  appContent = appContent.replace(
    /<\/div>\n\s*<div className="flex justify-end gap-3 mt-8">/,
    `${badgeSettingsStr}\n        </div>\n        <div className="flex justify-end gap-3 mt-8">`
  );
}

fs.writeFileSync(appFile, appContent);
console.log("Successfully patched App.jsx with Smart Badge System");
