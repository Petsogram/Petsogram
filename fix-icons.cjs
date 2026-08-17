const fs = require('fs');
const path = require('path');

const destFile = path.join(__dirname, 'src', 'App.jsx');
let destCode = fs.readFileSync(destFile, 'utf8');

const missingIcons = ['MapPinOff', 'SearchX', 'XCircle', 'ExternalLink'];

// Check if already imported
if (!destCode.includes('MapPinOff') || (destCode.indexOf('MapPinOff') > 1000)) { // means it's not in the top imports
    const oldImport = "} from \"lucide-react\";";
    const newImport = ", MapPinOff, SearchX, XCircle, ExternalLink\n} from \"lucide-react\";";
    
    destCode = destCode.replace(oldImport, newImport);
    fs.writeFileSync(destFile, destCode);
    console.log("Successfully added missing lucide-react imports!");
} else {
    console.log("Imports already exist.");
}
