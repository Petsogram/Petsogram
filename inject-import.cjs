const fs = require('fs');
const path = require('path');

const destFile = path.join(__dirname, 'src', 'App.jsx');
let destCode = fs.readFileSync(destFile, 'utf8');

if (!destCode.includes("import ErrorBoundary")) {
    destCode = destCode.replace(
        'import React, { useState, useEffect, useMemo } from "react";',
        'import React, { useState, useEffect, useMemo } from "react";\nimport ErrorBoundary from "./components/ErrorBoundary";'
    );
    fs.writeFileSync(destFile, destCode);
    console.log("Successfully injected ErrorBoundary import into App.jsx");
} else {
    console.log("Import already exists.");
}
