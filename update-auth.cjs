const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'App.jsx');
let src = fs.readFileSync(srcPath, 'utf8');

// 1. Add import
if (!src.includes('useAuth')) {
    src = src.replace('import React, { useState, useEffect, useMemo } from "react";', 'import React, { useState, useEffect, useMemo } from "react";\nimport { useAuth } from "./contexts/AuthContext";');
}

// 2. Modify PetsogramApp
src = src.replace(
    'const toast = useToast();\n  const setPage = (p) => { setPageRaw(p); window.scrollTo({ top: 0, behavior: "smooth" }); };',
    `const toast = useToast();
  const auth = useAuth();
  const setPage = (p) => {
    const protectedPages = ["dashboard", "rewards", "profile", "settings", "admin"];
    if (protectedPages.includes(p) && !auth.user) {
      auth.setPendingPage(p);
      setPageRaw("login");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setPageRaw(p); 
    window.scrollTo({ top: 0, behavior: "smooth" }); 
  };`
);

// 3. Modify LoginPage
src = src.replace(
    'function LoginPage({ setPage, toast }) {\n    return (',
    `function LoginPage({ setPage, toast }) {
    const auth = useAuth();
    return (`
);

src = src.replace(
    /onClick=\{\(\) => \{ toast.push\("Logged in successfully"\); setPage\("dashboard"\); \}\}/,
    `onClick={() => {
        auth.login();
        toast.push("Logged in successfully");
        if (auth.pendingAction) { auth.pendingAction(); auth.setPendingAction(null); }
        else if (auth.pendingPage) { setPage(auth.pendingPage); auth.setPendingPage(null); }
        else { setPage("dashboard"); }
    }}`
);

// 4. Modify SignupPage
src = src.replace(
    /function SignupPage\(\{ setPage, toast \}\) \{/,
    `function SignupPage({ setPage, toast }) {
    const auth = useAuth();`
);

src = src.replace(
    /onClick=\{\(\) => \{ toast.push\("Account created successfully!"\); setPage\("dashboard"\); \}\}/,
    `onClick={() => {
        auth.signup();
        toast.push("Account created successfully!");
        if (auth.pendingAction) { auth.pendingAction(); auth.setPendingAction(null); }
        else if (auth.pendingPage) { setPage(auth.pendingPage); auth.setPendingPage(null); }
        else { setPage("dashboard"); }
    }}`
);

// 5. Update Navbar (Login -> Logout toggle)
src = src.replace(
    'function Navbar({ page, setPage, toast }) {\n  const [open, setOpen] = useState(false);\n  const rewards = useRewards();',
    `function Navbar({ page, setPage, toast }) {
  const [open, setOpen] = useState(false);
  const rewards = useRewards();
  const auth = useAuth();`
);

src = src.replace(
    '<button onClick={() => setPage("dashboard")} className="p-2.5 rounded-lg text-stone-500 hover:bg-stone-100"><User size={18} /></button>',
    `{auth.user ? (
        <button onClick={() => setPage("dashboard")} className="p-2.5 rounded-lg text-stone-500 hover:bg-stone-100"><User size={18} /></button>
    ) : (
        <button onClick={() => setPage("login")} className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-stone-600 hover:text-stone-900 border border-stone-200 ml-2">Log in</button>
    )}`
);

fs.writeFileSync(srcPath, src);
console.log("Updated App.jsx with auth logic");
