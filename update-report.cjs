const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'App.jsx');
let src = fs.readFileSync(srcPath, 'utf8');

// Update ReportAbusePage signature to include auth check
src = src.replace(
    'function ReportAbusePage({ toast }) {\n    const rewards = useRewards();',
    `function ReportAbusePage({ setPage, toast }) {\n    const auth = useAuth();\n    const rewards = useRewards();`
);

// Update PetsogramApp to pass setPage to ReportAbusePage
src = src.replace(
    'report: <ReportAbusePage toast={toast} />',
    'report: <ReportAbusePage setPage={setPage} toast={toast} />'
);

// Add the optional signup prompt in the result view
const resultMarker = `<Card className="p-4 bg-emerald-50 border-emerald-200 flex items-center gap-3 mb-6">
              <Gift size={18} className="text-emerald-700 shrink-0" />
              <p className="text-sm text-emerald-800">This report is pending verification. Once confirmed by our team, you'll earn <span className="font-semibold">+50 P-Points</span> automatically.</p>
            </Card>`;

const newResultMarker = `<Card className="p-4 bg-emerald-50 border-emerald-200 flex items-center gap-3 mb-6">
              <Gift size={18} className="text-emerald-700 shrink-0" />
              <p className="text-sm text-emerald-800">This report is pending verification. Once confirmed by our team, you'll earn <span className="font-semibold">+50 P-Points</span> automatically.</p>
            </Card>
            
            {!auth.user && (
              <Card className="p-5 mb-6 border-stone-200 bg-stone-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-stone-900 text-sm">Track your report</p>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm">Create a free account to track this case's status, communicate with authorities, and claim your P-Points once verified.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setPage("login")} className="px-4 py-2 rounded-lg text-xs font-semibold border border-stone-300 text-stone-700 hover:bg-white">Log in</button>
                  <Button variant="primary" className="py-2 text-xs" onClick={() => setPage("signup")}>Create account</Button>
                </div>
              </Card>
            )}`;

src = src.replace(resultMarker, newResultMarker);

fs.writeFileSync(srcPath, src);
console.log("Updated Public Abuse Reporting architecture");
