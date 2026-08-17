const fs = require('fs');
const path = require('path');

const appFile = path.join(__dirname, 'src', 'App.jsx');
let appContent = fs.readFileSync(appFile, 'utf8');

const betterRelativeTime = `
function RelativeTime({ timestamp }) {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const update = () => {
      if (!timestamp) {
        setTimeStr("");
        return;
      }
      
      let parsed = timestamp;
      if (typeof timestamp === 'string') {
        parsed = new Date(timestamp).getTime();
      } else if (timestamp instanceof Date) {
        parsed = timestamp.getTime();
      }
      
      if (isNaN(parsed)) {
        setTimeStr("");
        return;
      }
      
      const diff = Math.floor((Date.now() - parsed) / 1000); // in seconds
      
      if (diff < 0) {
        // Future timestamp edge case
        setTimeStr("Just now");
      } else if (diff < 60) {
        setTimeStr("Just now");
      } else if (diff < 3600) {
        const m = Math.floor(diff / 60);
        setTimeStr(\`\${m}m ago\`);
      } else if (diff < 86400) {
        const h = Math.floor(diff / 3600);
        setTimeStr(\`\${h}h ago\`);
      } else if (diff < 172800) {
        setTimeStr("1d ago");
      } else if (diff < 604800) {
        const d = Math.floor(diff / 86400);
        setTimeStr(\`\${d}d ago\`);
      } else {
        setTimeStr(new Date(parsed).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
      }
    };
    
    update();
    const interval = setInterval(update, 30000); // update every 30s
    return () => clearInterval(interval);
  }, [timestamp]);

  return <>{timeStr}</>;
}
`;

// Replace the previous RelativeTime function
appContent = appContent.replace(/function RelativeTime\(\{ timestamp \}\) \{[\s\S]*?return <>{timeStr}<\/>;\n\}\n/g, betterRelativeTime);

fs.writeFileSync(appFile, appContent);
console.log("Successfully updated RelativeTime component");
