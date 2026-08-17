const fs = require('fs');
const path = require('path');

const destFile = path.join(__dirname, 'src', 'services', 'userDataService.js');
let destCode = fs.readFileSync(destFile, 'utf8');

// Inject the import at the top
if (!destCode.includes("import { getUserDonations, addDonation } from './donationService';")) {
  destCode = "import { getUserDonations, addDonation } from './donationService';\n" + destCode;
}

// Replace getUserDonations in userDataService
const startIdx = destCode.indexOf("export function getUserDonations(userId) {");
const endIdx = destCode.indexOf("// ─── REWARDS", startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  destCode = destCode.substring(0, startIdx) +
    `// getUserDonations is now imported from donationService\n` +
    `export { getUserDonations };\n` +
    `\n` +
    `export function addUserDonation(userId, donation) {\n` +
    `  if (!userId || !donation) return;\n` +
    `  addDonation({ ...donation, userId });\n` +
    `}\n\n` +
    destCode.substring(endIdx);
  
  fs.writeFileSync(destFile, destCode);
  console.log("Successfully updated userDataService.js to use donationService");
} else {
  console.error("Could not find getUserDonations section in userDataService");
}
