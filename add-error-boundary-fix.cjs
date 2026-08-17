const fs = require('fs');
const path = require('path');

const destFile = path.join(__dirname, 'src', 'App.jsx');
let destCode = fs.readFileSync(destFile, 'utf8');

if (!destCode.includes("import ErrorBoundary")) {
    destCode = destCode.replace(
        "import React, { useState, useEffect, useMemo, Suspense, useRef } from 'react';",
        "import React, { useState, useEffect, useMemo, Suspense, useRef } from 'react';\nimport ErrorBoundary from './components/ErrorBoundary';"
    );
}

const targetRender = "{pages[page] || pages.home}";
if (destCode.includes(targetRender) && !destCode.includes("<ErrorBoundary onGoHome")) {
    destCode = destCode.replace(
        targetRender,
        `<ErrorBoundary onGoHome={() => setPage("home")}>\n          ${targetRender}\n        </ErrorBoundary>`
    );
    fs.writeFileSync(destFile, destCode);
    console.log("Successfully added ErrorBoundary to App.jsx!");
} else {
    console.log("ErrorBoundary already added or target string not found.");
}
