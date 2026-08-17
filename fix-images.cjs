const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'App.jsx');
let src = fs.readFileSync(srcPath, 'utf8');

const fallbackComponent = `function ImageWithFallback({ src, alt, className }) {
  const [error, setError] = useState(false);
  
  if (error || !src) {
    return (
      <div className={\`flex flex-col items-center justify-center bg-stone-100 text-stone-400 \${className || ''}\`}>
        <PawPrint size={32} className="opacity-50 mb-2" />
        <span className="text-xs font-medium">Image unavailable</span>
      </div>
    );
  }
  
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
}

`;

// Insert the helper at the top before the main App component, around line 20
const injectionPoint = '/* ---------------------------------- ICONS & THEME ---------------------------------- */';
if (!src.includes('function ImageWithFallback')) {
  src = src.replace(injectionPoint, fallbackComponent + injectionPoint);
}

// Replace images with the fallback
src = src.replace(
  '<img src={a.img} alt={a.name} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" />',
  '<ImageWithFallback src={a.img} alt={a.name} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" />'
);

src = src.replace(
  '<img src={animal.img} className="w-full h-[420px] object-cover rounded-2xl" alt={animal.name} />',
  '<ImageWithFallback src={animal.img} className="w-full h-[420px] object-cover rounded-2xl" alt={animal.name} />'
);

src = src.replace(
  '<img src={a.img} className="h-40 w-full object-cover" alt={a.name} />',
  '<ImageWithFallback src={a.img} className="h-40 w-full object-cover" alt={a.name} />'
);

src = src.replace(
  '{p.img && <img src={p.img} className="w-full h-56 object-cover rounded-xl mt-4" alt="" />}',
  '{p.img && <ImageWithFallback src={p.img} className="w-full h-56 object-cover rounded-xl mt-4" alt="" />}'
);

src = src.replace(
  '<img src={e.img} className="h-36 w-full object-cover group-hover:scale-105 transition-transform duration-300" alt={e.name} />',
  '<ImageWithFallback src={e.img} className="h-36 w-full object-cover group-hover:scale-105 transition-transform duration-300" alt={e.name} />'
);

src = src.replace(
  '<img src={p.img} className="h-36 w-full object-cover" alt={p.name} />',
  '<ImageWithFallback src={p.img} className="h-36 w-full object-cover" alt={p.name} />'
);

src = src.replace(
  '{ANIMALS.slice(0, 3).map((a) => <img key={a.id} src={a.img} className="h-20 w-full object-cover rounded-lg" alt={a.name} />)}',
  '{ANIMALS.slice(0, 3).map((a) => <ImageWithFallback key={a.id} src={a.img} className="h-20 w-full object-cover rounded-lg" alt={a.name} />)}'
);

fs.writeFileSync(srcPath, src);
