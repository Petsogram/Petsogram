const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let code = fs.readFileSync(appPath, 'utf8');

// Ensure fetchTextSearch is imported
if (!code.includes('fetchTextSearch')) {
  code = code.replace(
    "import { fetchNearbyPlaces } from './services/placesApi';",
    "import { fetchNearbyPlaces, fetchTextSearch } from './services/placesApi';"
  );
}

const discoverStartIdx = code.indexOf('function DiscoverPage() {');
const servicesStartIdx = code.indexOf('function ServicesPage({ toast }) {');
const productCardStartIdx = code.indexOf('function ProductCard({ p, tab, setPage, toast }) {');

if (discoverStartIdx !== -1 && servicesStartIdx !== -1 && productCardStartIdx !== -1) {
  
  const newDiscoverCode = `function DiscoverPage() {
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

  const results = livePlaces.map(place => {
    const pLat = place.location?.latitude;
    const pLng = place.location?.longitude;
    const calcDist = (pLat && pLng && userLocation)
      ? calculateHaversineDistance(userLocation.lat, userLocation.lng, pLat, pLng)
      : null;
    const isOpen = place.regularOpeningHours?.openNow;
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
      phone: place.nationalPhoneNumber || "",
      googleMapsUri: place.googleMapsUri || (pLat ? \`https://www.google.com/maps/dir/?api=1&destination=\${pLat},\${pLng}\` : null),
      calculatedDistance: calcDist,
    };
  })
  .filter(p => p.rating >= minRating)
  .filter(p => !openOnly || (p.hasOpenInfo && p.open))
  .filter(p => p.calculatedDistance == null || p.calculatedDistance <= maxDistance)
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
              <button key={t} onClick={() => setTab(t)} className={\`snap-start whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition-all \${tab === t ? "bg-emerald-700 text-white shadow-md shadow-emerald-900/20" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}\`}>{t}</button>
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
                          <span className="text-stone-500 flex items-center gap-1"><Navigation size={12} /> {p.calculatedDistance < 1 ? \`\${Math.round(p.calculatedDistance * 1000)} m\` : \`\${p.calculatedDistance.toFixed(1)} km\` }</span>
                        )}
                      </div>
                    </div>
                    <div className="p-3 bg-stone-50 border-t border-stone-100 flex gap-2 rounded-b-2xl">
                      {p.phone ? (
                        <a href={\`tel:\${p.phone.replace(/[^0-9+]/g, '')}\`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors">
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
\n`;

  const newServicesCode = `function ServicesPage({ toast }) {
  const [cat, setCat] = useState("Veterinary");
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  
  const [liveServices, setLiveServices] = useState([]);
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
    const calcDist = (pLat && pLng && userLocation) ? calculateHaversineDistance(userLocation.lat, userLocation.lng, pLat, pLng) : null;
    return {
      id: place.id,
      name: place.displayName?.text || "Unknown Service",
      location: place.formattedAddress || "",
      rating: place.rating || 0,
      userRatingCount: place.userRatingCount || 0,
      googleMapsUri: place.googleMapsUri,
      calculatedDistance: calcDist,
      phone: place.nationalPhoneNumber || ""
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
            <button key={name} onClick={() => setCat(name)} className={\`flex flex-col items-center gap-2 p-3 rounded-xl transition-all \${cat === name ? "bg-emerald-50 text-emerald-700" : "hover:bg-stone-50 text-stone-600"}\`}>
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
                   {p.calculatedDistance != null && <p className="flex gap-2 items-center text-emerald-700 font-medium"><Navigation size={14} /> {p.calculatedDistance < 1 ? \`\${Math.round(p.calculatedDistance * 1000)} m away\` : \`\${p.calculatedDistance.toFixed(1)} km away\`}</p>}
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
\n`;

  const newCode = code.substring(0, discoverStartIdx) + newDiscoverCode + newServicesCode + code.substring(productCardStartIdx);
  fs.writeFileSync(appPath, newCode);
  console.log("DiscoverPage and ServicesPage completely rewritten to use real Google API data!");
} else {
  console.error("Could not find the function boundaries in App.jsx");
}
