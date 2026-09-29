# MASAR — Jordan Tourism 🇯🇴

An interactive tourism website designed to help visitors discover and explore Jordan through personalized travel experiences and an AI-powered tourism guide.

MASAR combines destination discovery, a personalized **Experience Finder**, and a friendly **AI Guide** into a simple and engaging tourism experience.

The visual language follows the provided ROOTS design references: warm cream backgrounds, an editorial serif (**Fraunces**) paired with **Inter**, a terracotta accent, and pill-shaped chips and buttons.

## ✨ Features

* 🇯🇴 **Jordan Tourism Discovery** — Explore destinations and experiences across Jordan.
* 🧭 **Experience Finder** — Answer five quick questions and receive personalized recommendations.
* 🤖 **AI Guide** — Ask MASAR questions about Jordan through an interactive AI tourism assistant.
* 👀 **Animated AI Character** — The guide reacts to typing, messages, thinking, and responses.
* ☁️ **Speech Cloud Responses** — AI answers appear as friendly cartoon-style speech clouds.
* 📍 **Destination Filtering** — Explore experiences based on location.
* 🎯 **Personalized Recommendations** — Experiences are matched according to the visitor's preferences.
* 📱 **Responsive Design** — Designed to work across desktop, tablet, and mobile screens.
* 🎨 **Editorial Tourism Design** — Warm, modern visual language inspired by the provided ROOTS references.

## 📁 Structure

```text
jordan-tourism/

├── index.html          Home — hero, storytelling, destinations, Petra & Amman features
├── explore.html        Plan Your Trip — multi-step Experience Finder + results
├── ai.html             AI Guide — "Ask MASAR" animated character + chat

├── css/
│   ├── style.css       Shared design tokens, components, and responsive styles
│   └── ai.css          AI Guide page styles

├── js/
│   ├── main.js         Navigation, scroll reveal, experience data,
│   │                    matching algorithm, finder, results, modal, and toast
│   └── ai.js           AI Guide chat, eye/mood animation, and sample answers

└── README.md
```

## 🚀 Running It

MASAR is currently a static HTML/CSS/JavaScript project.

No build tools, frameworks, or installation steps are required.

You can either open:

```text
index.html
```

directly in a browser, or serve the project locally.

For example:

```bash
python3 -m http.server
```

Then open:

```text
http://localhost:8000
```

## 🧭 Experience Finder

The **Experience Finder** is available on:

```text
explore.html
```

It uses a five-step quiz to understand what the visitor is looking for.

The experience data is stored in:

```text
js/main.js
```

The dataset is called:

```javascript
EXPERIENCES
```

Each experience contains information such as:

* Location
* Interests
* Time needed
* Walking level
* Budget tier

After the visitor completes the five steps, the answers are compared against the available experiences using:

```javascript
getRecommendations()
```

The top three matching experiences are then displayed as cards.

### Destination Links

Destination cards on the homepage can link directly to the Experience Finder with a selected location.

For example:

```text
explore.html?loc=<destination>
```

The selected destination is then used to pre-fill the location step.

All recommendation matching happens **client-side** using the in-memory experience dataset.

No backend or network request is required for the Experience Finder.

---

## 🤖 AI Guide

The AI Guide is available on:

```text
ai.html
```

The page is designed to feel like a friendly digital tourism companion rather than a traditional technical chatbot.

Visitors can simply type a question and ask MASAR about Jordan.

Examples include:

* "What should I visit in Amman?"
* "What can I do in Madaba?"
* "What Jordanian food should I try?"
* "Can you plan a day trip for me?"
* "Tell me about Petra."
* "What can I do in Jordan?"

### 👀 Animated Character

The AI character is interactive and responds to the visitor's actions.

The animation is controlled by:

```text
js/ai.js
```

The character uses the CSS variables:

```text
--look-x
--look-y
```

on:

```text
#ai-character
```

Different interaction states change the character's eye direction:

* **Idle** — looks toward the visitor.
* **Typing** — looks down toward the chat input.
* **Sending** — looks toward the new message.
* **Thinking** — glances around naturally.
* **Answering** — looks toward the response cloud before returning to the visitor.

The movement is designed to be subtle and friendly.

