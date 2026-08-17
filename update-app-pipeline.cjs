const fs = require('fs');
const path = require('path');

const appFile = path.join(__dirname, 'src', 'App.jsx');
let appContent = fs.readFileSync(appFile, 'utf8');

// Ensure fetchMultiTextSearch is imported
if (!appContent.includes('fetchMultiTextSearch')) {
  appContent = appContent.replace(
    /import { fetchNearbyPlaces, fetchTextSearch } from '\.\/services\/placesApi';/,
    "import { fetchNearbyPlaces, fetchTextSearch, fetchMultiTextSearch } from './services/placesApi';"
  );
}

// ---------------------------------------------------------
// 1. DISCOVER PAGE REFACTOR
// ---------------------------------------------------------
const discoverLoadPlacesStr = `
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
      setLocationError(\`Google API Error: \${apiErrorMsg.slice(0, 80)}\`);
    } else {
      setLivePlaces(finalPlaces);
    }
    setIsFetchingPlaces(false);
  };
`;

appContent = appContent.replace(
  /const loadPlaces = async \(\) => \{[\s\S]*?setIsFetchingPlaces\(false\);\n  \};/m,
  discoverLoadPlacesStr.trim()
);

// Fix Discover result rendering to handle strict Haversine + rating + open logic accurately
const discoverFilterStr = `
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
      googleMapsUri: place.googleMapsUri || (pLat ? \`https://www.google.com/maps/dir/?api=1&destination=\${pLat},\${pLng}\` : null),
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
`;

appContent = appContent.replace(
  /const results = livePlaces\.map\([\s\S]*?a\.calculatedDistance - b\.calculatedDistance;\n  \}\);/m,
  discoverFilterStr.trim()
);

// ---------------------------------------------------------
// 2. SERVICES PAGE REFACTOR
// ---------------------------------------------------------
const servicesLoadPlacesStr = `
  const loadServices = async () => {
    if (!userLocation) return;
    setIsLoading(true);
    setApiError("");
    setLiveServices([]); // Clear old results
    
    // Intelligent Fallback Logic (10km -> 25km -> 50km)
    const radii = [10, 25, 50];
    let finalPlaces = [];
    let apiErrorMsg = "";
    
    for (const testRadius of radii) {
      if (testRadius > Math.max(50, maxDistance)) break;
      
      let result;
      if (cat === "Veterinary") {
        const r1 = await fetchNearbyPlaces(userLocation.lat, userLocation.lng, testRadius, 'Vets');
        const r2 = await fetchMultiTextSearch(['veterinary hospital', 'animal hospital', 'pet clinic'], userLocation.lat, userLocation.lng, testRadius);
        const merged = [...(r1.places || []), ...(r2.places || [])];
        const seen = new Set();
        result = { places: merged.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; }) };
        if (r1.error) apiErrorMsg = r1.error || r1.message;
      } else if (cat === "Grooming") {
        result = await fetchMultiTextSearch(['pet grooming', 'dog grooming', 'pet spa'], userLocation.lat, userLocation.lng, testRadius);
      } else if (cat === "Training") {
        result = await fetchMultiTextSearch(['dog training', 'pet trainer', 'dog trainer'], userLocation.lat, userLocation.lng, testRadius);
      } else if (cat === "Boarding") {
        result = await fetchMultiTextSearch(['pet boarding', 'dog daycare', 'pet hotel'], userLocation.lat, userLocation.lng, testRadius);
      } else if (cat === "Pet Sitting") {
        result = await fetchMultiTextSearch(['pet sitter', 'dog sitter', 'pet sitting'], userLocation.lat, userLocation.lng, testRadius);
      } else if (cat === "Walking") {
        result = await fetchMultiTextSearch(['dog walker', 'dog walking service'], userLocation.lat, userLocation.lng, testRadius);
      }
      
      if (result && result.error) {
         apiErrorMsg = result.error || result.message;
         console.error("[Services] API Error:", apiErrorMsg);
         break;
      }
      
      if (result && result.places && result.places.length > 0) {
        finalPlaces = result.places;
        break;
      }
    }
    
    if (apiErrorMsg) {
      setApiError(\`Google API Error: \${apiErrorMsg.slice(0, 80)}\`);
    } else {
      setLiveServices(finalPlaces);
    }
    setIsLoading(false);
  };
`;

