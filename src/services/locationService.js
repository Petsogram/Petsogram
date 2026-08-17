/**
 * Petsogram Central Location Service
 * Single source of truth for GPS and distance logic.
 * All pages (Discover, Emergency, Services) use this.
 */

/**
 * Haversine distance formula — returns km between two lat/lng points.
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (
    lat1 == null || lon1 == null || lat2 == null || lon2 == null ||
    isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)
  ) {
    return null;
  }
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format a distance in km into a human-readable string.
 */
export function formatDistance(km) {
  if (km == null || isNaN(km)) return 'Distance unavailable';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/**
 * Open Google Maps directions to a given lat/lng destination.
 */
export function openGoogleMaps(lat, lng) {
  if (lat == null || lng == null) return;
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    '_blank',
    'noopener,noreferrer'
  );
}

/**
 * Get the user's current GPS position.
 * Returns a Promise that resolves to { latitude, longitude, accuracy, timestamp }
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
      },
      (err) => {
        reject(err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

/**
 * Describe GPS accuracy quality.
 */
export function describeAccuracy(accuracy) {
  if (accuracy == null) return '';
  if (accuracy <= 30) return 'High accuracy';
  if (accuracy <= 100) return 'Good accuracy';
  if (accuracy <= 500) return 'Approximate location';
  return 'Location may be imprecise';
}
