export function evaluateIntent(text, language, context, auth, rewardsProvider) {
  const lower = text.toLowerCase();
  const updatedContext = { ...context };

  // --- IDENTITY & GREETINGS ---
  const identityMatch = lower.match(/(?:i am|my name is|i'm|call me|मी|मेरा नाम) ([a-z]+)(?: आहे| है)?/i);
  if (identityMatch && !lower.match(/injured|hurt/)) {
    updatedContext.userName = identityMatch[1].charAt(0).toUpperCase() + identityMatch[1].slice(1);
    if (language === 'mr') return { text: `तुम्हाला भेटून आनंद झाला, ${updatedContext.userName}! 🐾 मी आज तुमची कशी मदत करू शकतो?`, updatedContext };
    if (language === 'hi') return { text: `आपसे मिलकर अच्छा लगा, ${updatedContext.userName}! 🐾 मैं आज आपकी कैसे मदद कर सकता हूँ?`, updatedContext };
    return { text: `Nice to meet you, ${updatedContext.userName}! 🐾 How can I help you today?`, updatedContext };
  }

  if (lower.match(/^(hi|hello|hey|good morning|good evening|नमस्कार|नमस्ते|namaste)[\s]*$/i)) {
    const nameStr = context.userName ? `, ${context.userName}` : "";
    if (language === 'mr') return { text: `नमस्कार${nameStr}! 👋 मी Miko आहे, Petsogram चा प्राणी कल्याण सहाय्यक. मी तुमची कशी मदत करू शकतो?`, updatedContext };
    if (language === 'hi') return { text: `नमस्ते${nameStr}! 👋 मैं Miko हूँ, Petsogram का पशु-कल्याण सहायक। मैं आपकी कैसे मदद कर सकता हूँ?`, updatedContext };
    return { text: `Hi${nameStr}! 👋 I'm Miko, your Petsogram animal-welfare assistant. How can I help you today?`, updatedContext };
  }

  if (lower.match(/how are you|kasa ahes|kaise ho/)) {
    if (language === 'mr') return { text: "मी मजेत आहे! 🐾 तुम्ही सांगा, मी तुमची कशी मदत करू?", updatedContext };
    if (language === 'hi') return { text: "मैं ठीक हूँ! 🐾 आप बताइए, मैं आपकी कैसे मदद कर सकता हूँ?", updatedContext };
    return { text: "I'm doing great! 🐾 How can I help you today?", updatedContext };
  }

  // --- CONVERSATIONAL CONTEXT ---
  if (context.lastTopic === 'emergency_dog' || context.lastTopic === 'emergency_cat') {
    if (lower.match(/yes|ho|haan|bleeding|unconscious/)) {
      updatedContext.lastTopic = null;
      if (language === 'mr') return { text: "हे गंभीर वाटत आहे. कृपया Emergency Help चा वापर करा आणि प्राण्याचं rescue location शेअर करा जेणेकरून जवळचे rescuer तिथे पोहोचू शकतील.", emergency: true, cta: { label: 'Emergency Help उघडा →', page: 'emergency' }, updatedContext };
      if (language === 'hi') return { text: "यह गंभीर लग रहा है। कृपया Emergency Help का उपयोग करें और जानवर की rescue location शेयर करें ताकि rescuer वहाँ पहुँच सकें।", emergency: true, cta: { label: 'Emergency Help खोलें →', page: 'emergency' }, updatedContext };
      return { text: "That sounds urgent. Please use Emergency Help and share the animal's rescue location so a rescuer can reach it.", emergency: true, cta: { label: 'Open Emergency Help →', page: 'emergency' }, updatedContext };
    }
  }

  // --- EMERGENCY ---
  if (lower.match(/emergency|urgent|injured|hurt|bleeding|accident|dying|hit by|beating|hurting|abuse|cruelty|sapadla/)) {
    if (lower.match(/abuse|beating|hurting|cruelty/)) {
      if (language === 'mr') return { text: "प्राण्यांवर अत्याचार होत असेल तर तुम्ही Report Cruelty पेजवरून रिपोर्ट नोंदवू शकता.", emergency: true, cta: { label: 'रिपोर्ट करा →', page: 'report' }, updatedContext };
      if (language === 'hi') return { text: "अगर किसी जानवर पर क्रूरता हो रही है, तो आप Report Cruelty पेज से रिपोर्ट दर्ज कर सकते हैं।", emergency: true, cta: { label: 'रिपोर्ट दर्ज करें →', page: 'report' }, updatedContext };
      return { text: "If you're witnessing animal cruelty, you can file a report and attach evidence.", emergency: true, cta: { label: 'Report Cruelty →', page: 'report' }, updatedContext };
    }

    if (lower.match(/found a dog|found a cat/) && !lower.match(/injured|hurt/)) {
      updatedContext.lastTopic = lower.includes('cat') ? 'emergency_cat' : 'emergency_dog';
      if (language === 'mr') return { text: "तो प्राणी जखमी आहे का किंवा धोक्यात आहे का?", updatedContext };
      if (language === 'hi') return { text: "क्या जानवर घायल है या खतरे में है?", updatedContext };
      return { text: "Is the animal injured or in immediate danger?", updatedContext };
    }

    if (language === 'mr') return { text: "हे अत्यंत गंभीर असू शकते. कृपया लवकरात लवकर Emergency Help चा वापर करा.", emergency: true, cta: { label: 'Emergency Help उघडा →', page: 'emergency' }, updatedContext };
    if (language === 'hi') return { text: "यह गंभीर हो सकता है। कृपया जल्द से जल्द Emergency Help का उपयोग करें।", emergency: true, cta: { label: 'Emergency Help खोलें →', page: 'emergency' }, updatedContext };
    return { text: "This may require urgent help. 🐾 You can report the animal and share its location with a nearby rescuer.", emergency: true, cta: { label: 'Open Emergency Help →', page: 'emergency' }, updatedContext };
  }

  // --- VET / SERVICES ---
  if (lower.match(/vet|doctor|clinic|hospital|groom|pahije|chahiye/)) {
    if (lower.match(/groom/)) {
      if (language === 'mr') return { text: "मी तुम्हाला जवळपासचे grooming services शोधायला मदत करू शकतो.", cta: { label: 'Grooming शोधा →', page: 'services' }, updatedContext };
      if (language === 'hi') return { text: "मैं आपको आस-पास grooming services खोजने में मदद कर सकता हूँ।", cta: { label: 'Grooming खोजें →', page: 'services' }, updatedContext };
      return { text: "I can help you find grooming services near your current location.", cta: { label: 'Find Grooming →', page: 'services' }, updatedContext };
    }
    if (language === 'mr') return { text: "मी तुम्हाला जवळपासचे veterinary services शोधायला मदत करू शकतो.", cta: { label: 'जवळचा Vet शोधा →', page: 'services' }, updatedContext };
    if (language === 'hi') return { text: "मैं आपको आस-पास veterinary services खोजने में मदद कर सकता हूँ।", cta: { label: 'आस-पास Vet खोजें →', page: 'services' }, updatedContext };
    return { text: "I can help you find veterinary services near your current location.", cta: { label: 'Find Nearby Vet →', page: 'services' }, updatedContext };
  }

  // --- ADOPTION ---
  if (lower.match(/adopt|adoption|rehome|give away|new home|foster/)) {
    if (language === 'mr') return { text: "नक्कीच! 🐶 मी तुम्हाला सध्या adoption साठी असलेल्या प्राण्यांची यादी दाखवू शकतो.", cta: { label: 'Adoption पहा →', page: 'adopt' }, updatedContext };
    if (language === 'hi') return { text: "बिल्कुल! 🐶 मैं आपको adoption के लिए उपलब्ध जानवरों की सूची दिखा सकता हूँ।", cta: { label: 'Adoption देखें →', page: 'adopt' }, updatedContext };
    return { text: "Absolutely! 🐶 I can help you explore animals currently listed for adoption.", cta: { label: 'Browse Adoption →', page: 'adopt' }, updatedContext };
  }

  // --- MARKETPLACE ---
  if (lower.match(/buy|sell|shop|marketplace|store|product|accessories|food/)) {
    if (language === 'mr') return { text: "चला, Petsogram Marketplace वर प्राण्यांसाठी लागणाऱ्या वस्तू पाहूया.", cta: { label: 'Marketplace उघडा →', page: 'marketplace' }, updatedContext };
    if (language === 'hi') return { text: "आइए, Petsogram Marketplace पर जानवरों के लिए उत्पाद देखें।", cta: { label: 'Marketplace खोलें →', page: 'marketplace' }, updatedContext };
    return { text: "Let's check the Petsogram Marketplace for pet products.", cta: { label: 'Open Marketplace →', page: 'marketplace' }, updatedContext };
  }

  // --- DONATION ---
  if (lower.match(/donate|donation|contribute|support|give money/)) {
    if (language === 'mr') return { text: "तुम्ही वैद्यकीय उपचार, अन्न आणि निवाऱ्यासाठी देणगी देऊ शकता.", cta: { label: 'देणगी द्या →', page: 'donate' }, updatedContext };
    if (language === 'hi') return { text: "आप चिकित्सा, भोजन और आश्रय के लिए दान कर सकते हैं।", cta: { label: 'दान करें →', page: 'donate' }, updatedContext };
    return { text: "You can support medical treatment, food, rescue, shelters, vaccination and emergency care.", cta: { label: 'Donate Now →', page: 'donate' }, updatedContext };
  }

  // --- COMMUNITY ---
  if (lower.match(/meetup|meet up|event|community|playdate/)) {
    if (language === 'mr') return { text: "तुम्ही जवळच्या pet meetups आणि community events मध्ये सामील होऊ शकता.", cta: { label: 'Events पहा →', page: 'events' }, updatedContext };
    if (language === 'hi') return { text: "आप आस-पास के pet meetups और community events में शामिल हो सकते हैं।", cta: { label: 'Events देखें →', page: 'events' }, updatedContext };
    return { text: "You can join nearby pet meetups or community events.", cta: { label: 'See meetups →', page: 'events' }, updatedContext };
  }

  // --- REWARDS ---
  if (lower.match(/point|reward|balance/)) {
    if (auth?.user && rewardsProvider) {
      if (language === 'mr') return { text: `तुमच्याकडे सध्या ${rewardsProvider.balance} P-Points आहेत!`, cta: { label: 'Rewards पहा →', page: 'dashboard' }, updatedContext };
      if (language === 'hi') return { text: `आपके पास अभी ${rewardsProvider.balance} P-Points हैं!`, cta: { label: 'Rewards देखें →', page: 'dashboard' }, updatedContext };
      return { text: `You currently have ${rewardsProvider.balance} P-Points! You've earned ${rewardsProvider.lifetime} points over your lifetime.`, cta: { label: 'View Rewards →', page: 'dashboard' }, updatedContext };
    } else {
      if (language === 'mr') return { text: "कृपया P-Points पाहण्यासाठी लॉग इन करा.", cta: { label: 'लॉग इन करा →', page: 'login' }, updatedContext };
      if (language === 'hi') return { text: "P-Points देखने के लिए कृपया लॉग इन करें।", cta: { label: 'लॉग令 इन करें →', page: 'login' }, updatedContext };
      return { text: "Please log in to view your P-Points.", cta: { label: 'Log In →', page: 'login' }, updatedContext };
    }
  }

  // --- LOCATION EDUCATION ---
  if (lower.match(/location|gps|track/)) {
    if (lower.match(/rescue location|pickup/)) {
      return { text: "Got it. Your current location and the animal's rescue location can be different. Use the Emergency page's Rescue Location option to select the animal's exact location.", cta: { label: 'Open Emergency Help →', page: 'emergency' }, updatedContext };
    }
    return { text: "Petsogram is privacy-first. We only take a one-time snapshot of your location when you explicitly share it. We never silently track you.", updatedContext };
  }

  // --- FALLBACK UNKNOWN ---
  if (language === 'mr') return { text: "मला तुमचा प्रश्न पूर्णपणे समजला नाही. 🐾 तुम्ही emergency rescue, vet, adoption, grooming, donation, community किंवा marketplace बद्दल विचारू शकता.", updatedContext };
  if (language === 'hi') return { text: "मैं आपके सवाल को पूरी तरह समझ नहीं पाया। 🐾 आप emergency rescue, vet, adoption, grooming, donation, community या marketplace के बारे में पूछ सकते हैं।", updatedContext };
  return { text: "I'm not fully sure what you mean yet. 🐾 You can ask me about emergency rescue, vets, adoption, grooming, donations, community events, or the marketplace.", updatedContext };
}
