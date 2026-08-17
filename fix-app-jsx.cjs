const fs = require('fs');
const path = require('path');

const appFile = path.join(__dirname, 'src', 'App.jsx');
let appContent = fs.readFileSync(appFile, 'utf8');

// 1. Fix RelativeTime
const startRelTime = appContent.indexOf('function RelativeTime');
const endRelTimeStr = 'const fontDisplay = { fontFamily: "\\\'Sora\\\', sans-serif" };';
const endRelTime = appContent.indexOf('const fontDisplay = {');

if (startRelTime !== -1 && endRelTime !== -1) {
  const cleanRelativeTime = `function RelativeTime({ timestamp }) {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const update = () => {
      if (!timestamp) {
        setTimeStr("");
        return;
      }
      
      let parsed = timestamp;
      if (typeof timestamp === 'string') {
        parsed = new Date(timestamp).getTime();
      } else if (timestamp instanceof Date) {
        parsed = timestamp.getTime();
      }
      
      if (isNaN(parsed)) {
        setTimeStr("");
        return;
      }
      
      const diff = Math.floor((Date.now() - parsed) / 1000); // in seconds
      
      if (diff < 0) {
        // Future timestamp edge case
        setTimeStr("Just now");
      } else if (diff < 60) {
        setTimeStr("Just now");
      } else if (diff < 3600) {
        const m = Math.floor(diff / 60);
        setTimeStr(\`\${m}m ago\`);
      } else if (diff < 86400) {
        const h = Math.floor(diff / 3600);
        setTimeStr(\`\${h}h ago\`);
      } else if (diff < 172800) {
        setTimeStr("1d ago");
      } else if (diff < 604800) {
        const d = Math.floor(diff / 86400);
        setTimeStr(\`\${d}d ago\`);
      } else {
        setTimeStr(new Date(parsed).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
      }
    };
    
    update();
    const interval = setInterval(update, 30000); // update every 30s
    return () => clearInterval(interval);
  }, [timestamp]);

  return <>{timeStr}</>;
}
`;
  appContent = appContent.substring(0, startRelTime) + cleanRelativeTime + appContent.substring(endRelTime);
}

// 2. Safely Inject Profile JSX ONLY into ProfilePage
const profileStartIdx = appContent.indexOf('function ProfilePage({ setPage }) {');
if (profileStartIdx !== -1) {
   const profileEndIdx = appContent.indexOf('function SettingsPage({ setPage, toast }) {', profileStartIdx);
   if (profileEndIdx !== -1) {
      const advancedProfileJSX = `
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden shrink-0">
            {auth.user?.photoURL ? <img src={auth.user.photoURL} alt="Profile" className="w-full h-full object-cover" /> : <User size={40} className="text-emerald-700" />}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-stone-900" style={fontDisplay}>{auth.user?.displayName || "Member"}</h1>
            <p className="text-stone-500 mb-2">{auth.user?.email}</p>
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
                       <p className="text-xl font-bold text-stone-900">{rewards?.balance || 0} <span className="text-sm font-medium text-stone-500">P-Points</span></p>
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
                    <p className="text-2xl font-bold text-amber-700">{rewards?.impact?.rescues || 0}</p>
                    <p className="text-xs text-amber-800 font-medium mt-1">Verified Rescues</p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
                    <p className="text-2xl font-bold text-blue-700">{rewards?.impact?.contributions || 0}</p>
                    <p className="text-xs text-blue-800 font-medium mt-1">Donations</p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-center">
                    <p className="text-2xl font-bold text-purple-700">{rewards?.impact?.animalsHelped || 0}</p>
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
                {badges?.allRanks?.map((r, i) => {
                  const isCurrent = badges.currentRankInfo && r.rank === badges.currentRankInfo.rank;
                  const isEarned = (rewards?.balance || 0) >= r.max || isCurrent || (i < (badges.allRanks.findIndex(x => x.rank === badges?.currentRankInfo?.rank) || 0));
                  
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
                {badges?.allAchievements?.map(a => {
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
                {badges?.unlockedBadges?.slice().reverse().map(ub => {
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

      let profileFuncStr = appContent.substring(profileStartIdx, profileEndIdx);
      // Ensure we don't accidentally nest it. Look for the first return (
      const returnIdx = profileFuncStr.indexOf('return (');
      if (returnIdx !== -1) {
          const startOfFunc = profileFuncStr.substring(0, returnIdx);
          
          // Add useBadges and profileTab state if not present
          let finalStartOfFunc = startOfFunc;
          if (!finalStartOfFunc.includes('const badges = useBadges();')) {
              finalStartOfFunc = finalStartOfFunc.replace(
                  /const auth = useAuth\(\);/,
                  'const auth = useAuth();\n  const badges = useBadges();\n  const rewards = useRewards();\n  const [profileTab, setProfileTab] = useState("overview");'
              );
          }

          const newProfileFunc = finalStartOfFunc + 'return (' + advancedProfileJSX + ');\n}\n\n';
          appContent = appContent.substring(0, profileStartIdx) + newProfileFunc + appContent.substring(profileEndIdx);
      }
   }
}

fs.writeFileSync(appFile, appContent);
console.log("Successfully fixed RelativeTime and updated ProfilePage.");
