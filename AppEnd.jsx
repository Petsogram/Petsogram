
function ProfilePage({ setPage }) {
  const auth = useAuth();
  const badges = useBadges();
  const rewards = useRewards();
  const [profileTab, setProfileTab] = useState("overview");

  if (!auth.user) return null;

  return (
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
          <button key={t} onClick={() => setProfileTab(t)} className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all ${profileTab === t ? "border-emerald-600 text-emerald-800" : "border-transparent text-stone-500 hover:text-stone-700"}`}>
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
                      <div className="bg-emerald-600 h-full rounded-full transition-all duration-1000" style={{ width: `${badges.rankProgress}%` }} />
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
                  <div key={r.rank} className={`relative flex flex-col items-center p-4 rounded-xl border text-center transition-all ${isCurrent ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-md' : isEarned ? 'bg-white border-emerald-200' : 'bg-stone-50 border-stone-200 opacity-60 grayscale'}`}>
                     {isEarned && !isCurrent && <div className="absolute -top-2 -right-2 bg-emerald-600 text-white rounded-full p-1"><Check size={12}/></div>}
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isCurrent ? 'bg-emerald-600 text-white' : isEarned ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-400'}`}>
                       <r.icon size={20} />
                     </div>
                     <p className="text-xs font-bold text-stone-900 leading-tight">{r.badge}</p>
                     <p className="text-[10px] text-stone-500 mt-1">{i === 0 ? 'Start' : `${badges.allRanks[i-1].max + 1}+`}</p>
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
                   <Card key={a.id} className={`p-5 flex gap-4 ${isUnlocked ? 'border-amber-200 bg-amber-50/30' : 'opacity-60 grayscale'}`}>
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isUnlocked ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-400'}`}>
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
                const bInfo = badges.allAchievements.find(a => a.id === ub.id) || badges.allRanks.find(r => `rank_${r.rank.replace(/\s+/g, '')}` === ub.id);
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
  );
}

function SettingsPage({ setPage, toast }) {
  const auth = useAuth();
  const { notifications, unreadCount, markAllAsRead, clearHistory } = useNotifications();
  const [notifFilter, setNotifFilter] = useState("All");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (!auth.user) {
      auth.setPendingPage("settings");
      setPage("login");
    }
  }, [auth.user, setPage]);

  const [settings, setSettings] = useState(() => {
    if (auth.user) {
      const saved = localStorage.getItem(`petsogram_settings_${auth.user.id}`);
      if (saved) return JSON.parse(saved);
    }
    return {
      "Email notifications": true,
      "SMS alerts for emergencies": true,
      "Show profile in community": true,
      "Allow location sharing": true
    };
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    localStorage.setItem(`petsogram_settings_${auth.user.id}`, JSON.stringify(settings));
    toast.push("Settings saved successfully.");
  };

  const handleLogout = () => {
    auth.logout();
    setPage("home");
    toast.push("Logged out successfully");
  };

  const notifFilters = ["All", "Unread", "Rewards", "Adoption", "Rescue", "Community", "Donation"];
  const filterTypeMap = { Rewards: "reward", Adoption: "adoption", Rescue: "rescue", Community: "community", Donation: "donation" };
  
  const filteredNotifs = notifications.filter(n => {
    if (notifFilter === "All") return true;
    if (notifFilter === "Unread") return !n.read;
    return n.type === filterTypeMap[notifFilter];
  });

  const getNotifIcon = (type) => {
    if (type === "reward") return Gift;
    if (type === "adoption") return PawPrint;
    if (type === "rescue") return Siren;
    if (type === "community") return Users;
    if (type === "donation") return HeartHandshake;
    return Bell;
  };

  const formatRelativeTime = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d === 1) return "Yesterday";
    return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 space-y-8">
      <h1 className="text-2xl font-bold text-stone-900" style={fontDisplay}>Settings</h1>
      
      <Card className="p-6 space-y-4">
        {Object.entries(settings).map(([label, value]) => (
          <div key={label} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
            <span className="text-sm text-stone-600">{label}</span>
            <input
              type="checkbox"
              checked={value}
              onChange={() => handleToggle(label)}
              className="accent-emerald-700 w-4 h-4 cursor-pointer"
            />
          </div>
        ))}
        <Button variant="primary" onClick={handleSave}>Save changes</Button>
        <button onClick={handleLogout} className="flex items-center gap-2 text-rose-600 text-sm font-medium pt-2"><LogOut size={15} /> Log out</button>
      </Card>

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

      {/* Notification History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-stone-800" style={fontDisplay}>Notification History</h2>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs font-semibold text-emerald-700 hover:underline">Mark all read</button>
            )}
            <button onClick={() => setShowClearConfirm(true)} className="text-xs text-stone-400 hover:text-rose-600">Clear history</button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-4">
          {notifFilters.map(f => (
            <button
              key={f}
              onClick={() => setNotifFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${notifFilter === f ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-stone-500 border-stone-200 hover:border-emerald-400"}`}
            >{f}</button>
          ))}
        </div>

        {/* Notification list */}
        <Card className="overflow-hidden">
          {filteredNotifs.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-sm">
              <Bell size={32} className="mx-auto mb-3 text-stone-200" />
              <p className="font-medium text-stone-700 mb-1">No {notifFilter === "All" ? "" : notifFilter.toLowerCase() + " "}notifications yet</p>
              <p>Your activity will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filteredNotifs.map(n => {
                const Icon = getNotifIcon(n.type);
                return (
                  <div
                    key={n.id}
                    onClick={() => { if (!n.read) markAllAsRead(); }}
                    className={`p-4 flex gap-3 transition-colors hover:bg-stone-50 cursor-pointer ${!n.read ? "bg-emerald-50/30" : ""}`}
                  >
                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!n.read ? "bg-emerald-100" : "bg-stone-100"}`}>
                      <Icon size={14} className={!n.read ? "text-emerald-700" : "text-stone-500"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.read ? "font-bold text-stone-900" : "font-medium text-stone-700"}`}>{n.title}</p>
                      <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-stone-400 mt-1 font-medium">{formatRelativeTime(n.timestamp)}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Clear history confirmation */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <Card className="p-6 max-w-sm mx-auto space-y-4">
              <p className="font-semibold text-stone-900">Clear notification history?</p>
              <p className="text-sm text-stone-500">This will permanently delete all your notifications. This action cannot be undone.</p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setShowClearConfirm(false)} className="flex-1">Cancel</Button>
                <Button variant="primary" className="flex-1 bg-rose-600 hover:bg-rose-700" onClick={() => { clearHistory(); setShowClearConfirm(false); toast.push("Notification history cleared."); }}>Clear history</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- APP ROOT ---------------------------------- */
export default function PetsogramApp() {
  useFonts();
  const getInitialPage = () => {
    const path = window.location.pathname.replace(/^\/+/, "");
    return path || "home";
  };

  const [page, setPageRaw] = useState(getInitialPage);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const toast = useToast();
  const auth = useAuth();

  useEffect(() => {
    window.history.replaceState({ page }, "", window.location.pathname);
    
    const handlePopState = (e) => {
      if (e.state && e.state.page) {
        setPageRaw(e.state.page);
      } else {
        setPageRaw(getInitialPage());
      }
    };
    
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const setPage = (p) => {
    if (p === page) return;

    const protectedPages = ["dashboard", "rewards", "profile", "settings", "admin"];
    let targetPage = p;

    if (protectedPages.includes(p) && !auth.user) {
      auth.setPendingPage(p);
      targetPage = "login";
    }

    setPageRaw(targetPage); 
    const newPath = targetPage === "home" ? "/" : `/${targetPage}`;
    window.history.pushState({ page: targetPage }, "", newPath);
    window.scrollTo({ top: 0, behavior: "smooth" }); 
  };

  const pages = {
    home: <HomePage setPage={setPage} toast={toast} />,
    discover: <DiscoverPage />,
    emergency: <EmergencyPage toast={toast} />,
    adopt: <AdoptPage setPage={setPage} setSelectedAnimal={setSelectedAnimal} />,
    animalProfile: <AnimalProfilePage animal={selectedAnimal} setPage={setPage} toast={toast} />,
    rehoming: <RehomingPage toast={toast} />,
    community: <CommunityPage setPage={setPage} toast={toast} />,
    events: <EventsPage setPage={setPage} toast={toast} />,
    report: <ReportAbusePage setPage={setPage} toast={toast} />,
    donate: <DonatePage toast={toast} />,
    services: <ServicesPage toast={toast} />,
    marketplace: <MarketplacePage setPage={setPage} toast={toast} />,
    rewards: <RewardsPage setPage={setPage} toast={toast} />,
    dashboard: <DashboardPage setPage={setPage} />,
    admin: <AdminDashboardPage />,
    login: <LoginPage setPage={setPage} toast={toast} />,
    signup: <SignupPage setPage={setPage} toast={toast} />,
    profile: <ProfilePage setPage={setPage} />,
    settings: <SettingsPage setPage={setPage} toast={toast} />,
  };

  return (
    <RewardsProvider toast={toast}>
      <BadgeProvider toast={toast}>
      <LocationProvider>
      <DonationProvider>
        <div className="min-h-screen bg-stone-50 text-stone-900" style={fontBody}>
          {toast.el}
          <Navbar page={page} setPage={setPage} toast={toast} />
          <ErrorBoundary onGoHome={() => setPage("home")}>
          {pages[page] || pages.home}
        </ErrorBoundary>
          <div className="max-w-7xl mx-auto px-6 pb-6 flex justify-center">
            <button onClick={() => setPage("admin")} className="text-xs text-stone-300 hover:text-stone-500 mt-4">Admin dashboard (demo)</button>
          </div>
          <Footer setPage={setPage} />
          <MikoChatbot setPage={setPage} />
        </div>
      </DonationProvider>
      </LocationProvider>
      </BadgeProvider>
    </RewardsProvider>
  );
}
