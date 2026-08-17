const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'App.jsx');
let src = fs.readFileSync(srcPath, 'utf8');

const oldLocationDiv = `            <div>
              <label className="text-sm font-semibold text-stone-700 block mb-2">Location</label>
              <button onClick={() => { setLocated(true); toast.push("Location shared"); }} className={\`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border \${located ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-stone-300 text-stone-600"}\`}>
                <MapPin size={16} /> {located ? "Location shared: Andheri West, Mumbai" : "Share current location"}
              </button>
            </div>`;

const newLocationDiv = `            <div>
              <label className="text-sm font-semibold text-stone-700 block mb-2">Location</label>
              {!pickupPoint ? (
                <div>
                  <button onClick={fetchCurrentLocation} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border bg-white border-stone-300 text-stone-600 hover:bg-stone-50">
                    <MapPin size={16} /> Share current location
                  </button>
                  <p className="text-xs text-stone-500 mt-2">Select an animal pickup point to enable navigation.</p>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                    <MapPin size={16} /> Pickup point selected
                  </div>
                  <div className="text-xs text-stone-600 font-mono space-y-1">
                    <p>Latitude: {pickupPoint.lat}</p>
                    <p>Longitude: {pickupPoint.lng}</p>
                  </div>
                  <a 
                    href={\`https://www.google.com/maps/dir/?api=1&destination=\${pickupPoint.lat},\${pickupPoint.lng}\`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors"
                  >
                    <MapPin size={16} /> Open in Google Maps
                  </a>
                </div>
              )}
            </div>`;

src = src.replace(oldLocationDiv, newLocationDiv);

// Now, for the rescue view (result step), we should also update the navigation button there
// Let's replace the placeholder toast with the actual Google Maps link
const oldNavButton = '<button onClick={() => toast.push("Opening navigation...")} className="p-2 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200"><Navigation size={16} /></button>';

// Wait, the rescue view is rendering nearby providers. The pickupPoint is for rescuers to navigate to the animal.
// But the user prompt says:
// "If a rescue request/rescuer view already exists: the primary navigation destination must also be pickupPoint."
// "Show: 📌 Animal Pickup Point [ Open in Google Maps ]"
// Let's see if there is a rescuer view... the prompt says "If a rescue request/rescuer view already exists...". It might just mean the confirmation page.
// Let's add it to the result page (step === "result").

const oldResultDiv = `          <div className="flex flex-wrap gap-3">
            <Button variant="emergency" disabled={rescueRequested} onClick={() => {
              setRescueRequested(true);
              toast.push(\`Rescue request created — case #\${caseId}\`);
              rewards.submitForVerification("rescue", caseId, "Verified animal rescue");
            }}>
              <Truck size={16} /> {rescueRequested ? "Rescue requested" : "Request Rescue"}
            </Button>
            <Button variant="secondary" onClick={() => toast.push("Connecting you to on-call veterinary help...")}><Phone size={16} /> Call Veterinary Help</Button>
            <Button variant="ghost" onClick={() => setStep("form")}><ArrowLeft size={16} /> Submit another report</Button>
          </div>`;

const newResultDiv = `          {pickupPoint && (
            <Card className="p-4 bg-emerald-50 border-emerald-200 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                <MapPin size={16} /> Animal Pickup Point
              </div>
              <a 
                href={\`https://www.google.com/maps/dir/?api=1&destination=\${pickupPoint.lat},\${pickupPoint.lng}\`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-fit px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors"
              >
                <MapPin size={16} /> Open in Google Maps
              </a>
            </Card>
          )}
          <div className="flex flex-wrap gap-3">
            <Button variant="emergency" disabled={rescueRequested} onClick={() => {
              setRescueRequested(true);
              toast.push(\`Rescue request created — case #\${caseId}\`);
              rewards.submitForVerification("rescue", caseId, "Verified animal rescue");
            }}>
              <Truck size={16} /> {rescueRequested ? "Rescue requested" : "Request Rescue"}
            </Button>
            <Button variant="secondary" onClick={() => toast.push("Connecting you to on-call veterinary help...")}><Phone size={16} /> Call Veterinary Help</Button>
            <Button variant="ghost" onClick={() => setStep("form")}><ArrowLeft size={16} /> Submit another report</Button>
          </div>`;

src = src.replace(oldResultDiv, newResultDiv);

// Clean up unused `located` state since we use `pickupPoint` now
src = src.replace('const [located, setLocated] = useState(false);', '');

fs.writeFileSync(srcPath, src);
