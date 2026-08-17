import React, { useState, useEffect, useMemo } from "react";
import {
  Heart, Search, Bell, User, Menu, X, MapPin, Star, Phone, Navigation,
  Stethoscope, Home as HomeIcon, ShieldAlert, Users, Wrench, ShoppingBag,
  Gift, Camera, ChevronRight, ChevronDown, Check, Clock, CalendarDays,
  MessageCircle, Share2, Bookmark, ThumbsUp, Sparkles, PawPrint, Siren,
  Building2, Dog, Cat, Bird, HeartHandshake, ClipboardList, BadgeCheck,
  TrendingUp, Filter, Plus, Upload, ArrowRight, ArrowLeft, LayoutDashboard,
  ShieldCheck, FileWarning, Truck, Scissors, GraduationCap, Package,
  AlertTriangle, CheckCircle2, Circle, Settings, LogOut, Mail, Lock,
  ImagePlus, Send, Eye, MoreHorizontal, Award, Activity,
  Trophy, Crown, Loader, Shield, RefreshCw, SearchX,
  MapPinOff, XCircle, ExternalLink
} from "lucide-react";
import { fetchNearbyPlaces, fetchTextSearch, fetchMultiTextSearch } from './services/placesApi';
import ErrorBoundary from "./components/ErrorBoundary";
import { useAuth } from "./contexts/AuthContext";
import { LocationProvider, useUserLocation } from "./contexts/LocationContext";
import { getGlobalDonations, getTotalDonated, addDonation as addGlobalDonation, getCategoryFunds, updateCategoryFund, calculateAvailableFund, calculateRequiredFund, calculateUtilization } from './services/donationService';
import { useNotifications } from "./contexts/NotificationContext";
import { MikoChatbot } from "./components/MikoChatbot.jsx";



function RelativeTime({ timestamp }) {
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
        setTimeStr(`${m}m ago`);
      } else if (diff < 86400) {
        const h = Math.floor(diff / 3600);
        setTimeStr(`${h}h ago`);
      } else if (diff < 172800) {
        setTimeStr("1d ago");
      } else if (diff < 604800) {
        const d = Math.floor(diff / 86400);
        setTimeStr(`${d}d ago`);
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
function useFonts() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
}

const fontDisplay = { fontFamily: "'Sora', sans-serif" };
const fontBody = { fontFamily: "'Inter', sans-serif" };

/* ---------------------------------- SHARED COMPONENTS ---------------------------------- */
function ImageWithFallback({ src, alt, className }) {
  const [error, setError] = useState(false);
  return (
    <img 
      src={error ? "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80" : src} 
      alt={alt} 
      className={className} 
      onError={() => setError(true)} 
    />
  );
}

/* ---------------------------------- REWARDS: CONTEXT / PROVIDER ---------------------------------- */
import { ANIMALS, PROVIDERS, EVENTS, POSTS, PRODUCTS, SERVICES, rewardsConfig, REWARD_RULES, parseRupees, pointsToDiscountValue, calculateMarketplaceDiscount, calculateEventDiscount, canRedeemPoints, calculateHaversineDistance, DONATION_FUND_DATA, DONATION_HISTORY, MOCK_NOTIFICATIONS, COMMUNITIES } from './data/mockData';
import { joinCommunity, leaveCommunity, isMember, getJoinedCommunities } from './services/communityService';
import {
  getSavedAnimals, saveAnimal, unsaveAnimal, isAnimalSaved,
  getAdoptionApplications, submitAdoptionApplication, hasApplied,
  getRescueRequests, addRescueRequest,
  getAppointments, addAppointment,
  getUserDonations, addUserDonation,
  getDashboardData,
} from './services/userDataService';

const RewardsContext = React.createContext(null);
function useRewards() {
  return React.useContext(RewardsContext);
}

function RewardsProvider({ children, toast }) {
  const auth = useAuth();
  const notifs = useNotifications();
  const [balance, setBalance] = useState(850);
  const [lifetime, setLifetime] = useState(1250);
  const [redeemed, setRedeemed] = useState(400);
  const [impact] = useState({ animalsHelped: 8, rescues: 3, eventsAttended: 4, volunteerHours: 12, contributions: 12 });

  const [transactions, setTransactions] = useState([
    { id: "t1", action_type: "rescue", reference_id: "PS-RQ-7710", points: 100, description: "Verified animal rescue", status: "credited", created_at: "3 days ago" },
    { id: "t2", action_type: "volunteer", reference_id: "POST-1", points: 75, description: "Volunteer participation", status: "credited", created_at: "2 days ago" },
    { id: "t3", action_type: "event_attendance", reference_id: "EVENT-102", points: 30, description: "Community event attendance", status: "credited", created_at: "Yesterday" },
    { id: "t4", action_type: "marketplace_redeem", reference_id: "ORDER-442", points: -250, description: "Marketplace discount redemption", status: "redeemed", created_at: "10 Aug" },
  ]);
  const [awardedKeys, setAwardedKeys] = useState(new Set(["rescue:PS-RQ-7710", "volunteer:POST-1", "event_attendance:EVENT-102", "marketplace_redeem:ORDER-442"]));
  const [pendingVerifications, setPendingVerifications] = useState([]);

  const ruleFor = (actionType) => REWARD_RULES.find((r) => r.action_type === actionType);
  const addTransaction = (tx) => setTransactions((prev) => [{ id: Math.random().toString(36).slice(2), created_at: "Just now", ...tx }, ...prev]);

  // Step 1: user performs an action → goes to "pending" until verified (anti-abuse: one reward per action_type+reference_id)
  const submitForVerification = (actionType, referenceId, description) => {
    const key = `${actionType}:${referenceId}`;
    if (awardedKeys.has(key)) { toast?.push("This activity has already been rewarded", "amber"); return false; }
    if (pendingVerifications.some((p) => `${p.action_type}:${p.reference_id}` === key)) { toast?.push("Already pending verification", "amber"); return false; }
    const rule = ruleFor(actionType);
    setPendingVerifications((prev) => [...prev, { id: Math.random().toString(36).slice(2), action_type: actionType, reference_id: referenceId, description: description || rule?.label, points: rule?.points || 0 }]);
    toast?.push("Your reward is pending verification.", "amber");
    return true;
  };

  // Step 2: verified/approved → credits points, records a transaction
  const awardPoints = (actionType, referenceId, description, pointsOverride) => {
    const key = `${actionType}:${referenceId}`;
    if (awardedKeys.has(key)) { toast?.push("Already rewarded for this activity", "amber"); return false; }
    const rule = ruleFor(actionType);
    const points = pointsOverride ?? rule?.points ?? 0;
    setBalance((b) => b + points);
    setLifetime((l) => l + points);
    setAwardedKeys((prev) => new Set(prev).add(key));
    setPendingVerifications((prev) => prev.filter((p) => `${p.action_type}:${p.reference_id}` !== key));
    addTransaction({ action_type: actionType, reference_id: referenceId, points, description: description || rule?.label, status: "credited" });
    toast?.push(`🎉 You earned ${points} P-Points!`);
    
    // Trigger notification
    if (notifs?.addNotification) {
      notifs.addNotification(
        "reward", 
        "Reward earned", 
        `You earned +${points} P-Points for: ${description || rule?.label}`, 
        "/rewards",
        `reward-${key}`
      );
    }
    return true;
  };

  const approveVerification = (id) => {
    const item = pendingVerifications.find((p) => p.id === id);
    if (item) awardPoints(item.action_type, item.reference_id, item.description, item.points);
  };
  const rejectVerification = (id) => {
    setPendingVerifications((prev) => prev.filter((p) => p.id !== id));
    toast?.push("Reward request rejected", "amber");
  };

  const redeemPoints = (points, referenceType, referenceId, discountAmount) => {
    if (!canRedeemPoints(balance, points)) { toast?.push("Not enough P-Points for this redemption", "amber"); return false; }
    setBalance((b) => b - points);
    setRedeemed((r) => r + points);
    addTransaction({ action_type: `${referenceType}_redeem`, reference_id: referenceId, points: -points, description: `${referenceType === "marketplace" ? "Marketplace" : "Event"} discount redemption`, status: "redeemed" });
    toast?.push(`${points} P-Points redeemed for ₹${discountAmount} off.`);
    return true;
  };

  const manualAdjust = (points, description) => {
    setBalance((b) => b + points);
    if (points > 0) setLifetime((l) => l + points);
    addTransaction({ action_type: "admin_adjustment", reference_id: "ADMIN", points, description, status: points >= 0 ? "credited" : "redeemed" });
    toast?.push(points >= 0 ? `Admin credited ${points} P-Points` : `Admin removed ${Math.abs(points)} P-Points`);
  };

  const value = {
    balance: auth.user ? balance : 0,
    lifetime: auth.user ? lifetime : 0,
    redeemed: auth.user ? redeemed : 0,
    transactions: auth.user ? transactions : [],
    pendingVerifications: auth.user ? pendingVerifications : [],
    impact: auth.user ? impact : { animalsHelped: 0, rescues: 0, eventsAttended: 0, volunteerHours: 0, contributions: 0 },
    rules: REWARD_RULES, awardedKeys,
    submitForVerification, awardPoints, approveVerification, rejectVerification, redeemPoints, manualAdjust,
  };
  return <RewardsContext.Provider value={value}>{children}</RewardsContext.Provider>;
}

/* ---------------------------------- DONATIONS: CONTEXT / PROVIDER ---------------------------------- */
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
      const stored = localStorage.getItem(`petsogram_badges_${auth.user?.id || 'demo'}`);
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
          notifs.addNotification("reward", "🏆 Achievement Unlocked!", `You earned ${badge.name}: ${badge.desc}`, "/profile", `badge-${badge.id}`);
        }
      }
    });

    // Evaluate Rank Ups
    const currentRankId = `rank_${currentRankInfo.rank.replace(/\s+/g, '')}`;
    if (!unlockedBadges.find(ub => ub.id === currentRankId)) {
      newUnlocks.push({
        id: currentRankId,
        date: Date.now(),
        type: "rank",
        rankName: currentRankInfo.rank
      });
      
      if (badgeSettings.rankNotifications && notifs?.addNotification) {
        notifs.addNotification("reward", "🌟 Rank Up!", `You are now a ${currentRankInfo.rank}! ${pointsRemaining ? pointsRemaining + ' points to next rank.' : ''}`, "/profile", `rank-${currentRankInfo.rank}`);
      }
    }

    if (newUnlocks.length > 0) {
      const updated = [...unlockedBadges, ...newUnlocks];
      setUnlockedBadges(updated);
      localStorage.setItem(`petsogram_badges_${auth.user.id}`, JSON.stringify(updated));
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

const DonationContext = React.createContext(null);
function useDonations() {
  return React.useContext(DonationContext);
}

function DonationProvider({ children }) {
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
      purpose: `${category} support`,
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

/* ---------------------------------- NAV ITEMS ---------------------------------- */
const NAV_ITEMS = [
  { key: "home", label: "Home" },
  { key: "discover", label: "Discover" },
  { key: "emergency", label: "Emergency" },
  { key: "adopt", label: "Adopt" },
  { key: "community", label: "Community" },
  { key: "services", label: "Services" },
  { key: "marketplace", label: "Marketplace" },
  { key: "donate", label: "Donate" },
];

/* ---------------------------------- SMALL UI PRIMITIVES ---------------------------------- */
const Badge = ({ children, tone = "emerald" }) => {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    stone: "bg-stone-100 text-stone-600 border-stone-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${tones[tone]}`}>{children}</span>;
};

const Button = ({ children, variant = "primary", className = "", ...props }) => {
  const variants = {
    primary: "bg-gradient-to-b from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-md shadow-emerald-900/10 hover:shadow-lg hover:shadow-emerald-900/15 hover:-translate-y-0.5",
    secondary: "bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 shadow-sm hover:-translate-y-0.5",
    emergency: "bg-gradient-to-b from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600 shadow-md shadow-amber-900/15 hover:shadow-lg hover:shadow-amber-900/20 hover:-translate-y-0.5",
    ghost: "text-stone-600 hover:bg-stone-100",
    dark: "bg-gradient-to-b from-stone-800 to-stone-900 text-white hover:from-stone-900 hover:to-black shadow-md hover:-translate-y-0.5",
    outlineLight: "bg-white/10 text-white border border-white/25 hover:bg-white/20 hover:-translate-y-0.5",
  };
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:pointer-events-none ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-stone-200/80 shadow-sm shadow-stone-200/60 transition-shadow duration-200 ${className}`}>{children}</div>
);

const SectionHeading = ({ eyebrow, title, subtitle, center }) => (
  <div className={`mb-10 ${center ? "text-center" : ""}`}>
    {eyebrow && (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm">
        <Sparkles size={12} /> {eyebrow}
      </span>
    )}
    <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mt-4" style={fontDisplay}>{title}</h2>
    <div className={`h-1 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 mt-4 ${center ? "mx-auto" : ""}`} />
    {subtitle && <p className="text-stone-500 mt-4 max-w-2xl text-base leading-relaxed" style={{ ...fontBody, marginLeft: center ? "auto" : 0, marginRight: center ? "auto" : 0 }}>{subtitle}</p>}
  </div>
);

function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = (msg, tone = "emerald") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };
  const el = (
    <div className="fixed top-5 right-5 z-[999] flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 bg-white ${t.tone === "amber" ? "border-amber-300 text-amber-800" : "border-emerald-300 text-emerald-800"}`} style={fontBody}>
          <CheckCircle2 size={16} /> {t.msg}
        </div>
      ))}
    </div>
  );
  return { push, el };
}

