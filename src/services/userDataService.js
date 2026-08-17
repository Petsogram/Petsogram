import { getUserDonations, addDonation } from './donationService';
/**
 * Petsogram User Data Service
 * Centralized localStorage-based persistence for user-specific data.
 * Used by Dashboard, Emergency, Adoption, and other features.
 */

// ─── SAVED ANIMALS ────────────────────────────────────────────────────────────
const savedKey = (userId) => `petsogram_saved_animals_${userId}`;

export function getSavedAnimals(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(savedKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveAnimal(userId, animal) {
  if (!userId || !animal) return false;
  const saved = getSavedAnimals(userId);
  if (saved.find(a => a.id === animal.id)) return false; // already saved
  saved.unshift({ id: animal.id, name: animal.name, species: animal.species, age: animal.age, img: animal.img, savedAt: new Date().toISOString() });
  localStorage.setItem(savedKey(userId), JSON.stringify(saved));
  return true;
}

export function unsaveAnimal(userId, animalId) {
  if (!userId) return;
  const saved = getSavedAnimals(userId).filter(a => a.id !== animalId);
  localStorage.setItem(savedKey(userId), JSON.stringify(saved));
}

export function isAnimalSaved(userId, animalId) {
  return getSavedAnimals(userId).some(a => a.id === animalId);
}

// ─── ADOPTION APPLICATIONS ────────────────────────────────────────────────────
const adoptKey = (userId) => `petsogram_adoptions_${userId}`;

export function getAdoptionApplications(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(adoptKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function submitAdoptionApplication(userId, animal) {
  if (!userId || !animal) return null;
  const apps = getAdoptionApplications(userId);
  // Prevent duplicate
  if (apps.find(a => a.animalId === animal.id)) return apps.find(a => a.animalId === animal.id);
  const app = {
    id: `ADOPT-${Date.now()}`,
    animalId: animal.id,
    animalName: animal.name,
    animalImg: animal.img,
    animalSpecies: animal.species,
    status: 'Pending',
    submittedAt: new Date().toISOString(),
  };
  apps.unshift(app);
  localStorage.setItem(adoptKey(userId), JSON.stringify(apps));
  return app;
}

export function hasApplied(userId, animalId) {
  return getAdoptionApplications(userId).some(a => a.animalId === animalId);
}

// ─── RESCUE REQUESTS ──────────────────────────────────────────────────────────
const rescueKey = (userId) => `petsogram_rescues_${userId}`;

export function getRescueRequests(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(rescueKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addRescueRequest(userId, request) {
  if (!userId || !request) return null;
  const requests = getRescueRequests(userId);
  const entry = {
    id: request.caseId || `PS-RQ-${Math.floor(1000 + Math.random() * 9000)}`,
    animalType: request.animalType || 'Unknown',
    description: request.description || '',
    location: request.location || null,
    pickupPoint: request.pickupPoint || null,
    severity: request.severity || 'High',
    status: 'Pending',
    submittedAt: new Date().toISOString(),
  };
  requests.unshift(entry);
  localStorage.setItem(rescueKey(userId), JSON.stringify(requests));
  return entry;
}

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
const apptKey = (userId) => `petsogram_appointments_${userId}`;

export function getAppointments(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(apptKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addAppointment(userId, appointment) {
  if (!userId || !appointment) return null;
  const appointments = getAppointments(userId);
  const entry = {
    id: `APPT-${Date.now()}`,
    ...appointment,
    status: 'Upcoming',
    bookedAt: new Date().toISOString(),
  };
  appointments.unshift(entry);
  localStorage.setItem(apptKey(userId), JSON.stringify(appointments));
  return entry;
}

// ─── DONATION HISTORY ─────────────────────────────────────────────────────────
const donationKey = (userId) => `petsogram_donations_${userId}`;

// getUserDonations is now imported from donationService
export { getUserDonations };

export function addUserDonation(userId, donation) {
  if (!userId || !donation) return;
  addDonation({ ...donation, userId });
}

// ─── REWARDS ──────────────────────────────────────────────────────────────────
const rewardsKey = (userId) => `petsogram_rewards_${userId}`;

export function getUserRewards(userId) {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(rewardsKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveUserRewards(userId, data) {
  if (!userId) return;
  localStorage.setItem(rewardsKey(userId), JSON.stringify(data));
}

// ─── FULL DASHBOARD AGGREGATOR ────────────────────────────────────────────────
export function getDashboardData(userId, { notifications = [], communityService } = {}) {
  if (!userId) return null;

  const savedAnimals = getSavedAnimals(userId);
  const adoptionApplications = getAdoptionApplications(userId);
  const rescueRequests = getRescueRequests(userId);
  const appointments = getAppointments(userId);
  const donations = getUserDonations(userId);
  const communityIds = communityService?.getJoinedCommunities?.(userId) || [];
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const totalDonated = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const upcomingAppts = appointments.filter(a => a.status === 'Upcoming');

  return {
    savedAnimals,
    savedAnimalsCount: savedAnimals.length,
    adoptionApplications,
    adoptionApplicationsCount: adoptionApplications.length,
    rescueRequests,
    rescueRequestsCount: rescueRequests.length,
    appointments,
    upcomingAppts,
    appointmentsCount: upcomingAppts.length,
    donations,
    donationsCount: donations.length,
    totalDonated,
    communityIds,
    communityActivityCount: communityIds.length,
    unreadNotifications,
    recentRescues: rescueRequests.slice(0, 5),
    recentNotifications: notifications.slice(0, 3),
  };
}