### ☁️ Speech Cloud Responses

AI responses appear as animated cartoon-style speech clouds rather than traditional rectangular chatbot messages.

The response:

1. Appears after the thinking state.
2. Pops upward with a small animation.
3. Uses a cloud/speech-bubble design.
4. Displays the AI's tourism response.
5. Keeps the conversation flowing naturally.

This gives the AI Guide a more welcoming and character-driven experience.

---

## 💬 AI Responses

The current AI Guide includes sample responses for demonstration.

The configuration is located in:

```javascript
js/ai.js
```

The default configuration uses:

```javascript
CONFIG.useMockReplies = true
```

Sample responses are stored in:

```javascript
MOCK_RULES
```

The rules use keywords to determine an appropriate sample tourism response.

These responses can be edited directly in `js/ai.js`.

---

## 🔌 Connecting a Real AI

The AI Guide is structured so that a real AI backend can be connected later.

Set:

```javascript
CONFIG.useMockReplies = false
```

and configure:

```javascript
CONFIG.apiUrl
```

to point to your backend endpoint.

The frontend sends a request containing:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "What should I visit in Jordan?"
    }
  ]
}
```

The expected response format is:

```json
{
  "reply": "Jordan has many amazing places to explore...",
  "link": {
    "href": "...",
    "label": "Explore this place"
  }
}
```

The `link` property is optional.

### 🔐 API Security

If a real AI provider is connected, the provider's secret API key must remain on the backend.

**Never place an AI provider API key inside browser JavaScript.**

The backend should handle communication with the AI provider and return only the required response to the MASAR frontend.

---

## 📍 Jordan Places & Location Assistant
---

## 🗺️ Map-tile 403 fix (root cause)

**Symptom:** the map panel sometimes showed *"Access blocked — App is not following the tile usage policy of OpenStreetMap's volunteer-run servers — 403"*.

**Root cause:** `js/ai-geo.js` was loading map imagery straight from `tile.openstreetmap.org`. That server is run by volunteers for light, non-production use; its own usage policy explicitly disallows embedding it in a real application without prior arrangement, and it rate-limits or blocks traffic that doesn't comply. That policy mismatch — not a bug in the request code — is what produced the 403.

**Fix:** `CONFIG.tileUrl` in `js/ai-geo.js` now points at CARTO's free "Positron" basemap (`basemaps.cartocdn.com`), which is built for exactly this kind of use, needs no API key or account, and is still rendered from OpenStreetMap's own map data — so the attribution now credits both OpenStreetMap and CARTO. This was the only line that needed to change; nothing else about the map, UI or places search was touched. If traffic ever outgrows CARTO's free use, MapTiler and Stadia Maps both accept the same drop-in `tileUrl` swap with low-cost paid tiers.

**Important — this fix is confirmed by code review, not by a live network test.** This sandbox has no outbound internet access, so I could not load an actual tile from `basemaps.cartocdn.com` here. Please open `ai.html` on a connected machine and confirm the map tiles render and the console shows no 403s before shipping.

**Everything else in this pass was root-cause hardening, not new features:**
- **Location is fully independent of the map.** Geolocation, the confirmed `{lat, lng}`, and searches all work even if tile imagery fails to load — a tile load error now shows a small non-blocking note ("Map imagery is having trouble loading right now, but your location and search results still work below") instead of anything breaking.
- **Denied location permission** now shows exactly: *"Location permission is required to find places near you. You can enable location access in your browser settings, or choose a city or tap the map instead."*
- **No duplicate requests:** clicking "Use my current location" twice in a row while a request is in flight is now a no-op (the button disables itself); the map is created once and reused (`ensureMap()`); the confirmed location is kept in `sessionStorage` for the whole session and is never re-requested automatically; follow-ups like "Which one is closest?" and "show more" reuse the results already fetched and make **no** new places request (verified — see Testing below).
- **AI/backend location contract**, sent from `ai.js` on every request as `location`:
  ```js
  { latitude: 31.9497, longitude: 35.9328, locationConfirmed: true, source: "gps" }
  // or, before the user confirms:
  { locationConfirmed: false }
  ```

### Testing done here (headless Chromium + a stubbed places response)
- Confirmed a location via city picker → one search fires, results render.
- "Which one is closest?" and "show more" → **zero** additional network requests (checked directly against a request counter).
- Denied/blocked geolocation, offline tiles, a pin dropped outside Jordan → each shows its message; nothing crashes or hangs.
- Map instance is created once and reused across searches (`ensureMap()` returns the existing map rather than recreating it).

### Still to verify on your end (needs real internet, which this sandbox doesn't have)
- Open `ai.html` on a connected device/browser and confirm CARTO tiles load with no console 403s.
- Click "Use my current location", allow permission, confirm the real coordinates are picked up.
- Deny permission once for real, to see the exact browser prompt/message pairing.


The AI Guide can now find real places in Jordan near the visitor and show them on a map.

**Files added** (nothing existing was removed or redesigned):

```text
jordan-tourism/js/ai-geo.js      Understanding requests, location, places search, map, result cards
jordan-tourism/css/ai-geo.css    Styles for the location bar, map panel, place cards, emergency box
backend-examples/places-proxy.example.js   Optional server example for Google Places (ratings)
```

`ai.js` and `ai.html` got small additions: `ai.js` asks `MASAR_GEO.handle()` first and falls back to the original tourism answers when a message isn't a places request; `ai.html` has a location bar, a map panel, two extra chips and the script/style tags.

### How it works

1. The visitor asks something like "Find me a restaurant" or "Where is the nearest pharmacy?".
2. If no location is confirmed, MASAR shows **📍 Please confirm your location…** with a button. Location is never requested automatically.
3. The visitor confirms with **Use my current location**, a **city**, or by **tapping the map** (the pin can be dragged). The search they asked for then continues by itself.
4. MASAR searches around the confirmed point, sorts by distance and shows cards: name, type, distance, address, hours, description, **View on map**, **Directions** (opens Google Maps directions, no key needed), plus Call / Website when the map data has them.
5. Naming a place ("restaurants in Irbid", "hotels in Petra") searches around that place's centre instead, and says so.

It also handles follow-ups ("Jordanian food", "Which one is closest?", "show more"), cheap/luxury hotels, "I'm sick", "What can I do around here?", "I'm visiting Petra tomorrow", "I have 4 hours in Amman", and basic Arabic keywords.

**Emergencies** ("I need help", "There is a fire", "I need an ambulance", "I need police") show the emergency numbers first, and only then the nearest matching service: **911** (unified), police 191, ambulance 193, fire / civil defence 199, Tourist Police +962 79 550 5755. Please re-verify these against the official Jordan government portal before launch.

### Data sources (no API key needed)

* **Places:** OpenStreetMap via the Overpass API (`overpass-api.de`, with one fallback mirror).
* **Map:** Leaflet 1.9.4 from cdnjs with OpenStreetMap tiles.

MASAR never invents businesses, ratings, prices, hours or distances. OpenStreetMap has **no ratings or prices**, so those are not shown; opening hours appear only when the map lists them (simple schedules also show Open now / Closed now). Coverage varies, and small towns can have sparse data.

**Privacy:** the confirmed location is kept only in the browser tab (`sessionStorage`). To search, the coordinates are sent to the Overpass service; the visitor can press **Forget** at any time.

### What is NOT configured yet (optional)

* **Ratings, prices, live opening status** need a provider such as Google Places. Its secret key must never be in browser code. Run `backend-examples/places-proxy.example.js` on your server, then set `CONFIG.provider = "backend"` and `CONFIG.backendUrl` in `js/ai-geo.js`. The contract is documented at the top of that file.
* **A real AI model** is still optional exactly as before (`CONFIG.useMockReplies` in `js/ai.js`). The request now also carries `location` (or `null`) next to `messages`.
* For production, consider hosting your own Overpass instance or a paid provider: the public Overpass servers have fair-use limits.
* Geolocation only works on **https** or `localhost`. Opening `ai.html` straight from disk still works for city/map-pin selection.

### Testing checklist (places assistant)

* "Find me a restaurant" → location prompt → confirm → results with distances
* "Jordanian food", "Which one is closest?", "show more"
* "Where is the nearest pharmacy?", "I need a hospital", "I need help", "There is a fire"
* "restaurants in Irbid", "I'm visiting Petra tomorrow", "I'm in Amman and have 4 hours"
* Deny location permission; be offline; pick a pin outside Jordan
* View on map / Directions on mobile width (~390px)

---

---

## 🔑 CARTO Basemaps API key (required for map tiles)

**Root cause:** as of CARTO's Basemaps Terms (23 Sep 2026), `basemaps.cartocdn.com` requires a free API key on every tile request. Calling it without one doesn't error — it returns tiles stamped with a large **"API KEY REQUIRED"** watermark, which is what you saw. This is a CARTO policy change, not a bug in the previous fix.

**The fix:**
- `js/ai-geo.js` now builds the tile URL from CARTO's current documented format — `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=YOUR_KEY` — and reads the key from `window.MASAR_ENV.CARTO_API_KEY` (never hardcoded).
- **This project has no build tool** (no Vite/webpack/React — confirmed by inspecting it: plain static HTML/CSS/JS, no `package.json`). So there's no `VITE_...` env-var mechanism to hook into. The static-site equivalent is a small runtime config file loaded as a plain `<script>` tag, which is exactly what's added:
  - **`jordan-tourism/js/config.example.js`** (committed) — template with setup instructions and an empty key.
  - **`jordan-tourism/js/config.js`** (created, but **git-ignored** — see `.gitignore`) — your real, local copy. Loaded in `ai.html` right before `ai-geo.js`.
- **If the key is missing or empty:** the app never calls CARTO at all (so a visitor can never see the watermark), a single clear message is logged to the browser console for developers, and the map still works for pins/search/directions on a plain background. It does **not** retry, and it does **not** show a raw error to end users.
- **Attribution stays visible either way** — `© OpenStreetMap contributors © CARTO` — whether or not a key is configured, since it's not tied to whether tiles loaded.

### What you need to do
1. Get a free key: **https://carto.com/basemaps/apikey** (no CARTO account needed). Free tier: 5M requests/month non-commercial, 1M/month commercial.
2. Open `jordan-tourism/js/config.js` and paste it in:
   ```js
   window.MASAR_ENV = { CARTO_API_KEY: "paste-your-key-here" };
   ```
3. Reload `ai.html` — tiles should render immediately, no watermark, no console warning.
4. **Recommended:** in the CARTO dashboard, restrict the key to your actual domain(s) — add `localhost` (and your dev port) for local work, and the competition's real production domain before you present. This key is visible in client-side page source regardless (normal for a map key), so domain restriction — not secrecy — is what protects your request quota.
5. **Deploying:** don't commit the real key. Generate `js/config.js` at deploy time from a secret, e.g.:
   ```bash
   echo "window.MASAR_ENV = { CARTO_API_KEY: \"$CARTO_API_KEY\" };" > jordan-tourism/js/config.js
   ```

### Confirmed unchanged
- **Leaflet** is still the map library; **CARTO is still the only basemap provider** (no OSM public tiles, no second provider, no proxy).
- **Geolocation is fully independent of the map/key.** The browser Geolocation API → confirmed `{lat, lng}` → AI/search path doesn't touch CARTO at all; it works identically whether or not a key is configured.
- **The AI receives real confirmed coordinates** on every message: `{ latitude, longitude, locationConfirmed: true, source }`, or `{ locationConfirmed: false }` before confirmation.
- **No duplicate requests / no re-init:** the map instance is created once (`ensureMap()` returns the existing instance thereafter); "Which one is closest?" and "show more" reuse already-fetched results with zero new network calls (verified with a request counter).
- All existing UI, styling, pages, tourism content, and the AI's tourism/emergency behavior are untouched — only `js/ai-geo.js` (tile URL + key handling), `ai.html` (one new `<script>` tag for `config.js`), and the new `config.example.js` / `config.js` / `.gitignore` were touched.

### Testing performed here
Because this sandbox has no outbound internet access, real requests to `carto.com`/`cartocdn.com` couldn't be made. Instead, the map logic was verified against a minimal in-memory stand-in for the Leaflet API (covering every `L.*` call this file makes) in headless Chromium:
- **No key configured:** confirmed **zero** calls are made toward CARTO's tile endpoint; the console logs exactly the one developer warning described above; the attribution control still renders the correct OSM + CARTO text; the map/location/search UI all still work.
- **Key configured** (`window.MASAR_ENV.CARTO_API_KEY = "TESTKEY123"`): confirmed the tile layer is created exactly once, with the URL `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=TESTKEY123`.
- The full conversation regression suite (restaurants, pharmacy, police, hotels, "which one is closest?", "show more", emergencies, "4 hours in Amman", etc.) was re-run against the patched file and is unaffected.

**Still to verify on your end (needs real internet):** paste a real key into `js/config.js`, open `ai.html` on a connected machine, and confirm tiles render cleanly with no console 403s or watermark — then test denying location permission and letting it time out, exactly as in the checklist below.

## 🎨 AI Character

The current AI character is implemented as an inline SVG inside:

```text
ai.html
```

This allows the eye animation to interact directly with the character.

To replace it with custom artwork, the SVG can be replaced with an image such as:

```html
<img src="assets/masar-ai.png" alt="MASAR AI Guide">
```

while keeping the:

```text
#ai-character
```

wrapper.

The existing floating animation and speech-cloud experience can remain in place.

The eye-tracking animation requires the SVG implementation.

---

## 🖼️ Images

The current tourism imagery is hotlinked from **Wikimedia Commons**, including photographs related to:

* Petra
* Wadi Rum
* Amman
* Dead Sea
* Aqaba
* Jerash

Because these images are loaded remotely, an internet connection is required for the photographs to appear.

The image sources can be replaced with locally stored assets if required.

A local structure such as:

```text
assets/
└── images/
```

can be used for locally hosted images.

---

## 🎨 Design System

MASAR follows the visual language established by the provided ROOTS design references.

The main design characteristics include:

* Warm cream backgrounds
* Terracotta accent color
* Editorial **Fraunces** typography
* **Inter** for supporting text
* Rounded pill-shaped buttons
* Rounded cards
* Clean editorial layouts
* Large tourism imagery
* Subtle animations
* Responsive layouts

The AI Guide extends this design system with:

* Friendly character artwork
* Animated eyes
* Chat interactions
* Thinking states
* Cartoon speech clouds

---

## 📱 Responsive Design

The website is designed to adapt to different screen sizes.

The shared stylesheet includes responsive behavior for smaller screens, including layouts down to approximately **390px** wide.

The AI Guide also adapts its:

* Character size
* Chat layout
* Message bubbles
* Input area
* Suggestion buttons

for smaller screens.

---

## 🗺️ Current Pages

### Home

```text
index.html
```

The homepage contains:

* Hero section
* Jordan tourism storytelling
* Destination discovery
* Petra feature
* Amman feature
* Navigation to the Experience Finder and AI Guide

### Plan Your Trip

```text
explore.html
```

Contains the five-step Experience Finder and personalized recommendations.

### AI Guide

```text
ai.html
```

Contains the **Ask MASAR** AI tourism experience with:

* Interactive AI character
* Animated eyes
* Chat interface
* Thinking state
* Cartoon speech clouds
* Sample tourism responses

---

## 🧪 Testing Checklist

Before publishing, test the following:

### Home

* Navigation links
* Destination cards
* Scroll animations
* Responsive layout
* Images loading correctly

### Experience Finder

* All five steps
* Back/Next navigation
* Location selection
* Preference selection
* Recommendation matching
* Top three results
* Destination pre-filling
* Mobile layout

### AI Guide

* Chat input
* Send button
* Enter-to-send
* Empty message handling
* Multiple messages
* Typing eye movement
* Thinking animation
* Speech cloud animation
* Long responses
* Mobile layout

---

## 🧭 Project Vision

MASAR aims to make discovering Jordan simpler, more personal, and more interactive.

Instead of asking every tourist to search through large amounts of information, MASAR helps visitors discover experiences based on what they actually want.

By combining:

**Tourism Discovery + Personalization + AI**

MASAR creates a more engaging way for visitors to explore Jordan.

> **Discover Jordan your way.**

---

## 👥 Project

**MASAR — Jordan Tourism 🇯🇴**

An interactive tourism web project focused on making Jordan easier and more engaging to discover.

---

## 📄 License

No license has been specified yet.
