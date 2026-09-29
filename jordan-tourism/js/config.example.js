/* ==========================================================================
   MASAR — local configuration template

   This project is plain static HTML/CSS/JS (no Vite/webpack/React build step),
   so there is no process.env or import.meta.env available in the browser.
   The equivalent for a project like this is a small runtime config file that
   is loaded as a normal <script> tag and kept OUT of version control.

   SETUP
     1. Copy this file to js/config.js (same folder).            <-- not committed
     2. Get a free CARTO Basemaps API key (no account needed, ~1 min):
          https://carto.com/basemaps/apikey
        Free tier: up to 5,000,000 requests/month non-commercial,
                   up to 1,000,000 requests/month commercial.
     3. Paste the key below.
     4. Reload ai.html. Map tiles will start rendering.

   If js/config.js is missing, or CARTO_API_KEY is left empty, the app does
   NOT call CARTO at all (so visitors never see an "API KEY REQUIRED"
   watermark) -- it just shows the map without imagery, logs one clear
   message in the browser console for developers, and location, search,
   directions and the AI assistant all keep working normally.

   PRODUCTION / DEPLOYMENT
   Never commit the real key-bearing js/config.js. For a static host
   (GitHub Pages, Netlify, a plain server, etc.) generate it at deploy time
   from a secret, e.g. in a deploy script:
     echo "window.MASAR_ENV = { CARTO_API_KEY: \"$CARTO_API_KEY\" };" > js/config.js
   If this project ever grows a real bundler (Vite, webpack, etc.), replace
   this file with that tool's standard mechanism instead (for Vite:
   VITE_CARTO_API_KEY in .env, read via import.meta.env.VITE_CARTO_API_KEY).

   KEY RESTRICTION (recommended)
   In the CARTO dashboard, restrict this key to the site's actual domain(s):
   add "localhost" (and your dev port, e.g. "localhost:5500") for local work,
   and the competition project's real production domain before you present
   or submit it. This key is visible to anyone viewing the page source (that
   is normal for a client-side map key), so restricting it by domain is what
   actually protects your request quota, not secrecy.
   ========================================================================== */

window.MASAR_ENV = {
  CARTO_API_KEY: "" // <-- paste your free CARTO Basemaps key between the quotes
};
