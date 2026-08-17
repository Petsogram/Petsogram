const fs = require('fs');
const path = require('path');

const destFile = path.join(__dirname, 'src', 'App.jsx');
let destCode = fs.readFileSync(destFile, 'utf8');

const badImport = "import { fetchNearbyPlaces, fetchTextSearch } from './services/placesApi';";

if (destCode.includes(badImport)) {
    // Remove all instances of the bad import from the middle of the file
    // Note: We'll just replace it with empty string
    destCode = destCode.split(badImport).join('');
    
    // Now add it safely to the top
    const reactImport = 'import React, { useState, useEffect, useMemo } from "react";';
    destCode = destCode.replace(
        reactImport,
        `${reactImport}\n${badImport}`
    );
    
    fs.writeFileSync(destFile, destCode);
    console.log("Successfully moved placesApi import to the top of App.jsx");
} else {
    console.log("Bad import not found.");
}
