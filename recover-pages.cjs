const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, 'Petsogram (3).jsx');
const destFile = path.join(__dirname, 'src', 'App.jsx');

const srcCode = fs.readFileSync(srcFile, 'utf8');
const destCode = fs.readFileSync(destFile, 'utf8');

const startMarker = 'function AdoptPage({ setPage, setSelectedAnimal }) {';
const endMarker = 'function ServicesPage({ toast }) {';

const startIndex = srcCode.indexOf(startMarker);
const endIndex = srcCode.indexOf(endMarker, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    let missingCode = srcCode.substring(startIndex, endIndex);

    // Minor fixes based on previous agent's likely modifications:
    missingCode = missingCode.replace('function CommunityPage({ toast }) {', 'function CommunityPage({ setPage, toast }) {');
    missingCode = missingCode.replace('function EventsPage({ toast }) {', 'function EventsPage({ setPage, toast }) {');
    missingCode = missingCode.replace('function ReportAbusePage({ toast }) {', 'function ReportAbusePage({ setPage, toast }) {');

    const destInsertIndex = destCode.indexOf('function ServicesPage({ toast }) {');
    if (destInsertIndex !== -1) {
        const newDestCode = destCode.substring(0, destInsertIndex) + missingCode + destCode.substring(destInsertIndex);
        fs.writeFileSync(destFile, newDestCode);
        console.log("Successfully restored missing pages!");
    } else {
        console.error("Could not find ServicesPage in App.jsx to insert before.");
    }
} else {
    console.error("Could not find boundaries in Petsogram (3).jsx");
}
