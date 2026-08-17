import React, { useState, useEffect, useRef } from "react";
import { PawPrint, X, Send, AlertTriangle, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { evaluateIntent } from "../utils/mikoIntentEngine";

export function MikoChatbot({ setPage, rewardsProvider }) {
  const auth = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState("en"); // 'en', 'mr', 'hi'
  const [context, setContext] = useState({ userName: null, lastTopic: null });
  const messagesEndRef = useRef(null);

  const getGreeting = (lang) => {
    if (lang === 'mr') return "नमस्कार, मी Miko 🐾 मी emergency vet info, adoption, grooming, animal cruelty reporting, marketplace, meetups, किंवा donations मध्ये मदत करू शकतो. तुम्हाला काय मदत हवी आहे?";
    if (lang === 'hi') return "नमस्ते, मैं Miko हूँ 🐾 मैं emergency vet info, adoption, grooming, animal cruelty reporting, marketplace, meetups, या donations में मदद कर सकता हूँ। आपको क्या मदद चाहिए?";
    return "Hi, I'm Miko 🐾 I can help with emergency vet info, adoption, grooming, reporting animal cruelty, the marketplace, meetups, or donations. What do you need?";
  };

  const getPlaceholder = (lang) => {
    if (lang === 'mr') return "Miko ला काहीही विचारा...";
    if (lang === 'hi') return "Miko से कुछ भी पूछें...";
    return "Ask Miko anything...";
  };

  // Initialize with greeting
  useEffect(() => {
    const greetingMsg = { role: "bot", text: getGreeting(language), emergency: false };
    
    // Load history from sessionStorage to keep it during session only, per requirements
    const history = sessionStorage.getItem("petsogram_miko_history");
    const savedContext = sessionStorage.getItem("petsogram_miko_context");
    
    if (history) {
      try {
        setMessages(JSON.parse(history));
      } catch (e) {
        setMessages([greetingMsg]);
      }
    } else {
      setMessages([greetingMsg]);
    }

    if (savedContext) {
      try {
        setContext(JSON.parse(savedContext));
      } catch (e) {}
    }
  }, []);

  // Save history and context
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("petsogram_miko_history", JSON.stringify(messages.slice(-50)));
    }
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem("petsogram_miko_context", JSON.stringify(context));
  }, [context]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const QUICK_ACTIONS = [
    { id: 'emergency', label: { en: '🚨 Emergency vet', mr: '🚨 आपत्कालीन Vet', hi: '🚨 आपातकालीन Vet' }, urgent: true, action: 'emergency' },
    { id: 'adopt', label: { en: '🐾 Adopt a pet', mr: '🐾 प्राणी Adopt करा', hi: '🐾 जानवर Adopt करें' }, action: 'adopt' },
    { id: 'complaint', label: { en: '⚠️ Report cruelty', mr: '⚠️ तक्रार नोंदवा', hi: '⚠️ क्रूरता की रिपोर्ट करें' }, action: 'report' },
    { id: 'market', label: { en: '🛒 Marketplace', mr: '🛒 मार्केटप्लेस', hi: '🛒 मार्केटप्लेस' }, action: 'marketplace' },
    { id: 'meetup', label: { en: '🎉 Meetups', mr: '🎉 मीटअप्स', hi: '🎉 मीटअप्स' }, action: 'events' },
    { id: 'donate', label: { en: '❤️ Donate', mr: '❤️ देणगी द्या', hi: '❤️ दान करें' }, action: 'donate' }
  ];

  const handleSend = (textOverride) => {
    const text = (textOverride || inputText).trim();
    if (!text) return;

    const userMsg = { role: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      // Use the smart intent engine
      const { text: botText, emergency, cta, updatedContext } = evaluateIntent(text, language, context, auth, rewardsProvider);
      
      const reply = { role: "bot", text: botText, emergency, cta };
      setContext(updatedContext);
      setIsTyping(false);
      setMessages(prev => [...prev, reply]);
    }, 500);
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat?")) {
      const greetingMsg = { role: "bot", text: getGreeting(language), emergency: false };
      setMessages([greetingMsg]);
      setContext({ userName: null, lastTopic: null });
      sessionStorage.removeItem("petsogram_miko_history");
      sessionStorage.removeItem("petsogram_miko_context");
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    // Optionally insert a notification message that language changed
    setMessages(prev => [...prev, { role: "bot", text: getGreeting(lang) }]);
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
        <div className="w-[calc(100vw-32px)] sm:w-[380px] h-[calc(100vh-100px)] sm:h-[600px] max-h-[700px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-200 transition-all">
          {/* Header */}
          <div className="bg-emerald-700 text-white p-3 flex flex-col shrink-0">
            <div className="flex items-center gap-3">
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
              <div className="flex items-center gap-1">
                <button onClick={handleClearChat} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" aria-label="Clear chat">
                  <Trash2 size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" aria-label="Close Miko">
                  <X size={18} />
                </button>
              </div>
            </div>
            
            {/* Language Selector */}
            <div className="flex gap-2 mt-2 pt-2 border-t border-emerald-600/50 justify-center text-xs font-semibold">
              <button onClick={() => handleLanguageChange('en')} className={`px-2 py-1 rounded ${language === 'en' ? 'bg-white/20' : 'hover:bg-white/10'}`}>EN</button>
              <button onClick={() => handleLanguageChange('mr')} className={`px-2 py-1 rounded ${language === 'mr' ? 'bg-white/20' : 'hover:bg-white/10'}`}>मराठी</button>
              <button onClick={() => handleLanguageChange('hi')} className={`px-2 py-1 rounded ${language === 'hi' ? 'bg-white/20' : 'hover:bg-white/10'}`}>हिन्दी</button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 p-3 overflow-x-auto shrink-0 border-b border-stone-100" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`
              .overflow-x-auto::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {QUICK_ACTIONS.map(a => (
              <button 
                key={a.id} 
                onClick={() => handleSend(a.action)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${a.urgent ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'}`}
              >
                {a.label[language]}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-3">
            {messages?.map((m, i) => (
              <div key={i} className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed break-words ${m.role === 'user' ? 'bg-emerald-100 text-emerald-900 self-end rounded-br-sm' : m.emergency ? 'bg-rose-50 border border-rose-200 text-rose-900 self-start rounded-bl-sm' : 'bg-stone-100 text-stone-800 self-start rounded-bl-sm border border-stone-200'}`} style={{ overflowWrap: 'anywhere' }}>
                <div dangerouslySetInnerHTML={{ __html: m.text }} />
                {m.cta && (
                  <button 
                    onClick={() => { setPage(m.cta.page); setIsOpen(false); }}
                    className={`mt-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${m.emergency ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
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
              placeholder={getPlaceholder(language)}
              className="flex-1 bg-stone-100 border border-stone-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 min-w-0"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              aria-label="Send message"
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
