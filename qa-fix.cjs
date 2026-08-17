const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'App.jsx');
let src = fs.readFileSync(srcPath, 'utf8');

src = src.replace(
  '<Button variant="primary" className="w-full py-2.5" onClick={() => { toast.push("Account created — welcome to Petsogram!"); setPage("dashboard"); }}>Create account</Button>',
  '<Button variant="primary" className="w-full py-2.5" onClick={() => { auth.login(); toast.push("Account created — welcome to Petsogram!"); setPage("dashboard"); }}>Create account</Button>'
);

// We need to check if there are other instances
src = src.replace(
  '<Button variant="primary" className="w-full py-2.5" onClick={() => { toast.push("Account created ?" welcome to Petsogram!"); setPage("dashboard"); }}>Create account</Button>',
  '<Button variant="primary" className="w-full py-2.5" onClick={() => { auth.login(); toast.push("Account created!"); setPage("dashboard"); }}>Create account</Button>'
);

fs.writeFileSync(srcPath, src);
