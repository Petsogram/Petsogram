/* ==========================================================================
   Miko — Chat Widget for Pet Welfare & Adoption Platforms
   Vanilla JS, no dependencies. Include miko-widget.css alongside this file.

   Quick start:
     <link rel="stylesheet" href="miko-widget.css">
     <script src="miko-widget.js"></script>
     <script>
       Miko.init({
         links: {
           vet: '/find-a-vet',
           adopt: '/adopt',
           groom: '/grooming',
           complaint: '/report',
           market: '/marketplace',
           meetup: '/meetups',
           donate: '/donate'
         },
         // Optional: point at your own server to power free-text replies
         // with a real AI/LLM. If omitted, Miko uses a built-in local
         // responder so the widget works out of the box.
         backendUrl: 'https://your-api.example.com/miko/chat'
       });
     </script>
   ========================================================================== */

(function (window, document) {
  'use strict';

  var DEFAULTS = {
    botName: 'Miko',
    greeting: "Hi, I'm Miko 🐾 I can help with emergency vet info, adoption, grooming, reporting animal cruelty, the marketplace, meetups, or donations. What do you need?",
    links: {
      vet: '#',
      adopt: '#',
      groom: '#',
      complaint: '#',
      market: '#',
      meetup: '#',
      donate: '#'
    },
    backendUrl: null,
    storageKey: 'miko_chat_history_v1',
    maxHistory: 60
  };

  var QUICK_ACTIONS = [
    { id: 'emergency', label: '🚨 Emergency vet', urgent: true },
    { id: 'adopt', label: '🐾 Adopt a pet' },
    { id: 'groom', label: '🧼 Grooming' },
    { id: 'complaint', label: '⚠️ Report cruelty' },
    { id: 'market', label: '🛒 Buy / sell / donate items' },
    { id: 'meetup', label: '🎉 Meetups' },
    { id: 'donate', label: '❤️ Donate' }
  ];

  // Local fallback intent engine — used when no backendUrl is configured,
  // and as a safety net if a backend call fails.
  function buildIntents(links) {
    return [
      {
        id: 'emergency',
        keywords: ['emergency', 'urgent', 'injured', 'hurt', 'bleeding', 'accident', 'dying', 'hit by', 'not breathing'],
        emergency: true,
        text: "I'm sorry to hear that. If this is a medical emergency, please don't wait — use the live map below to find the nearest open vet hospital, or start an online vet consult right away.",
        cta: { label: 'Find nearest vet →', href: links.vet }
      },
      {
        id: 'adopt',
        keywords: ['adopt', 'adoption', 'rehome', 'give away', 'new home', 'foster'],
        text: "Whether you're looking to adopt, or need to find a good home for a pet you can no longer keep, our adoption section handles both — profiles, meet-and-greets, and verified owner matching.",
        cta: { label: 'Go to adoption →', href: links.adopt }
      },
      {
        id: 'groom',
        keywords: ['groom', 'grooming', 'bath', 'haircut', 'nail trim'],
        text: "You can browse nearby grooming services and book an appointment directly from our grooming page.",
        cta: { label: 'Browse grooming services →', href: links.groom }
      },
      {
        id: 'complaint',
        keywords: ['complain', 'complaint', 'report', 'abuse', 'cruelty', 'hurting', 'mistreat', 'neglect'],
        text: "You can file a report and attach photos or video as evidence. Reports are reviewed and can be shared with local authorities or rescue volunteers nearby.",
        cta: { label: 'File a report →', href: links.complaint }
      },
      {
        id: 'market',
        keywords: ['buy', 'sell', 'shop', 'marketplace', 'store', 'product', 'accessories', 'food'],
        text: "Our marketplace has three sections: brand-new items, second-hand items, and donated items — all in one place.",
        cta: { label: 'Open marketplace →', href: links.market }
      },
      {
        id: 'meetup',
        keywords: ['meetup', 'meet up', 'event', 'community', 'playdate'],
        text: "You can browse upcoming pet meetups near you, or start your own to bring the community together.",
        cta: { label: 'See meetups →', href: links.meetup }
      },
      {
        id: 'donate',
        keywords: ['donate', 'donation', 'contribute', 'support', 'give money'],
        text: "Every donation — money, supplies, or time — goes directly toward food, medical care, and shelter for animals in need. Thank you for thinking of them.",
        cta: { label: 'Donate now →', href: links.donate }
      },
      {
        id: 'greeting',
        keywords: ['hi', 'hello', 'hey', 'hii', 'yo'],
        text: "Hey there! What can I help with — emergency vet help, adoption, grooming, reporting a concern, the marketplace, meetups, or donations?"
      }
    ];
  }

  function matchIntent(message, intents) {
    var lower = message.toLowerCase();
    for (var i = 0; i < intents.length; i++) {
      var kws = intents[i].keywords || [];
      for (var j = 0; j < kws.length; j++) {
        if (lower.indexOf(kws[j]) !== -1) return intents[i];
      }
    }
    return null;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function svgPaw() {
    return '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
      '<ellipse cx="12" cy="16" rx="5.2" ry="4.4"/>' +
      '<ellipse cx="5.2" cy="9.5" rx="2.1" ry="2.6"/>' +
      '<ellipse cx="18.8" cy="9.5" rx="2.1" ry="2.6"/>' +
      '<ellipse cx="8.7" cy="5.3" rx="1.9" ry="2.4"/>' +
      '<ellipse cx="15.3" cy="5.3" rx="1.9" ry="2.4"/>' +
      '</svg>';
  }

  function svgClose() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';
  }

  function svgSend() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
  }

  function Miko(config) {
    this.config = config;
    this.intents = buildIntents(config.links);
    this.history = this.loadHistory();
    this.isOpen = false;
    this.els = {};
    this.build();
    this.renderHistory();
  }

  Miko.prototype.loadHistory = function () {
    try {
      var raw = window.localStorage.getItem(this.config.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  Miko.prototype.saveHistory = function () {
    try {
      var trimmed = this.history.slice(-this.config.maxHistory);
      window.localStorage.setItem(this.config.storageKey, JSON.stringify(trimmed));
    } catch (e) { /* storage unavailable — ignore */ }
  };

  Miko.prototype.build = function () {
    var root = document.createElement('div');
    root.id = 'miko-root';

    root.innerHTML =
      '<button id="miko-launcher" aria-label="Open ' + this.config.botName + ' chat" aria-expanded="false">' +
        svgPaw() + '<span id="miko-badge"></span>' +
      '</button>' +
      '<div id="miko-panel" role="dialog" aria-label="' + this.config.botName + ' chat" hidden>' +
        '<div id="miko-header">' +
          '<div id="miko-avatar">' + svgPaw() + '</div>' +
          '<div id="miko-header-text"><h1>' + escapeHtml(this.config.botName) + '</h1><p>Here to help</p></div>' +
          '<button id="miko-close" aria-label="Close chat">' + svgClose() + '</button>' +
        '</div>' +
        '<div id="miko-quick-actions"></div>' +
        '<div id="miko-messages"></div>' +
        '<div id="miko-typing" hidden><span class="miko-paw">' + svgPaw() + '</span><span class="miko-paw">' + svgPaw() + '</span><span class="miko-paw">' + svgPaw() + '</span></div>' +
        '<form id="miko-input-form">' +
          '<input id="miko-input" type="text" autocomplete="off" placeholder="Ask ' + escapeHtml(this.config.botName) + ' anything...">' +
          '<button id="miko-send" type="submit" aria-label="Send">' + svgSend() + '</button>' +
        '</form>' +
      '</div>';

    document.body.appendChild(root);

    this.els.root = root;
    this.els.launcher = root.querySelector('#miko-launcher');
    this.els.badge = root.querySelector('#miko-badge');
    this.els.panel = root.querySelector('#miko-panel');
    this.els.close = root.querySelector('#miko-close');
    this.els.quickActions = root.querySelector('#miko-quick-actions');
    this.els.messages = root.querySelector('#miko-messages');
    this.els.typing = root.querySelector('#miko-typing');
    this.els.form = root.querySelector('#miko-input-form');
    this.els.input = root.querySelector('#miko-input');

    this.renderQuickActions();

    var self = this;
    this.els.launcher.addEventListener('click', function () { self.toggle(); });
    this.els.close.addEventListener('click', function () { self.close(); });
    this.els.form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = self.els.input.value.trim();
      if (!text) return;
      self.els.input.value = '';
      self.handleUserMessage(text);
    });

    if (this.history.length === 0) {
      this.pushMessage({ role: 'bot', text: this.config.greeting }, false);
    }
  };

  Miko.prototype.renderQuickActions = function () {
    var self = this;
    QUICK_ACTIONS.forEach(function (action) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'miko-chip' + (action.urgent ? ' miko-chip--urgent' : '');
      chip.textContent = action.label;
      chip.addEventListener('click', function () {
        self.handleUserMessage(action.label.replace(/^[^\w]+/, '').trim(), action.id);
      });
      self.els.quickActions.appendChild(chip);
    });
  };

  Miko.prototype.toggle = function () { this.isOpen ? this.close() : this.open(); };

  Miko.prototype.open = function () {
    this.isOpen = true;
    this.els.panel.hidden = false;
    this.els.launcher.setAttribute('aria-expanded', 'true');
    this.els.badge.hidden = true;
    this.els.input.focus();
    this.scrollToBottom();
  };

  Miko.prototype.close = function () {
    this.isOpen = false;
    this.els.panel.hidden = true;
    this.els.launcher.setAttribute('aria-expanded', 'false');
  };

  Miko.prototype.scrollToBottom = function () {
    this.els.messages.scrollTop = this.els.messages.scrollHeight;
  };

  Miko.prototype.pushMessage = function (msg, persist) {
    this.history.push(msg);
    if (persist !== false) this.saveHistory();
    this.renderMessage(msg);
    this.scrollToBottom();
  };

  Miko.prototype.renderMessage = function (msg) {
    var bubble = document.createElement('div');
    bubble.className = 'miko-msg miko-msg--' + msg.role + (msg.emergency ? ' miko-msg--emergency' : '');
    bubble.innerHTML = escapeHtml(msg.text).replace(/\n/g, '<br>');
    if (msg.cta) {
      var a = document.createElement('a');
      a.className = 'miko-msg-cta';
      a.href = msg.cta.href;
      a.textContent = msg.cta.label;
      bubble.appendChild(a);
    }
    this.els.messages.appendChild(bubble);
  };

  Miko.prototype.renderHistory = function () {
    var self = this;
    this.history.forEach(function (msg) { self.renderMessage(msg); });
    this.scrollToBottom();
  };

  Miko.prototype.handleUserMessage = function (text, intentIdHint) {
    if (!this.isOpen) this.open();
    this.pushMessage({ role: 'user', text: text });
    this.showTyping(true);

    var self = this;
    this.getReply(text, intentIdHint).then(function (reply) {
      self.showTyping(false);
      self.pushMessage(reply);
    });
  };

  Miko.prototype.showTyping = function (show) {
    this.els.typing.hidden = !show;
    if (show) this.scrollToBottom();
  };

  Miko.prototype.getReply = function (text, intentIdHint) {
    var self = this;

    // If a hint from a quick-action button was passed, use it directly.
    var directIntent = intentIdHint ? this.intents.filter(function (i) { return i.id === intentIdHint; })[0] : null;

    if (this.config.backendUrl) {
      return fetch(this.config.backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: this.history.slice(-10) })
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Bad response');
          return res.json();
        })
        .then(function (data) {
          return { role: 'bot', text: data.reply || "Sorry, I didn't quite get that.", cta: data.cta || null, emergency: !!data.emergency };
        })
        .catch(function () {
          return self.localReply(text, directIntent);
        });
    }

    return new Promise(function (resolve) {
      // Small delay so the typing indicator feels natural.
      setTimeout(function () { resolve(self.localReply(text, directIntent)); }, 500);
    });
  };

  Miko.prototype.localReply = function (text, directIntent) {
    var intent = directIntent || matchIntent(text, this.intents);
    if (intent) {
      return { role: 'bot', text: intent.text, cta: intent.cta || null, emergency: !!intent.emergency };
    }
    return {
      role: 'bot',
      text: "I can help with emergency vet info, adoption, grooming, reporting a concern, the marketplace, meetups, or donations — tap one of the buttons above or tell me more about what you need."
    };
  };

  window.Miko = {
    init: function (userConfig) {
      var config = Object.assign({}, DEFAULTS, userConfig || {});
      config.links = Object.assign({}, DEFAULTS.links, (userConfig && userConfig.links) || {});
      window.__mikoInstance = new Miko(config);
      return window.__mikoInstance;
    },
    open: function () { if (window.__mikoInstance) window.__mikoInstance.open(); },
    close: function () { if (window.__mikoInstance) window.__mikoInstance.close(); }
  };
})(window, document);
