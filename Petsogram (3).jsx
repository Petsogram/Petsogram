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
  ImagePlus, Send, Eye, MoreHorizontal, Award, Activity
} from "lucide-react";

/* ---------------------------------- FONTS ---------------------------------- */
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

/* ---------------------------------- MOCK DATA ---------------------------------- */
const ANIMALS = [
  { id: 1, name: "Bruno", species: "Dog", breed: "Indie", age: "2 years", gender: "Male", location: "Mumbai", vaccinated: true, medical: "Healthy", match: 92, img: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600", story: "Bruno was rescued from a construction site in Andheri after being abandoned by a previous owner. He's playful, loyal, and loves belly rubs.", temperament: "Friendly, energetic, great with kids" },
  { id: 2, name: "Luna", species: "Cat", breed: "Domestic Shorthair", age: "1 year", gender: "Female", location: "Pune", vaccinated: true, medical: "Recovering - minor limp", img: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600", match: 87, story: "Luna was found injured near a market and nursed back to health by our partner vet. She's shy at first but incredibly affectionate once comfortable.", temperament: "Calm, independent, affectionate" },
  { id: 3, name: "Milo", species: "Dog", breed: "Labrador Mix", age: "4 years", gender: "Male", location: "Thane", vaccinated: true, medical: "Healthy", img: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600", match: 78, story: "Milo's owner relocated abroad and couldn't take him along. He's house-trained and used to apartment living.", temperament: "Gentle, obedient, good with other dogs" },
  { id: 4, name: "Coco", species: "Bird", breed: "Budgerigar", age: "8 months", gender: "Female", location: "Navi Mumbai", vaccinated: false, medical: "Healthy", img: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=600", match: 65, story: "Coco was surrendered by a family who could no longer care for her. She chirps happily whenever someone talks to her.", temperament: "Chatty, curious, bonds closely with one person" },
  { id: 5, name: "Max", species: "Dog", breed: "German Shepherd Mix", age: "3 years", gender: "Male", location: "Mumbai", vaccinated: true, medical: "Healthy", img: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600", match: 95, story: "Max was rescued during a flood rescue operation. He's protective, intelligent, and highly trainable.", temperament: "Alert, loyal, needs an active household" },
  { id: 6, name: "Simba", species: "Cat", breed: "Indie", age: "6 months", gender: "Male", location: "Pune", vaccinated: true, medical: "Healthy", img: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600", match: 81, story: "Simba was born to a rescued street cat and has been hand-raised by volunteers since birth.", temperament: "Playful, curious, great with kids" },
];

const PROVIDERS = [
  { id: 1, name: "Sunrise Veterinary Hospital", type: "Vets", verified: true, rating: 4.8, distance: "1.2 km", open: true, phone: "+91 98200 11122", location: "Andheri West, Mumbai" },
  { id: 2, name: "Second Chance Animal Shelter", type: "Shelters", verified: true, rating: 4.6, distance: "2.4 km", open: true, phone: "+91 98200 22233", location: "Bandra, Mumbai" },
  { id: 3, name: "PawCare NGO Trust", type: "NGOs", verified: true, rating: 4.9, distance: "3.1 km", open: false, phone: "+91 98200 33344", location: "Powai, Mumbai" },
  { id: 4, name: "Rapid Rescue Volunteers", type: "Rescuers", verified: true, rating: 4.7, distance: "0.8 km", open: true, phone: "+91 98200 44455", location: "Ghatkopar, Mumbai" },
  { id: 5, name: "Furry Fresh Grooming Studio", type: "Groomers", verified: false, rating: 4.4, distance: "1.9 km", open: true, phone: "+91 98200 55566", location: "Thane West" },
  { id: 6, name: "Happy Paws Pet Services", type: "Pet Services", verified: true, rating: 4.5, distance: "2.7 km", open: true, phone: "+91 98200 66677", location: "Navi Mumbai" },
  { id: 7, name: "CityCare Veterinary Clinic", type: "Vets", verified: true, rating: 4.6, distance: "4.0 km", open: true, phone: "+91 98200 77788", location: "Pune" },
  { id: 8, name: "Shelter of Hope", type: "Shelters", verified: true, rating: 4.3, distance: "5.2 km", open: false, phone: "+91 98200 88899", location: "Thane" },
];

const EVENTS = [
  { id: 1, name: "Mumbai Mega Adoption Drive", date: "24 Aug 2026", time: "10:00 AM", location: "Bandra Amphitheatre, Mumbai", participants: 214, price: "Free", img: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600" },
  { id: 2, name: "Free Rabies Vaccination Camp", date: "29 Aug 2026", time: "9:00 AM", location: "Powai Community Ground", participants: 132, price: "Free", img: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600" },
  { id: 3, name: "Street Dog Feeding Meetup", date: "5 Sep 2026", time: "6:30 PM", location: "Juhu Beach, Mumbai", participants: 88, price: "Free", img: "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=600" },
  { id: 4, name: "Volunteer Onboarding Workshop", date: "12 Sep 2026", time: "11:00 AM", location: "Petsogram HQ, Pune", participants: 47, price: "Free", img: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=600" },
  { id: 5, name: "Pet Photography Workshop", date: "19 Sep 2026", time: "3:00 PM", location: "Powai, Mumbai", participants: 36, price: "₹500", img: "https://images.unsplash.com/photo-1517849845537-4d257902861a?w=600" },
  { id: 6, name: "Animal First Aid Workshop", date: "27 Sep 2026", time: "10:00 AM", location: "Andheri, Mumbai", participants: 58, price: "₹800", img: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=600" },
];

const POSTS = [
  { id: 1, author: "Ananya Rao", group: "Animal Rescuers", time: "2h ago", text: "Successfully relocated a family of kittens from a construction site in Chembur. All five are now safe and being fostered!", likes: 214, comments: 32, img: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600" },
  { id: 2, author: "Rohan Mehta", group: "Dog Lovers", time: "5h ago", text: "Reminder: monsoon season means more skin infections in strays. Carrying basic antiseptic can genuinely save a life.", likes: 156, comments: 18 },
  { id: 3, author: "Petsogram NGO Partners", group: "Animal Welfare", time: "1d ago", text: "This month we crossed 12,000 successful sterilizations across Mumbai and Pune. Thank you to every volunteer and donor.", likes: 542, comments: 61, img: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600" },
];

const PRODUCTS = {
  New: [
    { id: 1, name: "Premium Dry Dog Food 10kg", price: "₹2,199", condition: "New", location: "Mumbai", verified: true, img: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400" },
    { id: 2, name: "Orthopedic Pet Bed", price: "₹1,499", condition: "New", location: "Pune", verified: true, img: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=400" },
    { id: 3, name: "Adjustable Nylon Leash", price: "₹399", condition: "New", location: "Thane", verified: false, img: "https://images.unsplash.com/photo-1601758064135-8c319d3f5ee5?w=400" },
  ],
  "Pre-Owned": [
    { id: 4, name: "Wire Dog Crate (Medium)", price: "₹1,200", condition: "Good", location: "Navi Mumbai", verified: true, img: "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=400" },
    { id: 5, name: "Cat Tree Tower", price: "₹900", condition: "Fair", location: "Mumbai", verified: false, img: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400" },
  ],
  Donate: [
    { id: 6, name: "Unused Puppy Food Pack", price: "Free", condition: "New", location: "Pune", verified: true, img: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400" },
    { id: 7, name: "Old Blankets & Towels", price: "Free", condition: "Used", location: "Mumbai", verified: true, img: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400" },
  ],
};

const SERVICES = {
  Veterinary: [{ id: 1, name: "Dr. Kavita Shah - Home Visit Vet", rating: 4.9, price: "From ₹600", location: "Mumbai" }],
  Grooming: [{ id: 2, name: "PetStyle Grooming Salon", rating: 4.7, price: "From ₹450", location: "Pune" }],
  Training: [{ id: 3, name: "Bark & Learn Dog Training", rating: 4.8, price: "From ₹2,000/session", location: "Thane" }],
  Boarding: [{ id: 4, name: "Cozy Paws Boarding House", rating: 4.5, price: "From ₹700/day", location: "Mumbai" }],
  "Pet Sitting": [{ id: 5, name: "Sana's Pet Sitting", rating: 4.6, price: "From ₹500/day", location: "Navi Mumbai" }],
  Walking: [{ id: 6, name: "Daily Wag Dog Walkers", rating: 4.4, price: "From ₹300/walk", location: "Pune" }],
};

/* ---------------------------------- REWARDS: CONFIG & RULES ---------------------------------- */
// rewardsConfig.ts (kept as a single source of truth — do not duplicate these numbers elsewhere)
const rewardsConfig = {
  redemptionTiers: [
    { points: 100, discount: 10 },
    { points: 250, discount: 30 },
    { points: 500, discount: 75 },
    { points: 1000, discount: 150 },
  ],
  maxMarketplaceDiscountPct: 20,
  maxEventDiscountPct: 30,
};

const REWARD_RULES = [
  { action_type: "rescue", label: "Help / rescue an animal", points: 100, icon: Truck },
  { action_type: "abuse_report", label: "Verified abuse report", points: 50, icon: FileWarning },
  { action_type: "event_attendance", label: "Attend a community event", points: 30, icon: CalendarDays },
  { action_type: "volunteer", label: "Volunteer at an event", points: 75, icon: Users },
  { action_type: "adoption", label: "Successful adoption", points: 150, icon: HomeIcon },
  { action_type: "foster", label: "Foster an animal", points: 100, icon: HeartHandshake },
  { action_type: "donate_supplies", label: "Donate pet supplies", points: 50, icon: Package },
  { action_type: "help_owner", label: "Help another pet owner", points: 25, icon: Heart },
  { action_type: "organize_event", label: "Organize a verified event", points: 100, icon: Award },
  { action_type: "welfare_task", label: "Complete a verified welfare task", points: 50, icon: CheckCircle2 },
];

function parseRupees(str) {
  if (!str) return 0;
  const n = parseFloat(String(str).replace(/[^\d.]/g, ""));
  return isNaN(n) ? 0 : n;
}

// Points → rupee value, based on the nearest configured tier at or below the given points
function pointsToDiscountValue(points) {
  if (points <= 0) return 0;
  let best = null;
  for (const t of rewardsConfig.redemptionTiers) if (points >= t.points) best = t;
  if (!best) return 0;
  return Math.round(points * (best.discount / best.points));
}

function calculateMarketplaceDiscount(points, priceStr) {
  const price = parseRupees(priceStr);
  const maxDiscount = Math.floor(price * (rewardsConfig.maxMarketplaceDiscountPct / 100));
  const discount = Math.min(pointsToDiscountValue(points), maxDiscount, price);
  return { discount, maxDiscount, finalPrice: Math.max(price - discount, 0) };
}

function calculateEventDiscount(points, priceStr) {
  const price = parseRupees(priceStr);
  const maxDiscount = Math.floor(price * (rewardsConfig.maxEventDiscountPct / 100));
  const discount = Math.min(pointsToDiscountValue(points), maxDiscount, price);
  return { discount, maxDiscount, finalPrice: Math.max(price - discount, 0) };
}

function canRedeemPoints(balance, points) {
  return points > 0 && points <= balance;
}

/* ---------------------------------- REWARDS: CONTEXT / PROVIDER ---------------------------------- */
const RewardsContext = React.createContext(null);
function useRewards() {
  return React.useContext(RewardsContext);
}

function RewardsProvider({ children, toast }) {
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
    balance, lifetime, redeemed, transactions, pendingVerifications, impact, rules: REWARD_RULES, awardedKeys,
    submitForVerification, awardPoints, approveVerification, rejectVerification, redeemPoints, manualAdjust,
  };
  return <RewardsContext.Provider value={value}>{children}</RewardsContext.Provider>;
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

/* ---------------------------------- NAVBAR ---------------------------------- */
function Navbar({ page, setPage, toast }) {
  const [open, setOpen] = useState(false);
  const rewards = useRewards();
  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-stone-200 shadow-sm shadow-stone-200/40">
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
          <button onClick={() => toast.push("Search coming soon in full build")} className="p-2.5 rounded-lg text-stone-500 hover:bg-stone-100"><Search size={18} /></button>
          <button onClick={() => toast.push("No new notifications")} className="p-2.5 rounded-lg text-stone-500 hover:bg-stone-100 relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
          </button>
          <button onClick={() => setPage("rewards")} className={`hidden md:flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${page === "rewards" ? "bg-emerald-50 text-emerald-700" : "text-stone-600 hover:bg-stone-100"}`}>
            <Gift size={16} className="text-emerald-600" /> {rewards.balance.toLocaleString()}
          </button>
          <button onClick={() => setPage("dashboard")} className="p-2.5 rounded-lg text-stone-500 hover:bg-stone-100"><User size={18} /></button>
          <Button variant="emergency" onClick={() => setPage("emergency")} className="ml-2"><Siren size={16} /> Get Help</Button>
        </div>

        <button className="lg:hidden p-2 text-stone-700" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

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
            <Button variant="secondary" onClick={() => { setPage("login"); setOpen(false); }} className="flex-1">Log in</Button>
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
              {col.items.map((it) => (
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
            {quickActions.map((q) => (
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
            {stats.map((s) => (
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
            {journey.map((j) => (
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

/* ---------------------------------- EMERGENCY PAGE ---------------------------------- */
function EmergencyPage({ toast }) {
  const rewards = useRewards();
  const [step, setStep] = useState("form");
  const [severity, setSeverity] = useState("High");
  const [animalType, setAnimalType] = useState("Dog");
  const [desc, setDesc] = useState("");
  const [located, setLocated] = useState(false);
  const [caseId] = useState(`PS-RQ-${Math.floor(1000 + Math.random() * 9000)}`);
  const [rescueRequested, setRescueRequested] = useState(false);

  const nearby = PROVIDERS.filter((p) => ["Vets", "Rescuers", "Shelters", "NGOs"].includes(p.type)).slice(0, 5);

  const submit = () => {
    if (!desc.trim()) { toast.push("Describe the situation before submitting", "amber"); return; }
    setStep("result");
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
              <label className="text-sm font-semibold text-stone-700 block mb-2">Location</label>
              <button onClick={() => { setLocated(true); toast.push("Location shared"); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border ${located ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-stone-300 text-stone-600"}`}>
                <MapPin size={16} /> {located ? "Location shared: Andheri West, Mumbai" : "Share current location"}
              </button>
            </div>
            <div>
              <label className="text-sm font-semibold text-stone-700 block mb-2">Emergency severity</label>
              <div className="grid grid-cols-4 gap-2">
                {[{ l: "Critical", c: "rose" }, { l: "High", c: "amber" }, { l: "Moderate", c: "blue" }, { l: "Low", c: "emerald" }].map((s) => (
                  <button key={s.l} onClick={() => setSeverity(s.l)} className={`py-2.5 rounded-lg text-sm font-semibold border ${severity === s.l ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200"}`}>{s.l}</button>
                ))}
              </div>
            </div>
            <Button variant="emergency" onClick={submit} className="w-full py-3"><Siren size={17} /> Submit emergency report</Button>
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
            <div className="grid md:grid-cols-2 gap-4">
              {nearby.map((p) => (
                <Card key={p.id} className="p-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-stone-900 text-sm">{p.name}</p>
                      {p.verified && <BadgeCheck size={15} className="text-emerald-600" />}
                    </div>
                    <p className="text-xs text-stone-500 mt-1">{p.type} • {p.distance} • {p.location}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className={`font-medium ${p.open ? "text-emerald-600" : "text-rose-500"}`}>{p.open ? "Open now" : "Closed"}</span>
                      <span className="flex items-center gap-1 text-stone-500"><Star size={12} className="fill-amber-400 text-amber-400" /> {p.rating}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => toast.push(`Calling ${p.name}...`)} className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"><Phone size={16} /></button>
                    <button onClick={() => toast.push("Opening navigation...")} className="p-2 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200"><Navigation size={16} /></button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

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
    </div>
  );
}

/* ---------------------------------- DISCOVER PAGE ---------------------------------- */
function DiscoverPage() {
  const [tab, setTab] = useState("Vets");
  const [openOnly, setOpenOnly] = useState(false);
  const tabs = ["Vets", "Shelters", "NGOs", "Rescuers", "Groomers", "Pet Services"];
  const results = PROVIDERS.filter((p) => p.type === tab).filter((p) => !openOnly || p.open);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <SectionHeading eyebrow="Nearby & verified" title="Discover care around you" subtitle="Browse verified vets, shelters, NGOs, rescuers and service providers near your location." />
      <div className="flex gap-2 flex-wrap mb-8 border-b border-stone-200 pb-4">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === t ? "bg-emerald-700 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>{t}</button>
        ))}
      </div>
      <div className="grid lg:grid-cols-4 gap-8">
        <Card className="p-5 h-fit lg:sticky lg:top-24">
          <p className="font-semibold text-stone-800 text-sm mb-4 flex items-center gap-2"><Filter size={15} /> Filters</p>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-stone-500 mb-2 font-medium">Distance</p>
              <input type="range" className="w-full accent-emerald-700" />
            </div>
            <div>
              <p className="text-stone-500 mb-2 font-medium">Minimum rating</p>
              <div className="flex gap-1">{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={16} className="text-amber-400 fill-amber-400" />)}</div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} className="accent-emerald-700 w-4 h-4" /> Open now
            </label>
          </div>
        </Card>
        <div className="lg:col-span-3 grid md:grid-cols-2 gap-5">
          {results.length === 0 && <p className="text-stone-400 text-sm">No results match your filters.</p>}
          {results.map((p) => (
            <Card key={p.id} className="p-5 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-stone-300/40 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center"><Building2 size={20} className="text-emerald-700" /></div>
                {p.verified && <Badge>Verified</Badge>}
              </div>
              <p className="font-semibold text-stone-900 mt-3">{p.name}</p>
              <p className="text-xs text-stone-500 mt-1 flex items-center gap-1"><MapPin size={12} /> {p.location} • {p.distance}</p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="flex items-center gap-1 text-stone-600"><Star size={12} className="fill-amber-400 text-amber-400" /> {p.rating}</span>
                <span className={p.open ? "text-emerald-600 font-medium" : "text-rose-500 font-medium"}>{p.open ? "Open" : "Closed"}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="secondary" className="flex-1 text-xs py-2"><Phone size={13} /> {p.phone}</Button>
                <Button variant="primary" className="text-xs py-2">View <ChevronRight size={13} /></Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- ADOPT + PROFILE ---------------------------------- */
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
function CommunityPage({ toast }) {
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

function EventsPage({ toast }) {
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
function ReportAbusePage({ toast }) {
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
  const [amount, setAmount] = useState(500);
  const [custom, setCustom] = useState("");
  const categories = [
    { l: "Medical Treatment", icon: Stethoscope }, { l: "Food", icon: Package }, { l: "Rescue", icon: Truck },
    { l: "Shelter", icon: HomeIcon }, { l: "Vaccination", icon: ShieldCheck }, { l: "Emergency Care", icon: Siren },
  ];
  const [cat, setCat] = useState("Medical Treatment");
  const transparency = [
    { d: "₹5,000", b: "Second Chance Shelter", p: "Medical treatment for Luna", s: "Completed" },
    { d: "₹2,000", b: "Rapid Rescue Volunteers", p: "Flood rescue operation fuel", s: "In progress" },
    { d: "₹10,000", b: "PawCare NGO Trust", p: "Vaccination camp supplies", s: "Completed" },
  ];
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <SectionHeading eyebrow="Make an impact" title="Your support can save a life" subtitle="100% of donations are routed to verified organizations. Track exactly where your contribution goes." />
      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="p-6 lg:col-span-2">
          <p className="font-semibold text-stone-800 mb-3">Choose a category</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {categories.map((c) => (
              <button key={c.l} onClick={() => setCat(c.l)} className={`flex flex-col items-center gap-2 rounded-xl p-4 border text-xs font-semibold ${cat === c.l ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-stone-200 text-stone-600"}`}>
                <c.icon size={20} /> {c.l}
              </button>
            ))}
          </div>
          <p className="font-semibold text-stone-800 mb-3">Choose an amount</p>
          <div className="flex gap-2 flex-wrap mb-4">
            {[100, 500, 1000, 2500].map((v) => (
              <button key={v} onClick={() => { setAmount(v); setCustom(""); }} className={`px-5 py-2.5 rounded-lg text-sm font-semibold border ${amount === v && !custom ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-stone-600 border-stone-200"}`}>₹{v}</button>
            ))}
            <input value={custom} onChange={(e) => { setCustom(e.target.value); setAmount(0); }} placeholder="Custom amount" className="px-4 py-2.5 rounded-lg border border-stone-200 text-sm w-36" />
          </div>
          <Button variant="primary" className="w-full py-3" onClick={() => toast.push(`Thank you! ₹${custom || amount} donated toward ${cat}`)}>Donate ₹{custom || amount} now</Button>
        </Card>
        <Card className="p-6">
          <p className="font-semibold text-stone-800 mb-3">Donation impact</p>
          {[["₹100", "Feeds a rescued animal for a week"], ["₹500", "Covers a basic vet checkup"], ["₹1,000", "Supports emergency rescue transport"], ["₹2,500", "Funds full vaccination for 5 animals"]].map(([amt, txt]) => (
            <div key={amt} className="flex gap-3 py-2.5 border-b border-stone-100 last:border-0">
              <span className="font-bold text-emerald-700 text-sm w-14">{amt}</span>
              <span className="text-xs text-stone-500">{txt}</span>
            </div>
          ))}
        </Card>
      </div>

      <div className="mt-12">
        <h3 className="font-bold text-stone-900 text-lg mb-4" style={fontDisplay}>Donation transparency</h3>
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-500 text-xs uppercase"><tr><th className="text-left p-4">Donation</th><th className="text-left p-4">Beneficiary</th><th className="text-left p-4">Purpose</th><th className="text-left p-4">Status</th></tr></thead>
            <tbody>
              {transparency.map((t, i) => (
                <tr key={i} className="border-t border-stone-100">
                  <td className="p-4 font-semibold text-stone-800">{t.d}</td>
                  <td className="p-4 text-stone-600 flex items-center gap-1.5"><BadgeCheck size={14} className="text-emerald-600" /> {t.b}</td>
                  <td className="p-4 text-stone-500">{t.p}</td>
                  <td className="p-4"><Badge tone={t.s === "Completed" ? "emerald" : "amber"}>{t.s}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------- SERVICES ---------------------------------- */
function ServicesPage({ toast }) {
  const [cat, setCat] = useState("Veterinary");
  const icons = { Veterinary: Stethoscope, Grooming: Scissors, Training: GraduationCap, Boarding: HomeIcon, "Pet Sitting": Users, Walking: Dog };
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <SectionHeading eyebrow="Trusted providers" title="Pet services marketplace" subtitle="Book verified veterinary, grooming, training, boarding, sitting and walking services." />
      <div className="flex gap-2 flex-wrap mb-8">
        {Object.keys(SERVICES).map((c) => {
          const Icon = icons[c];
          return <button key={c} onClick={() => setCat(c)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${cat === c ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-stone-600 border-stone-200"}`}><Icon size={15} /> {c}</button>;
        })}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SERVICES[cat].map((s) => (
          <Card key={s.id} className="p-5">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">{React.createElement(icons[cat], { size: 20, className: "text-emerald-700" })}</div>
              <Badge>Verified</Badge>
            </div>
            <p className="font-semibold text-stone-900 mt-3">{s.name}</p>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1"><MapPin size={12} /> {s.location}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="flex items-center gap-1 text-xs text-stone-600"><Star size={12} className="fill-amber-400 text-amber-400" /> {s.rating}</span>
              <span className="text-sm font-semibold text-emerald-700">{s.price}</span>
            </div>
            <Button variant="primary" className="w-full mt-4 text-xs py-2" onClick={() => toast.push(`Booking request sent to ${s.name}`)}>Book Now</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- MARKETPLACE ---------------------------------- */
function ProductCard({ p, tab, toast }) {
  const rewards = useRewards();
  const [open, setOpen] = useState(false);
  const [redemption, setRedemption] = useState(null); // { points, discount, finalPrice }
  const canRedeem = tab !== "Donate" && p.price !== "Free";

  const confirm = (tier) => {
    const { discount, finalPrice, maxDiscount } = calculateMarketplaceDiscount(tier.points, p.price);
    const ok = rewards.redeemPoints(tier.points, "marketplace", `PROD-${p.id}`, discount);
    if (ok) { setRedemption({ points: tier.points, discount, finalPrice, maxDiscount }); setOpen(false); }
  };

  return (
    <Card className="overflow-hidden">
      <img src={p.img} className="h-36 w-full object-cover" alt={p.name} />
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

        <Button variant="secondary" className="w-full mt-3 text-xs py-2" onClick={() => toast.push(redemption ? `Order confirmed at ₹${redemption.finalPrice.toLocaleString()}` : `Interest sent for ${p.name}`)}>
          {tab === "Donate" ? "Request item" : redemption ? "Confirm order" : "Contact seller"}
        </Button>
      </div>
    </Card>
  );
}

function MarketplacePage({ toast }) {
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
        {(PRODUCTS[tab] || PRODUCTS.New).map((p) => <ProductCard key={p.id} p={p} tab={tab} toast={toast} />)}
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
function DashboardPage({ setPage }) {
  const rewards = useRewards();
  const items = [
    { l: "My Animals", v: 2, icon: PawPrint }, { l: "Adoption Applications", v: 1, icon: ClipboardList },
    { l: "Rescue Requests", v: 3, icon: Siren }, { l: "Appointments", v: 2, icon: CalendarDays },
    { l: "Community Activity", v: 14, icon: Users }, { l: "Donations", v: 6, icon: Heart },
    { l: "Saved Animals", v: 5, icon: Bookmark }, { l: "Notifications", v: 4, icon: Bell },
  ];
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900" style={fontDisplay}>Welcome back, Aditi</h1>
          <p className="text-stone-500 mt-1">Here's what's happening in your Petsogram world.</p>
        </div>
        <Button variant="secondary" onClick={() => setPage("settings")}><Settings size={16} /> Settings</Button>
      </div>

      <div className="rounded-2xl p-5 mb-8 flex items-center justify-between flex-wrap gap-4 bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-md shadow-emerald-900/20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center"><PawPrint size={20} className="text-white" /></div>
          <div>
            <p className="text-white font-semibold text-sm">Petsogram Rewards</p>
            <p className="text-emerald-100 text-2xl font-bold" style={fontDisplay}>{rewards.balance.toLocaleString()} <span className="text-sm font-medium">P-Points</span></p>
          </div>
        </div>
        <Button variant="outlineLight" onClick={() => setPage("rewards")}>View Rewards <ArrowRight size={14} /></Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        {items.map((it) => (
          <Card key={it.l} className="p-5">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3"><it.icon size={18} className="text-emerald-700" /></div>
            <p className="text-2xl font-bold text-stone-900" style={fontDisplay}>{it.v}</p>
            <p className="text-xs text-stone-500 mt-0.5">{it.l}</p>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <p className="font-semibold text-stone-800 mb-4">Recent rescue requests</p>
          {["Injured dog - Andheri (In progress)", "Kitten stuck in drain - Powai (Resolved)", "Abandoned puppies - Thane (Assigned)"].map((r) => (
            <div key={r} className="flex items-center justify-between py-2.5 border-b border-stone-100 last:border-0 text-sm">
              <span className="text-stone-600">{r}</span><ChevronRight size={15} className="text-stone-300" />
            </div>
          ))}
        </Card>
        <Card className="p-6">
          <p className="font-semibold text-stone-800 mb-4">Saved animals</p>
          <div className="grid grid-cols-3 gap-3">
            {ANIMALS.slice(0, 3).map((a) => <img key={a.id} src={a.img} className="h-20 w-full object-cover rounded-lg" alt={a.name} />)}
          </div>
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
        {stats.map((s) => (
          <Card key={s.l} className="p-5">
            <p className="text-2xl font-bold text-stone-900" style={fontDisplay}>{s.v}</p>
            <p className="text-xs text-stone-500 mt-1">{s.l}</p>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-4 gap-8">
        <Card className="p-5 h-fit">
          <p className="font-semibold text-stone-800 text-sm mb-3">Sections</p>
          {sections.map((s) => <div key={s} className="py-2 text-sm text-stone-600 hover:text-emerald-700 cursor-pointer">{s}</div>)}
        </Card>
        <Card className="lg:col-span-3 p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-500 text-xs uppercase"><tr><th className="text-left p-4">Case ID</th><th className="text-left p-4">Type</th><th className="text-left p-4">Status</th><th className="p-4"></th></tr></thead>
            <tbody>
              {rows.map((r) => (
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
        <Button variant="primary" className="w-full py-2.5" onClick={() => { toast.push("Logged in successfully"); setPage("dashboard"); }}>Log in</Button>
        <p className="text-center text-xs text-stone-500">Don't have an account? <button onClick={() => setPage("signup")} className="text-emerald-700 font-semibold">Sign up</button></p>
      </Card>
    </div>
  );
}

function SignupPage({ setPage, toast }) {
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
        <Button variant="primary" className="w-full py-2.5" onClick={() => { toast.push("Account created — welcome to Petsogram!"); setPage("dashboard"); }}>Create account</Button>
        <p className="text-center text-xs text-stone-500">Already have an account? <button onClick={() => setPage("login")} className="text-emerald-700 font-semibold">Log in</button></p>
      </Card>
    </div>
  );
}

function ProfilePage({ setPage }) {
  const rewards = useRewards();
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-700">A</div>
          <div><p className="font-bold text-lg text-stone-900">Aditi Sharma</p><p className="text-sm text-stone-500">Pet Owner • Mumbai</p></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
          <div><p className="text-stone-400 text-xs">Email</p><p className="text-stone-700 mt-0.5">aditi.sharma@example.com</p></div>
          <div><p className="text-stone-400 text-xs">Phone</p><p className="text-stone-700 mt-0.5">+91 98xxxxxx21</p></div>
          <div><p className="text-stone-400 text-xs">Member since</p><p className="text-stone-700 mt-0.5">Jan 2025</p></div>
          <div><p className="text-stone-400 text-xs">Role</p><p className="text-stone-700 mt-0.5">Pet Owner</p></div>
        </div>
      </Card>

      <div className="rounded-2xl p-5 mt-5 flex items-center justify-between flex-wrap gap-4 bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-md shadow-emerald-900/20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center"><PawPrint size={20} className="text-white" /></div>
          <div>
            <p className="text-white font-semibold text-sm">Petsogram Rewards</p>
            <p className="text-emerald-100 text-xl font-bold" style={fontDisplay}>{rewards.balance.toLocaleString()} <span className="text-sm font-medium">P-Points</span></p>
          </div>
        </div>
        <Button variant="outlineLight" onClick={() => setPage("rewards")}>View Rewards <ArrowRight size={14} /></Button>
      </div>
    </div>
  );
}

function SettingsPage({ toast }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-stone-900 mb-6" style={fontDisplay}>Settings</h1>
      <Card className="p-6 space-y-4">
        {["Email notifications", "SMS alerts for emergencies", "Show profile in community", "Allow location sharing"].map((s) => (
          <div key={s} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
            <span className="text-sm text-stone-600">{s}</span>
            <input type="checkbox" defaultChecked className="accent-emerald-700 w-4 h-4" />
          </div>
        ))}
        <Button variant="primary" onClick={() => toast.push("Settings saved")}>Save changes</Button>
        <button className="flex items-center gap-2 text-rose-600 text-sm font-medium pt-2"><LogOut size={15} /> Log out</button>
      </Card>
    </div>
  );
}

/* ---------------------------------- APP ROOT ---------------------------------- */
export default function PetsogramApp() {
  useFonts();
  const [page, setPageRaw] = useState("home");
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const toast = useToast();
  const setPage = (p) => { setPageRaw(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const pages = {
    home: <HomePage setPage={setPage} toast={toast} />,
    discover: <DiscoverPage />,
    emergency: <EmergencyPage toast={toast} />,
    adopt: <AdoptPage setPage={setPage} setSelectedAnimal={setSelectedAnimal} />,
    animalProfile: <AnimalProfilePage animal={selectedAnimal} setPage={setPage} toast={toast} />,
    rehoming: <RehomingPage toast={toast} />,
    community: <CommunityPage toast={toast} />,
    events: <EventsPage toast={toast} />,
    report: <ReportAbusePage toast={toast} />,
    donate: <DonatePage toast={toast} />,
    services: <ServicesPage toast={toast} />,
    marketplace: <MarketplacePage toast={toast} />,
    rewards: <RewardsPage setPage={setPage} toast={toast} />,
    dashboard: <DashboardPage setPage={setPage} />,
    admin: <AdminDashboardPage />,
    login: <LoginPage setPage={setPage} toast={toast} />,
    signup: <SignupPage setPage={setPage} toast={toast} />,
    profile: <ProfilePage setPage={setPage} />,
    settings: <SettingsPage toast={toast} />,
  };

  return (
    <RewardsProvider toast={toast}>
      <div className="min-h-screen bg-stone-50 text-stone-900" style={fontBody}>
        {toast.el}
        <Navbar page={page} setPage={setPage} toast={toast} />
        {pages[page] || pages.home}
        <div className="max-w-7xl mx-auto px-6 pb-6 flex justify-center">
          <button onClick={() => setPage("admin")} className="text-xs text-stone-300 hover:text-stone-500 mt-4">Admin dashboard (demo)</button>
        </div>
        <Footer setPage={setPage} />
      </div>
    </RewardsProvider>
  );
}