/* ---------------------------------- IMAGE UPLOADER ---------------------------------- */
function ImageUploader({ toast, accent = "emerald" }) {
  const inputRef = React.useRef(null);
  const [files, setFiles] = useState([]);

  const handleFiles = (fileList) => {
    const picked = Array.from(fileList).slice(0, 4 - files.length);
    if (picked.length === 0) return;
    picked.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        setFiles((prev) => [...prev, { id: Math.random().toString(36).slice(2), name: file.name, url: e.target.result }]);
      };
      reader.readAsDataURL(file);
    });
    if (toast) toast.push(`${picked.length} file${picked.length > 1 ? "s" : ""} added`);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-emerald-400", "bg-emerald-50/40");
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));
  const ring = accent === "rose" ? "hover:border-rose-400 focus:ring-rose-400" : "hover:border-emerald-400 focus:ring-emerald-400";

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ""; }} />
      {files.length === 0 ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-emerald-400", "bg-emerald-50/40"); }}
          onDragLeave={(e) => e.currentTarget.classList.remove("border-emerald-400", "bg-emerald-50/40")}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
          className={`border-2 border-dashed border-stone-300 rounded-xl p-8 text-center text-stone-400 cursor-pointer transition-colors ${ring}`}
        >
          <ImagePlus className="mx-auto mb-2" size={26} />
          <p className="text-sm font-medium text-stone-500">Click to upload, or drag and drop</p>
          <p className="text-xs text-stone-400 mt-1">PNG, JPG or MP4, up to 4 files</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-4 gap-3">
            {files.map((f) => (
              <div key={f.id} className="relative group aspect-square rounded-xl overflow-hidden border border-stone-200">
                <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                <button onClick={() => removeFile(f.id)} aria-label={`Remove ${f.name}`} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-stone-900/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={13} />
                </button>
              </div>
            ))}
            {files.length < 4 && (
              <button onClick={() => inputRef.current?.click()} className={`aspect-square rounded-xl border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 ${ring}`}>
                <Plus size={20} />
              </button>
            )}
          </div>
          <p className="text-xs text-stone-400 mt-2">{files.length} file{files.length > 1 ? "s" : ""} attached</p>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- SEARCH OVERLAY ---------------------------------- */
function SearchOverlay({ isOpen, onClose, setPage }) {
  const [query, setQuery] = useState("");
  const inputRef = React.useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalize = (value) => String(value ?? "").toLowerCase().trim();

  const SYNONYMS = {
    dog: ["dogs", "puppy", "puppies", "canine"],
    cat: ["cats", "kitten", "kittens", "feline"],
    vet: ["vets", "veterinary", "veterinarian", "veterinary care", "animal doctor", "clinic", "hospital"],
    adoption: ["adopt", "adoptable", "pet adoption", "animal adoption"],
    rescue: ["rescuer", "rescuers", "animal rescue", "emergency rescue"],
    grooming: ["groomer", "pet grooming", "pet groomer"],
    food: ["pet food", "dog food", "cat food", "animal food"],
    marketplace: ["shop", "store", "products", "pet products"]
  };

  // Normalize all datasets into a unified search index
  const unifiedIndex = [
    ...ANIMALS.map(a => ({
      id: `animal-${a.id}`,
      type: "animal",
      title: a.name || "Unknown Animal",
      subtitle: `${a.species || ''} • ${a.age || ''}`,
      category: "Adoption",
      route: "adopt",
      speciesMatch: a.species,
      descMatch: a.description,
      locMatch: a.location,
      searchText: `${a.name ?? ""} ${a.species ?? ""} ${a.breed ?? ""} ${a.location ?? ""} animal adoption pet dog cat bird`
    })),
    ...PROVIDERS.map(p => ({
      id: `provider-${p.id}`,
      type: "provider",
      title: p.name || "Unknown Provider",
      subtitle: p.type || "Provider",
      category: "Provider",
      route: "emergency",
      speciesMatch: p.type,
      descMatch: p.description,
      locMatch: p.location,
      searchText: `${p.name ?? ""} ${p.type ?? ""} ${p.location ?? ""} provider vet veterinary shelter rescue ngo emergency hospital clinic`
    })),
    ...Object.entries(SERVICES).flatMap(([category, items]) => 
      items?.map(s => ({
        id: `service-${s.id}`,
        type: "service",
        title: s.name || "Unknown Service",
        subtitle: s.location || "Service",
        category: "Service",
        route: "services",
        speciesMatch: category,
        descMatch: s.description,
        locMatch: s.location,
        searchText: `${s.name ?? ""} ${s.location ?? ""} ${category} service vet veterinary grooming boarding training pet`
      }))
    ),
    ...Object.values(PRODUCTS).flat().map(p => ({
      id: `product-${p.id}`,
      type: "marketplace",
      title: p.name || "Unknown Product",
      subtitle: p.condition || "Product",
      category: "Marketplace",
      route: "marketplace",
      speciesMatch: p.category, // e.g. "Food", "Accessories"
      descMatch: p.description,
      locMatch: p.location,
      searchText: `${p.name ?? ""} ${p.condition ?? ""} ${p.location ?? ""} product marketplace buy sell store shop food leash bed accessory`
    })),
    ...EVENTS.map(e => ({
      id: `event-${e.id}`,
      type: "event",
      title: e.name || "Unknown Event",
      subtitle: e.date || "Event",
      category: "Event",
      route: "events",
      speciesMatch: "",
      descMatch: e.description,
      locMatch: e.location,
      searchText: `${e.name ?? ""} ${e.location ?? ""} ${e.date ?? ""} event community meetup workshop drive volunteer`
    }))
  ];

  let results = [];
  const q = normalize(query);
  
  if (q) {
    // 1. Tokenize query
    const tokens = q.split(/\s+/).filter(Boolean);
    
    // 2. Expand synonyms
    const expandedTokens = new Set(tokens);
    tokens.forEach(t => {
      // Direct dictionary match
      for (const [key, syns] of Object.entries(SYNONYMS)) {
        if (key === t || syns.includes(t) || q.includes(key)) {
          expandedTokens.add(key);
          syns.forEach(s => expandedTokens.add(s));
        }
      }
    });
    // Add the full query as a token
    expandedTokens.add(q);
    const searchTerms = Array.from(expandedTokens);
    
    // Detect strict species filtering
    const isDogQuery = searchTerms.includes("dog");
    const isCatQuery = searchTerms.includes("cat");

    // 3. Score and Filter
    const scoredResults = unifiedIndex.map(item => {
      let score = 0;
      const title = normalize(item.title);
      const cat = normalize(item.category);
      const sp = normalize(item.speciesMatch);
      const loc = normalize(item.locMatch);
      const desc = normalize(item.descMatch);
      const text = normalize(item.searchText);
      
      // Species exclusion penalty (don't show cats if strictly searching dog)
      if (isDogQuery && sp === "cat") return { ...item, score: -1 };
      if (isCatQuery && sp === "dog") return { ...item, score: -1 };

      // Exact matches
      if (title === q) score += 100;
      else if (title.startsWith(q)) score += 80;
      else if (title.includes(q)) score += 60;
      
      // Token matches
      searchTerms.forEach(term => {
        if (title.includes(term) && term !== q) score += 30;
        if (cat === term) score += 50;
        else if (cat.includes(term)) score += 25;
        if (sp === term) score += 45;
        else if (sp.includes(term)) score += 20;
        if (loc.includes(term)) score += 10;
        if (desc.includes(term)) score += 20;
        if (text.includes(term)) score += 5; // fallback synonym match
      });
      
      return { ...item, score };
    }).filter(item => item.score > 0);
    
    // 4. Sort and Limit
    results = scoredResults.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  return (
    <>
      <div className="fixed inset-0 z-60 bg-stone-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-16 left-0 w-full bg-white border-b border-stone-200 shadow-xl z-60 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-stone-400" size={20} />
            <input
              ref={inputRef}
              type="search"
              aria-label="Search Petsogram"
              placeholder="Search animals, vets, services, events..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-12 pr-12 py-3.5 text-stone-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-4 top-3.5 text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            )}
          </div>
          
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            {!query && (
              <div className="px-2">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Suggested</p>
                <div className="flex gap-2 flex-wrap">
                  {["Dogs", "Cats", "Veterinary care", "Adoption", "Marketplace"].map(s => (
                    <button key={s} onClick={() => setQuery(s)} className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 text-sm font-medium hover:bg-stone-200">{s}</button>
                  ))}
                </div>
              </div>
            )}
            {query && results.length > 0 && (
              <div className="space-y-1">
                {results.slice(0, 15)?.map((r, i) => (
                  <button 
                    key={`${r.id}-${i}`}
                    onClick={() => { setPage(r.route); onClose(); }} 
                    className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 group transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-stone-900 group-hover:text-emerald-700">{r.title}</p>
                      <p className="text-xs text-stone-500">{r.subtitle}</p>
                    </div>
                    <Badge tone="emerald">{r.category}</Badge>
                  </button>
                ))}
              </div>
            )}
            {query && results.length === 0 && (
              <div className="text-center py-8">
                <p className="font-semibold text-stone-900 mb-1">No results found</p>
                <p className="text-sm text-stone-500">Try animals, vets, services, events or products.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------------------------- NOTIFICATION PANEL ---------------------------------- */
function NotificationPanel({ isOpen, onClose, setPage, auth, notifications, markRead, markAllRead }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = (type) => {
    if (type === "reward") return Gift;
    if (type === "adoption") return PawPrint;
    if (type === "emergency") return Siren;
    return Bell;
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-transparent" onClick={onClose} />
      <div className="absolute top-14 right-4 sm:right-6 w-80 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <p className="font-bold text-stone-900">Notifications</p>
          {auth.user && notifications.some(n => !n.read) && (
            <button onClick={markAllRead} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">Mark all as read</button>
          )}
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {!auth.user ? (
            <div className="p-6 text-center">
              <p className="text-sm text-stone-500 mb-4">Log in to view your notifications.</p>
              <Button variant="secondary" onClick={() => { auth.requireAuthAction(() => {}); onClose(); }}>Log in</Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-stone-500">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-stone-300" />
              <p className="font-semibold text-stone-900 mb-1">You're all caught up</p>
              <p className="text-xs">No new notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {notifications?.map((n) => {
                const Icon = getIcon(n.type);
                return (
                  <button 
                    key={n.id}
                    onClick={() => { markRead(n.id); setPage(n.action_route || n.route); onClose(); }}
                    className={`w-full text-left p-4 flex gap-3 transition-colors hover:bg-stone-50 ${n.read ? 'opacity-60' : 'bg-emerald-50/30'}`}
                  >
                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.read ? 'bg-stone-100' : 'bg-emerald-100'}`}>
                      <Icon size={14} className={n.read ? 'text-stone-500' : 'text-emerald-700'} />
                    </div>
                    <div>
                      <p className={`text-sm ${n.read ? 'font-medium text-stone-700' : 'font-bold text-stone-900'}`}>{n.title}</p>
                      <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-stone-400 mt-1 font-medium"><RelativeTime timestamp={n.timestamp} /></p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ---------------------------------- NAVBAR ---------------------------------- */
function Navbar({ page, setPage, toast }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const rewards = useRewards();
  const auth = useAuth();
  
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const toggleSearch = () => {
    setSearchOpen(prev => !prev);
    if (!searchOpen) setNotifOpen(false);
  };

  const toggleNotif = () => {
    setNotifOpen(prev => !prev);
    if (!notifOpen) setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-stone-200 shadow-sm shadow-stone-200/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button onClick={() => setPage("home")} className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center shadow-sm shadow-emerald-900/20 group-hover:scale-105 transition-transform">
            <PawPrint size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-stone-900 tracking-tight" style={fontDisplay}>Petsogram</span>
        </button>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((n) => (
            <button
              key={n.key}
              onClick={() => setPage(n.key)}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${page === n.key ? "text-emerald-700 bg-emerald-50" : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"}`}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-1.5">
          <button onClick={toggleSearch} className={`p-2.5 rounded-lg transition-colors ${searchOpen ? 'bg-stone-100 text-stone-900' : 'text-stone-500 hover:bg-stone-100'}`}><Search size={18} /></button>
          <div className="relative">
            <button onClick={toggleNotif} className={`p-2.5 rounded-lg transition-colors relative ${notifOpen ? 'bg-stone-100 text-stone-900' : 'text-stone-500 hover:bg-stone-100'}`}>
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border border-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationPanel 
              isOpen={notifOpen} 
              onClose={() => setNotifOpen(false)} 
              setPage={setPage}
              auth={auth}
              notifications={notifications}
              markRead={markAsRead}
              markAllRead={markAllAsRead}
            />
          </div>
          <button onClick={() => setPage("rewards")} className={`hidden md:flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${page === "rewards" ? "bg-emerald-50 text-emerald-700" : "text-stone-600 hover:bg-stone-100"}`}>
            <Gift size={16} className="text-emerald-600" /> {rewards.balance.toLocaleString()}
          </button>
          {auth.user ? (
            <button onClick={() => setPage("dashboard")} className="p-2.5 rounded-lg text-stone-500 hover:bg-stone-100"><User size={18} /></button>
          ) : (
            <button onClick={() => setPage("login")} className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-stone-600 hover:text-stone-900 border border-stone-200 ml-2">Log in</button>
          )}
          <Button variant="emergency" onClick={() => setPage("emergency")} className="ml-2"><Siren size={16} /> Get Help</Button>
        </div>

        <div className="lg:hidden flex items-center gap-1">
          <button onClick={toggleSearch} className="p-2 text-stone-700"><Search size={22} /></button>
          <button onClick={toggleNotif} className="p-2 text-stone-700 relative">
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border border-white">
                {unreadCount}
              </span>
            )}
          </button>
          <NotificationPanel 
            isOpen={notifOpen} 
            onClose={() => setNotifOpen(false)} 
            setPage={setPage}
            auth={auth}
            notifications={notifications}
            markRead={markAsRead}
            markAllRead={markAllAsRead}
          />
          <button className="p-2 text-stone-700" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} setPage={setPage} />

      {open && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-3 flex flex-col gap-1">
          {NAV_ITEMS.map((n) => (
            <button key={n.key} onClick={() => { setPage(n.key); setOpen(false); }} className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium ${page === n.key ? "text-emerald-700 bg-emerald-50" : "text-stone-600"}`}>
              {n.label}
            </button>
          ))}
          <button onClick={() => { setPage("rewards"); setOpen(false); }} className={`flex items-center gap-2 text-left px-3 py-2.5 rounded-lg text-sm font-medium ${page === "rewards" ? "text-emerald-700 bg-emerald-50" : "text-stone-600"}`}>
            <Gift size={16} className="text-emerald-600" /> Rewards — {rewards.balance.toLocaleString()} P-Points
          </button>
          <div className="flex gap-2 mt-2">
            {auth.user ? (
              <Button variant="secondary" onClick={() => { setPage("dashboard"); setOpen(false); }} className="flex-1">Dashboard</Button>
            ) : (
              <Button variant="secondary" onClick={() => { setPage("login"); setOpen(false); }} className="flex-1">Log in</Button>
            )}
            <Button variant="emergency" onClick={() => { setPage("emergency"); setOpen(false); }} className="flex-1"><Siren size={16} /> Get Help</Button>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------------------------------- FOOTER ---------------------------------- */
function Footer({ setPage }) {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center"><PawPrint size={16} className="text-white" /></div>
            <span className="text-white font-bold text-lg" style={fontDisplay}>Petsogram</span>
          </div>
          <p className="text-sm text-stone-400 max-w-xs leading-relaxed">Connecting people. Caring for animals. One ecosystem for animal welfare, care and community.</p>
        </div>
        {[
          { title: "Platform", items: ["discover", "emergency", "adopt", "community", "rewards"] },
          { title: "Services", items: ["services", "marketplace", "donate", "rehoming"] },
          { title: "Company", items: ["dashboard", "admin", "login", "signup"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-white font-semibold text-sm mb-3">{col.title}</h4>
            <ul className="space-y-2">
              {col.items?.map((it) => (
                <li key={it}><button onClick={() => setPage(it)} className="text-sm text-stone-400 hover:text-white capitalize">{it}</button></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-stone-800 py-5 text-center text-xs text-stone-500">Petsogram is a demo prototype built for hackathon presentation. All organizations and listings shown are fictional sample data.</div>
    </footer>
  );
}

/* ---------------------------------- ANIMATED COUNTER ---------------------------------- */
function Counter({ to, suffix = "" }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf; const start = performance.now(); const dur = 1200;
    const step = (t) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.floor(p * to));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span>{n.toLocaleString()}{suffix}</span>;
}

/* ---------------------------------- HOME PAGE ---------------------------------- */
function HomePage({ setPage, toast }) {
  const quickActions = [
    { icon: Siren, label: "Emergency Help", key: "emergency", tone: "amber" },
    { icon: Stethoscope, label: "Find a Vet", key: "discover" },
    { icon: HomeIcon, label: "Adopt", key: "adopt" },
    { icon: Heart, label: "Donate", key: "donate" },
    { icon: ShieldAlert, label: "Report Abuse", key: "report" },
    { icon: Users, label: "Join Community", key: "community" },
  ];
  const stats = [
    { label: "Animals helped", value: 48210, icon: PawPrint },
    { label: "Successful adoptions", value: 9640, icon: HomeIcon },
    { label: "Verified vets", value: 812, icon: Stethoscope },
    { label: "Active volunteers", value: 5310, icon: Users },
    { label: "Rescue cases", value: 21870, icon: Siren },
    { label: "Donations supported", value: 36400, icon: Heart },
  ];
  const journey = [
    { icon: Siren, label: "Emergency case" },
    { icon: Navigation, label: "Nearest rescuer" },
    { icon: Stethoscope, label: "Nearest vet" },
    { icon: Activity, label: "Medical assistance" },
    { icon: TrendingUp, label: "Recovery" },
    { icon: HomeIcon, label: "Adoption" },
    { icon: HeartHandshake, label: "Follow-up care" },
  ];
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 pb-28">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle, #fff 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
        <div className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full bg-emerald-600/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-[360px] h-[360px] rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-10 grid md:grid-cols-2 gap-12 items-center relative">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-200">Technology-driven animal welfare</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-5 leading-[1.1] tracking-tight" style={fontDisplay}>Every paw deserves <span className="text-amber-400">a safe place.</span></h1>
            <p className="text-lg text-emerald-100/80 mt-5 leading-relaxed max-w-md">Connecting people, care, and resources to create a safer world for animals.</p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Button variant="emergency" onClick={() => setPage("emergency")}><Siren size={17} /> Find Help</Button>
              <Button variant="outlineLight" onClick={() => setPage("adopt")}>Explore Animals <ArrowRight size={16} /></Button>
            </div>
            <div className="flex items-center gap-6 mt-10">
              <div><p className="text-2xl font-bold text-white" style={fontDisplay}><Counter to={48210} /></p><p className="text-xs text-emerald-200/70">Animals helped</p></div>
              <div className="w-px h-10 bg-emerald-700" />
              <div><p className="text-2xl font-bold text-white" style={fontDisplay}><Counter to={812} /></p><p className="text-xs text-emerald-200/70">Verified vets</p></div>
              <div className="w-px h-10 bg-emerald-700" />
              <div><p className="text-2xl font-bold text-white" style={fontDisplay}><Counter to={5310} /></p><p className="text-xs text-emerald-200/70">Volunteers</p></div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-amber-400/20 to-emerald-400/10 rounded-[2rem] blur-xl -z-10" />
            <img src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=900" alt="Rescued dog" className="rounded-3xl w-full h-[420px] object-cover shadow-2xl shadow-black/40 ring-1 ring-white/10" />
            <Card className="absolute -bottom-6 -left-6 p-4 flex items-center gap-3 hidden sm:flex shadow-xl">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center"><ShieldCheck size={18} className="text-emerald-700" /></div>
              <div><p className="text-sm font-semibold text-stone-900">Verified network</p><p className="text-xs text-stone-500">812 vets & shelters</p></div>
            </Card>
            <Card className="absolute -top-5 -right-5 p-3 flex items-center gap-2 hidden sm:flex shadow-xl">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center"><Sparkles size={15} className="text-amber-600" /></div>
              <div><p className="text-xs font-semibold text-stone-900">AI-assisted</p><p className="text-[11px] text-stone-500">Triage & matching</p></div>
            </Card>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
        <Card className="p-5 md:p-6 shadow-2xl shadow-emerald-900/15">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {quickActions?.map((q) => (
              <button key={q.label} onClick={() => (q.key === "report" ? setPage("report") : setPage(q.key))}
                className={`flex flex-col items-center gap-2.5 rounded-xl p-4 transition-all duration-200 hover:-translate-y-1 ${q.tone === "amber" ? "bg-gradient-to-b from-amber-50 to-amber-50/50 hover:shadow-md hover:shadow-amber-900/10" : "bg-stone-50 hover:shadow-md hover:shadow-stone-300/40"}`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${q.tone === "amber" ? "bg-gradient-to-br from-amber-400 to-amber-500 text-white" : "bg-gradient-to-br from-emerald-600 to-emerald-800 text-white"}`}>
                  <q.icon size={20} />
                </div>
                <span className="text-xs font-semibold text-stone-700 text-center">{q.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-stone-900 to-emerald-950 py-20 mt-20">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle, #fff 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }} />
        <div className="max-w-7xl mx-auto px-6 relative">
          <Badge tone="amber">Live impact</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-3" style={fontDisplay}>Our ecosystem, in numbers</h2>
          <p className="text-emerald-200/70 mt-3 max-w-2xl text-base leading-relaxed">Demo statistics illustrating platform scale. Figures shown are sample data for prototype purposes.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mt-10">
            {stats?.map((s) => (
              <div key={s.label} className="rounded-2xl p-6 bg-white/5 border border-white/10 backdrop-blur hover:bg-white/10 hover:-translate-y-1 transition-all duration-200">
                <div className="w-10 h-10 rounded-lg bg-amber-400/15 flex items-center justify-center mb-4"><s.icon size={18} className="text-amber-400" /></div>
                <p className="text-3xl font-bold text-white" style={fontDisplay}><Counter to={s.value} /></p>
                <p className="text-sm text-emerald-200/70 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <SectionHeading eyebrow="The Petsogram loop" title="One connected journey, start to follow-up" subtitle="From the moment an emergency is reported to long-term adoption follow-up, every step is linked so no animal falls through the cracks." center />
        <div className="relative">
          <div className="hidden sm:block absolute top-7 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
          <div className="flex flex-wrap justify-center items-start gap-x-2 gap-y-8 relative">
            {journey?.map((j) => (
              <div key={j.label} className="flex flex-col items-center gap-2 w-28 group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-800 text-white flex items-center justify-center shadow-md shadow-emerald-900/20 group-hover:-translate-y-1 group-hover:shadow-lg transition-all duration-200 ring-4 ring-stone-50"><j.icon size={22} /></div>
                <span className="text-xs font-semibold text-stone-700 text-center leading-tight">{j.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function LocationPickerModal({ onClose, onConfirm, initialLocation, toast }) {
  const [lat, setLat] = useState(initialLocation?.lat || "");
  const [lng, setLng] = useState(initialLocation?.lng || "");
  const [address, setAddress] = useState(initialLocation?.address || "");
  const [isFetching, setIsFetching] = useState(false);

  const fetchModalLocation = () => {
    if (!navigator.geolocation) {
      toast.push("Geolocation not supported by browser", "rose");
      return;
    }
    setIsFetching(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setIsFetching(false);
        toast.push("Location fetched successfully", "emerald");
      },
      (err) => {
        setIsFetching(false);
        toast.push("Failed to get location: " + err.message, "rose");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    if (!lat || !lng) {
      toast.push("Please provide valid coordinates", "amber");
      return;
    }
    onConfirm({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      address: address.trim() || "Coordinates entered manually",
      source: "map"
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-70 flex items-center justify-center p-4" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-70 w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-stone-900 mb-2 flex items-center gap-2"><MapPin size={18} className="text-emerald-600"/> Set Animal Rescue Location</h3>
        <p className="text-sm text-stone-500 mb-4">Google Maps API is not configured. Please use your current GPS or enter coordinates manually.</p>
        
        <Button variant="secondary" className="w-full mb-4 py-3 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700" onClick={fetchModalLocation} disabled={isFetching}>
          <MapPin size={16} className={isFetching ? "animate-bounce text-emerald-600" : "text-emerald-600"} /> {isFetching ? "Detecting..." : "Use My Current Location"}
        </Button>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Latitude</label>
            <input 
              type="number" step="any"
              placeholder="e.g. 19.12345" 
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full rounded-xl border border-stone-300 p-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Longitude</label>
            <input 
              type="number" step="any"
              placeholder="e.g. 72.12345" 
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="w-full rounded-xl border border-stone-300 p-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="text-xs font-semibold text-stone-600 mb-1 block">Landmark / Address (Optional)</label>
          <input 
            type="text" 
            placeholder="e.g. Near Bandra Station West" 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-xl border border-stone-300 p-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" className="w-full" onClick={onClose}>Cancel</Button>
          <Button variant="primary" className="w-full" onClick={handleConfirm}>Confirm Rescue Location</Button>
        </div>
      </div>
    </>
  );
}

/* ---------------------------------- EMERGENCY PAGE ---------------------------------- */
function EmergencyPage({ toast }) {
  const rewards = useRewards();
  const auth = useAuth();
  const { addNotification } = useNotifications();
  const [step, setStep] = useState("form");

  const [severity, setSeverity] = useState("High");
  const [animalType, setAnimalType] = useState("Dog");
  const [desc, setDesc] = useState("");
  const [reporterLocation, setReporterLocation] = useState(null);
  const [pickupPoint, setPickupPoint] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  
  const fetchCurrentLocation = (isRefresh = false) => {
    if (!navigator.geolocation) {
      toast.push("Location permission is required to detect your current location.", "rose");
      return;
    }
    toast.push(isRefresh ? "Refreshing GPS..." : "Fetching location...", "amber");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude, timestamp: pos.timestamp, accuracy: pos.coords.accuracy, source: "current_gps" };
        setReporterLocation(coords);
        
        // Inherit pickupPoint if empty OR if it was already set via GPS (so refresh works)
        setPickupPoint(prev => {
          if (!prev || prev.source === "current_gps") {
            return { ...coords, address: "Using current GPS location" };
          }
          return prev; // Preserve manual selection
        });
        
        toast.push("Location acquired successfully!");
      },
      (err) => {
        toast.push("Failed to get location: " + err.message, "rose");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  };
  const [caseId] = useState(`PS-RQ-${Math.floor(1000 + Math.random() * 9000)}`);
  const [rescueRequested, setRescueRequested] = useState(false);

  const nearby = useMemo(() => {
    let list = PROVIDERS.filter((p) => ["Vets", "Rescuers", "Shelters", "NGOs"].includes(p.type));
    if (reporterLocation) {
      list = list.map((p) => ({
        ...p,
        calculatedDistance: calculateHaversineDistance(reporterLocation.lat, reporterLocation.lng, p.latitude, p.longitude)
      }))
      .filter((p) => p.calculatedDistance <= 50)
      .sort((a, b) => a.calculatedDistance - b.calculatedDistance)
      .slice(0, 5);
    } else {
      list = [];
    }
    return list;
  }, [reporterLocation]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!desc.trim()) { toast.push("Please describe the emergency situation.", "amber"); return; }
    if (!pickupPoint) {
      toast.push("Please select the animal's rescue location.", "amber");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Persist to user's rescue history
      const authUser = auth?.user || null;
      if (authUser?.id) {
        addRescueRequest(authUser.id, {
          caseId,
          animalType,
          description: desc,
          location: reporterLocation, // might be null if user skipped GPS and only chose manual, which is allowed
          pickupPoint: pickupPoint,
          severity,
        });
      }

      try {
        if (addNotification) {
          addNotification("emergency", "Rescue request created", `Your emergency rescue request (${caseId}) has been submitted.`, "/emergency", caseId);
        }
      } catch (notifErr) {
        console.error("Notification failed but emergency succeeded:", notifErr);
      }

      setStep("result");
    } catch (error) {
      console.error("Emergency report submission failed:", error);
      toast.push("Failed to submit emergency report.", "rose");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center"><Siren className="text-white" size={20} /></div>
        <h1 className="text-3xl font-bold text-stone-900" style={fontDisplay}>Animal Emergency Assistance</h1>
      </div>
      <p className="text-stone-500 mb-8">Report an injured or at-risk animal and get connected to the nearest verified help, instantly.</p>

      {step === "form" && (
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="p-6 lg:col-span-2 space-y-6">
            <div>
              <label className="text-sm font-semibold text-stone-700 block mb-2">Upload photo or video</label>
              <ImageUploader toast={toast} />
            </div>
            <div>
              <label className="text-sm font-semibold text-stone-700 block mb-2">Animal type</label>
              <div className="flex gap-2 flex-wrap">
                {["Dog", "Cat", "Bird", "Cattle", "Other"].map((t) => (
                  <button key={t} onClick={() => setAnimalType(t)} className={`px-4 py-2 rounded-lg text-sm font-medium border ${animalType === t ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-stone-600 border-stone-200"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-stone-700 block mb-2">Describe the situation</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} placeholder="E.g. Injured dog near the highway service road, unable to walk..." className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-sm font-semibold text-stone-700 block mb-2">Location Tracking</label>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {!reporterLocation && (
                  <button onClick={() => fetchCurrentLocation()} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all bg-emerald-50 border-emerald-200 text-emerald-700 border hover:bg-emerald-100">
                    <MapPin size={16} /> Share current location
                  </button>
                )}
                {!pickupPoint && reporterLocation && (
                  <button onClick={() => setShowLocationModal(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all bg-white border-stone-200 text-stone-600 border hover:bg-stone-50">
                    <PawPrint size={16} /> Set rescue location
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                {reporterLocation && (
                  <div className="relative bg-stone-50 p-4 rounded-xl border border-stone-200">
                    <div className="flex items-center gap-2 font-semibold text-stone-800 mb-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center"><MapPin size={12} /></span>
                      Current Location
                    </div>
                    <p className="text-sm text-stone-600 ml-7 mb-1">GPS location detected</p>
                    <p className="text-xs text-stone-400 ml-7 font-mono">
                      {reporterLocation.accuracy < 25 ? "Excellent: < 25m" : reporterLocation.accuracy <= 100 ? "Good: 25-100m" : "Approximate: > 100m"}
                    </p>
                    {reporterLocation.accuracy > 200 && <p className="text-xs text-amber-600 mt-1 ml-7">GPS accuracy is currently low. Try moving outdoors.</p>}
                    <button onClick={() => fetchCurrentLocation(true)} className="absolute top-4 right-4 text-xs font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded">Refresh GPS</button>
                  </div>
                )}
                {pickupPoint && (
                  <div className="relative bg-white p-4 rounded-xl border border-emerald-200 shadow-sm shadow-emerald-900/5">
                    <div className="flex items-center gap-2 font-semibold text-emerald-800 mb-1">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center"><PawPrint size={12} /></span>
                      Animal Rescue Location
                    </div>
                    <p className="text-sm text-stone-700 ml-7 mb-2">{pickupPoint.address}</p>
                    {pickupPoint.source === "google_maps" || pickupPoint.source === "google_places" ? (
                       <p className="text-xs text-emerald-600 ml-7 font-medium flex items-center gap-1"><CheckCircle2 size={12}/> Google Maps verified</p>
                    ) : null}
                    
                    <div className="absolute top-4 right-4 flex gap-2">
                       <a href={`https://www.google.com/maps/search/?api=1&query=${pickupPoint.lat},${pickupPoint.lng}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-stone-500 hover:text-stone-800 bg-stone-100 px-2 py-1 rounded">Open Maps</a>
                       <button onClick={() => setShowLocationModal(true)} className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded">Change</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-stone-700 block mb-2">Emergency severity</label>
              <div className="grid grid-cols-4 gap-2">
                {[{ l: "Critical", c: "rose" }, { l: "High", c: "amber" }, { l: "Moderate", c: "blue" }, { l: "Low", c: "emerald" }].map((s) => (
                  <button key={s.l} onClick={() => setSeverity(s.l)} className={`py-2.5 rounded-lg text-sm font-semibold border ${severity === s.l ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200"}`}>{s.l}</button>
                ))}
              </div>
            </div>
            <Button variant="emergency" onClick={submit} disabled={isSubmitting} className={`w-full py-3 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}>
              {isSubmitting ? <span className="flex items-center gap-2"><Loader className="animate-spin" size={17} /> Submitting...</span> : <><Siren size={17} /> Submit emergency report</>}
            </Button>
          </Card>

          <div className="space-y-4">
            <Card className="p-5 bg-amber-50 border-amber-200">
              <div className="flex items-center gap-2 mb-2"><Sparkles size={16} className="text-amber-700" /><p className="font-semibold text-amber-800 text-sm">AI emergency triage</p></div>
              <p className="text-xs text-amber-700 leading-relaxed">Once submitted, our AI assistant analyzes the photo and description to suggest a priority level, helping responders act faster. This is assistance only, not a diagnosis.</p>
            </Card>
            <Card className="p-5">
              <p className="font-semibold text-stone-800 text-sm mb-3">What happens next</p>
              <ol className="space-y-3 text-sm text-stone-500">
                {["Report is triaged instantly", "Nearest vet & rescuer notified", "Rescue request is created", "You get live status updates"].map((s, i) => (
                  <li key={s} className="flex items-start gap-2"><span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>{s}</li>
                ))}
              </ol>
            </Card>
          </div>
        </div>
      )}

      {step === "result" && (
        <div className="space-y-8">
          <Card className="p-6 border-amber-300 bg-amber-50 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center"><AlertTriangle className="text-white" size={22} /></div>
              <div>
                <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5"><Sparkles size={13} /> AI-ASSISTED TRIAGE</p>
                <p className="text-xl font-bold text-stone-900" style={fontDisplay}>Priority: {severity.toUpperCase()}</p>
              </div>
            </div>
            <p className="text-sm text-amber-800 font-medium max-w-sm">Seek professional veterinary assistance immediately. This assessment does not replace a licensed veterinarian.</p>
          </Card>

          <div>
            <h3 className="text-lg font-bold text-stone-900 mb-4" style={fontDisplay}>Nearby help</h3>
            {!reporterLocation ? (
              <Card className="p-6 text-center text-stone-500 border-dashed">
                <MapPin size={24} className="mx-auto text-stone-300 mb-2" />
                <p className="font-semibold text-stone-800 text-sm mb-1">Share your location to see accurate nearby help.</p>
                <button onClick={() => { setStep("form"); fetchCurrentLocation(); }} className="text-emerald-700 text-sm font-semibold hover:underline">Use My Current Location</button>
              </Card>
            ) : nearby.length === 0 ? (
              <Card className="p-6 text-center text-stone-500 border-dashed">
                <ShieldAlert size={24} className="mx-auto text-stone-300 mb-2" />
                <p className="font-semibold text-stone-800 text-sm mb-1">No verified help providers found nearby.</p>
                <a href={`https://www.google.com/maps/search/veterinarian/@${reporterLocation.lat},${reporterLocation.lng},13z`} target="_blank" rel="noopener noreferrer" className="text-emerald-700 text-sm font-semibold hover:underline">Open Google Maps to search</a>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {nearby?.map((p) => (
                  <Card key={p.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-stone-900">{p.name}</p>
                        {p.verified && <BadgeCheck size={16} className="text-emerald-600" />}
                      </div>
                      <p className="text-sm text-stone-500 mt-1">{p.type} • {p.location}</p>
                      <div className="flex items-center gap-3 mt-3 text-xs">
                        <span className={`font-semibold ${p.open ? "text-emerald-600" : "text-rose-500"}`}>{p.open ? "Open now" : "Closed"}</span>
                        <span className="flex items-center gap-1 text-stone-500"><Star size={13} className="fill-amber-400 text-amber-400" /> {p.rating}</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                      <Building2 size={18} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-5 pt-4 border-t border-stone-100">
                    <Button variant="secondary" className="flex-1 py-2 text-xs"><Phone size={14} /> Call</Button>
                    <Button variant="secondary" className="flex-1 py-2 text-xs"><MapPin size={14} /> Maps</Button>
                  </div>
                </Card>
                ))}
              </div>
            )}
          </div>

          {!pickupPoint ? (
            <Card className="p-4 bg-rose-50 border-rose-200 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-rose-800 font-semibold text-sm">
                <AlertTriangle size={16} /> Animal rescue location not selected.
              </div>
              <p className="text-xs text-rose-700">Rescuers will not be able to navigate to the animal.</p>
            </Card>
          ) : (
            <Card className="p-4 bg-emerald-50 border-emerald-200 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                <PawPrint size={16} /> Animal Rescue Location
              </div>
              <p className="text-sm text-emerald-900 font-medium">{pickupPoint.address}</p>
              <p className="text-[10px] text-emerald-700 font-mono">Coordinates: {pickupPoint.lat.toFixed(5)}, {pickupPoint.lng.toFixed(5)}</p>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${pickupPoint.lat},${pickupPoint.lng}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 bg-gradient-to-b from-stone-800 to-stone-900 text-white hover:from-stone-900 hover:to-black shadow-md hover:-translate-y-0.5 w-full"
              >
                <MapPin size={16} /> Open in Google Maps
              </a>
            </Card>
          )}

          {reporterLocation && (
            <Card className="p-4 bg-stone-50 border-stone-200">
               <div className="flex items-center gap-2 text-stone-600 font-semibold text-sm mb-1">
                 <MapPin size={14} /> Reporter Location
               </div>
               <p className="text-xs text-stone-500 font-mono">Shared successfully.</p>
            </Card>
          )}
          
          <div className="flex flex-wrap gap-3">
            <Button variant="emergency" disabled={rescueRequested} onClick={() => {
              setRescueRequested(true);
              toast.push(`Rescue request created — case #${caseId}`);
              rewards.submitForVerification("rescue", caseId, "Verified animal rescue");
            }}>
              <Truck size={16} /> {rescueRequested ? "Rescue requested" : "Request Rescue"}
            </Button>
            <Button variant="secondary" onClick={() => toast.push("Connecting you to on-call veterinary help...")}><Phone size={16} /> Call Veterinary Help</Button>
            <Button variant="ghost" onClick={() => setStep("form")}><ArrowLeft size={16} /> Submit another report</Button>
          </div>
          {rescueRequested && (
            <Card className="p-4 bg-emerald-50 border-emerald-200 flex items-center gap-3">
              <Gift size={18} className="text-emerald-700 shrink-0" />
              <p className="text-sm text-emerald-800">Case <span className="font-mono font-semibold">#{caseId}</span> is pending verification. Once our team confirms the rescue, you'll earn <span className="font-semibold">+100 P-Points</span> automatically.</p>
            </Card>
          )}
        </div>
      )}

      {showLocationModal && (
        <LocationPickerModal 
          toast={toast}
          initialLocation={reporterLocation || pickupPoint}
          onClose={() => setShowLocationModal(false)}
          onConfirm={(locationData) => {
            setPickupPoint(locationData);
            setShowLocationModal(false);
            toast.push("Rescue location saved successfully!");
          }}
        />
      )}
    </div>
  );
}

/* ---------------------------------- DISCOVER PAGE ---------------------------------- */


function DiscoverPage() {
  const [tab, setTab] = useState("Vets");
  const [openOnly, setOpenOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState(10);
  const [minRating, setMinRating] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const [livePlaces, setLivePlaces] = useState([]);
  const [isFetchingPlaces, setIsFetchingPlaces] = useState(false);
  
  const tabs = ["Vets", "Shelters", "NGOs", "Rescuers", "Groomers", "Pet Services"];

  const requestGPS = (forceReal = false) => {
    setIsLoadingLocation(true);
    setLocationError("");
    
    if (demoMode && !forceReal) {
      setUserLocation({ lat: 19.0441, lng: 73.0255, acc: 10, timestamp: Date.now() });
      setIsLoadingLocation(false);
      return;
    }
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setIsLoadingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          acc: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setIsLoadingLocation(false);
      },
      (err) => {
        setLocationError("Unable to get your location. Please check permissions.");
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  useEffect(() => { requestGPS(); }, [demoMode]); // eslint-disable-line

  const loadPlaces = async () => {
    if (!userLocation) return;
    setIsFetchingPlaces(true);
    setLocationError("");
    setLivePlaces([]); // Clear old places while loading
    
    // Intelligent Fallback Logic (10km -> 25km -> 50km)
    const radii = [10, 25, 50];
    let finalPlaces = [];
    let apiErrorMsg = "";
    
    for (const testRadius of radii) {
      if (testRadius > Math.max(50, maxDistance)) break; // Don't fetch way beyond what we need
      
      let result;
      if (tab === "Vets") {
        // Vets: use searchNearby + multi-query text fallback
        const r1 = await fetchNearbyPlaces(userLocation.lat, userLocation.lng, testRadius, 'Vets');
        const r2 = await fetchMultiTextSearch(['veterinary hospital', 'animal clinic', 'veterinarian'], userLocation.lat, userLocation.lng, testRadius);
        
        // Merge and deduplicate
        const merged = [...(r1.places || []), ...(r2.places || [])];
        const seen = new Set();
        result = { places: merged.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; }) };
        if (r1.error) apiErrorMsg = r1.error || r1.message;
        
      } else if (tab === "Groomers") {
        result = await fetchMultiTextSearch(['pet grooming', 'dog grooming', 'pet spa'], userLocation.lat, userLocation.lng, testRadius);
      } else if (tab === "Pet Services") {
        result = await fetchMultiTextSearch(['pet boarding', 'pet daycare', 'pet sitter', 'dog trainer'], userLocation.lat, userLocation.lng, testRadius);
      } else if (tab === "Shelters") {
        result = await fetchMultiTextSearch(['animal shelter', 'pet shelter', 'dog shelter'], userLocation.lat, userLocation.lng, testRadius);
      } else if (tab === "NGOs") {
        result = await fetchMultiTextSearch(['animal welfare NGO', 'animal rescue NGO'], userLocation.lat, userLocation.lng, testRadius);
      } else if (tab === "Rescuers") {
        result = await fetchMultiTextSearch(['animal rescue organization', 'pet rescue'], userLocation.lat, userLocation.lng, testRadius);
      }
      
      if (result && result.error) {
         apiErrorMsg = result.error || result.message;
         console.error("[Discover] API Error:", apiErrorMsg);
         break; // Stop trying if API throws a hard error (like missing API key)
      }
      
      if (result && result.places && result.places.length > 0) {
        finalPlaces = result.places;
        break; // Stop expanding radius if we found something
      }
    }
    
    if (apiErrorMsg) {
      setLocationError(`Google API Error: ${apiErrorMsg.slice(0, 80)}`);
    } else {
      setLivePlaces(finalPlaces);
    }
    setIsFetchingPlaces(false);
  };

  useEffect(() => {
    const handler = setTimeout(() => { loadPlaces(); }, 500);
    return () => clearTimeout(handler);
  }, [userLocation, tab, maxDistance]); // eslint-disable-line

  const results = livePlaces.map(place => {
    const pLat = place.location?.latitude;
    const pLng = place.location?.longitude;
    const calcDist = (pLat && pLng && userLocation)
      ? calculateHaversineDistance(userLocation.lat, userLocation.lng, pLat, pLng)
      : null;
    const isOpen = place.currentOpeningHours?.openNow ?? place.regularOpeningHours?.openNow;
    return {
      id: place.id,
      name: place.displayName?.text || "Unknown Place",
      location: place.formattedAddress || "Address unavailable",
      latitude: pLat,
      longitude: pLng,
      rating: place.rating || 0,
      userRatingCount: place.userRatingCount || 0,
      open: isOpen,
      hasOpenInfo: isOpen !== undefined,
      phone: place.nationalPhoneNumber || place.internationalPhoneNumber || "",
      website: place.websiteUri || "",
      googleMapsUri: place.googleMapsUri || (pLat ? `https://www.google.com/maps/dir/?api=1&destination=${pLat},${pLng}` : null),
      calculatedDistance: calcDist,
    };
  })
  .filter(p => p.calculatedDistance != null && p.calculatedDistance <= maxDistance) // STRICT distance filter
  .filter(p => minRating > 0 ? (p.rating > 0 && p.rating >= minRating) : true) // STRICT rating filter
  .filter(p => !openOnly || (p.hasOpenInfo && p.open)) // STRICT openNow filter
  .sort((a, b) => {
    if (a.calculatedDistance == null) return 1;
    if (b.calculatedDistance == null) return -1;
    return a.calculatedDistance - b.calculatedDistance;
  });

  const accuracyLabel = userLocation
    ? userLocation.acc <= 25 ? "High accuracy" : userLocation.acc <= 100 ? "Good accuracy" : "Approximate location"
    : "Detecting...";

  return (
    <div className="bg-stone-50 min-h-[calc(100vh-64px)] pb-24">
      <div className="bg-white border-b border-stone-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-stone-900" style={fontDisplay}>Discover Care</h1>
            <div className="flex items-center gap-3 bg-stone-50 p-2 rounded-xl border border-stone-200 max-w-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <MapPin className="text-emerald-700" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-800 truncate">{demoMode ? "Demo location" : "Location detected"}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-stone-500 truncate">Accuracy: ~{userLocation ? Math.round(userLocation.acc) : "--"}m</p>
                  <p className="text-[10px] bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded font-medium">{accuracyLabel}</p>
                </div>
              </div>
              <button onClick={() => requestGPS(false)} disabled={isLoadingLocation} className="p-2 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">
                <RefreshCw size={16} className={isLoadingLocation ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 mt-6 scrollbar-hide snap-x">
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`snap-start whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-emerald-700 text-white shadow-md shadow-emerald-900/20" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-4 gap-8">
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2"><Filter size={16} className="text-emerald-700" /> Filters</h3>
            <div className="space-y-6">
              <div>
                <label className="flex items-center justify-between text-sm font-semibold text-stone-700 mb-2"><span>Maximum distance</span><span className="text-emerald-700">{maxDistance} km</span></label>
                <input type="range" min="1" max="50" step="1" value={maxDistance} onChange={(e) => setMaxDistance(Number(e.target.value))} className="w-full accent-emerald-600" />
              </div>
              <div>
                <label className="flex items-center justify-between text-sm font-semibold text-stone-700 mb-2"><span>Minimum rating</span><span className="text-amber-500">{minRating}+ ★</span></label>
                <input type="range" min="0" max="5" step="0.5" value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="w-full accent-amber-500" />
              </div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-semibold text-stone-700">Open now</span>
                <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
              </label>
              <div className="pt-4 border-t border-stone-100">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-semibold text-stone-500">College Demo Mode</span>
                  <input type="checkbox" checked={demoMode} onChange={(e) => setDemoMode(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                </label>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {locationError ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
              <MapPinOff className="mx-auto text-rose-400 mb-3" size={32} />
              <p className="text-rose-800 font-semibold mb-1">{locationError}</p>
              <Button variant="secondary" onClick={() => requestGPS(false)} className="mt-4 bg-white">Try Again</Button>
            </div>
          ) : isFetchingPlaces ? (
            <div className="text-center py-20 text-stone-500">
               <RefreshCw className="animate-spin mx-auto mb-4 text-emerald-600" size={32} />
               <p>Finding {tab.toLowerCase()} near you...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4"><SearchX className="text-stone-400" size={24} /></div>
              <h3 className="text-lg font-bold text-stone-900 mb-1">No results found</h3>
              <p className="text-stone-500 text-sm max-w-sm mx-auto">Try increasing the search radius or adjusting your filters to find more options.</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-stone-500 font-medium mb-4">Showing {results.length} Google Places results</p>
              <div className="grid md:grid-cols-2 gap-5">
                {results.map((p) => (
                  <Card key={p.id} className="flex flex-col hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/10">
                    <div className="p-5 flex-1">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="font-bold text-stone-900 leading-tight">{p.name}</h3>
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-md text-xs font-bold shrink-0">
                          <Star size={12} className="fill-current" /> {p.rating > 0 ? p.rating.toFixed(1) : "New"}
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex gap-2 text-stone-500 text-sm"><MapPin size={16} className="shrink-0 mt-0.5 text-stone-400" /><span className="line-clamp-2">{p.location}</span></div>
                        {p.phone && <div className="flex gap-2 text-stone-500 text-sm"><Phone size={16} className="shrink-0 mt-0.5 text-stone-400" /><span>{p.phone}</span></div>}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold">
                        {p.hasOpenInfo && (
                          <span className={p.open ? "text-emerald-600 flex items-center gap-1" : "text-rose-600 flex items-center gap-1"}>
                            {p.open ? <CheckCircle2 size={12} /> : <XCircle size={12} />} {p.open ? "Open now" : "Closed"}
                          </span>
                        )}
                        {p.calculatedDistance != null && (
                          <span className="text-stone-500 flex items-center gap-1"><Navigation size={12} /> {p.calculatedDistance < 1 ? `${Math.round(p.calculatedDistance * 1000)} m` : `${p.calculatedDistance.toFixed(1)} km` }</span>
                        )}
                      </div>
                    </div>
                    <div className="p-3 bg-stone-50 border-t border-stone-100 flex gap-2 rounded-b-2xl">
                      {p.phone ? (
                        <a href={`tel:${p.phone.replace(/[^0-9+]/g, '')}`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors">
                          <Phone size={14} /> Call
                        </a>
                      ) : (
                        <div className="flex-1 px-3 py-2 bg-stone-200 text-stone-400 rounded-lg text-xs font-semibold text-center cursor-not-allowed">No Phone</div>
                      )}
                      <a href={p.googleMapsUri || "#"} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-stone-200 text-stone-700 rounded-lg text-xs font-semibold hover:bg-stone-50 transition-colors">
                        <ExternalLink size={14} /> Maps
                      </a>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdoptPage({ setPage, setSelectedAnimal }) {
  const [species, setSpecies] = useState("All");
  const filtered = ANIMALS.filter((a) => species === "All" || a.species === species);
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <SectionHeading eyebrow="Find your companion" title="Animals ready for adoption" subtitle="Every profile includes health status and an AI-assisted compatibility match based on your lifestyle." />
      <div className="flex gap-2 flex-wrap mb-8">
        {["All", "Dog", "Cat", "Bird", "Other"].map((s) => (
          <button key={s} onClick={() => setSpecies(s)} className={`px-4 py-2 rounded-lg text-sm font-semibold border ${species === s ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-stone-600 border-stone-200"}`}>{s}</button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((a) => (
          <Card key={a.id} className="overflow-hidden group hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-300/40 transition-all duration-200">
            <div className="relative overflow-hidden">
              <img src={a.img} alt={a.name} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur rounded-full px-3 py-1 text-xs font-bold text-emerald-700 flex items-center gap-1 shadow-sm"><Sparkles size={12} /> {a.match}% match</div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="font-bold text-stone-900 text-lg" style={fontDisplay}>{a.name}</p>
                {a.vaccinated && <Badge>Vaccinated</Badge>}
              </div>
              <p className="text-sm text-stone-500 mt-1">{a.species} • {a.age} • {a.gender}</p>
              <p className="text-sm text-stone-500 flex items-center gap-1 mt-1"><MapPin size={13} /> {a.location}</p>
              <div className="flex gap-2 mt-4">
                <Button variant="secondary" className="flex-1 text-xs py-2" onClick={() => { setSelectedAnimal(a); setPage("animalProfile"); }}>View Profile</Button>
                <Button variant="primary" className="flex-1 text-xs py-2" onClick={() => { setSelectedAnimal(a); setPage("animalProfile"); }}>Apply to Adopt</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AnimalProfilePage({ animal, setPage, toast }) {
  const rewards = useRewards();
  const [applied, setApplied] = useState(false);
  if (!animal) return <div className="max-w-3xl mx-auto px-6 py-20 text-center text-stone-500">Select an animal from the Adopt page first. <button className="text-emerald-700 font-semibold underline" onClick={() => setPage("adopt")}>Go to Adopt</button></div>;
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <button onClick={() => setPage("adopt")} className="text-sm text-stone-500 flex items-center gap-1 mb-6 hover:text-stone-800"><ArrowLeft size={15} /> Back to all animals</button>
      <div className="grid lg:grid-cols-2 gap-10">
        <div>
          <img src={animal.img} className="w-full h-[420px] object-cover rounded-2xl" alt={animal.name} />
          <div className="grid grid-cols-3 gap-3 mt-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-stone-100 flex items-center justify-center text-stone-300"><Camera size={20} /></div>)}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-stone-900" style={fontDisplay}>{animal.name}</h1>
            <div className="bg-emerald-50 rounded-full px-3 py-1 text-sm font-bold text-emerald-700 flex items-center gap-1"><Sparkles size={13} /> {animal.match}% AI match</div>
          </div>
          <p className="text-stone-500 mt-1">{animal.breed} • {animal.gender} • {animal.age}</p>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {[
              { l: "Location", v: animal.location, icon: MapPin },
              { l: "Health", v: animal.medical, icon: Stethoscope },
              { l: "Vaccinated", v: animal.vaccinated ? "Yes" : "Pending", icon: ShieldCheck },
              { l: "Temperament", v: animal.temperament, icon: Heart },
            ].map((f) => (
              <div key={f.l} className="bg-stone-50 rounded-xl p-3">
                <p className="text-xs text-stone-400 flex items-center gap-1"><f.icon size={12} /> {f.l}</p>
                <p className="text-sm font-semibold text-stone-800 mt-0.5">{f.v}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <p className="font-semibold text-stone-800 text-sm mb-2">Rescue story</p>
            <p className="text-sm text-stone-500 leading-relaxed">{animal.story}</p>
          </div>
          <div className="mt-6">
            <p className="font-semibold text-stone-800 text-sm mb-2">Care requirements</p>
            <p className="text-sm text-stone-500 leading-relaxed">Regular exercise, balanced diet, routine vet checkups, and a loving, patient household.</p>
          </div>
          <Button variant="primary" className="w-full mt-8 py-3" onClick={() => {
            setApplied(true);
            toast.push(`Adoption application sent for ${animal.name}`);
            rewards.submitForVerification("adoption", `ADOPT-${animal.id}`, `Successful adoption — ${animal.name}`);
          }} disabled={applied}>
            {applied ? <><Check size={16} /> Application submitted</> : <>Apply for Adoption</>}
          </Button>
          {applied && (
            <p className="text-xs text-stone-400 mt-3 flex items-center gap-1.5"><Gift size={13} className="text-emerald-600" /> Once your adoption is finalized and verified, you'll earn <span className="font-semibold text-emerald-700">+150 P-Points</span>.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- REHOMING ---------------------------------- */
function RehomingPage({ toast }) {
  const [showForm, setShowForm] = useState(false);
  const cases = ANIMALS.slice(0, 3);
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <SectionHeading eyebrow="Responsible pet ownership" title="Safe rehoming" subtitle="Can no longer care for your pet? Find them a safe, verified new home instead of abandonment." />
      <Card className="p-6 flex items-center justify-between flex-wrap gap-4 mb-10 bg-emerald-50 border-emerald-200">
        <p className="text-sm text-emerald-800 max-w-lg">Responsible pet owners can post a rehoming request. Our team helps match your pet with a verified, screened adopter.</p>
        <Button variant="primary" onClick={() => setShowForm(true)}><Plus size={16} /> Post a Rehoming Request</Button>
      </Card>

      {showForm && (
        <Card className="p-6 mb-10 space-y-4">
          <p className="font-semibold text-stone-800">Rehoming request form</p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <input placeholder="Animal name & breed" className="border border-stone-300 rounded-lg px-3 py-2.5" />
            <input placeholder="Location" className="border border-stone-300 rounded-lg px-3 py-2.5" />
            <textarea placeholder="Reason for rehoming" className="border border-stone-300 rounded-lg px-3 py-2.5 md:col-span-2" rows={3} />
            <textarea placeholder="Medical information & behaviour" className="border border-stone-300 rounded-lg px-3 py-2.5 md:col-span-2" rows={3} />
          </div>
          <div className="flex gap-3">
            <Button variant="primary" onClick={() => { setShowForm(false); toast.push("Rehoming request posted"); }}>Submit request</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <h3 className="font-bold text-stone-900 text-lg mb-4" style={fontDisplay}>Available rehoming cases</h3>
      <div className="grid md:grid-cols-3 gap-5">
        {cases.map((a) => (
          <Card key={a.id} className="overflow-hidden">
            <img src={a.img} className="h-40 w-full object-cover" alt={a.name} />
            <div className="p-4">
              <p className="font-semibold text-stone-900">{a.name}</p>
              <p className="text-xs text-stone-500 mt-1">{a.species} • {a.age} • {a.location}</p>
              <Button variant="secondary" className="w-full mt-3 text-xs py-2">View details</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- COMMUNITY ---------------------------------- */
function CommunityPage({ setPage, toast }) {
  const rewards = useRewards();
  const categories = ["Dog Lovers", "Cat Lovers", "Animal Rescuers", "Pet Parents", "Volunteers", "Animal Welfare", "Local Communities"];
  const [likes, setLikes] = useState({});
  const toggleLike = (id) => setLikes((l) => ({ ...l, [id]: !l[id] }));
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <SectionHeading eyebrow="Together for animals" title="A community that cares" subtitle="Join discussions, share rescue updates, and connect with people who care about animal welfare." />
      <div className="flex gap-2 flex-wrap mb-8">
        {categories.map((c) => <Badge key={c} tone="stone">{c}</Badge>)}
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          {POSTS.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">{p.author[0]}</div>
                <div>
                  <p className="font-semibold text-stone-800 text-sm">{p.author}</p>
                  <p className="text-xs text-stone-400">{p.group} • {p.time}</p>
                </div>
              </div>
              <p className="text-sm text-stone-600 mt-4 leading-relaxed">{p.text}</p>
              {p.img && <img src={p.img} className="w-full h-56 object-cover rounded-xl mt-4" alt="" />}
              {p.id === 1 && (
                <button onClick={() => rewards.submitForVerification("volunteer", `POST-${p.id}`, "Volunteer participation - community rescue")} className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 hover:bg-emerald-100">
                  <HeartHandshake size={14} /> I volunteered for this rescue <Badge tone="emerald">+75 P-Points</Badge>
                </button>
              )}
              <div className="flex items-center gap-5 mt-4 pt-4 border-t border-stone-100 text-stone-500 text-sm">
                <button onClick={() => toggleLike(p.id)} className={`flex items-center gap-1.5 ${likes[p.id] ? "text-emerald-700" : ""}`}><ThumbsUp size={15} /> {p.likes + (likes[p.id] ? 1 : 0)}</button>
                <button className="flex items-center gap-1.5"><MessageCircle size={15} /> {p.comments}</button>
                <button className="flex items-center gap-1.5"><Share2 size={15} /> Share</button>
                <button onClick={() => toast.push("Saved to your bookmarks")} className="flex items-center gap-1.5 ml-auto"><Bookmark size={15} /></button>
              </div>
            </Card>
          ))}
        </div>
        <div className="space-y-5">
          <Card className="p-5">
            <p className="font-semibold text-stone-800 text-sm mb-3 flex items-center gap-2"><TrendingUp size={15} /> Trending communities</p>
            {categories.slice(0, 4).map((c) => (
              <div key={c} className="flex items-center justify-between py-2 text-sm">
                <span className="text-stone-600">{c}</span>
                <Button variant="secondary" className="text-xs py-1 px-3">Join</Button>
              </div>
            ))}
          </Card>
          <Card className="p-5">
            <p className="font-semibold text-stone-800 text-sm mb-3 flex items-center gap-2"><CalendarDays size={15} /> Upcoming events</p>
            {EVENTS.slice(0, 3).map((e) => (
              <div key={e.id} className="py-2 border-b border-stone-100 last:border-0">
                <p className="text-sm font-medium text-stone-700">{e.name}</p>
                <p className="text-xs text-stone-400">{e.date}</p>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- EVENTS ---------------------------------- */
function EventCard({ e, toast }) {
  const rewards = useRewards();
  const isPaid = e.price !== "Free";
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState(null); // { points, discount, finalPrice }
  const [registered, setRegistered] = useState(false);
  const [attendanceSubmitted, setAttendanceSubmitted] = useState(false);

  const register = () => {
    if (applied) rewards.redeemPoints(applied.points, "event", `EVENT-${e.id}`, applied.discount);
    setRegistered(true);
    toast.push(`Registration confirmed for ${e.name}`);
  };

  const markAttended = () => {
    setAttendanceSubmitted(true);
    rewards.submitForVerification("event_attendance", `EVENT-${e.id}`, `Community event attendance — ${e.name}`);
  };

  return (
    <Card className="overflow-hidden group hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-300/40 transition-all duration-200">
      <div className="overflow-hidden relative">
        <img src={e.img} className="h-36 w-full object-cover group-hover:scale-105 transition-transform duration-300" alt={e.name} />
        <div className="absolute top-2 right-2">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isPaid ? "bg-amber-500 text-white" : "bg-emerald-600 text-white"}`}>{isPaid ? e.price : "FREE"}</span>
        </div>
      </div>
      <div className="p-4">
        <p className="font-semibold text-stone-900 text-sm">{e.name}</p>
        <p className="text-xs text-stone-500 mt-2 flex items-center gap-1"><CalendarDays size={12} /> {e.date} • {e.time}</p>
        <p className="text-xs text-stone-500 mt-1 flex items-center gap-1"><MapPin size={12} /> {e.location}</p>
        <p className="text-xs text-stone-400 mt-1">{e.participants} participants</p>

        {isPaid && !registered && (
          <div className="mt-3">
            {applied ? (
              <p className="text-xs text-stone-500">
                <span className="line-through mr-1">{e.price}</span>
                <span className="font-bold text-emerald-700">₹{applied.finalPrice}</span> after {applied.points} P-Points
              </p>
            ) : (
              <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <Gift size={13} /> Use P-Points for a discount {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </button>
            )}
            {open && !applied && (
              <div className="mt-2 border border-emerald-200 bg-emerald-50/60 rounded-xl p-3 space-y-2">
                {rewardsConfig.redemptionTiers.map((tier) => {
                  const { discount, finalPrice } = calculateEventDiscount(tier.points, e.price);
                  const disabled = tier.points > rewards.balance || discount <= 0;
                  return (
                    <button key={tier.points} disabled={disabled} onClick={() => { setApplied({ points: tier.points, discount, finalPrice }); setOpen(false); }}
                      className={`w-full flex items-center justify-between text-xs rounded-lg px-3 py-2 border transition-colors ${disabled ? "opacity-40 cursor-not-allowed bg-white border-stone-200" : "bg-white border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-medium"}`}>
                      <span>Use {tier.points} P-Points</span><span>₹{discount} off</span>
                    </button>
                  );
                })}
                <p className="text-[10px] text-stone-400 pt-1">Max discount capped at {rewardsConfig.maxEventDiscountPct}% of event price.</p>
              </div>
            )}
          </div>
        )}

        {!registered ? (
          <Button variant="primary" className="w-full mt-3 text-xs py-2" onClick={register}>
            {isPaid ? `Confirm & Register${applied ? ` — ₹${applied.finalPrice}` : ""}` : "Join"}
          </Button>
        ) : attendanceSubmitted ? (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <Clock size={13} /> Attendance pending verification (+30 P-Points on approval)
          </div>
        ) : (
          <Button variant="secondary" className="w-full mt-3 text-xs py-2" onClick={markAttended}><CheckCircle2 size={14} /> I attended this event</Button>
        )}
      </div>
    </Card>
  );
}

function EventsPage({ setPage, toast }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <SectionHeading eyebrow="Get involved" title="Events & meetups" subtitle="Adoption drives, vaccination camps, awareness campaigns and volunteer activities near you. Paid workshops can be discounted with Petsogram Points." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {EVENTS.map((e) => <EventCard key={e.id} e={e} toast={toast} />)}
      </div>
    </div>
  );
}

/* ---------------------------------- REPORT ABUSE ---------------------------------- */
function ReportAbusePage({ setPage, toast }) {
  const rewards = useRewards();
  const [step, setStep] = useState("form");
  const [category, setCategory] = useState("Cruelty");
  const [desc, setDesc] = useState("");
  const [caseId] = useState(`PS-2026-${Math.floor(10000 + Math.random() * 89999)}`);
  const statuses = ["Submitted", "Under Review", "Assigned", "Action Taken", "Closed"];
  const submit = () => {
    if (!desc.trim()) { toast.push("Add a description before submitting", "amber"); return; }
    setStep("result");
    rewards.submitForVerification("abuse_report", caseId, "Verified animal welfare report");
  };
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center"><FileWarning className="text-white" size={20} /></div>
        <h1 className="text-3xl font-bold text-stone-900" style={fontDisplay}>Report Animal Cruelty or Abuse</h1>
      </div>
      <p className="text-stone-500 mb-8">Reports are routed for appropriate review and action. Petsogram does not replace authorized government or law-enforcement authorities.</p>

      {step === "form" ? (
        <Card className="p-6 space-y-5">
          <div>
            <label className="text-sm font-semibold text-stone-700 block mb-2">Upload evidence</label>
            <ImageUploader toast={toast} accent="rose" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <input placeholder="Location" className="border border-stone-300 rounded-lg px-3 py-2.5 text-sm" />
            <input placeholder="Animal type" className="border border-stone-300 rounded-lg px-3 py-2.5 text-sm" />
            <input type="datetime-local" className="border border-stone-300 rounded-lg px-3 py-2.5 text-sm md:col-span-2" />
          </div>
          <div>
            <label className="text-sm font-semibold text-stone-700 block mb-2">Incident category</label>
            <div className="flex gap-2 flex-wrap">
              {["Cruelty", "Abuse", "Abandonment", "Neglect", "Injury", "Other"].map((c) => (
                <button key={c} onClick={() => setCategory(c)} className={`px-3.5 py-2 rounded-lg text-sm font-medium border ${category === c ? "bg-rose-600 text-white border-rose-600" : "bg-white text-stone-600 border-stone-200"}`}>{c}</button>
              ))}
            </div>
          </div>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe what you witnessed..." rows={4} className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm" />
          <Button variant="dark" className="w-full py-3 bg-rose-600 hover:bg-rose-700" onClick={submit}>Submit report</Button>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="text-emerald-600" size={24} />
            <div>
              <p className="font-bold text-stone-900">Report submitted successfully</p>
              <p className="text-sm text-stone-500">Case ID: <span className="font-mono font-semibold">{caseId}</span></p>
            </div>
          </div>
          <Card className="p-4 bg-emerald-50 border-emerald-200 flex items-center gap-3 mb-6">
            <Gift size={18} className="text-emerald-700 shrink-0" />
            <p className="text-sm text-emerald-800">This report is pending verification. Once confirmed by our team, you'll earn <span className="font-semibold">+50 P-Points</span> automatically.</p>
          </Card>
          <div className="flex items-center justify-between">
            {statuses.map((s, i) => (
              <div key={s} className="flex-1 flex flex-col items-center relative">
                {i > 0 && <div className={`absolute top-3 -left-1/2 w-full h-0.5 ${i === 1 ? "bg-emerald-600" : "bg-stone-200"}`} />}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${i === 0 ? "bg-emerald-600" : i === 1 ? "bg-emerald-100 border-2 border-emerald-600" : "bg-stone-100"}`}>
                  {i === 0 ? <Check size={13} className="text-white" /> : <Circle size={10} className={i === 1 ? "text-emerald-600" : "text-stone-300"} />}
                </div>
                <p className="text-[11px] text-stone-500 mt-2 text-center">{s}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-8 border-t border-stone-100 pt-4">This report has been routed to our verified partner network for review. Petsogram does not replace police or government animal welfare authorities — for immediate danger, please also contact local authorities.</p>
        </Card>
      )}
    </div>
  );
}

/* ---------------------------------- DONATE ---------------------------------- */
function DonatePage({ toast }) {
  const { totalDonated, globalHistory, makeDonation, funds, calculateAvailableFund, calculateRequiredFund, calculateUtilization } = useDonations();
  const [amount, setAmount] = useState(500);
  const [custom, setCustom] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cat, setCat] = useState("Medical Treatment");
  const auth = useAuth();
  const rewards = useRewards();
  const { addNotification } = useNotifications();

  
  const categoryDescriptions = {
    "Medical Treatment": "Supports veterinary treatment, medicines, surgeries and recovery.",
    "Food": "Supports food and nutritional supplies for rescued animals.",
    "Rescue": "Supports rescue operations, transportation and field response.",
    "Shelter": "Supports shelter operations, care and essential infrastructure.",
    "Vaccination": "Supports vaccination and preventive healthcare.",
    "Emergency Care": "Supports urgent medical and emergency response."
  };

  const categories = [
    { l: "Medical Treatment", icon: Stethoscope }, { l: "Food", icon: Package }, { l: "Rescue", icon: Truck },
    { l: "Shelter", icon: HomeIcon }, { l: "Vaccination", icon: ShieldCheck }, { l: "Emergency Care", icon: Siren },
  ];

  const handleDonate = async () => {
    const finalAmount = custom ? parseInt(custom, 10) : amount;
    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) {
      toast.push("Please enter a valid donation amount.");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      makeDonation(cat, finalAmount);
      
      addNotification("donation", "Donation successful", `Your ₹${finalAmount} donation for ${cat} was completed.`, "/donate", `DON-${Date.now()}`);
      
      if (rewards && rewards.submitForVerification) {
        rewards.submitForVerification('donate_supplies', `DON-${Date.now()}`, "Monetary donation");
      }
      
      toast.push(`Thank you! ₹${finalAmount} donated toward ${cat}`);
      setCustom("");
      setAmount(500);
    } catch (error) {
      console.error(error);
      toast.push("Donation could not be completed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <SectionHeading eyebrow="Make an impact" title="Your support can save a life" subtitle="100% of donations are routed to verified organizations. Track exactly where your contribution goes." />
      
      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="p-6 lg:col-span-2">
          <p className="font-semibold text-stone-800 mb-3" style={fontDisplay}>Choose a category</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {categories.map((c) => (
              <button key={c.l} onClick={() => setCat(c.l)} className={`flex flex-col items-center gap-2 rounded-xl p-4 border text-xs font-semibold transition-all ${cat === c.l ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm" : "bg-white border-stone-200 text-stone-600 hover:border-emerald-200 hover:bg-stone-50"}`}>
                <c.icon size={20} /> {c.l}
              </button>
            ))}
          </div>
          <p className="font-semibold text-stone-800 mb-3" style={fontDisplay}>Choose an amount</p>
          <div className="flex gap-2 flex-wrap mb-4">
            {[100, 500, 1000, 2500].map((v) => (
              <button key={v} onClick={() => { setAmount(v); setCustom(""); }} className={`px-5 py-2.5 rounded-lg text-sm font-semibold border transition-all ${amount === v && !custom ? "bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-900/10" : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"}`}>₹{v}</button>
            ))}
            <input type="number" min="1" value={custom} onChange={(e) => { setCustom(e.target.value); setAmount(0); }} placeholder="Custom amount" className="px-4 py-2.5 rounded-lg border border-stone-200 text-sm w-36 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
          </div>
          <Button variant="primary" className="w-full py-3 mt-2 text-base font-bold shadow-md shadow-emerald-900/10" onClick={handleDonate} disabled={isProcessing}>
            {isProcessing ? "Processing..." : `Donate ₹${custom || amount || 0} now`}
          </Button>
        </Card>
        
        <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-emerald-700 to-emerald-900 text-white shadow-xl shadow-emerald-900/20 border-none">
              <p className="text-emerald-100 font-semibold mb-1">Total Donated</p>
              <p className="text-4xl font-bold" style={fontDisplay}>₹{totalDonated.toLocaleString()}</p>
              <p className="text-xs text-emerald-200/80 mt-3 border-t border-emerald-600 pt-3">Every rupee makes a difference.</p>
            </Card>
            
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
                                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${utilization}%` }} />
                              </div>
                              <p className="text-xs text-center font-semibold mt-3 text-stone-500">
                                  {required > 0 ? `₹${required.toLocaleString()} still required` : 'Fully funded'}
                              </p>
                          </div>
                      </>
                  );
              })()}
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

/* ---------------------------------- SERVICES ---------------------------------- */
function ServicesPage({ toast }) {
  const [cat, setCat] = useState("Veterinary");
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  
  const [liveServices, setLiveServices] = useState([]);
  const [apiError, setApiError] = useState("");
  const [isFetchingServices, setIsFetchingServices] = useState(false);

  const icons = { Veterinary: Stethoscope, Grooming: Scissors, Training: GraduationCap, Boarding: HomeIcon, "Pet Sitting": Users, Walking: Dog };

  const fetchLocation = (forceReal = false) => {
    setIsLoadingLocation(true);
    setLocationError("");
    if (demoMode && !forceReal) {
      setUserLocation({ lat: 19.0441, lng: 73.0255, acc: 10 });
      setIsLoadingLocation(false);
      return;
    }
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setIsLoadingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy });
        setIsLoadingLocation(false);
      },
      (err) => {
        setLocationError("Unable to access your location.");
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  useEffect(() => { fetchLocation(); }, [demoMode]); // eslint-disable-line

  const loadServices = async () => {
    if (!userLocation) return;
    setIsFetchingServices(true);
    
    const queryMap = {
      'Veterinary': 'veterinary clinic',
      'Grooming': 'pet groomer',
      'Training': 'dog trainer',
      'Boarding': 'pet boarding',
      'Pet Sitting': 'pet sitter',
      'Walking': 'dog walker'
    };
    
    const result = await fetchTextSearch(queryMap[cat], userLocation.lat, userLocation.lng, 25);
    
    if (!result.error && result.places) {
      setLiveServices(result.places);
    } else {
      setLiveServices([]);
    }
    setIsFetchingServices(false);
  };

  useEffect(() => {
    const handler = setTimeout(() => { loadServices(); }, 500);
    return () => clearTimeout(handler);
  }, [userLocation, cat]); // eslint-disable-line

  const results = liveServices.map(place => {
    const pLat = place.location?.latitude;
    const pLng = place.location?.longitude;
    const calcDist = (pLat && pLng && userLocation)
      ? calculateHaversineDistance(userLocation.lat, userLocation.lng, pLat, pLng)
      : null;
    const isOpen = place.currentOpeningHours?.openNow ?? place.regularOpeningHours?.openNow;
    return {
      id: place.id,
      name: place.displayName?.text || "Unknown Place",
      location: place.formattedAddress || "Address unavailable",
      latitude: pLat,
      longitude: pLng,
      rating: place.rating || 0,
      userRatingCount: place.userRatingCount || 0,
      open: isOpen,
      hasOpenInfo: isOpen !== undefined,
      phone: place.nationalPhoneNumber || place.internationalPhoneNumber || "",
      website: place.websiteUri || "",
      googleMapsUri: place.googleMapsUri || (pLat ? `https://www.google.com/maps/dir/?api=1&destination=${pLat},${pLng}` : null),
      calculatedDistance: calcDist,
    };
  })
  .filter(p => p.calculatedDistance != null && p.calculatedDistance <= maxDistance) // STRICT distance filter
  .filter(p => minRating > 0 ? (p.rating > 0 && p.rating >= minRating) : true) // STRICT rating filter
  .filter(p => !openOnly || (p.hasOpenInfo && p.open)) // STRICT openNow filter
  .sort((a, b) => {
    if (a.calculatedDistance == null) return 1;
    if (b.calculatedDistance == null) return -1;
    return a.calculatedDistance - b.calculatedDistance;
  });

  return (
    <div className="bg-stone-50 min-h-[calc(100vh-64px)] pb-24">
      <div className="bg-emerald-900 text-white pt-16 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #fff 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl font-bold mb-4" style={fontDisplay}>Pet Care Services</h1>
          <p className="text-emerald-100 max-w-xl mx-auto">Find trusted professionals for grooming, training, sitting, and more.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 mb-8">
        <Card className="p-4 grid grid-cols-2 md:grid-cols-6 gap-2 shadow-xl shadow-emerald-900/10">
          {Object.entries(icons).map(([name, Icon]) => (
            <button key={name} onClick={() => setCat(name)} className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${cat === name ? "bg-emerald-50 text-emerald-700" : "hover:bg-stone-50 text-stone-600"}`}>
              <Icon size={24} />
              <span className="text-xs font-semibold">{name}</span>
            </button>
          ))}
        </Card>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-stone-900" style={fontDisplay}>
             {cat} near {demoMode ? "Demo Location" : (userLocation ? "you" : "...")}
          </h2>
          <div className="flex items-center gap-4">
             <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-stone-600">
               <input type="checkbox" checked={demoMode} onChange={(e) => setDemoMode(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
               Demo Mode
             </label>
             <Button variant="secondary" className="text-sm bg-white" onClick={() => fetchLocation(false)} disabled={isLoadingLocation}>
               {isLoadingLocation ? <RefreshCw size={14} className="animate-spin" /> : <MapPin size={14} />} 
               Use My Location
             </Button>
          </div>
        </div>

        {locationError ? (
           <div className="text-center py-12 bg-white rounded-2xl border border-rose-200">
             <MapPinOff className="mx-auto text-rose-400 mb-4" size={32} />
             <p className="text-rose-700 font-semibold">{locationError}</p>
           </div>
        ) : isFetchingServices ? (
           <div className="text-center py-20 text-stone-500">
              <RefreshCw className="animate-spin mx-auto mb-4 text-emerald-600" size={32} />
              <p>Searching Google Places...</p>
           </div>
        ) : results.length === 0 ? (
           <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-stone-500">
             <SearchX className="mx-auto mb-4 text-stone-300" size={32} />
             <p>No providers found nearby.</p>
           </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((p) => (
              <Card key={p.id} className="p-5 flex flex-col hover:shadow-xl hover:shadow-emerald-900/5 transition-all">
                <div className="flex items-start justify-between gap-3 mb-4">
                   <h3 className="font-bold text-stone-900 leading-tight">{p.name}</h3>
                   <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-bold shrink-0">
                     <Star size={12} className="fill-current" /> {p.rating > 0 ? p.rating.toFixed(1) : "New"}
                   </div>
                </div>
                <div className="space-y-2 mb-6 flex-1 text-sm text-stone-500">
                   <p className="flex gap-2"><MapPin size={16} className="shrink-0 text-stone-400 mt-0.5" /> <span className="line-clamp-2">{p.location}</span></p>
                   {p.calculatedDistance != null && <p className="flex gap-2 items-center text-emerald-700 font-medium"><Navigation size={14} /> {p.calculatedDistance < 1 ? `${Math.round(p.calculatedDistance * 1000)} m away` : `${p.calculatedDistance.toFixed(1)} km away`}</p>}
                </div>
                <a href={p.googleMapsUri || "#"} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" className="w-full text-xs font-semibold py-2.5">Open in Maps</Button>
                </a>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ p, tab, setPage, toast }) {
    const auth = useAuth();
  const rewards = useRewards();
  const [open, setOpen] = useState(false);
  const [redemption, setRedemption] = useState(null); // { points, discount, finalPrice }
  const canRedeem = tab !== "Donate" && p.price !== "Free";

  const confirm = (tier) => {
    auth.requireAuthAction(() => {
      const { discount, finalPrice, maxDiscount } = calculateMarketplaceDiscount(tier.points, p.price);
      const ok = rewards.redeemPoints(tier.points, "marketplace", `PROD-${p.id}`, discount);
      if (ok) { setRedemption({ points: tier.points, discount, finalPrice, maxDiscount }); setOpen(false); }
    }, setPage);
  };

  return (
    <Card className="overflow-hidden">
      <ImageWithFallback src={p.img} className="h-36 w-full object-cover" alt={p.name} />
      <div className="p-4">
        <p className="font-semibold text-stone-900 text-sm">{p.name}</p>
        <p className="text-xs text-stone-500 mt-1">{p.condition} • {p.location}</p>
        <div className="flex items-center justify-between mt-2">
          {redemption ? (
            <div>
              <span className="text-xs text-stone-400 line-through mr-1.5">{p.price}</span>
              <span className="font-bold text-emerald-700">₹{redemption.finalPrice.toLocaleString()}</span>
            </div>
          ) : (
            <span className="font-bold text-emerald-700">{p.price}</span>
          )}
          {p.verified && <BadgeCheck size={15} className="text-emerald-600" />}
        </div>

        {redemption && (
          <Badge tone="emerald">{redemption.points} P-Points used · ₹{redemption.discount} off</Badge>
        )}

        {canRedeem && !redemption && (
          <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mt-3">
            <Gift size={13} /> {rewards.balance.toLocaleString()} P-Points available — use points {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
        )}

        {open && !redemption && (
          <div className="mt-3 border border-emerald-200 bg-emerald-50/60 rounded-xl p-3 space-y-2">
            {rewardsConfig.redemptionTiers.map((tier) => {
              const { discount, maxDiscount } = calculateMarketplaceDiscount(tier.points, p.price);
              const disabled = tier.points > rewards.balance || discount <= 0;
              return (
                <button key={tier.points} disabled={disabled} onClick={() => confirm(tier)}
                  className={`w-full flex items-center justify-between text-xs rounded-lg px-3 py-2 border transition-colors ${disabled ? "opacity-40 cursor-not-allowed bg-white border-stone-200" : "bg-white border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-medium"}`}>
                  <span>Use {tier.points} P-Points</span>
                  <span>₹{discount} off</span>
                </button>
              );
            })}
            <p className="text-[10px] text-stone-400 pt-1">Max discount capped at {rewardsConfig.maxMarketplaceDiscountPct}% of item price.</p>
          </div>
        )}

        <Button variant="secondary" className="w-full mt-3 text-xs py-2" onClick={() => {
          auth.requireAuthAction(() => {
            toast.push(redemption ? `Order confirmed at ₹${redemption.finalPrice.toLocaleString()}` : `Interest sent for ${p.name}`);
          }, setPage);
        }}>
          {tab === "Donate" ? "Request item" : redemption ? "Confirm order" : "Contact seller"}
        </Button>
      </div>
    </Card>
  );
}

function MarketplacePage({ setPage, toast }) {
  const [tab, setTab] = useState("New");
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <SectionHeading eyebrow="Community marketplace" title="Marketplace" subtitle="Buy new supplies, browse pre-owned pet products, or donate items to families and shelters in need." />
      <div className="flex gap-2 mb-8">
        {["New", "Pre-Owned", "Donate"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === t ? "bg-emerald-700 text-white" : "bg-stone-100 text-stone-600"}`}>{t === "New" ? "New Products" : t === "Donate" ? "Donate Items" : t}</button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {(PRODUCTS[tab] || PRODUCTS.New).map((p) => <ProductCard key={p.id} p={p} tab={tab} setPage={setPage} toast={toast} />)}
      </div>
    </div>
  );
}

/* ---------------------------------- REWARDS PAGE ---------------------------------- */
function RewardBalanceCard({ setPage }) {
  const rewards = useRewards();
  const discountValue = pointsToDiscountValue(rewards.balance);
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 p-7 shadow-lg shadow-emerald-900/25">
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, #fff 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }} />
      <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-center gap-2 text-white/90">
        <PawPrint size={18} /> <span className="text-sm font-semibold">Petsogram Rewards</span>
      </div>
      <div className="relative mt-6 flex items-end gap-3">
        <p className="text-5xl font-bold text-white" style={fontDisplay}><Counter to={rewards.balance} /></p>
        <p className="text-sm font-medium text-emerald-100 mb-2">P-Points</p>
      </div>
      <p className="relative text-sm text-emerald-100/90 mt-1">≈ ₹{discountValue} available discount value</p>
      <div className="relative flex flex-wrap gap-3 mt-6">
        <Button variant="outlineLight" onClick={() => setPage("marketplace")}><Gift size={15} /> Redeem Points</Button>
        <Button variant="outlineLight" onClick={() => document.getElementById("reward-history")?.scrollIntoView({ behavior: "smooth" })}>View History</Button>
      </div>
      <div className="relative grid grid-cols-2 gap-4 mt-7 pt-5 border-t border-white/15 text-white">
        <div><p className="text-lg font-bold" style={fontDisplay}>{rewards.lifetime.toLocaleString()}</p><p className="text-xs text-emerald-100/80">Lifetime earned</p></div>
        <div><p className="text-lg font-bold" style={fontDisplay}>{rewards.redeemed.toLocaleString()}</p><p className="text-xs text-emerald-100/80">Redeemed</p></div>
      </div>
    </div>
  );
}

function EarnCard({ rule }) {
  const rewards = useRewards();
  const isCompleted = [...rewards.awardedKeys].some((k) => k.startsWith(`${rule.action_type}:`));
  const isPending = rewards.pendingVerifications.some((p) => p.action_type === rule.action_type);
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center"><rule.icon size={20} className="text-emerald-700" /></div>
        {isCompleted && <Badge tone="emerald"><CheckCircle2 size={11} /> Completed</Badge>}
        {!isCompleted && isPending && <Badge tone="amber"><Clock size={11} /> Pending</Badge>}
      </div>
      <p className="font-semibold text-stone-900 mt-3 text-sm">{rule.label}</p>
      <p className="text-xs text-stone-500 mt-1">Earn <span className="font-semibold text-emerald-700">+{rule.points} P-Points</span> once verified</p>
    </Card>
  );
}

function RewardsPage({ setPage, toast }) {
  const rewards = useRewards();
  const toneFor = (points) => (points > 0 ? "text-emerald-700" : "text-rose-600");

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <SectionHeading eyebrow="Petsogram Rewards" title="Make an impact. Earn rewards." subtitle="Earn Petsogram Points for verified animal-welfare activities, then redeem them for marketplace and event discounts." />

      <div className="grid lg:grid-cols-3 gap-8 mb-16">
        <RewardBalanceCard setPage={setPage} />
        <Card className="p-6 lg:col-span-2">
          <p className="font-semibold text-stone-800 mb-1">Your impact</p>
          <p className="text-xs text-stone-500 mb-5">Your actions create real impact — rewards are a thank-you, not the point.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { l: "Animals helped", v: rewards.impact.animalsHelped, icon: PawPrint },
              { l: "Rescue cases", v: rewards.impact.rescues, icon: Truck },
              { l: "Events attended", v: rewards.impact.eventsAttended, icon: CalendarDays },
              { l: "Volunteer hours", v: rewards.impact.volunteerHours, icon: HeartHandshake },
            ].map((s) => (
              <div key={s.l} className="bg-stone-50 rounded-xl p-4">
                <s.icon size={16} className="text-emerald-700 mb-2" />
                <p className="text-xl font-bold text-stone-900" style={fontDisplay}>{s.v}</p>
                <p className="text-xs text-stone-500 mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionHeading eyebrow="Ways to earn" title="Help an animal, earn P-Points" subtitle="Verified activities credit points automatically — duplicate submissions for the same case are never rewarded twice." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
        {REWARD_RULES.map((rule) => <EarnCard key={rule.action_type} rule={rule} />)}
      </div>

      <SectionHeading eyebrow="Redeem" title="Redeem your points" subtitle={`${rewardsConfig.redemptionTiers.length} tiers available, from ${rewardsConfig.redemptionTiers[0].points} to ${rewardsConfig.redemptionTiers[rewardsConfig.redemptionTiers.length - 1].points} points.`} />
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        <Card className="p-6 flex items-center justify-between gap-4">
          <div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-3"><ShoppingBag size={20} className="text-emerald-700" /></div>
            <p className="font-semibold text-stone-900">Marketplace discounts</p>
            <p className="text-xs text-stone-500 mt-1 max-w-xs">Use points on any new or pre-owned product. Capped at {rewardsConfig.maxMarketplaceDiscountPct}% off per item.</p>
          </div>
          <Button variant="secondary" onClick={() => setPage("marketplace")}>Browse <ArrowRight size={14} /></Button>
        </Card>
        <Card className="p-6 flex items-center justify-between gap-4">
          <div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-3"><CalendarDays size={20} className="text-emerald-700" /></div>
            <p className="font-semibold text-stone-900">Community event discounts</p>
            <p className="text-xs text-stone-500 mt-1 max-w-xs">Apply points to paid workshops and camps. Capped at {rewardsConfig.maxEventDiscountPct}% off per event.</p>
          </div>
          <Button variant="secondary" onClick={() => setPage("events")}>View events <ArrowRight size={14} /></Button>
        </Card>
      </div>

      <div id="reward-history">
        <SectionHeading eyebrow="History" title="Recent activity" subtitle="Every point change — earned or redeemed — is logged as a transaction." />
        <Card className="p-0 overflow-hidden mb-16">
          {rewards.transactions.length === 0 && <p className="p-6 text-sm text-stone-400">No activity yet.</p>}
          {rewards.transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-5 py-4 border-b border-stone-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.points > 0 ? "bg-emerald-50" : "bg-rose-50"}`}>
                  {t.points > 0 ? <TrendingUp size={14} className="text-emerald-700" /> : <Gift size={14} className="text-rose-500" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-800">{t.description}</p>
                  <p className="text-xs text-stone-400">{t.reference_id} • {t.created_at}</p>
                </div>
              </div>
              <span className={`text-sm font-bold ${toneFor(t.points)}`}>{t.points > 0 ? "+" : ""}{t.points}</span>
            </div>
          ))}
        </Card>
      </div>

      <SectionHeading eyebrow="Rules" title="Rewards rules" subtitle="Reference table of how many points each verified activity earns." />
      <Card className="p-0 overflow-hidden mb-10">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-xs uppercase"><tr><th className="text-left p-4">Activity</th><th className="text-left p-4">Points</th></tr></thead>
          <tbody>
            {REWARD_RULES.map((r) => (
              <tr key={r.action_type} className="border-t border-stone-100">
                <td className="p-4 text-stone-700 flex items-center gap-2"><r.icon size={14} className="text-emerald-700" /> {r.label}</td>
                <td className="p-4 font-semibold text-emerald-700">+{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <p className="text-xs text-stone-400 max-w-2xl">P-Points are promotional reward points and cannot be withdrawn or converted directly to cash. Points can only be used according to Petsogram's configured reward rules and are not transferable between users.</p>
    </div>
  );
}

/* ---------------------------------- DASHBOARD (USER) ---------------------------------- */
/* ─── DASHBOARD HELPERS ──────────────────────────────────────────────────────── */
function DashStatCard({ icon: Icon, label, value, sub, onClick, accent = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group ${accent ? "bg-gradient-to-br from-emerald-50 to-emerald-100/60 border-emerald-200" : "bg-white border-stone-200/80 shadow-sm shadow-stone-200/60"}`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${accent ? "bg-emerald-100" : "bg-stone-50 group-hover:bg-emerald-50"}`}>
        <Icon size={18} className="text-emerald-700" />
      </div>
      <p className="text-2xl font-bold text-stone-900" style={fontDisplay}>{value}</p>
      <p className="text-xs text-stone-500 mt-0.5 font-medium">{label}</p>
      {sub && <p className="text-[10px] text-stone-400 mt-1">{sub}</p>}
    </button>
  );
}

function DashSectionHeader({ title, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <p className="font-bold text-stone-800 text-base" style={fontDisplay}>{title}</p>
      {action && <button onClick={onAction} className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1">{action} <ChevronRight size={12} /></button>}
    </div>
  );
}

const STATUS_COLORS = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  "Under Review": "bg-blue-50 text-blue-700 border-blue-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
  Rescuer_Assigned: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Resolved: "bg-stone-50 text-stone-600 border-stone-200",
  Upcoming: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function formatRelTime(ts) {
  if (!ts) return "";
  try {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d === 1) return "Yesterday";
    return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch { return ""; }
}

/* ─── REWARDS PROGRESS BAR ───────────────────────────────────────────────────── */
function RewardsProgress({ balance, setPage }) {
  const tiers = [100, 250, 500, 1000, 2500, 5000];
  const next = tiers.find(t => t > balance) || null;
  const prev = tiers.filter(t => t <= balance).pop() || 0;
  const pct = next ? Math.round(((balance - prev) / (next - prev)) * 100) : 100;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="font-bold text-stone-800 text-sm" style={fontDisplay}>P-Points Progress</p>
        <button onClick={() => setPage("rewards")} className="text-xs font-semibold text-emerald-700 hover:underline">View Rewards</button>
      </div>
      <p className="text-3xl font-bold text-emerald-700 mb-3" style={fontDisplay}>{balance.toLocaleString()} <span className="text-sm font-medium text-stone-500">P-Points</span></p>
      {next ? (
        <>
          <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-stone-400 mt-2">{next - balance} points to <span className="font-semibold text-stone-600">{next.toLocaleString()} P-Points</span> tier</p>
        </>
      ) : (
        <p className="text-xs text-emerald-600 font-semibold">🎉 You've reached the top rewards tier!</p>
      )}
    </Card>
  );
}

/* ─── DASHBOARD PAGE ────────────────────────────────────────────────────────── */
function DashboardPage({ setPage }) {
  const rewards = useRewards();
  const auth = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const userId = auth.user?.id || auth.user?.email || null;

  // Live data derived from all systems
  const dash = useMemo(() => {
    if (!userId) return null;
    return getDashboardData(userId, {
      notifications,
      communityService: { getJoinedCommunities },
    });
  }, [userId, notifications]);

  // ── LOGGED OUT ──────────────────────────────────────────────────────────────
  if (!auth.user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <PawPrint size={36} className="text-emerald-700" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-3" style={fontDisplay}>Your Petsogram Dashboard</h1>
          <p className="text-stone-500 mb-8 leading-relaxed">Sign in to view your animals, rewards, rescue requests, donations and community activity — all in one place.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="primary" onClick={() => setPage("login")}>Log in</Button>
            <Button variant="secondary" onClick={() => setPage("signup")}>Create account</Button>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 text-left">
            {[
              { icon: Siren, label: "Report Emergency", sub: "No login required", page: "emergency", tone: "amber" },
              { icon: PawPrint, label: "Browse Adoption", sub: "No login required", page: "adopt", tone: "emerald" },
              { icon: MapPin, label: "Find Nearby Help", sub: "No login required", page: "discover", tone: "emerald" },
              { icon: Heart, label: "Donate", sub: "No login required", page: "donate", tone: "emerald" },
            ].map(a => (
              <button key={a.page} onClick={() => setPage(a.page)} className="p-4 rounded-2xl bg-white border border-stone-200 text-left hover:border-emerald-300 hover:bg-emerald-50 transition-all">
                <a.icon size={18} className={`mb-2 ${a.tone === "amber" ? "text-amber-600" : "text-emerald-700"}`} />
                <p className="text-sm font-semibold text-stone-800">{a.label}</p>
                <p className="text-xs text-stone-400">{a.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── LOGGED IN ────────────────────────────────────────────────────────────────
  const quickActions = [
    { icon: Siren, label: "Report Emergency", page: "emergency", bg: "bg-amber-500" },
    { icon: PawPrint, label: "Adopt an Animal", page: "adopt", bg: "bg-emerald-600" },
    { icon: MapPin, label: "Find Nearby Help", page: "discover", bg: "bg-emerald-500" },
    { icon: Heart, label: "Donate", page: "donate", bg: "bg-rose-500" },
    { icon: Users, label: "Community", page: "community", bg: "bg-emerald-700" },
    { icon: Gift, label: "View Rewards", page: "rewards", bg: "bg-amber-400" },
  ];

  const statCards = [
    { icon: PawPrint, label: "Saved Animals", value: dash?.savedAnimalsCount ?? 0, page: "adopt", sub: dash?.savedAnimalsCount === 1 ? "1 animal saved" : undefined },
    { icon: ClipboardList, label: "Adoption Applications", value: dash?.adoptionApplicationsCount ?? 0, page: "adopt" },
    { icon: Siren, label: "Rescue Requests", value: dash?.rescueRequestsCount ?? 0, page: "emergency", accent: true },
    { icon: CalendarDays, label: "Appointments", value: dash?.appointmentsCount ?? 0, page: "services" },
    { icon: Users, label: "Communities", value: dash?.communityActivityCount ?? 0, page: "community" },
    { icon: Heart, label: "Donations", value: dash?.donationsCount ?? 0, page: "donate", sub: dash?.totalDonated > 0 ? `₹${dash.totalDonated.toLocaleString()} total` : undefined },
    { icon: Bookmark, label: "Saved Animals", value: dash?.savedAnimalsCount ?? 0, page: "adopt" },
    { icon: Bell, label: "Unread Notifications", value: unreadCount, page: "settings", accent: unreadCount > 0 },
  ];

  // Deduplicate — show only first 8 unique labels
  const seenLabels = new Set();
  const uniqueStats = [];
  for (const s of [
    { icon: PawPrint, label: "Saved Animals", value: dash?.savedAnimalsCount ?? 0, page: "adopt" },
    { icon: ClipboardList, label: "Applications", value: dash?.adoptionApplicationsCount ?? 0, page: "adopt" },
    { icon: Siren, label: "Rescue Requests", value: dash?.rescueRequestsCount ?? 0, page: "emergency", accent: (dash?.rescueRequestsCount ?? 0) > 0 },
    { icon: CalendarDays, label: "Appointments", value: dash?.appointmentsCount ?? 0, page: "services" },
    { icon: Users, label: "Communities", value: dash?.communityActivityCount ?? 0, page: "community" },
    { icon: Heart, label: "Donations", value: dash?.donationsCount ?? 0, page: "donate", sub: dash?.totalDonated > 0 ? `₹${dash.totalDonated.toLocaleString()} total` : undefined },
    { icon: Gift, label: "P-Points", value: rewards.balance.toLocaleString(), page: "rewards" },
    { icon: Bell, label: "Unread Alerts", value: unreadCount, page: "settings", accent: unreadCount > 0 },
  ]) {
    if (!seenLabels.has(s.label)) { seenLabels.add(s.label); uniqueStats.push(s); }
  }

  const getNotifIcon = (type) => {
    if (type === "reward") return Gift;
    if (type === "adoption") return PawPrint;
    if (type === "rescue") return Siren;
    if (type === "community") return Users;
    if (type === "donation") return Heart;
    return Bell;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900" style={fontDisplay}>Welcome back, {auth.user.name.split(" ")[0]} 👋</h1>
          <p className="text-stone-500 mt-1 text-sm">Here's your Petsogram activity at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setPage("profile")}><User size={15} /> Profile</Button>
          <Button variant="secondary" onClick={() => setPage("settings")}><Settings size={16} /> Settings</Button>
        </div>
      </div>

      {/* Rewards Banner */}
      <div className="rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-md shadow-emerald-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
            <PawPrint size={22} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm opacity-80">Petsogram Rewards</p>
            <p className="text-white text-3xl font-bold leading-tight" style={fontDisplay}>
              {rewards.balance.toLocaleString()} <span className="text-lg font-medium text-emerald-200">P-Points</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {(() => {
            const tiers = [100, 250, 500, 1000, 2500, 5000];
            const next = tiers.find(t => t > rewards.balance);
            if (next) return (
              <div className="text-right hidden sm:block">
                <p className="text-emerald-200 text-xs">{next - rewards.balance} pts to next tier</p>
                <p className="text-white/60 text-xs">{next.toLocaleString()} P-Points</p>
              </div>
            );
            return null;
          })()}
          <Button variant="outlineLight" onClick={() => setPage("rewards")}>View Rewards <ArrowRight size={14} /></Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {uniqueStats.map((s) => (
          <DashStatCard
            key={s.label}
            icon={s.icon}
            label={s.label}
            value={s.value}
            sub={s.sub}
            accent={s.accent}
            onClick={() => setPage(s.page)}
          />
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Rescue Requests */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <DashSectionHeader title="Recent Rescue Requests" action="Report Emergency" onAction={() => setPage("emergency")} />
            {!dash?.recentRescues?.length ? (
              <div className="py-8 text-center">
                <Siren size={32} className="mx-auto mb-3 text-stone-200" />
                <p className="text-stone-500 text-sm font-medium mb-1">No rescue requests yet.</p>
                <p className="text-stone-400 text-xs mb-4">Submit a rescue request to track it here.</p>
                <Button variant="emergency" onClick={() => setPage("emergency")}><Siren size={14} /> Get Emergency Help</Button>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {dash.recentRescues.map((r) => (
                  <div key={r.id} className="py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-800 truncate">{r.animalType || "Animal"}</p>
                      <p className="text-xs text-stone-400 mt-0.5 truncate">
                        {r.pickupPoint?.address || r.pickupPoint?.lat ? `${r.pickupPoint.lat?.toFixed(4)}, ${r.pickupPoint.lng?.toFixed(4)}` : "Location set"} · {formatRelTime(r.submittedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[r.status] || STATUS_COLORS.Pending}`}>{r.status}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${r.severity === "High" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{r.severity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar: Rewards Progress + Notifications */}
        <div className="space-y-5">
          <RewardsProgress balance={rewards.balance} setPage={setPage} />

          {/* Recent Notifications */}
          <Card className="p-5">
            <DashSectionHeader title="Recent Notifications" action={`View all${unreadCount > 0 ? ` (${unreadCount})` : ""}`} onAction={() => setPage("settings")} />
            {notifications.length === 0 ? (
              <div className="py-4 text-center">
                <Bell size={24} className="mx-auto mb-2 text-stone-200" />
                <p className="text-xs text-stone-400">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 3).map((n) => {
                  const Icon = getNotifIcon(n.type);
                  return (
                    <div key={n.id} className={`flex gap-3 rounded-xl p-2.5 ${!n.read ? "bg-emerald-50/50" : ""}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${!n.read ? "bg-emerald-100" : "bg-stone-100"}`}>
                        <Icon size={12} className={!n.read ? "text-emerald-700" : "text-stone-500"} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-stone-800 truncate">{n.title}</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">{formatRelTime(n.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Bottom grid: Saved Animals + Adoption Apps + Donations + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Saved Animals */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <DashSectionHeader title="Saved Animals" action="Explore Animals" onAction={() => setPage("adopt")} />
            {!dash?.savedAnimals?.length ? (
              <div className="py-8 text-center">
                <Bookmark size={32} className="mx-auto mb-3 text-stone-200" />
                <p className="text-stone-500 text-sm font-medium mb-1">No saved animals yet.</p>
                <p className="text-stone-400 text-xs mb-4">Browse animals and save the ones you love.</p>
                <Button variant="secondary" onClick={() => setPage("adopt")}><PawPrint size={14} /> Explore Animals</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {dash.savedAnimals.slice(0, 6).map((a) => (
                  <div key={a.id} className="group relative rounded-xl overflow-hidden cursor-pointer" onClick={() => setPage("adopt")}>
                    <ImageWithFallback src={a.img} className="h-28 w-full object-cover" alt={a.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-xs font-bold drop-shadow">{a.name}</p>
                      <p className="text-white/80 text-[10px]">{a.species}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Adoption Apps + Quick Actions */}
        <div className="space-y-5">
          {/* Adoption Applications */}
          <Card className="p-5">
            <DashSectionHeader title="Applications" action="Browse" onAction={() => setPage("adopt")} />
            {!dash?.adoptionApplications?.length ? (
              <div className="py-4 text-center">
                <ClipboardList size={24} className="mx-auto mb-2 text-stone-200" />
                <p className="text-xs text-stone-400 mb-3">No adoption applications yet.</p>
                <button onClick={() => setPage("adopt")} className="text-xs font-semibold text-emerald-700 hover:underline">Explore Animals →</button>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {dash.adoptionApplications.slice(0, 3).map((app) => (
                  <div key={app.id} className="py-2.5 flex items-center gap-3">
                    <ImageWithFallback src={app.animalImg} className="w-9 h-9 rounded-lg object-cover shrink-0" alt={app.animalName} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-800 truncate">{app.animalName}</p>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${STATUS_COLORS[app.status] || STATUS_COLORS.Pending}`}>{app.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="p-5">
            <p className="font-bold text-stone-800 text-sm mb-3" style={fontDisplay}>Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions?.map((a) => (
                <button key={a.page} onClick={() => setPage(a.page)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-stone-50 hover:bg-emerald-50 hover:border-emerald-200 border border-transparent transition-all text-center">
                  <div className={`w-7 h-7 rounded-lg ${a.bg} flex items-center justify-center`}>
                    <a.icon size={14} className="text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-stone-700 leading-tight">{a.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Donations + Upcoming Events */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Donation history */}
        <Card className="p-6">
          <DashSectionHeader title="Your Donations" action="Donate" onAction={() => setPage("donate")} />
          {!dash?.donations?.length ? (
            <div className="py-6 text-center">
              <Heart size={28} className="mx-auto mb-2 text-stone-200" />
              <p className="text-stone-500 text-sm mb-1">No donations yet.</p>
              <Button variant="secondary" onClick={() => setPage("donate")} className="mt-3"><Heart size={14} /> Make a Donation</Button>
            </div>
          ) : (
            <>
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <span className="text-xs text-emerald-700 font-semibold">Total donated</span>
                <span className="text-lg font-bold text-emerald-700" style={fontDisplay}>₹{dash.totalDonated.toLocaleString()}</span>
              </div>
              <div className="divide-y divide-stone-100">
                {dash.donations.slice(0, 4).map((d) => (
                  <div key={d.id} className="py-2.5 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-stone-700">{d.category || d.purpose}</p>
                      <p className="text-xs text-stone-400">{formatRelTime(d.date)}</p>
                    </div>
                    <span className="text-emerald-700 font-bold">₹{(d.amount || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Upcoming Events */}
        <Card className="p-6">
          <DashSectionHeader title="Upcoming Events" action="All Events" onAction={() => setPage("events")} />
          {EVENTS.length === 0 ? (
            <div className="py-6 text-center">
              <CalendarDays size={28} className="mx-auto mb-2 text-stone-200" />
              <p className="text-stone-400 text-sm">No upcoming events.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {EVENTS.slice(0, 4).map((e) => (
                <div key={e.id} className="py-3 flex gap-3 items-start">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                    <ImageWithFallback src={e.img} className="w-full h-full object-cover" alt={e.name} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-800 line-clamp-1">{e.name}</p>
                    <p className="text-xs text-stone-400">{e.date} · {e.location}</p>
                    <Badge tone="stone">{e.price}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}


/* ---------------------------------- ADMIN DASHBOARD ---------------------------------- */
function AdminDashboardPage() {
  const rewards = useRewards();
  const stats = [
    { l: "Total Users", v: "24,810" }, { l: "Animals Registered", v: "6,204" }, { l: "Rescue Cases", v: "1,842" },
    { l: "Adoption Cases", v: "9,640" }, { l: "Active Reports", v: "128" }, { l: "Donations", v: "₹18.4L" },
    { l: "Verified Organizations", v: "312" }, { l: "Veterinary Partners", v: "812" },
  ];
  const sections = ["Users", "Animals", "Rescue Cases", "Reports", "Donations", "Organizations", "Veterinarians", "Community Moderation", "Rewards"];
  const rows = [
    { id: "PS-2026-10482", type: "Report - Abandonment", status: "Under Review" },
    { id: "PS-RQ-8841", type: "Rescue - Injured dog", status: "Assigned" },
    { id: "PS-ORG-0219", type: "Organization verification", status: "Pending" },
    { id: "PS-AD-5533", type: "Adoption case", status: "Resolved" },
    { id: "PS-USR-7712", type: "Volunteer signup", status: "Verified" },
  ];
  const toneOf = (s) => s === "Resolved" || s === "Verified" ? "emerald" : s === "Rejected" ? "rose" : "amber";
  const [adjustPoints, setAdjustPoints] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="text-emerald-700" size={24} />
        <h1 className="text-3xl font-bold text-stone-900" style={fontDisplay}>Admin dashboard</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        {stats?.map((s) => (
          <Card key={s.l} className="p-5">
            <p className="text-2xl font-bold text-stone-900" style={fontDisplay}>{s.v}</p>
            <p className="text-xs text-stone-500 mt-1">{s.l}</p>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-4 gap-8">
        <Card className="p-5 h-fit">
          <p className="font-semibold text-stone-800 text-sm mb-3">Sections</p>
          {sections?.map((s) => <div key={s} className="py-2 text-sm text-stone-600 hover:text-emerald-700 cursor-pointer">{s}</div>)}
        </Card>
        <Card className="lg:col-span-3 p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-500 text-xs uppercase"><tr><th className="text-left p-4">Case ID</th><th className="text-left p-4">Type</th><th className="text-left p-4">Status</th><th className="p-4"></th></tr></thead>
            <tbody>
              {rows?.map((r) => (
                <tr key={r.id} className="border-t border-stone-100">
                  <td className="p-4 font-mono text-xs text-stone-700">{r.id}</td>
                  <td className="p-4 text-stone-600">{r.type}</td>
                  <td className="p-4"><Badge tone={toneOf(r.status)}>{r.status}</Badge></td>
                  <td className="p-4 text-right"><MoreHorizontal size={16} className="text-stone-400 inline" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* -------- Rewards management -------- */}
      <div className="mt-14">
        <div className="flex items-center gap-3 mb-6">
          <Gift className="text-emerald-700" size={22} />
          <h2 className="text-2xl font-bold text-stone-900" style={fontDisplay}>Rewards management</h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <Card className="p-5"><p className="text-2xl font-bold text-stone-900" style={fontDisplay}>{rewards.balance.toLocaleString()}</p><p className="text-xs text-stone-500 mt-1">Demo user balance</p></Card>
          <Card className="p-5"><p className="text-2xl font-bold text-stone-900" style={fontDisplay}>{rewards.pendingVerifications.length}</p><p className="text-xs text-stone-500 mt-1">Pending verifications</p></Card>
          <Card className="p-5"><p className="text-2xl font-bold text-stone-900" style={fontDisplay}>{rewards.transactions.length}</p><p className="text-xs text-stone-500 mt-1">Total transactions logged</p></Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-5">
            <p className="font-semibold text-stone-800 text-sm mb-4">Pending reward requests</p>
            {rewards.pendingVerifications.length === 0 && <p className="text-sm text-stone-400">No pending requests. Try requesting a rescue on the Emergency page, or submitting a report.</p>}
            <div className="space-y-3">
              {rewards.pendingVerifications.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 border border-stone-200 rounded-xl p-3">
                  <div>
                    <p className="text-sm font-medium text-stone-800">{p.description}</p>
                    <p className="text-xs text-stone-400">{p.reference_id} • +{p.points} P-Points</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => rewards.approveVerification(p.id)} className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"><Check size={15} /></button>
                    <button onClick={() => rewards.rejectVerification(p.id)} className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"><X size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="font-semibold text-stone-800 text-sm mb-4">Manually adjust points</p>
            <div className="space-y-3">
              <input value={adjustPoints} onChange={(e) => setAdjustPoints(e.target.value)} type="number" placeholder="Points (use negative to remove)" className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm" />
              <input value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="Reason" className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm" />
              <Button variant="primary" className="w-full" onClick={() => {
                const pts = parseInt(adjustPoints, 10);
                if (!pts) return;
                rewards.manualAdjust(pts, adjustReason || "Manual admin adjustment");
                setAdjustPoints(""); setAdjustReason("");
              }}>Apply adjustment</Button>
            </div>
          </Card>
        </div>

        <Card className="p-5 mb-6">
          <p className="font-semibold text-stone-800 text-sm mb-4">Reward configuration</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {REWARD_RULES.map((r) => (
              <div key={r.action_type} className="flex items-center justify-between text-sm border border-stone-100 rounded-lg px-3 py-2.5 bg-stone-50">
                <span className="text-stone-600 flex items-center gap-2"><r.icon size={13} className="text-emerald-700" /> {r.label}</span>
                <span className="font-semibold text-emerald-700">{r.points}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-3">Max marketplace discount: {rewardsConfig.maxMarketplaceDiscountPct}% · Max event discount: {rewardsConfig.maxEventDiscountPct}%</p>
        </Card>

        <Card className="p-0 overflow-hidden">
          <p className="font-semibold text-stone-800 text-sm p-5 pb-0">Reward transactions</p>
          <table className="w-full text-sm mt-3">
            <thead className="bg-stone-50 text-stone-500 text-xs uppercase"><tr><th className="text-left p-4">Reference</th><th className="text-left p-4">Description</th><th className="text-left p-4">Points</th><th className="text-left p-4">Status</th></tr></thead>
            <tbody>
              {rewards.transactions.map((t) => (
                <tr key={t.id} className="border-t border-stone-100">
                  <td className="p-4 font-mono text-xs text-stone-700">{t.reference_id}</td>
                  <td className="p-4 text-stone-600">{t.description}</td>
                  <td className={`p-4 font-semibold ${t.points > 0 ? "text-emerald-700" : "text-rose-600"}`}>{t.points > 0 ? "+" : ""}{t.points}</td>
                  <td className="p-4"><Badge tone={t.status === "credited" ? "emerald" : t.status === "redeemed" ? "rose" : "amber"}>{t.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------- AUTH ---------------------------------- */
function LoginPage({ setPage, toast }) {
  const auth = useAuth();
  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-emerald-700 flex items-center justify-center mx-auto mb-4"><PawPrint className="text-white" size={22} /></div>
        <h1 className="text-2xl font-bold text-stone-900" style={fontDisplay}>Welcome back</h1>
        <p className="text-stone-500 text-sm mt-1">Log in to continue to Petsogram.</p>
      </div>
      <Card className="p-6 space-y-4">
        <div><label className="text-xs font-semibold text-stone-500 mb-1.5 block">Email</label><div className="flex items-center border border-stone-300 rounded-lg px-3"><Mail size={15} className="text-stone-400" /><input className="w-full px-2 py-2.5 text-sm outline-none" placeholder="you@example.com" /></div></div>
        <div><label className="text-xs font-semibold text-stone-500 mb-1.5 block">Password</label><div className="flex items-center border border-stone-300 rounded-lg px-3"><Lock size={15} className="text-stone-400" /><input type="password" className="w-full px-2 py-2.5 text-sm outline-none" placeholder="••••••••" /></div></div>
        <Button variant="primary" className="w-full py-2.5" onClick={() => {
        auth.login();
        toast.push("Logged in successfully");
        if (auth.pendingAction) { auth.pendingAction(); auth.setPendingAction(null); }
        else if (auth.pendingPage) { setPage(auth.pendingPage); auth.setPendingPage(null); }
        else { setPage("dashboard"); }
    }}>Log in</Button>
        <p className="text-center text-xs text-stone-500">Don't have an account? <button onClick={() => setPage("signup")} className="text-emerald-700 font-semibold">Sign up</button></p>
      </Card>
    </div>
  );
}

function SignupPage({ setPage, toast }) {
    const auth = useAuth();
  const roles = ["Pet Owner", "Volunteer", "Rescuer", "Veterinarian", "NGO/Shelter", "Service Provider"];
  const [role, setRole] = useState("Pet Owner");
  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-emerald-700 flex items-center justify-center mx-auto mb-4"><PawPrint className="text-white" size={22} /></div>
        <h1 className="text-2xl font-bold text-stone-900" style={fontDisplay}>Join Petsogram</h1>
        <p className="text-stone-500 text-sm mt-1">Create your account to get started.</p>
      </div>
      <Card className="p-6 space-y-4">
        <div><label className="text-xs font-semibold text-stone-500 mb-1.5 block">Full name</label><input className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm" placeholder="Aditi Sharma" /></div>
        <div><label className="text-xs font-semibold text-stone-500 mb-1.5 block">Email</label><input className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm" placeholder="you@example.com" /></div>
        <div>
          <label className="text-xs font-semibold text-stone-500 mb-1.5 block">I am a...</label>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((r) => <button key={r} onClick={() => setRole(r)} className={`px-3 py-2 rounded-lg text-xs font-medium border ${role === r ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-stone-600 border-stone-200"}`}>{r}</button>)}
          </div>
        </div>
        <Button variant="primary" className="w-full py-2.5" onClick={() => { 
          auth.signup(null, "Demo User", role); 
          toast.push("Account created — welcome to Petsogram!"); 
          if (auth.pendingAction) { auth.pendingAction(); auth.setPendingAction(null); }
          else if (auth.pendingPage) { setPage(auth.pendingPage); auth.setPendingPage(null); }
          else { setPage("dashboard"); }
        }}>Create account</Button>
        <p className="text-center text-xs text-stone-500">Already have an account? <button onClick={() => setPage("login")} className="text-emerald-700 font-semibold">Log in</button></p>
      </Card>
    </div>
  );
}


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
