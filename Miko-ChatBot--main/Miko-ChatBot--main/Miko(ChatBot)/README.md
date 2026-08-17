# Miko — Chat Widget

A self-contained, no-dependency chat widget for your pet welfare & adoption
site. Works as a plain `<script>` + `<link>` include — no build step needed.

## Files

- `miko-widget.css` — all styling (self-scoped under `#miko-root`, won't clash with your site's CSS)
- `miko-widget.js` — all behavior
- `index.html` — a working demo you can open directly in a browser
- `README.md` — this file

## 1. Add it to any page

Copy `miko-widget.css` and `miko-widget.js` into your site, then add before `</body>`:

```html
<link rel="stylesheet" href="miko-widget.css">
<script src="miko-widget.js"></script>
<script>
  Miko.init({
    links: {
      vet: '/find-a-vet',       // your live vet-locator/map page
      adopt: '/adopt',
      groom: '/grooming',
      complaint: '/report',
      market: '/marketplace',
      meetup: '/meetups',
      donate: '/donate'
    }
  });
</script>
```

Miko will appear as a floating button in the bottom-right corner on every
page you add this to.

## 2. Quick actions (already built in)

Seven buttons appear at the top of the chat: Emergency vet, Adopt, Grooming,
Report cruelty, Marketplace, Meetups, Donate. Each opens a relevant reply
with a link button to the matching page you set in `links` above. The
Emergency button is styled in coral so it stands out from the rest.

## 3. Free-text replies

By default (no extra setup) Miko answers typed questions using a built-in
keyword responder — it recognizes things like "my dog is hurt", "how do I
adopt", "I want to report someone", etc.

To make Miko genuinely conversational with an AI model, point it at your own
backend:

```js
Miko.init({
  links: { /* ...as above... */ },
  backendUrl: 'https://your-api.example.com/miko/chat'
});
```

Your backend should accept:

```json
POST /miko/chat
{ "message": "my dog is hurt", "history": [ { "role": "user", "text": "..." }, ... ] }
```

and respond with:

```json
{
  "reply": "text to show",
  "emergency": false,
  "cta": { "label": "Find nearest vet →", "href": "/find-a-vet" }
}
```

**Important:** call your AI provider (e.g. the Anthropic API) from your
backend, not from this front-end file — an API key should never be shipped
in client-side JavaScript. If the backend call fails or times out, Miko
automatically falls back to the built-in local responder so the chat never
breaks.

## 4. Chat history

Conversations persist per-browser via `localStorage` (key
`miko_chat_history_v1`), so a visitor's chat survives a page reload. Nothing
is sent anywhere unless you configure `backendUrl`.

## 5. Customizing

- **Name/greeting:** `Miko.init({ botName: 'Miko', greeting: '...' })`
- **Colors:** edit the CSS variables at the top of `miko-widget.css`
  (`--miko-teal`, `--miko-marigold`, `--miko-coral`, etc.)
- **Open/close programmatically:** `Miko.open()` / `Miko.close()`
