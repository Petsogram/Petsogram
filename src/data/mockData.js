// Auto-extracted mock data
import { Truck, FileWarning, CalendarDays, Users, HomeIcon, HeartHandshake, Package, Heart, Award, CheckCircle2 } from "lucide-react";

export const ANIMALS = [
  { id: 1, name: "Bruno", species: "Dog", breed: "Indie", age: "2 years", gender: "Male", location: "Mumbai", vaccinated: true, medical: "Healthy", match: 92, img: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80", story: "Bruno was rescued from a construction site in Andheri after being abandoned by a previous owner. He's playful, loyal, and loves belly rubs.", temperament: "Friendly, energetic, great with kids" },
  { id: 2, name: "Luna", species: "Cat", breed: "Domestic Shorthair", age: "1 year", gender: "Female", location: "Pune", vaccinated: true, medical: "Recovering - minor limp", img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80", match: 87, story: "Luna was found injured near a market and nursed back to health by our partner vet. She's shy at first but incredibly affectionate once comfortable.", temperament: "Calm, independent, affectionate" },
  { id: 3, name: "Milo", species: "Dog", breed: "Labrador Mix", age: "4 years", gender: "Male", location: "Thane", vaccinated: true, medical: "Healthy", img: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80", match: 78, story: "Milo's owner relocated abroad and couldn't take him along. He's house-trained and used to apartment living.", temperament: "Gentle, obedient, good with other dogs" },
  { id: 4, name: "Coco", species: "Bird", breed: "Budgerigar", age: "8 months", gender: "Female", location: "Navi Mumbai", vaccinated: false, medical: "Healthy", img: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=600", match: 65, story: "Coco was surrendered by a family who could no longer care for her. She chirps happily whenever someone talks to her.", temperament: "Chatty, curious, bonds closely with one person" },
  { id: 5, name: "Max", species: "Dog", breed: "German Shepherd Mix", age: "3 years", gender: "Male", location: "Mumbai", vaccinated: true, medical: "Healthy", img: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=80", match: 95, story: "Max was rescued during a flood rescue operation. He's protective, intelligent, and highly trainable.", temperament: "Alert, loyal, needs an active household" },
  { id: 6, name: "Simba", species: "Cat", breed: "Indie", age: "6 months", gender: "Male", location: "Pune", vaccinated: true, medical: "Healthy", img: "https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&w=900&q=80", match: 81, story: "Simba was born to a rescued street cat and has been hand-raised by volunteers since birth.", temperament: "Playful, curious, great with kids" },
];

export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const PROVIDERS = [
  { id: 1, name: "Sunrise Veterinary Hospital", type: "Vets", verified: true, rating: 4.8, openHoursStart: 9, openHoursEnd: 21, hasOpenInfo: true, phone: "+91 98200 11122", location: "Andheri West, Mumbai", latitude: 19.1363, longitude: 72.8277 },
  { id: 2, name: "Second Chance Animal Shelter", type: "Shelters", verified: true, rating: 4.6, openHoursStart: 0, openHoursEnd: 24, hasOpenInfo: true, phone: "+91 98200 22233", location: "Bandra, Mumbai", latitude: 19.0596, longitude: 72.8295 },
  { id: 3, name: "PawCare NGO Trust", type: "NGOs", verified: true, rating: 4.9, openHoursStart: 10, openHoursEnd: 18, hasOpenInfo: true, phone: "+91 98200 33344", location: "Powai, Mumbai", latitude: 19.1176, longitude: 72.9060 },
  { id: 4, name: "Rapid Rescue Volunteers", type: "Rescuers", verified: true, rating: 4.7, openHoursStart: 0, openHoursEnd: 24, hasOpenInfo: true, phone: "+91 98200 44455", location: "Ghatkopar, Mumbai", latitude: 19.0856, longitude: 72.9082 },
  { id: 5, name: "Furry Fresh Grooming Studio", type: "Groomers", verified: false, rating: 4.4, openHoursStart: 11, openHoursEnd: 20, hasOpenInfo: true, phone: "+91 98200 55566", location: "Thane West, Mumbai", latitude: 19.2183, longitude: 72.9781 },
  { id: 6, name: "Happy Paws Pet Services", type: "Pet Services", verified: true, rating: 4.5, openHoursStart: 8, openHoursEnd: 18, hasOpenInfo: true, phone: "+91 98200 66677", location: "Navi Mumbai", latitude: 19.0330, longitude: 73.0297 },
  { id: 7, name: "CityCare Veterinary Clinic", type: "Vets", verified: true, rating: 4.6, openHoursStart: 9, openHoursEnd: 22, hasOpenInfo: true, phone: "+91 98200 77788", location: "Shivajinagar, Pune", latitude: 18.5204, longitude: 73.8567 },
  { id: 8, name: "Shelter of Hope", type: "Shelters", verified: true, rating: 4.3, openHoursStart: 9, openHoursEnd: 17, hasOpenInfo: true, phone: "+91 98200 88899", location: "Thane, Maharashtra", latitude: 19.2000, longitude: 72.9666 },
  { id: 9, name: "Green Leaf Animal Hospital", type: "Vets", verified: true, rating: 4.7, openHoursStart: 9, openHoursEnd: 21, hasOpenInfo: true, phone: "+91 98201 11223", location: "Koregaon Park, Pune", latitude: 18.5362, longitude: 73.8972 },
  { id: 10, name: "Paws & Claws NGO", type: "NGOs", verified: true, rating: 4.8, openHoursStart: 9, openHoursEnd: 18, hasOpenInfo: true, phone: "+91 98201 22334", location: "Baner, Pune", latitude: 18.5590, longitude: 73.7868 },
  { id: 11, name: "Street Animal Rescue Network", type: "Rescuers", verified: true, rating: 4.9, openHoursStart: 0, openHoursEnd: 24, hasOpenInfo: true, phone: "+91 98201 33445", location: "Wakad, Pune", latitude: 18.5909, longitude: 73.7614 },
  { id: 12, name: "Glamour Grooming Salon", type: "Groomers", verified: false, rating: 4.2, openHoursStart: 10, openHoursEnd: 19, hasOpenInfo: true, phone: "+91 98201 44556", location: "Viman Nagar, Pune", latitude: 18.5623, longitude: 73.9131 },
  { id: 13, name: "PetZone Complete Care", type: "Pet Services", verified: true, rating: 4.6, openHoursStart: 8, openHoursEnd: 20, hasOpenInfo: true, phone: "+91 98201 55667", location: "Kothrud, Pune", latitude: 18.5075, longitude: 73.8080 },
  { id: 14, name: "Bangalore Pet Clinic", type: "Vets", verified: true, rating: 4.8, openHoursStart: 8, openHoursEnd: 21, hasOpenInfo: true, phone: "+91 98202 11223", location: "Koramangala, Bangalore", latitude: 12.9352, longitude: 77.6245 },
  { id: 15, name: "Stray Safe Shelter", type: "Shelters", verified: true, rating: 4.5, openHoursStart: 9, openHoursEnd: 18, hasOpenInfo: true, phone: "+91 98202 22334", location: "Indiranagar, Bangalore", latitude: 12.9784, longitude: 77.6408 },
  { id: 16, name: "Bangalore Animal Welfare Trust", type: "NGOs", verified: true, rating: 4.7, openHoursStart: 10, openHoursEnd: 17, hasOpenInfo: true, phone: "+91 98202 33445", location: "Jayanagar, Bangalore", latitude: 12.9308, longitude: 77.5838 },
  { id: 17, name: "QuickPaw Rescue Team", type: "Rescuers", verified: true, rating: 4.9, openHoursStart: 0, openHoursEnd: 24, hasOpenInfo: true, phone: "+91 98202 44556", location: "Whitefield, Bangalore", latitude: 12.9698, longitude: 77.7500 },
  { id: 18, name: "Sparkle Pet Grooming", type: "Groomers", verified: true, rating: 4.4, openHoursStart: 9, openHoursEnd: 19, hasOpenInfo: true, phone: "+91 98202 55667", location: "HSR Layout, Bangalore", latitude: 12.9116, longitude: 77.6474 },
  { id: 19, name: "Bangalore PetCare Services", type: "Pet Services", verified: true, rating: 4.5, openHoursStart: 8, openHoursEnd: 20, hasOpenInfo: true, phone: "+91 98202 66778", location: "BTM Layout, Bangalore", latitude: 12.9166, longitude: 77.6101 },
  { id: 20, name: "Delhi Animal Clinic", type: "Vets", verified: true, rating: 4.7, openHoursStart: 9, openHoursEnd: 21, hasOpenInfo: true, phone: "+91 98203 11223", location: "Greater Kailash, New Delhi", latitude: 28.5494, longitude: 77.2285 },
  { id: 21, name: "North Delhi Rescue Unit", type: "Rescuers", verified: true, rating: 4.6, openHoursStart: 0, openHoursEnd: 24, hasOpenInfo: true, phone: "+91 98203 22334", location: "Rohini, New Delhi", latitude: 28.7041, longitude: 77.1025 },
  { id: 22, name: "Delhi NGO for Animals", type: "NGOs", verified: true, rating: 4.5, openHoursStart: 10, openHoursEnd: 17, hasOpenInfo: true, phone: "+91 98203 33445", location: "Dwarka, New Delhi", latitude: 28.5921, longitude: 77.0460 },
  { id: 23, name: "Delhi Pet Grooming Lounge", type: "Groomers", verified: true, rating: 4.3, openHoursStart: 10, openHoursEnd: 19, hasOpenInfo: true, phone: "+91 98203 44556", location: "Lajpat Nagar, New Delhi", latitude: 28.5700, longitude: 77.2411 },
  { id: 24, name: "Chennai Vet Care", type: "Vets", verified: true, rating: 4.5, openHoursStart: 8, openHoursEnd: 20, hasOpenInfo: true, phone: "+91 98204 11223", location: "T. Nagar, Chennai", latitude: 13.0418, longitude: 80.2341 },
  { id: 25, name: "Chennai Animal Shelter", type: "Shelters", verified: true, rating: 4.4, openHoursStart: 9, openHoursEnd: 17, hasOpenInfo: true, phone: "+91 98204 22334", location: "Adyar, Chennai", latitude: 13.0067, longitude: 80.2568 },
  { id: 26, name: "Hyderabad Animal Rescue", type: "Rescuers", verified: true, rating: 4.8, openHoursStart: 0, openHoursEnd: 24, hasOpenInfo: true, phone: "+91 98205 11223", location: "Banjara Hills, Hyderabad", latitude: 17.4156, longitude: 78.4347 },
  { id: 27, name: "Hyderabad Vet Hospital", type: "Vets", verified: true, rating: 4.6, openHoursStart: 8, openHoursEnd: 21, hasOpenInfo: true, phone: "+91 98205 22334", location: "Jubilee Hills, Hyderabad", latitude: 17.4239, longitude: 78.4099 },
  { id: 28, name: "Ahmedabad Pet Hospital", type: "Vets", verified: true, rating: 4.6, openHoursStart: 9, openHoursEnd: 21, hasOpenInfo: true, phone: "+91 98206 11223", location: "Navrangpura, Ahmedabad", latitude: 23.0300, longitude: 72.5600 },
  { id: 29, name: "Kolkata Animal Care NGO", type: "NGOs", verified: true, rating: 4.4, openHoursStart: 10, openHoursEnd: 17, hasOpenInfo: true, phone: "+91 98207 11223", location: "Salt Lake, Kolkata", latitude: 22.5726, longitude: 88.4319 },
  { id: 30, name: "Kolkata Rescue Squad", type: "Rescuers", verified: true, rating: 4.7, openHoursStart: 0, openHoursEnd: 24, hasOpenInfo: true, phone: "+91 98207 22334", location: "Park Street, Kolkata", latitude: 22.5535, longitude: 88.3508 },
];

export const EVENTS = [
  { id: 1, name: "Mumbai Mega Adoption Drive", date: "24 Aug 2026", time: "10:00 AM", location: "Bandra Amphitheatre, Mumbai", participants: 214, price: "Free", img: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600" },
  { id: 2, name: "Free Rabies Vaccination Camp", date: "29 Aug 2026", time: "9:00 AM", location: "Powai Community Ground", participants: 132, price: "Free", img: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600" },
  { id: 3, name: "Street Dog Feeding Meetup", date: "5 Sep 2026", time: "6:30 PM", location: "Juhu Beach, Mumbai", participants: 88, price: "Free", img: "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=600" },
  { id: 4, name: "Volunteer Onboarding Workshop", date: "12 Sep 2026", time: "11:00 AM", location: "Petsogram HQ, Pune", participants: 47, price: "Free", img: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=600" },
  { id: 5, name: "Pet Photography Workshop", date: "19 Sep 2026", time: "3:00 PM", location: "Powai, Mumbai", participants: 36, price: "₹500", img: "https://images.unsplash.com/photo-1517849845537-4d257902861a?w=600" },
  { id: 6, name: "Animal First Aid Workshop", date: "27 Sep 2026", time: "10:00 AM", location: "Andheri, Mumbai", participants: 58, price: "₹800", img: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=600" },
];

export const COMMUNITIES = [
  { id: "dog-lovers", name: "Dog Lovers", description: "A community for all dog enthusiasts.", members: 12450, category: "Dogs" },
  { id: "cat-lovers", name: "Cat Lovers", description: "Connect with fellow cat parents.", members: 8900, category: "Cats" },
  { id: "animal-rescuers", name: "Animal Rescuers", description: "Coordinate and discuss animal rescue efforts.", members: 4200, category: "Rescue" },
  { id: "pet-parents", name: "Pet Parents", description: "General discussions on pet parenting and care.", members: 15320, category: "Pets" },
  { id: "volunteers", name: "Volunteers", description: "For those looking to volunteer at shelters and events.", members: 3100, category: "Volunteer" },
  { id: "animal-welfare", name: "Animal Welfare", description: "Discuss laws, welfare, and advocacy.", members: 2150, category: "Advocacy" },
  { id: "local-communities", name: "Local Communities", description: "Connect with pet owners in your local neighborhood.", members: 5400, category: "Local" }
];

export const POSTS = [
  { id: 1, author: "Ananya Rao", group: "Animal Rescuers", time: "2h ago", text: "Successfully relocated a family of kittens from a construction site in Chembur. All five are now safe and being fostered!", likes: 214, comments: 32, img: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600" },
  { id: 2, author: "Rohan Mehta", group: "Dog Lovers", time: "5h ago", text: "Reminder: monsoon season means more skin infections in strays. Carrying basic antiseptic can genuinely save a life.", likes: 156, comments: 18 },
  { id: 3, author: "Petsogram NGO Partners", group: "Animal Welfare", time: "1d ago", text: "This month we crossed 12,000 successful sterilizations across Mumbai and Pune. Thank you to every volunteer and donor.", likes: 542, comments: 61, img: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600" },
];

export const PRODUCTS = {
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

export const SERVICES = {
  Veterinary: [{ id: 1, name: "Dr. Kavita Shah - Home Visit Vet", rating: 4.9, price: "From ₹600", location: "Mumbai" }],
  Grooming: [{ id: 2, name: "PetStyle Grooming Salon", rating: 4.7, price: "From ₹450", location: "Pune" }],
  Training: [{ id: 3, name: "Bark & Learn Dog Training", rating: 4.8, price: "From ₹2,000/session", location: "Thane" }],
  Boarding: [{ id: 4, name: "Cozy Paws Boarding House", rating: 4.5, price: "From ₹700/day", location: "Mumbai" }],
  "Pet Sitting": [{ id: 5, name: "Sana's Pet Sitting", rating: 4.6, price: "From ₹500/day", location: "Navi Mumbai" }],
  Walking: [{ id: 6, name: "Daily Wag Dog Walkers", rating: 4.4, price: "From ₹300/walk", location: "Pune" }],
};


// rewardsConfig.ts (kept as a single source of truth — do not duplicate these numbers elsewhere)
export const rewardsConfig = {
  redemptionTiers: [
    { points: 100, discount: 10 },
    { points: 250, discount: 30 },
    { points: 500, discount: 75 },
    { points: 1000, discount: 150 },
  ],
  maxMarketplaceDiscountPct: 20,
  maxEventDiscountPct: 30,
};

export const REWARD_RULES = [
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
  { action_type: "community_join", label: "Join a community", points: 10, icon: Users },
];

export function parseRupees(str) {
  if (!str) return 0;
  const n = parseFloat(String(str).replace(/[^\d.]/g, ""));
  return isNaN(n) ? 0 : n;
}

// Points → rupee value, based on the nearest configured tier at or below the given points
export function pointsToDiscountValue(points) {
  if (points <= 0) return 0;
  let best = null;
  for (const t of rewardsConfig.redemptionTiers) if (points >= t.points) best = t;
  if (!best) return 0;
  return Math.round(points * (best.discount / best.points));
}

export function calculateMarketplaceDiscount(points, priceStr) {
  const price = parseRupees(priceStr);
  const maxDiscount = Math.floor(price * (rewardsConfig.maxMarketplaceDiscountPct / 100));
  const discount = Math.min(pointsToDiscountValue(points), maxDiscount, price);
  return { discount, maxDiscount, finalPrice: Math.max(price - discount, 0) };
}

export function calculateEventDiscount(points, priceStr) {
  const price = parseRupees(priceStr);
  const maxDiscount = Math.floor(price * (rewardsConfig.maxEventDiscountPct / 100));
  const discount = Math.min(pointsToDiscountValue(points), maxDiscount, price);
  return { discount, maxDiscount, finalPrice: Math.max(price - discount, 0) };
}

export function canRedeemPoints(balance, points) {
  return points > 0 && points <= balance;
}

export const DONATION_FUND_DATA = {
  "Medical Treatment": { target: 50000, received: 32500, utilized: 21000 },
  "Food": { target: 20000, received: 15000, utilized: 14000 },
  "Rescue": { target: 30000, received: 12000, utilized: 5000 },
  "Shelter": { target: 40000, received: 25000, utilized: 25000 },
  "Vaccination": { target: 15000, received: 16000, utilized: 12000 },
  "Emergency Care": { target: 60000, received: 10000, utilized: 5000 }
};

export const DONATION_HISTORY = [
  { id: "PS-DON-10294", date: "16 Aug 2026", category: "Medical Treatment", amount: 1000, beneficiary: "Second Chance Shelter", purpose: "Medical treatment for Luna", status: "Completed" },
  { id: "DON-2", date: "10 Aug 2026", category: "Food", amount: 1500, beneficiary: "Petsogram Fund", purpose: "Food support", status: "Completed" },
  { id: "PS-DON-02111", date: "02 Aug 2026", category: "Rescue", amount: 500, beneficiary: "Rapid Rescue Volunteers", purpose: "Rescue", status: "Completed" }
];

export const MOCK_NOTIFICATIONS = [
  { id: "notif_1", type: "reward", title: "Reward earned", message: "You earned 50 P-Points for logging an activity.", timestamp: "2 hours ago", read: false, route: "rewards" },
  { id: "notif_2", type: "adoption", title: "Adoption update", message: "Your application for Luna has been reviewed.", timestamp: "Yesterday", read: false, route: "adopt" },
  { id: "notif_3", type: "emergency", title: "Rescue request", message: "Rescue request #842 submitted successfully.", timestamp: "10 min ago", read: false, route: "dashboard" }
];
