const fs = require('fs');
const path = require('path');

const destFile = path.join(__dirname, 'src', 'App.jsx');
let destCode = fs.readFileSync(destFile, 'utf8');

// 1. Add LocationProvider import
if (!destCode.includes("LocationProvider")) {
    destCode = destCode.replace(
        "import { useAuth } from \"./contexts/AuthContext\";",
        "import { useAuth } from \"./contexts/AuthContext\";\nimport { LocationProvider, useUserLocation } from \"./contexts/LocationContext\";"
    );
}

// 2. Wrap App in LocationProvider
if (destCode.includes("<DonationProvider>") && !destCode.includes("<LocationProvider>")) {
    destCode = destCode.replace(
        "<DonationProvider>",
        "<LocationProvider>\n      <DonationProvider>"
    ).replace(
        "</DonationProvider>",
        "</DonationProvider>\n      </LocationProvider>"
    );
}

// 3. Rewrite DiscoverPage
const discStartIdx = destCode.indexOf('function DiscoverPage() {');
const discEndIdx = destCode.indexOf('/* ---------------------------------- EMERGENCY', discStartIdx);

if (discStartIdx !== -1 && discEndIdx !== -1) {
    const newDiscoverPage = `function DiscoverPage() {
  const [tab, setTab] = useState("Vets");
  const [openOnly, setOpenOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState(10);
  const [minRating, setMinRating] = useState(0);
  const { userLocation, locationError, isLoadingLocation, demoMode, setDemoMode, requestGPS } = useUserLocation();

  const [livePlaces, setLivePlaces] = useState([]);
  const [isFetchingPlaces, setIsFetchingPlaces] = useState(false);
  
  const tabs = ["Vets", "Shelters", "NGOs", "Rescuers", "Groomers", "Pet Services"];

  useEffect(() => { 
      if (!userLocation && !isLoadingLocation && !locationError) {
          requestGPS(); 
      }
  }, []); // eslint-disable-line

  const loadPlaces = async () => {
    if (!userLocation) return;
    setIsFetchingPlaces(true);
    
    let result;
    if (["Groomers", "Pet Services", "Shelters", "NGOs"].includes(tab)) {
       const queryMap = {
         'Groomers': 'pet groomer',
         'Pet Services': 'pet care',
         'Shelters': 'animal shelter',
         'NGOs': 'animal rescue NGO'
       };
       result = await fetchTextSearch(queryMap[tab], userLocation.lat, userLocation.lng, maxDistance);
    } else {
       result = await fetchNearbyPlaces(userLocation.lat, userLocation.lng, maxDistance, tab);
    }
    
    if (!result.error && result.places) {
      setLivePlaces(result.places);
    } else {
      setLivePlaces([]);
    }
    setIsFetchingPlaces(false);
  };

  useEffect(() => {
    const handler = setTimeout(() => { loadPlaces(); }, 500);
    return () => clearTimeout(handler);
  }, [userLocation, tab, maxDistance]); // eslint-disable-line

  const results = livePlaces.filter(place => {
    const r = place.rating || 0;
    if (r < minRating) return false;
    if (openOnly && place.currentOpeningHours && place.currentOpeningHours.openNow === false) return false;
    return true;
  }).map(place => {
    const pLat = place.location?.latitude;
    const pLng = place.location?.longitude;
    const calcDist = (pLat && pLng && userLocation) ? calculateHaversineDistance(userLocation.lat, userLocation.lng, pLat, pLng) : null;
    
    return {
      id: place.id,
      name: place.displayName?.text || "Unknown Place",
      location: place.formattedAddress || "",
      rating: place.rating || 0,
      userRatingCount: place.userRatingCount || 0,
      distanceText: calcDist !== null ? \`\${calcDist.toFixed(1)} km\` : "Distance unknown",
      calculatedDistance: calcDist,
      isOpen: place.currentOpeningHours ? place.currentOpeningHours.openNow : null,
      googleMapsUri: place.googleMapsUri,
      phone: place.nationalPhoneNumber || "",
      website: place.websiteUri || ""
    };
  }).filter(p => p.calculatedDistance === null || p.calculatedDistance <= maxDistance)
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
          <h1 className="text-4xl font-bold mb-4" style={fontDisplay}>Discover Pet Resources</h1>
          <p className="text-emerald-100 max-w-xl mx-auto">Find the nearest verified vets, shelters, NGOs, and grooming services instantly powered by live Google Maps data.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 mb-8">
        <Card className="p-2 flex gap-1 overflow-x-auto no-scrollbar shadow-xl shadow-emerald-900/10">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={\`px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all \${tab === t ? "bg-emerald-700 text-white shadow-md shadow-emerald-900/20" : "text-stone-600 hover:bg-stone-50"}\`}>{t}</button>
          ))}
        </Card>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20 flex flex-col lg:flex-row gap-8">
        <div className="lg:w-72 shrink-0">
          <Card className="p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-900 flex items-center gap-2"><Filter size={16} className="text-emerald-700" /> Filters</h3>
              {isFetchingPlaces && <RefreshCw size={14} className="text-emerald-600 animate-spin" />}
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-stone-700">Distance radius</p>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{maxDistance} km</span>
                </div>
                <input type="range" min="1" max="50" value={maxDistance} onChange={(e) => setMaxDistance(parseInt(e.target.value))} className="w-full accent-emerald-600" />
                <div className="flex justify-between text-[10px] text-stone-400 font-semibold mt-1"><span>1km</span><span>25km</span><span>50km</span></div>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-stone-700 mb-2">Minimum rating</p>
                <div className="flex gap-2">
                  {[0, 3, 4, 4.5].map((r) => (
                     <button key={r} onClick={() => setMinRating(r)} className={\`flex-1 py-2 rounded text-xs font-bold border transition-all \${minRating === r ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-stone-200 text-stone-600 hover:bg-stone-50"}\`}>{r === 0 ? "Any" : \`\${r}+\`}</button>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-stone-100">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-stone-700">
                  <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                  Show open now only
                </label>
              </div>

              <div className="pt-4 border-t border-stone-100">
                 <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-stone-700">
                   <input type="checkbox" checked={demoMode} onChange={(e) => setDemoMode(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                   College Demo Mode
                 </label>
                 <p className="text-xs text-stone-400 mt-1">Sets location to DY Patil University</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-stone-900" style={fontDisplay}>
               {tab} near {demoMode ? "DY Patil University" : (userLocation ? "you" : "...")}
            </h2>
            <Button variant="secondary" className="text-sm bg-white" onClick={() => requestGPS(false)} disabled={isLoadingLocation}>
               {isLoadingLocation ? <RefreshCw size={14} className="animate-spin" /> : <MapPin size={14} />} 
               Use My Location
            </Button>
          </div>

          {locationError ? (
             <div className="text-center py-12 bg-white rounded-2xl border border-rose-200">
               <MapPinOff className="mx-auto text-rose-400 mb-4" size={32} />
               <p className="text-rose-700 font-semibold">{locationError}</p>
             </div>
          ) : isFetchingPlaces ? (
             <div className="text-center py-20 text-stone-500">
                <RefreshCw className="animate-spin mx-auto mb-4 text-emerald-600" size={32} />
                <p>Searching Google Places...</p>
             </div>
          ) : results.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-stone-500">
               <SearchX className="mx-auto mb-4 text-stone-300" size={32} />
               <p>No verified Google results found within {maxDistance}km.</p>
               <Button variant="secondary" className="mt-4" onClick={() => setMaxDistance(50)}>Search up to 50km</Button>
             </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.map((p) => (
                <Card key={p.id} className="p-5 flex flex-col hover:shadow-xl hover:shadow-emerald-900/5 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-4">
                     <h3 className="font-bold text-stone-900 leading-tight">{p.name}</h3>
                     <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-bold shrink-0">
                       <Star size={12} className="fill-current" /> {p.rating > 0 ? p.rating.toFixed(1) : "New"}
                     </div>
                  </div>
                  <div className="space-y-2 text-sm text-stone-600 mb-6 flex-1">
                     <p className="flex items-start gap-2"><MapPin size={16} className="text-stone-400 shrink-0 mt-0.5" /> <span className="line-clamp-2">{p.location}</span></p>
                     {p.isOpen !== null && (
                        <p className="flex items-center gap-2">
                           {p.isOpen ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-rose-500" />}
                           <span className={p.isOpen ? "text-emerald-700 font-semibold" : "text-rose-600 font-semibold"}>{p.isOpen ? "Open Now" : "Closed"}</span>
                        </p>
                     )}
                     <p className="flex items-center gap-2"><Navigation size={16} className="text-stone-400" /> <strong>{p.distanceText}</strong> away</p>
                     {p.phone && <p className="flex items-center gap-2"><Phone size={16} className="text-stone-400" /> {p.phone}</p>}
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-stone-100">
                     {p.googleMapsUri && (
                        <a href={p.googleMapsUri} target="_blank" rel="noopener noreferrer" className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors">
                           <ExternalLink size={14} /> Maps
                        </a>
                     )}
                     {p.website && (
                        <a href={p.website} target="_blank" rel="noopener noreferrer" className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 transition-colors">
                           Website
                        </a>
                     )}
                     {p.phone && (
                        <a href={\`tel:\${p.phone}\`} className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 transition-colors">
                           Call
                        </a>
                     )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

`;
    destCode = destCode.substring(0, discStartIdx) + newDiscoverPage + destCode.substring(discEndIdx);
}

