const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'App.jsx');
let src = fs.readFileSync(srcPath, 'utf8');

// 1. Replace State
src = src.replace(
    'const [located, setLocated] = useState(false);',
    `const [reporterLocation, setReporterLocation] = useState(null);
    const [pickupPoint, setPickupPoint] = useState(null);
    const [locationMethod, setLocationMethod] = useState("current");
    const [manualAddress, setManualAddress] = useState("");
    
    const fetchCurrentLocation = () => {
      if (!navigator.geolocation) {
        toast.push("Geolocation is not supported by your browser", "rose");
        return;
      }
      toast.push("Fetching location...", "amber");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude, timestamp: pos.timestamp };
          setReporterLocation(coords); // independent snapshot
          if (locationMethod === "current") {
            setPickupPoint({ ...coords, address: "Current Location" }); // fixed pickup
          }
          toast.push("Location acquired successfully!");
        },
        (err) => toast.push("Failed to get location: " + err.message, "rose"),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    };`
);

// 2. Replace Location UI in Form
const oldLocationUI = `<div>
                <label className="text-sm font-semibold text-stone-700 block mb-2">Location</label>
                <button onClick={() => { setLocated(true); toast.push("Location shared"); }} className={\`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border \${located ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-stone-300 text-stone-600"}\`}>
                  <MapPin size={16} /> {located ? "Location shared: Andheri West, Mumbai" : "Share current location"}
                </button>
              </div>`;

const newLocationUI = `<div>
                <label className="text-sm font-semibold text-stone-700 block mb-2">Animal Pickup Point</label>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {["current", "map", "search", "manual"].map(method => (
                    <button key={method} onClick={(e) => { e.preventDefault(); setLocationMethod(method); }} className={\`px-3 py-1.5 rounded-lg text-xs font-medium border \${locationMethod === method ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-white text-stone-600 border-stone-200"}\`}>
                      {method === "current" ? "Use My Location" : method === "map" ? "Choose on Map" : method === "search" ? "Search" : "Enter Manually"}
                    </button>
                  ))}
                </div>
                
                {locationMethod === "current" && (
                  <button onClick={(e) => { e.preventDefault(); fetchCurrentLocation(); }} className={\`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border \${pickupPoint ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-stone-300 text-stone-600"}\`}>
                    <MapPin size={16} /> {pickupPoint ? "Location captured (Tap to refresh)" : "Capture Current Location"}
                  </button>
                )}
                
                {locationMethod === "manual" && (
                  <input type="text" value={manualAddress} onChange={e => { setManualAddress(e.target.value); setPickupPoint({ address: e.target.value }); }} placeholder="Enter exact address or landmark..." className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                )}
                
                {(locationMethod === "map" || locationMethod === "search") && (
                  <div className="p-4 border border-stone-200 rounded-xl bg-stone-50 text-center">
                    <p className="text-sm text-stone-500 mb-2">Map selection available soon.</p>
                    <button onClick={(e) => { e.preventDefault(); setPickupPoint({ lat: 19.1136, lng: 72.8697, address: "Andheri East, Mumbai" }); toast.push("Location set from map"); }} className="text-xs text-emerald-600 font-medium underline">Simulate Map Selection</button>
                  </div>
                )}
              </div>`;

src = src.replace(oldLocationUI, newLocationUI);

// 3. Add Google Maps Directions Link to Results
const oldResultUI = `<p className="text-xl font-bold text-stone-900" style={fontDisplay}>Priority: {severity.toUpperCase()}</p>
                </div>
              </div>
              <p className="text-sm text-amber-800 font-medium max-w-sm">Seek professional veterinary assistance immediately. This assessment does not replace a licensed veterinarian.</p>
            </Card>`;

const newResultUI = `<p className="text-xl font-bold text-stone-900" style={fontDisplay}>Priority: {severity.toUpperCase()}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 max-w-sm">
                <p className="text-sm text-amber-800 font-medium">Seek professional veterinary assistance immediately. This assessment does not replace a licensed veterinarian.</p>
                {pickupPoint && pickupPoint.lat && (
                  <a href={\`https://www.google.com/maps/dir/?api=1&destination=\${pickupPoint.lat},\${pickupPoint.lng}\`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg w-fit transition-colors">
                    <MapPin size={14} /> Open in Google Maps
                  </a>
                )}
              </div>
            </Card>`;

src = src.replace(oldResultUI, newResultUI);

fs.writeFileSync(srcPath, src);
console.log("Updated Emergency Location Architecture");
