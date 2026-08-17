const fs = require('fs');
const path = require('path');

const appFile = path.join(__dirname, 'src', 'App.jsx');
let appContent = fs.readFileSync(appFile, 'utf8');

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
    /import \{ MikoChatbot \} from "\.\/components\/MikoChatbot\.jsx";/,
    `import { MikoChatbot } from "./components/MikoChatbot.jsx";\n${relativeTimeComponent}`
  );
  
  fs.writeFileSync(appFile, appContent);
  console.log("Successfully injected RelativeTime component");
} else {
  console.log("RelativeTime already exists.");
}
