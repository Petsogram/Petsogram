const fs = require('fs');
const path = require('path');

const appFile = path.join(__dirname, 'src', 'App.jsx');
let appContent = fs.readFileSync(appFile, 'utf8');

// 1. Add RelativeTime component after the imports
if (!appContent.includes('function RelativeTime')) {
  const relativeTimeComponent = `

function RelativeTime({ timestamp }) {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const update = () => {
      if (!timestamp) return;
      const diff = Math.floor((Date.now() - timestamp) / 1000); // in seconds
      if (diff < 60) {
        setTimeStr("Just now");
      } else if (diff < 3600) {
        const m = Math.floor(diff / 60);
        setTimeStr(\`\${m} minute\${m > 1 ? 's' : ''} ago\`);
      } else if (diff < 86400) {
        const h = Math.floor(diff / 3600);
        setTimeStr(\`\${h} hour\${h > 1 ? 's' : ''} ago\`);
      } else if (diff < 172800) {
        setTimeStr("Yesterday");
      } else if (diff < 604800) {
        const d = Math.floor(diff / 86400);
        setTimeStr(\`\${d} days ago\`);
      } else {
        setTimeStr(new Date(timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
      }
    };
    
    update();
    const interval = setInterval(update, 30000); // update every 30s
    return () => clearInterval(interval);
  }, [timestamp]);

  return <>{timeStr}</>;
}
`;
  appContent = appContent.replace(
    /import { useDonations } from "\.\/services\/donationService";/,
    `import { useDonations } from "./services/donationService";\n${relativeTimeComponent}`
  );
}

// 2. Fix NotificationPanel to use RelativeTime
appContent = appContent.replace(
  /<p className="text-\[10px\] text-stone-400 mt-1 font-medium">\{n\.timestamp\}<\/p>/g,
  '<p className="text-[10px] text-stone-400 mt-1 font-medium"><RelativeTime timestamp={n.timestamp} /></p>'
);

// 3. Fix DonatePage
appContent = appContent.replace(
  /const { notify } = useNotifications\(\);/g,
  'const { addNotification } = useNotifications();'
);
appContent = appContent.replace(
  /notify\(\{\s*title: "Donation successful",\s*message: `Your ₹\$\{finalAmount\} donation for \$\{cat\} was recorded successfully\.`,\s*type: "reward"\s*\}\);/g,
  `addNotification("donation", "Donation successful", \`Your ₹\${finalAmount} donation for \${cat} was completed.\`, "/donate", \`DON-\${Date.now()}\`);`
);

// 4. Fix EmergencyPage
if (!appContent.includes('const { addNotification } = useNotifications();', appContent.indexOf('function EmergencyPage'))) {
  appContent = appContent.replace(
    /function EmergencyPage\(\{ toast \}\) \{([\s\S]*?)const auth = useAuth\(\);/,
    `function EmergencyPage({ toast }) {$1const auth = useAuth();\n  const { addNotification } = useNotifications();`
  );
}
if (!appContent.includes('addNotification("emergency"')) {
  appContent = appContent.replace(
    /setStep\("result"\);\n  \};/g,
    `addNotification("emergency", "Rescue request created", \`Your emergency rescue request (\${caseId}) has been submitted.\`, "/emergency", caseId);\n    setStep("result");\n  };`
  );
}

fs.writeFileSync(appFile, appContent);
console.log("Successfully updated App.jsx");
