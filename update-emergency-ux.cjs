const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let code = fs.readFileSync(appPath, 'utf8');

const getAccuracyText = (acc) => {
  if (!acc) return "Approximate: > 100m";
  if (acc < 25) return `Excellent: < 25m`;
  if (acc <= 100) return `Good: 25-100m`;
  return `Approximate: > 100m`;
};

// Replace fetchCurrentLocation
const oldFetch = `  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.push("Geolocation is not supported by your browser", "rose");
      return;
    }
    toast.push("Fetching location...", "amber");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude, timestamp: pos.timestamp, accuracy: pos.coords.accuracy };
        setReporterLocation(coords); // strictly reporter's location
        toast.push("Location acquired successfully!");
      },
      (err) => toast.push("Failed to get location: " + err.message, "rose"),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  };`;

const newFetch = `  const fetchCurrentLocation = (isRefresh = false) => {
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
  };`;

code = code.replace(oldFetch, newFetch);

// Replace Submit logic
const oldSubmit = `  const submit = () => {
    if (!desc.trim()) { toast.push("Describe the situation before submitting", "amber"); return; }
    if (!pickupPoint) { toast.push("Please select the animal's rescue location.", "rose"); return; }
    // Persist to user's rescue history
    const authUser = auth?.user || null;
    if (authUser?.id) {
      addRescueRequest(authUser.id, {
        caseId,
        animalType,
        description: desc,
        location: reporterLocation,
        pickupPoint,
        severity,
      });
    }
    setStep("result");
  };`;

const newSubmit = `  const submit = () => {
    if (!desc.trim()) { toast.push("Describe the situation before submitting", "amber"); return; }
    if (!reporterLocation && !pickupPoint) {
      toast.push("Please share your current location or set the animal's rescue location.", "amber");
      return;
    }
    
    // In edge cases where reporterLocation exists but pickupPoint was somehow wiped, sync it
    const finalPickupPoint = pickupPoint || { ...reporterLocation, address: "Using current GPS location", source: "current_gps" };
    
    // Persist to user's rescue history
    const authUser = auth?.user || null;
    if (authUser?.id) {
      addRescueRequest(authUser.id, {
        caseId,
        animalType,
        description: desc,
        location: reporterLocation, // might be null if user skipped GPS and only chose manual, which is allowed
        pickupPoint: finalPickupPoint,
        severity,
      });
    }
    setStep("result");
  };`;

code = code.replace(oldSubmit, newSubmit);

// Replace UI Block
const oldUI = `            <div>
              <label className="text-sm font-semibold text-stone-700 block mb-2">Location</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={fetchCurrentLocation} className={\`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all \${reporterLocation ? 'bg-emerald-50 border-emerald-200 text-emerald-700 border' : 'bg-white border-stone-200 text-stone-600 border hover:bg-stone-50'}\`}>
                  <MapPin size={16} /> {reporterLocation ? "📍 Current location shared" : "Share current location"}
                </button>
                <button onClick={() => setShowLocationModal(true)} className={\`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all \${pickupPoint ? 'bg-emerald-50 border-emerald-200 text-emerald-700 border' : 'bg-white border-stone-200 text-stone-600 border hover:bg-stone-50'}\`}>
                  <PawPrint size={16} /> {pickupPoint ? "🐾 Rescue location selected" : "Set rescue location"}
                </button>
              </div>
              
              <div className="mt-4 space-y-3">
                {reporterLocation && (
                  <div className="text-xs text-stone-500 bg-stone-50 p-3 rounded-lg border border-stone-100 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    Reporter GPS active (Accuracy: ~{reporterLocation.accuracy ? Math.round(reporterLocation.accuracy) : 12}m)
                  </div>
                )}
                {pickupPoint && (
                  <div className="text-xs text-stone-500 bg-stone-50 p-3 rounded-lg border border-stone-100 flex flex-col gap-1">
                    <div className="flex items-center gap-2 font-semibold text-stone-700">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      Animal Rescue Location: {pickupPoint.address}
                    </div>
                    <p className="pl-6 font-mono text-[10px]">Lat: {pickupPoint.lat.toFixed(5)}, Lng: {pickupPoint.lng.toFixed(5)}</p>
                  </div>
                )}
              </div>
            </div>`;

const newUI = `            <div>
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
                       <a href={\`https://www.google.com/maps/search/?api=1&query=\${pickupPoint.lat},\${pickupPoint.lng}\`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-stone-500 hover:text-stone-800 bg-stone-100 px-2 py-1 rounded">Open Maps</a>
                       <button onClick={() => setShowLocationModal(true)} className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded">Change</button>
                    </div>
                  </div>
                )}
              </div>
            </div>`;

code = code.replace(oldUI, newUI);

fs.writeFileSync(appPath, code);
console.log("EmergencyPage location UX updated!");
