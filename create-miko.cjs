const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

const mikoCode = `import React, { useState, useEffect, useRef } from "react";
import { PawPrint, X, Send, AlertTriangle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function MikoChatbot({ setPage, rewardsProvider }) {
  const auth = useAuth();
  
  // We need to access rewards. Since useRewards is inside App, we pass rewardsProvider as a prop or just use a hook if it's within context.
  // Wait, MikoChatbot will be rendered inside PetsogramApp, which is inside Providers (AuthProvider, RewardsProvider).
  // So we can import useRewards from App if it's exported, or we can just pass it as a prop.
  // It's safer to pass it as a prop or just define MikoChatbot inside App.jsx to avoid circular dependency.
  // Let's actually define it here and see if we can just import it.
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize with greeting
  useEffect(() => {
    const greeting = {
      role: "bot",
      text: "Hi, I'm Miko 🐾 I can help with emergency vet info, adoption, grooming, reporting animal cruelty, the marketplace, meetups, or donations. What do you need?",
      emergency: false
    };
    
    // Load history
    const history = localStorage.getItem("petsogram_miko_history");
    if (history) {
      try {
        setMessages(JSON.parse(history));
      } catch (e) {
        setMessages([greeting]);
      }
    } else {
      setMessages([greeting]);
    }
  }, []);

  // Save history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("petsogram_miko_history", JSON.stringify(messages.slice(-50)));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const QUICK_ACTIONS = [
    { id: 'emergency', label: '🚨 Emergency vet', urgent: true },
    { id: 'adopt', label: '🐾 Adopt a pet' },
    { id: 'complaint', label: '⚠️ Report cruelty' },
    { id: 'market', label: '🛒 Marketplace' },
    { id: 'meetup', label: '🎉 Meetups' },
    { id: 'donate', label: '❤️ Donate' }
  ];

  const matchIntent = (text) => {
    const lower = text.toLowerCase();
    
    if (lower.match(/emergency|urgent|injured|hurt|bleeding|accident|dying|hit by/)) {
      return {
        text: "I'm sorry to hear that. If this is a medical emergency, please don't wait. Use our Emergency page to find the nearest open vet hospital or start an online consult.",
        cta: { label: 'Go to Emergency →', page: 'emergency' },
        emergency: true
      };
    }
    if (lower.match(/adopt|adoption|rehome|give away|new home|foster/)) {
      return {
        text: "Whether you're looking to adopt, or need to find a good home for a pet, our adoption section handles profiles and verified owner matching.",
        cta: { label: 'Go to adoption →', page: 'adopt' }
      };
    }
    if (lower.match(/complain|complaint|report|abuse|cruelty|hurting|mistreat|neglect/)) {
      return {
        text: "You can file a report and attach evidence. Reports are reviewed and routed for appropriate action.",
        cta: { label: 'File a report →', page: 'report' },
        emergency: true
      };
    }
    if (lower.match(/buy|sell|shop|marketplace|store|product|accessories/)) {
      return {
        text: "Our marketplace has brand-new, second-hand, and donated items — all in one place.",
        cta: { label: 'Open marketplace →', page: 'marketplace' }
      };
    }
    if (lower.match(/meetup|meet up|event|community|playdate/)) {
      return {
        text: "Browse upcoming pet meetups near you, or start your own to bring the community together.",
        cta: { label: 'See meetups →', page: 'events' }
      };
    }
    if (lower.match(/donate|donation|contribute|support|give money/)) {
      return {
        text: "Every donation goes directly toward food, medical care, and shelter for animals in need.",
        cta: { label: 'Donate now →', page: 'donate' }
      };
    }
    if (lower.match(/vet|doctor|clinic|hospital|groom/)) {
      return {
        text: "You can find nearby vets and grooming services on our platform.",
        cta: { label: 'Find a Vet →', page: 'find-vet' }
      };
    }
    if (lower.match(/point|reward|balance/)) {
      if (auth?.user && rewardsProvider) {
        return {
          text: \`You currently have \${rewardsProvider.balance} P-Points! You've earned \${rewardsProvider.lifetime} points over your lifetime.\`,
          cta: { label: 'View Rewards →', page: 'dashboard' } // dashboard has the rewards card
        };
      } else {
        return {
          text: "P-Points reward you for helping the community! You need to log in to view your balance.",
          cta: { label: 'Log In →', page: 'login' }
        };
      }
    }
    if (lower.match(/location|gps|track/)) {
      return {
        text: "Petsogram is privacy-first. We only take a one-time snapshot of your location when you explicitly share it for an emergency or report. We never silently track you."
      };
    }
    if (lower.match(/pickup|rescue destination/)) {
      return {
        text: "The Pickup Point is the exact location of the animal in need. This is the destination sent to rescuers via Google Maps."
      };
    }

    return {
      text: "I can help with emergency vet info, adoption, grooming, reporting a concern, the marketplace, meetups, or donations — tap one of the buttons above or tell me more about what you need."
    };
  };

  const handleSend = (textOverride) => {
    const text = (textOverride || inputText).trim();
    if (!text) return;

    const userMsg = { role: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = matchIntent(text);
      reply.role = "bot";
      setIsTyping(false);
      setMessages(prev => [...prev, reply]);
    }, 500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[99999] font-sans">
      {/* Launcher */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105"
        >
          <PawPrint size={24} />
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full"></span>
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div className="w-[360px] max-w-[calc(100vw-32px)] h-[550px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-200">
          {/* Header */}
          <div className="bg-emerald-700 text-white p-4 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <PawPrint size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-lg leading-tight font-display">Miko</h1>
              <p className="text-xs text-emerald-100 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                Here to help
              </p>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 p-3 overflow-x-auto shrink-0 border-b border-stone-100 scrollbar-hide">
            {QUICK_ACTIONS.map(a => (
              <button 
                key={a.id} 
                onClick={() => handleSend(a.label.replace(/^[^\w]+/, '').trim())}
                className={\`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors \${a.urgent ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'}\`}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={\`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed \${m.role === 'user' ? 'bg-emerald-100 text-emerald-900 self-end rounded-br-sm' : m.emergency ? 'bg-rose-50 border border-rose-200 text-rose-900 self-start rounded-bl-sm' : 'bg-stone-100 text-stone-800 self-start rounded-bl-sm border border-stone-200'}\`}>
                <div dangerouslySetInnerHTML={{ __html: m.text }} />
                {m.cta && (
                  <button 
                    onClick={() => { setPage(m.cta.page); setIsOpen(false); }}
                    className={\`mt-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors \${m.emergency ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}\`}
                  >
                    {m.cta.label}
                  </button>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="bg-stone-100 border border-stone-200 self-start rounded-2xl rounded-bl-sm p-3 flex gap-1 items-center h-10 w-16">
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="p-3 border-t border-stone-100 bg-white flex gap-2 shrink-0"
          >
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Miko anything..."
              className="flex-1 bg-stone-100 border border-stone-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center disabled:opacity-50 hover:bg-emerald-700 transition-colors shrink-0"
            >
              <Send size={16} className="-ml-0.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(path.join(componentsDir, 'MikoChatbot.jsx'), mikoCode);

// Inject into App.jsx
const appPath = path.join(__dirname, 'src', 'App.jsx');
let appSrc = fs.readFileSync(appPath, 'utf8');

// Inject MikoChatbot import
if (!appSrc.includes('MikoChatbot')) {
  appSrc = appSrc.replace(
    'import { useAuth } from "./contexts/AuthContext";',
    'import { useAuth } from "./contexts/AuthContext";\nimport { MikoChatbot } from "./components/MikoChatbot.jsx";'
  );
}

// Inject MikoChatbot into PetsogramApp
if (!appSrc.includes('<MikoChatbot')) {
  const injectionPoint = '{/* Add ToastContainer or other global elements here if needed */}\n        {toast.messages.map(';
  const replacement = '<MikoChatbot setPage={setPage} rewardsProvider={rewards} />\n        {toast.messages.map(';
  appSrc = appSrc.replace(injectionPoint, replacement);
}

fs.writeFileSync(appPath, appSrc);
console.log("Successfully created MikoChatbot.jsx and injected into App.jsx");