// 4. Rewrite ServicesPage
const servStartIdx = destCode.indexOf('function ServicesPage({ toast }) {');
const servEndIdx = destCode.indexOf('/* ---------------------------------- MARKETPLACE', servStartIdx);

if (servStartIdx !== -1 && servEndIdx !== -1) {
    const newServicesPage = `function ServicesPage({ toast }) {
  const [cat, setCat] = useState("Veterinary");
  const { userLocation, locationError, isLoadingLocation, demoMode, setDemoMode, requestGPS } = useUserLocation();
  
  const [liveServices, setLiveServices] = useState([]);
  const [isFetchingServices, setIsFetchingServices] = useState(false);
  const [searchRadius, setSearchRadius] = useState(10); // Start with 10km

  const icons = { Veterinary: Stethoscope, Grooming: Scissors, Training: GraduationCap, Boarding: HomeIcon, "Pet Sitting": Users, Walking: Dog };

  useEffect(() => { 
      if (!userLocation && !isLoadingLocation && !locationError) {
          requestGPS(); 
      }
  }, []); // eslint-disable-line

  const loadServices = async () => {
    if (!userLocation) return;
    setIsFetchingServices(true);
    setSearchRadius(10);
    
    const queryMap = {
      'Grooming': 'pet grooming near me',
      'Training': 'dog training near me',
      'Boarding': 'pet boarding near me',
      'Pet Sitting': 'pet sitter near me',
      'Walking': 'dog walker near me'
    };
    
    const fetchWithExpansion = async (distance) => {
        if (cat === 'Veterinary') {
            return await fetchNearbyPlaces(userLocation.lat, userLocation.lng, distance, 'veterinary_care');
        } else {
            return await fetchTextSearch(queryMap[cat], userLocation.lat, userLocation.lng, distance);
        }
    };

    let result = await fetchWithExpansion(10);
    let currentRadius = 10;
    
    // Auto-expand radius if empty
    if (!result.error && (!result.places || result.places.length === 0)) {
        currentRadius = 25;
        result = await fetchWithExpansion(25);
        if (!result.error && (!result.places || result.places.length === 0)) {
            currentRadius = 50;
            result = await fetchWithExpansion(50);
        }
    }
    
    if (!result.error && result.places) {
      setLiveServices(result.places);
      setSearchRadius(currentRadius);
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
    const calcDist = (pLat && pLng && userLocation) ? calculateHaversineDistance(userLocation.lat, userLocation.lng, pLat, pLng) : null;
    return {
      id: place.id,
      name: place.displayName?.text || "Unknown Service",
      location: place.formattedAddress || "",
      rating: place.rating || 0,
      userRatingCount: place.userRatingCount || 0,
      calculatedDistance: calcDist,
      distanceText: calcDist !== null ? \`\${calcDist.toFixed(1)} km\` : "Distance unknown",
      isOpen: place.currentOpeningHours ? place.currentOpeningHours.openNow : null,
      phone: place.nationalPhoneNumber || "",
      website: place.websiteUri || "",
      googleMapsUri: place.googleMapsUri
    };
  }).sort((a, b) => {
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
            <button key={name} onClick={() => setCat(name)} className={\`flex flex-col items-center gap-2 p-3 rounded-xl transition-all \${cat === name ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200" : "hover:bg-stone-50 text-stone-600 border border-transparent"}\`}>
              <Icon size={24} />
              <span className="text-xs font-semibold">{name}</span>
            </button>
          ))}
        </Card>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-stone-900 flex flex-wrap items-center gap-3" style={fontDisplay}>
             <span>{cat} near {demoMode ? "DY Patil University" : (userLocation ? "you" : "...")}</span>
             {!isFetchingServices && userLocation && !locationError && (
                 <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1">
                     <CheckCircle2 size={12} /> Live Google Places data
                 </span>
             )}
          </h2>
          <div className="flex items-center gap-4">
             <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-stone-600">
               <input type="checkbox" checked={demoMode} onChange={(e) => setDemoMode(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
               Demo Mode
             </label>
             <Button variant="secondary" className="text-sm bg-white" onClick={() => requestGPS(false)} disabled={isLoadingLocation}>
               {isLoadingLocation ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />} 
               Refresh nearby
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
              <p>Finding {cat.toLowerCase()} services near you...</p>
           </div>
        ) : results.length === 0 ? (
           <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-stone-500">
             <SearchX className="mx-auto mb-4 text-stone-300" size={32} />
             <p>No verified Google results found in your area.</p>
           </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((p) => (
              <Card key={p.id} className="p-5 flex flex-col hover:shadow-xl hover:shadow-emerald-900/5 transition-all border border-stone-200">
                <div className="flex items-start justify-between gap-3 mb-4">
                   <h3 className="font-bold text-stone-900 leading-tight">{p.name}</h3>
                   <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-bold shrink-0 border border-amber-100">
                     <Star size={12} className="fill-current" /> {p.rating > 0 ? p.rating.toFixed(1) : "New"}
                   </div>
                </div>
                
                <div className="space-y-2 text-sm text-stone-600 mb-6 flex-1">
                   <p className="flex items-start gap-2"><MapPin size={16} className="text-stone-400 shrink-0 mt-0.5" /> <span className="line-clamp-2">{p.location}</span></p>
                   {p.isOpen !== null && (
                      <p className="flex items-center gap-2">
                         {p.isOpen ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-rose-500" />}
                         <span className={p.isOpen ? "text-emerald-700 font-semibold" : "text-rose-600 font-semibold"}>{p.isOpen ? "Open now" : "Closed"}</span>
                      </p>
                   )}
                   <p className="flex items-center gap-2"><Navigation size={16} className="text-stone-400" /> <span className="font-semibold text-stone-700">{p.distanceText}</span> away</p>
                   {p.phone && <p className="flex items-center gap-2"><Phone size={16} className="text-stone-400" /> {p.phone}</p>}
                </div>

                <div className="flex gap-2 pt-4 border-t border-stone-100">
                   {p.googleMapsUri && (
                      <a href={p.googleMapsUri} target="_blank" rel="noopener noreferrer" className="flex-1 flex justify-center items-center gap-1.5 py-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors border border-emerald-100">
                         <ExternalLink size={14} /> Maps
                      </a>
                   )}
                   {p.website && (
                      <a href={p.website} target="_blank" rel="noopener noreferrer" className="flex-1 flex justify-center items-center gap-1.5 py-2.5 rounded-lg bg-stone-50 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-colors border border-stone-200">
                         Website
                      </a>
                   )}
                   {p.phone && (
                      <a href={\`tel:\${p.phone}\`} className="flex-1 flex justify-center items-center gap-1.5 py-2.5 rounded-lg bg-stone-50 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-colors border border-stone-200">
                         Call
                      </a>
                   )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

`;
    destCode = destCode.substring(0, servStartIdx) + newServicesPage + destCode.substring(servEndIdx);
}

fs.writeFileSync(destFile, destCode);
console.log("Successfully refactored App.jsx (DiscoverPage and ServicesPage)");