appContent = appContent.replace(
  /const loadServices = async \(\) => \{[\s\S]*?setIsLoading\(false\);\n  \};/m,
  servicesLoadPlacesStr.trim()
);

const servicesFilterStr = `
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
      googleMapsUri: place.googleMapsUri || (pLat ? \`https://www.google.com/maps/dir/?api=1&destination=\${pLat},\${pLng}\` : null),
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
`;

appContent = appContent.replace(
  /const results = liveServices\.map\([\s\S]*?a\.calculatedDistance - b\.calculatedDistance;\n  \}\);/m,
  servicesFilterStr.trim()
);

// Update Services Error UI
if (appContent.includes('const [apiError, setApiError] = useState("");')) {
  // Good, apiError state exists. Let's fix the UI rendering for it in ServicesPage.
  appContent = appContent.replace(
    /\{isLoading \? \([\s\S]*?\} else if \(results\.length === 0\) \{/m,
    `{apiError ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center max-w-lg mx-auto">
              <AlertTriangle className="mx-auto text-rose-500 mb-4" size={32} />
              <h3 className="text-lg font-bold text-rose-900 mb-2">Unable to load nearby services</h3>
              <p className="text-rose-700 text-sm mb-6">{apiError}</p>
              <Button variant="secondary" onClick={() => loadServices()} className="bg-white border-rose-200">Retry search</Button>
            </div>
          ) : isLoading ? (
            <div className="text-center py-20 text-stone-500">
               <RefreshCw className="animate-spin mx-auto mb-4 text-emerald-600" size={32} />
               <p>Searching Google Places for {cat}...</p>
            </div>
          ) : results.length === 0 ? (`
  );
} else {
  // Need to inject apiError state
  appContent = appContent.replace(
    /const \[liveServices, setLiveServices\] = useState\(\[\]\);/,
    `const [liveServices, setLiveServices] = useState([]);\n  const [apiError, setApiError] = useState("");`
  );
  appContent = appContent.replace(
    /\{isLoading \? \([\s\S]*?\} else if \(results\.length === 0\) \{/m,
    `{apiError ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center max-w-lg mx-auto">
              <AlertTriangle className="mx-auto text-rose-500 mb-4" size={32} />
              <h3 className="text-lg font-bold text-rose-900 mb-2">Unable to load nearby services</h3>
              <p className="text-rose-700 text-sm mb-6">{apiError}</p>
              <Button variant="secondary" onClick={() => loadServices()} className="bg-white border-rose-200">Retry search</Button>
            </div>
          ) : isLoading ? (
            <div className="text-center py-20 text-stone-500">
               <RefreshCw className="animate-spin mx-auto mb-4 text-emerald-600" size={32} />
               <p>Searching Google Places for {cat}...</p>
            </div>
          ) : results.length === 0 ? (`
  );
}

// Add the same explicit error UI for Discover Page
if (!appContent.includes('<h3 className="text-lg font-bold text-rose-900 mb-2">Unable to discover care options</h3>')) {
   appContent = appContent.replace(
     /\{locationError \? \([\s\S]*?\}\) : isFetchingPlaces \? \(/m,
     `{locationError ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
              <MapPinOff className="mx-auto text-rose-400 mb-3" size={32} />
              <h3 className="text-lg font-bold text-rose-900 mb-2">Unable to discover care options</h3>
              <p className="text-rose-800 font-semibold mb-1">{locationError}</p>
              <Button variant="secondary" onClick={() => { if (locationError.includes('API Error')) loadPlaces(); else requestGPS(false); }} className="mt-4 bg-white border-rose-200">Try Again</Button>
            </div>
          ) : isFetchingPlaces ? (`
   );
}


fs.writeFileSync(appFile, appContent);
console.log("Successfully updated App.jsx");
