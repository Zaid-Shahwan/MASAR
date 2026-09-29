/* ==========================================================================
   MASAR — Jordan places & location assistant (ai-geo.js)
   Plain JavaScript. Loaded on ai.html BEFORE ai.js. ai.js calls into it through
   window.MASAR_GEO; nothing else in the project depends on this file.

   Sections
     1. Settings                    7. Places service (OpenStreetMap / backend)
     2. Jordan gazetteer            8. Result formatting
     3. Place categories            9. Conversation engine (handle)
     4. Helpers (distance, hours)  10. Location + map UI (Leaflet)
     5. Location state             11. Rendering cards inside the speech cloud
     6. Understanding messages     12. Public API

   Data honesty: nothing here invents businesses, ratings, hours or distances.
   Everything shown comes from the places provider; distances are computed from
   the confirmed coordinates. Missing fields are simply not displayed.
   ========================================================================== */

(function (root) {
  "use strict";

  /* ------------------------------------------------------------------
     1. SETTINGS
  ------------------------------------------------------------------ */
  const CONFIG = {
    // "osm"     = OpenStreetMap Overpass API (free, no API key, works from the browser)
    // "backend" = YOUR server at `backendUrl` (use this for Google Places etc. —
    //             the secret key stays on the server; see backend-examples/)
    provider: "osm",
    backendUrl: "/api/places",

    overpassEndpoints: [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter"
    ],
    requestTimeoutMs: 20000,
    cacheMinutes: 10,

    maxResults: 5,            // cards shown per category
    maxResultsUrgent: 3,      // police / hospital / fire: fewer, nearest first

    // tile.openstreetmap.org's usage policy explicitly disallows embedding it in a
    // production app like this one without prior arrangement -- that mismatch is what
    // produced the earlier 403 ("not following the tile usage policy"). CARTO's basemaps
    // (built from OpenStreetMap's own data, so OSM is credited alongside CARTO below) are
    // the fix -- but as of the CARTO Basemaps Terms (23 Sep 2026), tile requests to
    // basemaps.cartocdn.com must carry a free API key (carto.com/basemaps/apikey; no
    // CARTO account needed; free up to 5M non-commercial / 1M commercial requests a
    // month) or the tiles render with an "API KEY REQUIRED" watermark. The key itself is
    // configured in js/config.js (see js/config.example.js) -- never hardcoded here.
    tileUrl: "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
    // Populated from window.MASAR_ENV.CARTO_API_KEY (see js/config.js). Left null when
    // that file is missing or the key hasn't been filled in yet -- ensureMap() checks
    // this and skips loading tiles entirely rather than ever calling CARTO without one.
    cartoApiKey: (root.MASAR_ENV && root.MASAR_ENV.CARTO_API_KEY) || null,

    // The confirmed location lives only in this tab (sessionStorage), never on a server of ours.
    storageKey: "masar.location.v1",

    jordanBounds: { south: 29.18, west: 34.88, north: 33.38, east: 39.31 }
  };

  // Jordan's unified emergency number is 911. The older direct lines are still published.
  const EMERGENCY = {
    main: { number: "911", label: "Emergency (police, ambulance, civil defence)" },
    lines: [
      { key: "police",    label: "Police",                     number: "191" },
      { key: "ambulance", label: "Ambulance",                  number: "193" },
      { key: "fire",      label: "Fire / Civil Defence",       number: "199" },
      { key: "tourist",   label: "Tourist Police",             number: "+962795505755", shown: "+962 79 550 5755" }
    ]
  };

  /* ------------------------------------------------------------------
     2. JORDAN GAZETTEER — approximate centres, used only as search anchors
  ------------------------------------------------------------------ */
  const GAZETTEER = [
    { id: "amman",      name: "Amman",          type: "city", lat: 31.9497, lng: 35.9328, en: ["amman"], ar: ["عمان", "عمّان"] },
    { id: "zarqa",      name: "Zarqa",          type: "city", lat: 32.0728, lng: 36.0876, en: ["zarqa", "zarka", "az zarqa"], ar: ["الزرقاء", "زرقاء"] },
    { id: "irbid",      name: "Irbid",          type: "city", lat: 32.5556, lng: 35.8500, en: ["irbid"], ar: ["إربد", "اربد"] },
    { id: "aqaba",      name: "Aqaba",          type: "city", lat: 29.5321, lng: 35.0063, en: ["aqaba"], ar: ["العقبة", "عقبة"] },
    { id: "madaba",     name: "Madaba",         type: "city", lat: 31.7160, lng: 35.7939, en: ["madaba", "madeba"], ar: ["مادبا"] },
    { id: "jerash",     name: "Jerash",         type: "city", lat: 32.2747, lng: 35.8961, en: ["jerash", "jarash", "gerasa"], ar: ["جرش"] },
    { id: "salt",       name: "Salt",           type: "city", lat: 32.0392, lng: 35.7272, en: [], ar: ["السلط"], re: /\b(?:in|near|at|to|around|from|of) (?:as[- ]?)?salt\b|\bas[- ]salt\b/ },
    { id: "karak",      name: "Karak",          type: "city", lat: 31.1853, lng: 35.7048, en: ["karak", "kerak", "al karak"], ar: ["الكرك"] },
    { id: "tafila",     name: "Tafila",         type: "city", lat: 30.8375, lng: 35.6042, en: ["tafila", "tafileh", "tafilah"], ar: ["الطفيلة"] },
    { id: "maan",       name: "Ma'an",          type: "city", lat: 30.1962, lng: 35.7341, en: [], ar: ["معان"], re: /\bma'?an\b/ },
    { id: "ajloun",     name: "Ajloun",         type: "city", lat: 32.3326, lng: 35.7517, en: ["ajloun", "ajlun"], ar: ["عجلون"] },
    { id: "mafraq",     name: "Mafraq",         type: "city", lat: 32.3406, lng: 36.2080, en: ["mafraq"], ar: ["المفرق"] },
    { id: "petra",      name: "Petra",          type: "site", lat: 30.3285, lng: 35.4444, en: ["petra", "wadi musa"], ar: ["البتراء", "وادي موسى"] },
    { id: "wadi-rum",   name: "Wadi Rum",       type: "site", lat: 29.5833, lng: 35.4167, en: ["wadi rum", "wadirum"], ar: ["وادي رم"] },
    { id: "dead-sea",   name: "Dead Sea",       type: "site", lat: 31.7100, lng: 35.5850, en: ["dead sea"], ar: ["البحر الميت"] },
    { id: "mount-nebo", name: "Mount Nebo",     type: "site", lat: 31.7679, lng: 35.7259, en: ["mount nebo", "nebo"], ar: ["جبل نبو"] },
    { id: "umm-qais",   name: "Umm Qais",       type: "site", lat: 32.6564, lng: 35.6853, en: ["umm qais", "um qais", "umm qays"], ar: ["أم قيس"] },
    { id: "downtown",   name: "Downtown Amman", type: "area", lat: 31.9515, lng: 35.9390, en: ["downtown amman", "amman downtown", "downtown", "al balad", "the balad"], ar: ["وسط البلد"] },
    { id: "rainbow",    name: "Rainbow Street", type: "area", lat: 31.9505, lng: 35.9250, en: ["rainbow street", "rainbow st"], ar: ["شارع الرينبو"] },
    { id: "abdoun",     name: "Abdoun",         type: "area", lat: 31.9430, lng: 35.8880, en: ["abdoun"], ar: ["عبدون"] },
    { id: "weibdeh",    name: "Jabal al-Weibdeh", type: "area", lat: 31.9640, lng: 35.9270, en: ["weibdeh", "webdeh"], ar: ["اللويبدة"] },
    { id: "sweifieh",   name: "Sweifieh",       type: "area", lat: 31.9575, lng: 35.8650, en: ["sweifieh", "sweifiyeh"], ar: ["الصويفية"] }
  ];

  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  GAZETTEER.forEach(function (g) {
    g.matchers = [];
    if (g.re) g.matchers.push(g.re);
    if (g.en.length) g.matchers.push(new RegExp("\\b(?:" + g.en.map(escapeRe).join("|") + ")\\b"));
    g.ar.forEach(function (a) { g.matchers.push(new RegExp(escapeRe(a))); });
  });

  // Longest match wins ("downtown amman" beats "amman").
  function findPlace(text) {
    let best = null;
    GAZETTEER.forEach(function (g) {
      g.matchers.forEach(function (re) {
        const m = re.exec(text);
        if (m && (!best || m[0].length > best.len)) best = { g: g, len: m[0].length };
      });
    });
    return best ? best.g : null;
  }

  /* ------------------------------------------------------------------
     3. PLACE CATEGORIES
     sel   = OpenStreetMap selectors (each one is searched)
     dense = many of these exist in a city, so we start with a small radius
  ------------------------------------------------------------------ */
  const CATEGORIES = {
    police:       { label: "police stations",   single: "Police station", emoji: "👮", urgent: true, sel: ['["amenity"="police"]'],
                    re: /\bpolice\b|police (?:station|department|dept)|precinct|شرطة|مركز أمن/ },
    fire_station: { label: "fire stations",     single: "Fire station",   emoji: "🚒", urgent: true, sel: ['["amenity"="fire_station"]'],
                    re: /fire (?:station|department|brigade)|civil defen[cs]e (?:station|centre|center)|محطة إطفاء|مركز دفاع مدني/ },
    hospital:     { label: "hospitals",         single: "Hospital",       emoji: "🏥", urgent: true, sel: ['["amenity"="hospital"]', '["healthcare"="hospital"]'],
                    re: /hospital|emergency room|\ber\b|a&e|medical cent(?:er|re)|مستشفى/ },
    clinic:       { label: "clinics",           single: "Clinic",         emoji: "🩺", sel: ['["amenity"="clinic"]', '["amenity"="doctors"]', '["healthcare"~"^(clinic|doctor)$"]'], dense: true,
                    re: /\bclinics?\b|\bdoctors?\b|urgent care|عيادة|طبيب/ },
    pharmacy:     { label: "pharmacies",        single: "Pharmacy",       emoji: "💊", sel: ['["amenity"="pharmacy"]'], dense: true,
                    re: /pharmac|drug ?store|chemist|medicine|medication|صيدلية|دواء/ },
    embassy:      { label: "embassies",         single: "Embassy",        emoji: "🏛️", sel: ['["amenity"="embassy"]', '["office"="diplomatic"]'],
                    re: /embass(?:y|ies)|consulate|سفارة|قنصلية/ },
    atm:          { label: "ATMs",              single: "ATM",            emoji: "🏧", sel: ['["amenity"="atm"]'], dense: true,
                    re: /\batms?\b|cash machine|cash ?point|withdraw (?:money|cash)|(?:need|get|find) (?:some )?cash|صراف آلي|ماكينة سحب/ },
    exchange:     { label: "currency exchange offices", single: "Currency exchange", emoji: "💱", sel: ['["amenity"="bureau_de_change"]'], dense: true,
                    re: /currency exchange|money exchange|exchange (?:office|shop)|صرافة/ },
    bank:         { label: "banks",             single: "Bank",           emoji: "🏦", sel: ['["amenity"="bank"]'], dense: true,
                    re: /\bbanks?\b|بنك|مصرف/ },
    fuel:         { label: "gas stations",      single: "Gas station",    emoji: "⛽", sel: ['["amenity"="fuel"]'], dense: true,
                    re: /gas station|petrol|fuel|filling station|gasoline|diesel|محطة وقود|بنزين/ },
    supermarket:  { label: "supermarkets",      single: "Supermarket",    emoji: "🛒", sel: ['["shop"="supermarket"]', '["shop"="convenience"]'], dense: true,
                    re: /supermarket|grocer(?:y|ies)|convenience store|mini ?market|سوبرماركت|بقالة/ },
    mall:         { label: "shopping malls",    single: "Shopping mall",  emoji: "🛍️", sel: ['["shop"="mall"]'],
                    re: /\bmalls?\b|shopping (?:centre|center|mall)|department store|مول|مجمع تجاري/ },
    shopping:     { label: "places to shop",    single: "Shopping",       emoji: "🛍️", sel: ['["shop"="mall"]', '["amenity"="marketplace"]', '["shop"="gift"]'],
                    re: /shopping|souvenirs?|souks?|bazaar|market ?place|سوق|تسوق/ },
    university:   { label: "universities",      single: "University",     emoji: "🎓", sel: ['["amenity"="university"]', '["amenity"="college"]'],
                    re: /universit|college|campus|جامعة|كلية/ },
    museum:       { label: "museums",           single: "Museum",         emoji: "🖼️", sel: ['["tourism"="museum"]', '["tourism"="gallery"]'],
                    re: /museum|galler(?:y|ies)|متحف/ },
    historic:     { label: "historical sites",  single: "Historical site", emoji: "🏺", sel: ['["historic"~"^(archaeological_site|ruins|castle|monument|fort|city_gate|tomb)$"]'],
                    re: /histor(?:ic|ical) (?:site|place|landmark)|historic|ruins|archaeolog|castles?|citadel|roman |ancient|heritage|آثار|قلعة|موقع أثري/ },
    beach:        { label: "beaches",           single: "Beach",          emoji: "🏖️", sel: ['["natural"="beach"]', '["leisure"="beach_resort"]'],
                    re: /beach|seaside|swimming|شاطئ|شاطىء/ },
    park:         { label: "parks",             single: "Park",           emoji: "🌳", sel: ['["leisure"~"^(park|garden|nature_reserve)$"]'],
                    re: /\bparks?\b|gardens?|playground|picnic|nature reserve|حديقة|متنزه/ },
    car_rental:   { label: "car rental offices", single: "Car rental",    emoji: "🚗", sel: ['["amenity"="car_rental"]'],
                    re: /car rental|rent a car|car hire|rental car|تأجير سيارات/ },
    transport:    { label: "transport options", single: "Transport",      emoji: "🚌", sel: ['["amenity"="bus_station"]', '["amenity"="taxi"]', '["public_transport"="station"]', '["aeroway"="aerodrome"]'],
                    re: /bus (?:station|terminal)|public transport|transportation|\btaxis?\b|\bmetro\b|airport|مواصلات|محطة باص|تكسي|مطار/ },
    hotel:        { label: "hotels",            single: "Hotel",          emoji: "🏨", sel: ['["tourism"~"^(hotel|hostel|guest_house|motel|apartment|resort)$"]'],
                    re: /hotels?|hostels?|guest ?houses?|(?:where|place|somewhere) to (?:stay|sleep)|accommodation|lodging|resort|need a room|فندق|نزل|شقق فندقية/ },
    dessert:      { label: "dessert & sweets spots", single: "Sweets",    emoji: "🍰", sel: ['["amenity"="ice_cream"]', '["shop"="pastry"]', '["shop"="confectionery"]'], dense: true,
                    re: /desserts?|sweets?|knafeh|kunafa|kanafeh|baklava|ice ?cream|pastr(?:y|ies)|حلويات|كنافة|بوظة/ },
    cafe:         { label: "cafés",             single: "Café",           emoji: "☕", sel: ['["amenity"="cafe"]'], dense: true,
                    re: /caf[eé]s?|coffee|tea ?house|espresso|shisha|hookah|قهوة|كافيه|مقهى|أرجيلة/ },
    fast_food:    { label: "fast-food spots",   single: "Fast food",      emoji: "🌯", sel: ['["amenity"="fast_food"]'], dense: true,
                    re: /fast ?food|shawarma|falafel|burgers?|snacks?|sandwich|cheap eats|quick bite|شاورما|فلافل|وجبات سريعة/ },
    restaurant:   { label: "restaurants",       single: "Restaurant",     emoji: "🍽️", sel: ['["amenity"="restaurant"]'], dense: true,
                    re: /restaurants?|\bfood\b|\beat\b|eating|hungry|lunch|dinner|breakfast|\bmeals?\b|grill|\bdine\b|dining|good to eat|something to eat|مطعم|أكل|اكل|طعام|جوعان|مأكولات/ },
    attraction:   { label: "attractions",       single: "Attraction",     emoji: "📍", sel: ['["tourism"~"^(attraction|viewpoint|museum|gallery|zoo|theme_park|aquarium)$"]', '["historic"~"^(archaeological_site|ruins|castle|monument|fort)$"]'],
                    re: /attractions?|sights?\b|sightseeing|tourist (?:spots?|places?|sites?)|landmarks?|viewpoints?|places? to (?:go|visit|see)|hidden (?:gems?|spots?|places?)|معلم سياحي|أماكن سياحية|اماكن سياحية/ }
  };

  // Order matters only for ties; the earliest word in the message decides the main category.
  const CATEGORY_IDS = Object.keys(CATEGORIES);

  const TYPE_LABELS = {
    restaurant: "Restaurant", cafe: "Café", fast_food: "Fast food", ice_cream: "Ice cream", pharmacy: "Pharmacy",
    hospital: "Hospital", clinic: "Clinic", doctors: "Doctor", police: "Police station", embassy: "Embassy",
    bank: "Bank", atm: "ATM", bureau_de_change: "Currency exchange", fuel: "Gas station", supermarket: "Supermarket",
    convenience: "Convenience store", mall: "Shopping mall", marketplace: "Market", gift: "Gift shop",
    university: "University", college: "College", museum: "Museum", gallery: "Gallery", attraction: "Attraction",
    viewpoint: "Viewpoint", zoo: "Zoo", theme_park: "Theme park", aquarium: "Aquarium", hotel: "Hotel", hostel: "Hostel",
    guest_house: "Guest house", motel: "Motel", apartment: "Apartments", resort: "Resort",
    archaeological_site: "Archaeological site", ruins: "Ruins", castle: "Castle", monument: "Monument", fort: "Fort",
    city_gate: "City gate", tomb: "Tomb", beach: "Beach", beach_resort: "Beach resort", park: "Park", garden: "Garden",
    nature_reserve: "Nature reserve", car_rental: "Car rental", bus_station: "Bus station", taxi: "Taxi stand",
    station: "Station", aerodrome: "Airport", fire_station: "Fire station", pastry: "Pastry shop", confectionery: "Sweets shop",
    diplomatic: "Embassy / consulate"
  };

  const CUISINES = {
    jordanian: { label: "Jordanian / Arab",  re: /arab|jordanian|middle_eastern|lebanese|syrian|palestinian|levantine|oriental|mansaf|falafel|hummus|shawarma/ },
    lebanese:  { label: "Lebanese",          re: /lebanese/ },
    italian:   { label: "Italian",           re: /italian|pizza|pasta/ },
    pizza:     { label: "Pizza",             re: /pizza/ },
    burger:    { label: "Burgers",           re: /burger/ },
    indian:    { label: "Indian",            re: /indian/ },
    chinese:   { label: "Chinese",           re: /chinese/ },
    asian:     { label: "Asian",             re: /asian|chinese|japanese|thai|korean|sushi|vietnamese/ },
    turkish:   { label: "Turkish",           re: /turkish|kebab/ },
    seafood:   { label: "Seafood",           re: /seafood|fish/ },
    grill:     { label: "Grill / BBQ",       re: /grill|barbecue|bbq|steak/ },
    vegetarian:{ label: "Vegetarian",        re: /vegetarian|vegan/ }
  };
  const CUISINE_WORDS = [
    ["jordanian", /jordanian|arab(?:ic)?|middle[- ]eastern|local|traditional|mansaf|أردني|عربي/],
    ["lebanese", /lebanese|لبناني/], ["italian", /italian|pasta/], ["pizza", /pizza/], ["burger", /burgers?/],
    ["indian", /indian/], ["chinese", /chinese/], ["asian", /asian|japanese|sushi|thai|korean/],
    ["turkish", /turkish|kebab/], ["seafood", /seafood|fish/], ["grill", /grill|bbq|barbecue|steak/],
    ["vegetarian", /vegetarian|vegan/]
  ];

  /* ------------------------------------------------------------------
     4. HELPERS — distance, formatting, opening hours
  ------------------------------------------------------------------ */
  function norm(s) {
    return String(s || "").toLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, " ").trim();
  }

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000, rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  function formatDistance(m) {
    if (m < 1000) return (m < 100 ? Math.max(10, Math.round(m / 10) * 10) : Math.round(m / 10) * 10) + " m";
    return (m / 1000).toFixed(m < 10000 ? 1 : 0) + " km";
  }

  function inJordan(lat, lng) {
    const b = CONFIG.jordanBounds;
    return lat >= b.south && lat <= b.north && lng >= b.west && lng <= b.east;
  }

  // Understands only simple opening_hours ("24/7", "Mo-Su 08:00-22:00", "09:00-17:00,18:00-23:00").
  // Anything more complicated returns null and the raw text is shown instead.
  const DAY_KEYS = ["su", "mo", "tu", "we", "th", "fr", "sa"];
  function parseOpenNow(str, date) {
    if (!str) return null;
    const s = String(str).trim().toLowerCase();
    if (s === "24/7") return true;
    if (s.indexOf(";") !== -1) return null;
    const D = "(?:mo|tu|we|th|fr|sa|su)";
    const R = D + "(?:\\s*-\\s*" + D + ")?";
    const T = "\\d{1,2}:\\d{2}\\s*-\\s*\\d{1,2}:\\d{2}";
    const m = s.match(new RegExp("^(?:(" + R + "(?:\\s*,\\s*" + R + ")*)\\s+)?(" + T + "(?:\\s*,\\s*" + T + ")*)$"));
    if (!m) return null;

    let days = null;
    if (m[1]) {
      days = new Set();
      m[1].split(",").forEach(function (part) {
        const ends = part.split("-").map(function (x) { return DAY_KEYS.indexOf(x.trim()); });
        let i = ends[0];
        const last = ends.length > 1 ? ends[1] : ends[0];
        for (let guard = 0; guard < 8; guard++) { days.add(i); if (i === last) break; i = (i + 1) % 7; }
      });
    }

    const parts = {};
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Amman", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(date || new Date()).forEach(function (p) { parts[p.type] = p.value; });
    const today = DAY_KEYS.indexOf(String(parts.weekday).slice(0, 2).toLowerCase());
    const yesterday = (today + 6) % 7;
    const now = (parseInt(parts.hour, 10) % 24) * 60 + parseInt(parts.minute, 10);
    const todayOk = !days || days.has(today);
    const yesterdayOk = !days || days.has(yesterday);

    const ranges = m[2].split(",");
    for (let i = 0; i < ranges.length; i++) {
      const t = ranges[i].match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
      const start = +t[1] * 60 + +t[2];
      const end = +t[3] * 60 + +t[4];
      if (end > start) { if (todayOk && now >= start && now < end) return true; }
      else {                                           // runs past midnight
        if (todayOk && now >= start) return true;
        if (yesterdayOk && now < end) return true;
      }
    }
    return false;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function safeUrl(value) {
    try {
      const u = new URL(String(value).split(";")[0].trim(), "https://x.invalid");
      if (u.protocol === "http:" || u.protocol === "https:") return u.href;
    } catch (e) { /* ignore */ }
    return null;
  }

  function directionsUrl(place, anchor) {
    let url = "https://www.google.com/maps/dir/?api=1&destination=" + place.lat + "," + place.lng;
    if (anchor && anchor.kind === "user") url += "&origin=" + anchor.lat + "," + anchor.lng;
    return url;
  }

  /* ------------------------------------------------------------------
     5. LOCATION STATE — nothing is assumed; only a location the user confirmed
  ------------------------------------------------------------------ */
  const state = { location: null };     // { lat, lng, accuracy?, source: "gps"|"pin"|"city", label? }

  function loadLocation() {
    try {
      const raw = root.sessionStorage.getItem(CONFIG.storageKey);
      if (!raw) return;
      const loc = JSON.parse(raw);
      if (loc && typeof loc.lat === "number" && typeof loc.lng === "number" && inJordan(loc.lat, loc.lng)) state.location = loc;
    } catch (e) { /* storage unavailable: fine */ }
  }
  function saveLocation() {
    try {
      if (state.location) root.sessionStorage.setItem(CONFIG.storageKey, JSON.stringify(state.location));
      else root.sessionStorage.removeItem(CONFIG.storageKey);
    } catch (e) { /* ignore */ }
  }

  /* ------------------------------------------------------------------
     6. UNDERSTANDING MESSAGES
  ------------------------------------------------------------------ */
  const ctx = {
    pending: null,       // a search waiting for the user to confirm a location
    last: null,          // { cats, opts, anchor, all, shown, places }
    statedPlace: null,   // "I'm in Amman" (city-level only, never treated as exact)
    ratingsNoted: false
  };

  const CUE_RE  = /\b(find|show|search|locate|looking for|look for|need|want|where|nearest|nearby|closest|near|around|close|any|recommend|suggest|is there|are there|directions|give me|list|get me|take me|hungry|thirsty|sick|open|got)\b|near me|around here|close by|\?$/;
  const NEAR_RE = /\bnear(?:by|est)?\b|closest|around (?:me|here)|close (?:to|by)|find me|where can i|where is|show me|\bany\b|\bin (?:my|this) area/;
  const NEAR_ME_RE = /near me|around me|nearby|nearest|closest|around here|close to me|close by|here\b|where i am/;
  const KNOW_RE = /(?:what|which) .{0,30}(?:food|dish|dishes|cuisine)|traditional|national dish|tell me about|history of|\bwhy\b|\bhow (?:do|does|did)\b|what is|what's (?:a|the)|best time|famous for|explain/;
  const URGENT_RE = /\b(?:i need|need|now|urgent|urgently|emergency|asap|quick|quickly|immediately|help)\b/;
  const LOCATE_RE = /(?:use|confirm|share|set|update|change|enable) (?:my )?(?:current )?location|where am i|my location/;
  const EXPLORE_RE = /what (?:can|should) i (?:do|see)|things to do|what to do|what'?s (?:there|around)|around here|something to do|activities|bored|explore|what else/;
  const VISITING_RE = /\bi'?m (?:visiting|going to|heading to|travel(?:l)?ing to|arriving in)|\bwe'?re (?:visiting|going to|heading to)|\bvisiting\b|\bplanning (?:a trip )?to\b|\bgoing to\b/;
  const HOURS_RE = /(\d+|one|two|three|four|five|six|seven|eight)\s*(?:hours?|hrs?)\b|a few hours|half (?:a )?day|half-day/;
  const MORE_RE = /^(?:show |give )?(?:me )?(?:more|others?|another (?:one|few)|next)\b/;
  const CLOSEST_RE = /(?:which|what)(?: one)?(?: is| 's|'s)? (?:the )?(?:closest|nearest)|closest one|nearest one|which is closest|closest\??$|nearest\??$/;
  const MAP_RE = /\b(?:show|see|open|view|put)\b.*\bmap\b|\bdirections?\b|how (?:do|can) i get (?:there|to)|\bnavigate\b|take me there|\bon the map\b/;
  const SICK_RE = /\b(?:i'?m|i am|feel(?:ing)?|feeling) (?:really |very |so )?(?:sick|ill|unwell)|not feeling (?:well|good)|\bhave (?:a )?(?:fever|headache|stomach ?ache|toothache)\b/;
  const BUDGET_RE = /\b(?:cheap|cheaper|cheapest|budget|affordable|inexpensive|low[- ]cost|backpacker)\b/;
  const LUXURY_RE = /\b(?:luxury|luxurious|fancy|upscale|5[- ]?star|five[- ]star|high[- ]end)\b/;

  const EMERGENCY_RULES = [
    { type: "fire", cats: ["fire_station"],
      re: /\bon fire\b|there(?:'s| is) (?:a )?fire|\bfire!|(?:is|are) burning|caught fire|catching fire|call (?:the )?fire|fire (?:department|brigade)|civil defen[cs]e|حريق|الدفاع المدني/ },
    { type: "ambulance", cats: ["hospital"],
      re: /ambulance|paramedic|heart attack|not breathing|can'?t breathe|cannot breathe|unconscious|bleeding (?:badly|heavily)|overdose|choking|seizure|\bstroke\b|إسعاف|اسعاف/ },
    { type: "police", cats: ["police"],
      re: /\b(?:i need|call|get me|send)\b.{0,12}\bpolice\b|\brobbed\b|\bmugged\b|\bburglar|attack(?:ed|ing) me|being followed|\bassaulted\b|my (?:wallet|phone|passport|bag) (?:was |got |has been )?stolen|النجدة/ },
    { type: "generic", cats: [],
      re: /^(?:i need help|need help|help|help me|please help|help!?|i need urgent help)[.!?]*$|\b(?:emergency|sos)\b|طوارئ|ساعدوني/ }
  ];

  function detectEmergency(text) {
    for (let i = 0; i < EMERGENCY_RULES.length; i++) {
      if (EMERGENCY_RULES[i].re.test(text)) return EMERGENCY_RULES[i];
    }
    return null;
  }

  // Which categories does the message mention? Earliest mention = the main one.
  function detectCats(text) {
    const hits = [];
    CATEGORY_IDS.forEach(function (id) {
      const m = CATEGORIES[id].re.exec(text);
      if (m) hits.push({ id: id, index: m.index });
    });
    hits.sort(function (a, b) { return a.index - b.index; });
    let ids = hits.map(function (h) { return h.id; });

    // Drop overlaps: "fast food" also contains "food"; museums are also attractions, etc.
    if (ids.indexOf("fast_food") !== -1) ids = ids.filter(function (i) { return i !== "restaurant"; });
    if (ids.indexOf("dessert") !== -1 || ids.indexOf("cafe") !== -1) {
      if (!/\brestaurants?\b|مطعم/.test(text)) ids = ids.filter(function (i) { return i !== "restaurant"; });
    }
    ["museum", "historic", "beach", "park"].forEach(function (specific) {
      if (ids.indexOf(specific) !== -1) ids = ids.filter(function (i) { return i !== "attraction"; });
    });
    if (ids.indexOf("atm") !== -1 || ids.indexOf("exchange") !== -1) ids = ids.filter(function (i) { return i !== "bank"; });
    if (ids.indexOf("mall") !== -1) ids = ids.filter(function (i) { return i !== "shopping"; });
    if (ids.indexOf("hospital") !== -1) ids = ids.filter(function (i) { return i !== "clinic"; });

    if (ids.length > 1 && !/\b(?:and|plus|also|as well)\b|&|,|،|\bو/.test(text)) ids = ids.slice(0, 1);
    return ids.slice(0, 3);
  }

  function detectCuisine(text) {
    for (let i = 0; i < CUISINE_WORDS.length; i++) if (CUISINE_WORDS[i][1].test(text)) return CUISINE_WORDS[i][0];
    return null;
  }
  function detectBudget(text) { return BUDGET_RE.test(text) ? "budget" : (LUXURY_RE.test(text) ? "luxury" : null); }

  function detectHours(text) {
    const m = HOURS_RE.exec(text);
    if (!m) return null;
    if (/half/.test(m[0])) return 4;
    if (/few/.test(m[0])) return 3;
    const words = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8 };
    const n = isNaN(+m[1]) ? words[m[1]] : +m[1];
    return n >= 1 && n <= 12 ? n : null;
  }

  function ordinal(text) {
    if (/\b(?:second|2nd|number 2|#2)\b/.test(text)) return 1;
    if (/\b(?:third|3rd|number 3|#3)\b/.test(text)) return 2;
    if (/\b(?:fourth|4th|number 4|#4)\b/.test(text)) return 3;
    if (/\b(?:fifth|5th|number 5|#5)\b/.test(text)) return 4;
    return 0;
  }

  // Turns a message into an intent. Returns { kind: "none" } when it is not a places question,
  // so ai.js can fall back to the tourism answers it already had.
  function interpret(raw, c) {
    c = c || ctx;
    const text = norm(raw);
    const words = text.split(" ").length;
    const arabic = /[\u0600-\u06FF]/.test(text);
    const place = findPlace(text);

    const em = detectEmergency(text);
    if (em) return { kind: "emergency", type: em.type, cats: em.cats, place: place, text: text };

    if (LOCATE_RE.test(text)) return { kind: "locate", text: text };

    const cats = detectCats(text);

    // Answer to "please confirm your location" by naming a place instead.
    if (!cats.length && c.pending && place && words <= 6) {
      return Object.assign({}, c.pending, { place: place, text: text });
    }

    // Follow-ups about the results already on screen.
    if (c.last && !cats.length) {
      if (MORE_RE.test(text)) return { kind: "more", text: text };
      if (CLOSEST_RE.test(text)) return { kind: "closest", text: text };
      if (MAP_RE.test(text)) return { kind: "showmap", index: ordinal(text), text: text };
      const cuisine = detectCuisine(text), budget = detectBudget(text);
      if ((cuisine || budget) && words <= 6) {
        const opts = Object.assign({}, c.last.opts);
        if (cuisine) opts.cuisine = cuisine;
        if (budget) opts.budget = budget;
        return { kind: "search", cats: c.last.cats, opts: opts, anchor: c.last.anchor, place: null, text: text };
      }
      if (/^(?:the )?(?:first|second|third|fourth|fifth|1st|2nd|3rd|number \d)\b/.test(text)) {
        return { kind: "showmap", index: ordinal(text), text: text };
      }
    }

    // "I'm in Amman" (no request): remember it for later, city-level only.
    if (!cats.length && place && /\bi'?m (?:in|at|staying in|near)|\bi am (?:in|at)|\bwe'?re (?:in|at|staying in)/.test(text) && !HOURS_RE.test(text) && words <= 8) {
      return { kind: "stated", place: place, text: text };
    }

    // "4 hours in Amman" — time-boxed plan.
    const hrs = detectHours(text);
    if (hrs && !cats.length && (place || NEAR_ME_RE.test(text) || /\bfree\b|\bwhat can i do\b|\bi have\b/.test(text))) {
      return { kind: "plan", hours: hrs, place: place, text: text };
    }

    // "I'm visiting Petra tomorrow"
    if (!cats.length && place && VISITING_RE.test(text)) return { kind: "visiting", place: place, text: text };

    if (!cats.length) {
      if (SICK_RE.test(text)) return { kind: "sick", place: place, text: text };
      if (EXPLORE_RE.test(text) && (NEAR_ME_RE.test(text) || !place)) return { kind: "explore", place: place, text: text };
      if (EXPLORE_RE.test(text) && place && /\bnear|around|nearby|show|find\b/.test(text)) return { kind: "explore", place: place, text: text };
      return { kind: "none" };
    }

    // From here on: at least one category was mentioned.
    const primary = cats[0];
    const cue = CUE_RE.test(text) || arabic || words <= 3;
    if (!cue) return { kind: "none" };

    // "What food should I try?" is a knowledge question, not a search, unless they say near/find.
    if (KNOW_RE.test(text) && !NEAR_RE.test(text)) return { kind: "none" };
    // Named place + broad "what to visit" wording stays a knowledge answer.
    if (primary === "attraction" && !NEAR_RE.test(text) && !NEAR_ME_RE.test(text) && !/\b(?:list|any)\b/.test(text)) return { kind: "none" };

    const opts = { cuisine: detectCuisine(text), budget: detectBudget(text), nearest: /nearest|closest/.test(text) };
    const urgent = URGENT_RE.test(text) && CATEGORIES[primary].urgent;
    return { kind: "search", cats: cats, opts: opts, place: place, urgent: urgent, text: text };
  }

  /* ------------------------------------------------------------------
     7. PLACES SERVICE
  ------------------------------------------------------------------ */
  const DENSE_RADII = [1000, 3000, 8000, 20000];
  const SPARSE_RADII = [3000, 10000, 30000, 80000];
  const cache = new Map();

  function buildOverpassQuery(cat, a, radius) {
    const parts = cat.sel.map(function (s) {
      return "nwr" + s + '["name"](around:' + radius + "," + a.lat + "," + a.lng + ");";
    }).join("");
    return "[out:json][timeout:25];(" + parts + ");out center tags 250;";
  }

  async function overpass(query) {
    let lastError = null;
    for (let i = 0; i < CONFIG.overpassEndpoints.length; i++) {
      const ctrl = new AbortController();
      const timer = setTimeout(function () { ctrl.abort(); }, CONFIG.requestTimeoutMs);
      try {
        const res = await fetch(CONFIG.overpassEndpoints[i], {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: "data=" + encodeURIComponent(query),
          signal: ctrl.signal
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json();
        return json.elements || [];
      } catch (e) { lastError = e; }
      finally { clearTimeout(timer); }
    }
    throw lastError || new Error("Places service unavailable");
  }

  function labelFor(tags, cat) {
    const keys = ["amenity", "tourism", "historic", "shop", "leisure", "natural", "public_transport", "aeroway", "office"];
    for (let i = 0; i < keys.length; i++) {
      const v = tags[keys[i]];
      if (v && TYPE_LABELS[v]) return TYPE_LABELS[v];
    }
    return cat.single;
  }

  function nicely(list) {
    return String(list).split(";").map(function (s) { return s.trim().replace(/_/g, " "); }).filter(Boolean).join(", ");
  }

  function describe(tags) {
    const desc = tags["description:en"] || tags.description;
    if (desc) return desc.length > 160 ? desc.slice(0, 157) + "…" : desc;
    const bits = [];
    if (tags.cuisine) bits.push("Cuisine: " + nicely(tags.cuisine));
    if (tags.stars) bits.push(tags.stars + "★");
    if (tags.brand && tags.brand !== tags.name) bits.push(tags.brand);
    if (tags.wheelchair === "yes") bits.push("Wheelchair accessible");
    if (tags.internet_access === "wlan" || tags.wifi === "yes") bits.push("Wi-Fi");
    return bits.join(" · ") || null;
  }

  function addressFor(tags) {
    if (tags["addr:full"]) return tags["addr:full"];
    const street = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
    const parts = [street, tags["addr:suburb"] || tags["addr:neighbourhood"] || tags["addr:district"], tags["addr:city"]].filter(Boolean);
    return parts.length ? parts.join(", ") : null;
  }

  function hotelTier(tags) {
    const stars = parseFloat(tags.stars);
    if (tags.tourism === "hostel" || tags.tourism === "guest_house") return "budget";
    if (!isNaN(stars)) return stars <= 2 ? "budget" : (stars === 3 ? "mid" : "luxury");
    return "unknown";
  }

  function normalizeElement(el, cat, anchor) {
    const tags = el.tags || {};
    const lat = el.lat != null ? el.lat : (el.center && el.center.lat);
    const lng = el.lon != null ? el.lon : (el.center && el.center.lon);
    const name = tags["name:en"] || tags.name || tags["name:ar"];
    if (!name || typeof lat !== "number" || typeof lng !== "number") return null;
    const altName = tags["name:ar"] && tags["name:ar"] !== name ? tags["name:ar"] : (tags.name && tags.name !== name ? tags.name : null);
    const hours = tags.opening_hours || null;
    const phone = String(tags.phone || tags["contact:phone"] || "").split(";")[0].replace(/[^\d+()\s-]/g, "").trim();
    return {
      id: el.type + "/" + el.id,
      name: name, altName: altName,
      catId: cat.id, emoji: cat.emoji,
      category: labelFor(tags, cat),
      lat: lat, lng: lng,
      distanceM: haversine(anchor.lat, anchor.lng, lat, lng),
      address: addressFor(tags),
      rating: null, ratingCount: null,            // OpenStreetMap has no ratings — never invented
      hours: hours, openNow: parseOpenNow(hours),
      phone: phone || null,
      website: safeUrl(tags.website || tags["contact:website"] || ""),
      description: describe(tags),
      cuisine: tags.cuisine ? String(tags.cuisine).toLowerCase() : "",
      tier: cat.id === "hotel" ? hotelTier(tags) : null
    };
  }

  function dedupe(list) {
    const kept = [];
    list.forEach(function (p) {
      const dup = kept.some(function (k) {
        return k.name.toLowerCase() === p.name.toLowerCase() && haversine(k.lat, k.lng, p.lat, p.lng) < 150;
      });
      if (!dup) kept.push(p);
    });
    return kept;
  }

  function applyFilters(list, catId, opts) {
    let out = list;
    if (opts.cuisine && (catId === "restaurant" || catId === "fast_food")) {
      const re = CUISINES[opts.cuisine].re;
      out = out.filter(function (p) { return re.test(p.cuisine); });
    }
    return out;
  }

  function sortPlaces(list, catId, opts) {
    const byDistance = function (a, b) { return a.distanceM - b.distanceM; };
    if (catId === "hotel" && opts.budget) {
      const order = opts.budget === "luxury"
        ? { luxury: 0, mid: 1, unknown: 2, budget: 3 }
        : { budget: 0, unknown: 1, mid: 2, luxury: 3 };
      return list.slice().sort(function (a, b) { return (order[a.tier] - order[b.tier]) || byDistance(a, b); });
    }
    return list.slice().sort(byDistance);
  }

  // One category around one anchor. Returns { places (all found, sorted), radius, filteredOut }.
  async function findPlaces(catId, anchor, opts) {
    opts = opts || {};
    const cat = Object.assign({ id: catId }, CATEGORIES[catId]);
    const key = [catId, anchor.lat.toFixed(3), anchor.lng.toFixed(3), opts.cuisine || "", opts.budget || "", CONFIG.provider].join("|");
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < CONFIG.cacheMinutes * 60000) return hit.value;

    let value;
    if (CONFIG.provider === "backend") value = await findViaBackend(cat, anchor, opts);
    else {
      const radii = cat.dense ? DENSE_RADII : SPARSE_RADII;
      const wanted = cat.dense ? 5 : 3;
      let places = [], radius = 0, unfiltered = [];
      for (let i = 0; i < radii.length; i++) {
        radius = radii[i];
        const elements = await overpass(buildOverpassQuery(cat, anchor, radius));
        unfiltered = dedupe(elements.map(function (e) { return normalizeElement(e, cat, anchor); }).filter(Boolean)
          .sort(function (a, b) { return a.distanceM - b.distanceM; }));
        places = applyFilters(unfiltered, catId, opts);
        if (places.length >= wanted) break;
      }
      const relaxed = !places.length && unfiltered.length && opts.cuisine;
      value = { places: sortPlaces(relaxed ? unfiltered : places, catId, opts), radius: radius, relaxed: !!relaxed };
    }
    cache.set(key, { at: Date.now(), value: value });
    return value;
  }

  // Backend contract (see README): GET {backendUrl}?lat=&lng=&category=&cuisine=&budget=
  //   -> { places: [{ id, name, category, lat, lng, distanceM?, address, rating, ratingCount,
  //                    openNow, hours, phone, website, description }], radius? }
  async function findViaBackend(cat, anchor, opts) {
    const qs = new URLSearchParams({ lat: anchor.lat, lng: anchor.lng, category: cat.id });
    if (opts.cuisine) qs.set("cuisine", opts.cuisine);
    if (opts.budget) qs.set("budget", opts.budget);
    const res = await fetch(CONFIG.backendUrl + "?" + qs.toString());
    if (!res.ok) throw new Error("Places backend error " + res.status);
    const data = await res.json();
    const places = (data.places || []).filter(function (p) {
      return p && p.name && typeof p.lat === "number" && typeof p.lng === "number";
    }).map(function (p) {
      return {
        id: String(p.id || p.name + p.lat), name: p.name, altName: p.altName || null,
        catId: cat.id, emoji: cat.emoji, category: p.category || cat.single,
        lat: p.lat, lng: p.lng,
        distanceM: typeof p.distanceM === "number" ? p.distanceM : haversine(anchor.lat, anchor.lng, p.lat, p.lng),
        address: p.address || null,
        rating: typeof p.rating === "number" ? p.rating : null,
        ratingCount: typeof p.ratingCount === "number" ? p.ratingCount : null,
        hours: p.hours || null, openNow: typeof p.openNow === "boolean" ? p.openNow : null,
        phone: p.phone || null, website: p.website ? safeUrl(p.website) : null,
        description: p.description || null, cuisine: "", tier: null
      };
    });
    return { places: sortPlaces(places, cat.id, opts), radius: data.radius || 0, relaxed: false };
  }

  /* ------------------------------------------------------------------
     8. RESULT FORMATTING — build the reply object ai.js renders
  ------------------------------------------------------------------ */
  function whereText(anchor) {
    if (!anchor) return "";
    return anchor.kind === "user" ? "near your location" : "near " + anchor.label;
  }

  function emergencyBlock(type) {
    return { type: type || "generic" };
  }

  function emergencyText(type) {
    switch (type) {
      case "fire":
        return "🚨 Call 911 now. Get yourself and everyone around you to a safe place first, and don't go back inside.";
      case "ambulance":
        return "🚨 Call 911 now for an ambulance. Stay with the person, and tell the operator exactly where you are.";
      case "police":
        return "🚨 Call 911 for the police. If you're in danger, move somewhere safe first.";
      default:
        return "🚨 If you or someone else is in danger or needs urgent help, call 911 now. What kind of help do you need?";
    }
  }

  function numberPlaces(groups) {
    let n = 1;
    const flat = [];
    groups.forEach(function (g) { g.places.forEach(function (p) { p.n = n++; flat.push(p); }); });
    return flat;
  }

  function locationPromptReply(intent, extra) {
    ctx.pending = intent;
    const reply = {
      text: "📍 Please confirm your location so I can find the nearest places for you.",
      extras: { locationPrompt: true }
    };
    if (extra) Object.assign(reply.extras, extra);
    return reply;
  }

  function noServiceReply(message, extra) {
    return {
      text: "😕 I couldn't reach the places service just now, and I don't want to guess. Please try again in a moment.",
      extras: Object.assign({ suggestions: [{ label: "Try again", message: message }] }, extra || {})
    };
  }

  function resolveAnchor(intent) {
    if (intent.anchor) return intent.anchor;
    if (intent.place) return { lat: intent.place.lat, lng: intent.place.lng, label: intent.place.name, kind: "place" };
    if (state.location) return { lat: state.location.lat, lng: state.location.lng, label: "your location", kind: "user", accuracy: state.location.accuracy };
    if (ctx.statedPlace && !NEAR_ME_RE.test(intent.text || "")) {
      return { lat: ctx.statedPlace.lat, lng: ctx.statedPlace.lng, label: ctx.statedPlace.name, kind: "place" };
    }
    return null;
  }

  function anchorTip(anchor) {
    if (!anchor || anchor.kind === "user") return null;
    return "Distances are measured from the centre of " + anchor.label + ". Confirm your location for exact distances.";
  }

  function ratingNote() {
    if (ctx.ratingsNoted || CONFIG.provider !== "osm") return null;
    ctx.ratingsNoted = true;
    return "Ratings and prices aren't part of OpenStreetMap data, so I don't show them. Opening hours appear when the map lists them.";
  }

  async function runSearch(intent) {
    const anchor = resolveAnchor(intent);
    const primary = intent.cats[0];
    const urgentCat = CATEGORIES[primary].urgent;
    const block = intent.urgent || intent.emergencyType ? emergencyBlock(intent.emergencyType || (primary === "police" ? "police" : primary === "fire_station" ? "fire" : "ambulance")) : null;

    if (!anchor) {
      const pendingIntent = Object.assign({}, intent, { anchor: null });
      const r = locationPromptReply(pendingIntent, block ? { emergency: block } : null);
      if (block) r.text = emergencyText(block.type) + "\n\n" + r.text;
      return r;
    }
    ctx.pending = null;

    const limit = urgentCat ? CONFIG.maxResultsUrgent : (intent.opts && intent.opts.nearest ? 3 : CONFIG.maxResults);
    const settled = await Promise.allSettled(intent.cats.map(function (c) { return findPlaces(c, anchor, intent.opts || {}); }));
    const groups = [];
    let failed = 0, radiusFar = false, relaxedNote = null;

    settled.forEach(function (s, i) {
      const catId = intent.cats[i], cat = CATEGORIES[catId];
      if (s.status !== "fulfilled") { failed++; return; }
      const res = s.value;
      if (res.relaxed) relaxedNote = "None of them are tagged as " + CUISINES[intent.opts.cuisine].label + " in the map data, so these are the nearest " + cat.label + " instead.";
      const shown = res.places.slice(0, limit);
      if (shown.length && shown[0].distanceM > 5000) radiusFar = true;
      groups.push({ catId: catId, title: intent.cats.length > 1 ? cat.emoji + " " + cat.label.charAt(0).toUpperCase() + cat.label.slice(1) : null,
                    places: shown, all: res.places, radius: res.radius });
    });

    if (failed === intent.cats.length) return noServiceReply(intent.text, block ? { emergency: block } : null);

    const flat = numberPlaces(groups);
    const first = groups[0];
    const cat = CATEGORIES[first.catId];
    let text;
    if (!flat.length) {
      const km = first.radius ? Math.round(first.radius / 1000) : null;
      text = "I couldn't find any " + cat.label + " " + (km ? "within " + km + " km " : "") + whereText(anchor) + " in the map data. " +
             "Try naming a nearby town, for example “" + cat.label + " in Amman”.";
    } else if (intent.opts && intent.opts.nearest && groups.length === 1) {
      text = "📍 The closest " + cat.single.toLowerCase() + " is " + flat[0].name + ", about " + formatDistance(flat[0].distanceM) + " away. Here are the nearest options:";
    } else if (groups.length === 1) {
      text = "📍 I found these " + cat.label + " " + whereText(anchor) + ":";
    } else {
      text = "📍 Here's what I found " + whereText(anchor) + ":";
    }
    if (radiusFar && flat.length) text += " The nearest ones are a bit further out.";
    if (block) text = emergencyText(block.type) + "\n\n" + text;

    ctx.last = { cats: intent.cats, opts: intent.opts || {}, anchor: anchor, all: first.all, shown: first.places.length, places: flat };

    const notes = [relaxedNote, anchorTip(anchor), (intent.opts && intent.opts.budget && primary === "hotel") ?
      "Map data has no prices, so I ranked " + (intent.opts.budget === "luxury" ? "the higher-star hotels" : "hostels, guest houses and 1–2★ hotels") + " first." : null, ratingNote()].filter(Boolean);

    const suggestions = [];
    if (flat.length && first.all.length > first.places.length && groups.length === 1) suggestions.push({ label: "Show more", message: "show more" });
    if (primary === "restaurant" && !intent.opts.cuisine) suggestions.push({ label: "Jordanian food", message: "Jordanian food" }, { label: "Cafés", message: "cafés near me" });
    if (primary === "hotel" && !intent.opts.budget) suggestions.push({ label: "Cheaper options", message: "cheaper hotels" });
    if (failed) notes.push("Some results couldn't be loaded.");

    return {
      text: text,
      extras: { emergency: block, groups: groups, anchor: anchor, mapPlaces: flat, note: notes.join(" "), suggestions: suggestions }
    };
  }

  /* ------------------------------------------------------------------
     9. CONVERSATION ENGINE
  ------------------------------------------------------------------ */
  async function runEmergency(intent) {
    const block = emergencyBlock(intent.type);
    let reply = { text: emergencyText(intent.type), extras: { emergency: block } };

    if (intent.type === "generic") {
      reply.extras.suggestions = [
        { label: "🚓 Police", message: "I need the police" },
        { label: "🚑 Ambulance", message: "I need an ambulance" },
        { label: "🔥 Fire", message: "There is a fire" },
        { label: "🏥 Hospital", message: "I need a hospital" },
        { label: "💊 Pharmacy", message: "I need a pharmacy" }
      ];
      return reply;
    }

    // Also point to the nearest matching service — but never let that delay the numbers above.
    const search = await runSearch({ kind: "search", cats: intent.cats, opts: { nearest: true }, place: intent.place, urgent: true, emergencyType: intent.type, text: intent.text });
    return search;
  }

  async function runExplore(intent, opts) {
    opts = opts || {};
    const anchor = resolveAnchor(intent);
    if (!anchor) return locationPromptReply(intent);
    ctx.pending = null;

    const plan = [["attraction", 3], ["restaurant", 2], ["cafe", 2]];
    const settled = await Promise.allSettled(plan.map(function (p) { return findPlaces(p[0], anchor, {}); }));
    const groups = [];
    settled.forEach(function (s, i) {
      if (s.status !== "fulfilled" || !s.value.places.length) return;
      const cat = CATEGORIES[plan[i][0]];
      const titles = { attraction: "Things to see", restaurant: "Where to eat", cafe: "Coffee & a break" };
      groups.push({ catId: plan[i][0], title: cat.emoji + " " + titles[plan[i][0]], places: s.value.places.slice(0, plan[i][1]), all: s.value.places });
    });
    if (!groups.length) return noServiceReply(intent.text);

    const flat = numberPlaces(groups);
    ctx.last = { cats: ["attraction"], opts: {}, anchor: anchor, all: groups[0].all, shown: groups[0].places.length, places: flat };
    const notes = [anchorTip(anchor), ratingNote()].filter(Boolean);
    return {
      text: opts.text || ("📍 Here are some ideas " + whereText(anchor) + ":"),
      link: opts.link,
      extras: { groups: groups, anchor: anchor, mapPlaces: flat, note: notes.join(" "),
                suggestions: opts.suggestions || [{ label: "🏨 Hotels", message: "hotels " + (anchor.kind === "user" ? "near me" : "in " + anchor.label) }] }
    };
  }

  async function runVisiting(intent, knowledge) {
    const place = intent.place;
    const known = knowledge ? knowledge(intent.text) : null;
    const intro = known && known.text ? known.text + "\n\nAnd here's what's around " + place.name + ":" :
      "Enjoy " + place.name + "! Here's what's around:";
    const suggestions = [
      { label: "🏨 Hotels in " + place.name, message: "hotels in " + place.name },
      { label: "☕ Cafés", message: "cafés in " + place.name },
      { label: "ℹ️ Tell me about " + place.name, message: "Tell me about " + place.name }
    ];
    return runExplore(Object.assign({}, intent, { place: place }), { text: intro, link: known && known.link, suggestions: suggestions });
  }

  async function runPlan(intent) {
    const anchor = resolveAnchor(intent);
    if (!anchor) return locationPromptReply(intent);
    ctx.pending = null;

    const h = intent.hours;
    const maxKm = h <= 2 ? 5 : (h <= 4 ? 12 : 30);
    const nAttr = h <= 2 ? 1 : (h <= 4 ? 2 : 3);
    const settled = await Promise.allSettled([findPlaces("attraction", anchor, {}), findPlaces("restaurant", anchor, {}), findPlaces("cafe", anchor, {})]);
    if (settled.every(function (s) { return s.status !== "fulfilled"; })) return noServiceReply(intent.text);
    const val = function (s) { return s.status === "fulfilled" ? s.value.places : []; };

    // Nearest-neighbour route through the attractions that are close enough.
    const pool = val(settled[0]).filter(function (p) { return p.distanceM <= maxKm * 1000; });
    const stops = [];
    let cur = anchor;
    while (stops.length < nAttr && pool.length) {
      pool.sort(function (a, b) { return haversine(cur.lat, cur.lng, a.lat, a.lng) - haversine(cur.lat, cur.lng, b.lat, b.lng); });
      const next = pool.shift();
      next.role = "See";
      stops.push(next);
      cur = next;
    }
    const nearLast = function (list) {
      return list.slice().sort(function (a, b) { return haversine(cur.lat, cur.lng, a.lat, a.lng) - haversine(cur.lat, cur.lng, b.lat, b.lng); })[0];
    };
    const food = h >= 3 && val(settled[1]).length ? nearLast(val(settled[1])) : null;
    if (food) { food.role = "Eat"; stops.push(food); cur = food; }
    const coffee = (h <= 2 || h >= 5) && val(settled[2]).length ? nearLast(val(settled[2])) : null;
    if (coffee) { coffee.role = "Coffee break"; stops.push(coffee); }

    if (!stops.length) {
      return { text: "I couldn't find enough mapped places within " + maxKm + " km " + whereText(anchor) + " to build a plan. Try naming a bigger town or a nearby attraction.", extras: {} };
    }
    const groups = [{ catId: "plan", title: null, places: stops, all: stops }];
    const flat = numberPlaces(groups);
    stops.forEach(function (p) { p.category = p.role + " · " + p.category; });
    ctx.last = { cats: ["attraction"], opts: {}, anchor: anchor, all: stops, shown: stops.length, places: flat };

    return {
      text: "⏱️ With about " + h + " hour" + (h > 1 ? "s" : "") + " " + whereText(anchor) + ", here's a realistic plan. Allow roughly 45–90 minutes per stop, plus travel time:",
      extras: { groups: groups, anchor: anchor, mapPlaces: flat, note: [anchorTip(anchor), "Check opening hours before you go."].filter(Boolean).join(" ") }
    };
  }

  function placeReply(p, text) {
    const anchor = ctx.last.anchor;
    return { text: text, extras: { groups: [{ catId: p.catId, title: null, places: [p], all: [p] }], anchor: anchor, mapPlaces: ctx.last.places, focusId: p.id } };
  }

  async function handle(message, opts) {
    opts = opts || {};
    const intent = interpret(message, ctx);
    switch (intent.kind) {
      case "none":
        return null;

      case "locate":
        return { text: "📍 Use the map below to confirm where you are. I only use your location to find nearby places.", extras: { locationPrompt: true, openPicker: true } };

      case "stated":
        ctx.statedPlace = intent.place;
        return { text: "Nice — " + intent.place.name + " it is. What are you looking for: food, a place to stay, sights, or something else?",
                 extras: { suggestions: [{ label: "🍽️ Food", message: "restaurants in " + intent.place.name }, { label: "🏛️ Sights", message: "attractions in " + intent.place.name }, { label: "🏨 Hotels", message: "hotels in " + intent.place.name }] } };

      case "emergency":
        return runEmergency(intent);

      case "sick":
        return { text: "I'm sorry you're not feeling well. If it's serious (trouble breathing, chest pain, heavy bleeding), call 911 now. Otherwise, what do you need?",
                 extras: { emergency: emergencyBlock("ambulance"),
                           suggestions: [{ label: "💊 Pharmacy", message: "I need a pharmacy" }, { label: "🩺 Clinic", message: "I need a clinic" }, { label: "🏥 Hospital", message: "I need a hospital" }] } };

      case "closest": {
        const p = ctx.last.places.slice().sort(function (a, b) { return a.distanceM - b.distanceM; })[0];
        if (!p) return null;
        const from = ctx.last.anchor.kind === "user" ? "your confirmed location" : ctx.last.anchor.label + " centre";
        return placeReply(p, "📍 " + p.name + " is the closest, about " + formatDistance(p.distanceM) + " from " + from + ".");
      }

      case "more": {
        const l = ctx.last;
        if (!l.all || l.shown >= l.all.length || l.cats.length !== 1) return { text: "That's everything I found for that search. Want me to look somewhere else?", extras: {} };
        const next = l.all.slice(l.shown, l.shown + CONFIG.maxResults);
        l.shown += next.length;
        const groups = [{ catId: l.cats[0], title: null, places: next, all: l.all }];
        const start = l.places.length;
        next.forEach(function (p, i) { p.n = start + i + 1; });
        l.places = l.places.concat(next);
        return { text: "Here are a few more:", extras: { groups: groups, anchor: l.anchor, mapPlaces: l.places,
                 suggestions: l.shown < l.all.length ? [{ label: "Show more", message: "show more" }] : [] } };
      }

      case "showmap": {
        const p = ctx.last.places[Math.min(intent.index || 0, ctx.last.places.length - 1)];
        if (!p) return null;
        return placeReply(p, "🗺️ Here's " + p.name + " on the map.");
      }

      case "explore":
        return runExplore(intent);

      case "visiting":
        return runVisiting(intent, opts.knowledge);

      case "plan":
        return runPlan(intent);

      case "search":
        ctx.lastMessage = intent.text;
        return runSearch(intent);
    }
    return null;
  }

  // Called right after the user confirms a location.
  async function onLocationConfirmed() {
    const p = ctx.pending;
    if (!p) {
      return { text: "📍 Location confirmed. What are you looking for?",
               extras: { suggestions: [{ label: "🍽️ Restaurants", message: "restaurants near me" }, { label: "💊 Pharmacy", message: "nearest pharmacy" }, { label: "📍 Things to do", message: "what can I do around here?" }, { label: "🏨 Hotels", message: "hotels near me" }] } };
    }
    ctx.pending = null;
    if (p.kind === "emergency") return runEmergency(Object.assign({}, p, { place: null }));
    if (p.kind === "explore") return runExplore(p);
    if (p.kind === "plan") return runPlan(p);
    return runSearch(Object.assign({}, p, { anchor: null }));
  }

  /* ------------------------------------------------------------------
     10. LOCATION + MAP UI (Leaflet). Everything here is optional: if the
         page has no #geo-panel, or Leaflet didn't load, chat still works.
  ------------------------------------------------------------------ */
  const UI = { ready: false, map: null, resultLayer: null, userLayer: null, candidate: null, candidateMarker: null, picking: false, els: {}, shown: null };

  function $(id) { return document.getElementById(id); }

  function pinIcon(html, cls) {
    return root.L.divIcon({ className: "geo-pin " + (cls || ""), html: "<span>" + html + "</span>", iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -16] });
  }

  function help(msg) { if (UI.els.help) UI.els.help.textContent = msg || ""; }

  function updateBar() {
    if (!UI.ready) return;
    const loc = state.location;
    if (loc) {
      let how = loc.source === "gps" ? (loc.accuracy ? " · GPS ±" + Math.round(loc.accuracy) + " m" : " · GPS") : (loc.source === "city" ? " · " + (loc.label || "city") + " centre (approximate)" : " · map pin");
      UI.els.status.textContent = "📍 Location confirmed" + how;
      UI.els.open.textContent = "Change";
    } else {
      UI.els.status.textContent = "📍 Location not confirmed";
      UI.els.open.textContent = "Confirm location";
    }
    UI.els.clear.hidden = !loc;
    UI.els.bar.classList.toggle("is-confirmed", !!loc);
  }

  function ensureMap() {
    if (UI.map) return UI.map;
    if (!root.L || !UI.els.map) return null;
    const L = root.L;
    UI.map = L.map(UI.els.map, { zoomControl: true, attributionControl: !!CONFIG.cartoApiKey }).setView([31.3, 36.2], 7);

    if (CONFIG.cartoApiKey) {
      const tiles = L.tileLayer(CONFIG.tileUrl + "?key=" + encodeURIComponent(CONFIG.cartoApiKey), {
        maxZoom: 19, attribution: CONFIG.tileAttribution, detectRetina: true
      }).addTo(UI.map);
      // A tile provider hiccup (rate limit, outage, offline) must never take the location
      // or places system down with it -- log it once and keep going with whatever tiles
      // did load; pins, search and directions all work off coordinates, not the imagery.
      let tileErrorNoted = false;
      tiles.on("tileerror", function () {
        if (tileErrorNoted) return;
        tileErrorNoted = true;
        help("Map imagery is having trouble loading right now, but your location and search results still work below.");
      });
    } else {
      // No key configured: never call CARTO without one -- that would show every visitor
      // a watermarked "API KEY REQUIRED" tile. Skip the tile layer entirely (one console
      // message for developers, nothing alarming for visitors) and keep the map usable
      // for pins, distances and directions against its plain background.
      console.warn("[MASAR] Map tiles are disabled: js/config.js is missing or CARTO_API_KEY is empty. " +
        "Get a free key at https://carto.com/basemaps/apikey and set it in js/config.js (see js/config.example.js). " +
        "Location, search and directions are unaffected.");
      L.control.attribution({ prefix: false }).addTo(UI.map).addAttribution(CONFIG.tileAttribution);
    }

    UI.resultLayer = L.layerGroup().addTo(UI.map);
    UI.userLayer = L.layerGroup().addTo(UI.map);
    UI.map.on("click", function (e) { if (UI.picking) setCandidate(e.latlng.lat, e.latlng.lng, { source: "pin" }); });
    return UI.map;
  }

  function openPanel() {
    if (!UI.ready) return false;
    UI.els.panel.hidden = false;
    const map = ensureMap();
    if (!map) { help("The map couldn't load (are you offline?). You can still pick a city below, and results will list directions links."); return false; }
    setTimeout(function () { map.invalidateSize(); }, 60);
    drawUser();
    return true;
  }

  function drawUser() {
    if (!UI.map) return;
    UI.userLayer.clearLayers();
    const loc = state.location;
    if (!loc) return;
    root.L.marker([loc.lat, loc.lng], { icon: pinIcon("🧍", "geo-pin--user"), keyboard: false }).bindTooltip("You are here").addTo(UI.userLayer);
    if (loc.accuracy && loc.accuracy < 3000) root.L.circle([loc.lat, loc.lng], { radius: loc.accuracy, color: "#8c3f32", weight: 1, fillOpacity: 0.08 }).addTo(UI.userLayer);
  }

  function setCandidate(lat, lng, extra) {
    if (!inJordan(lat, lng)) { help("That spot is outside Jordan. MASAR focuses on Jordan, so please pick a place inside it."); return; }
    UI.candidate = Object.assign({ lat: lat, lng: lng }, extra || {});
    const map = ensureMap();
    if (!map) { UI.els.confirm.disabled = false; return; }
    if (UI.candidateMarker) UI.candidateMarker.setLatLng([lat, lng]);
    else {
      UI.candidateMarker = root.L.marker([lat, lng], { draggable: true, icon: pinIcon("📍", "geo-pin--candidate"), title: "Drag to adjust" }).addTo(map);
      UI.candidateMarker.on("dragend", function () {
        const p = UI.candidateMarker.getLatLng();
        if (!inJordan(p.lat, p.lng)) { help("That spot is outside Jordan."); UI.candidateMarker.setLatLng([UI.candidate.lat, UI.candidate.lng]); return; }
        UI.candidate = { lat: p.lat, lng: p.lng, source: "pin" };
      });
    }
    map.setView([lat, lng], Math.max(map.getZoom(), 14));
    UI.els.confirm.disabled = false;
  }

  function startPicking(message) {
    UI.picking = true;
    openPanel();
    help(message || "Tap “Use my current location”, choose a city, or tap the map to drop a pin. Drag the pin to adjust, then confirm.");
    if (UI.els.panel.scrollIntoView) UI.els.panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function locateMe() {
    if (UI.locating) return;                 // one in-flight request at a time -- no duplicate GPS calls
    startPicking("Finding your location…");
    if (!root.navigator || !root.navigator.geolocation) { help("This browser can't share its location. Choose a city or tap the map instead."); return; }
    if (root.isSecureContext === false) { help("Your browser only shares location on secure pages (https, or localhost when testing). Choose a city or tap the map instead."); return; }
    UI.locating = true;
    if (UI.els.locate) UI.els.locate.disabled = true;
    const done = function () { UI.locating = false; if (UI.els.locate) UI.els.locate.disabled = false; };
    root.navigator.geolocation.getCurrentPosition(function (pos) {
      done();
      const c = pos.coords;
      if (!inJordan(c.latitude, c.longitude)) {
        help("Your device location appears to be outside Jordan. Pick a city or tap the map to explore a place in Jordan.");
        if (UI.map) UI.map.setView([31.3, 36.2], 7);
        return;
      }
      setCandidate(c.latitude, c.longitude, { source: "gps", accuracy: c.accuracy });
      help(c.accuracy > 1500 ? "This is only approximate (±" + Math.round(c.accuracy) + " m). Drag the pin to where you really are, then confirm."
                             : "Is this right? Drag the pin to adjust, then confirm.");
    }, function (err) {
      done();
      const msgs = { 1: "Location permission is required to find places near you. You can enable location access in your browser settings, or choose a city or tap the map instead.",
                     2: "Your location isn't available right now. Choose a city or tap the map instead.",
                     3: "Finding your location took too long. Try again, or choose a city or tap the map." };
      help(msgs[err.code] || msgs[2]);
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 });
  }

  function confirmCandidate() {
    if (!UI.candidate) return;
    const c = UI.candidate;
    state.location = { lat: +c.lat.toFixed(6), lng: +c.lng.toFixed(6), source: c.source || "pin", accuracy: c.accuracy || null, label: c.label || null };
    saveLocation();
    if (UI.candidateMarker && UI.map) { UI.map.removeLayer(UI.candidateMarker); }
    UI.candidateMarker = null; UI.candidate = null; UI.picking = false;
    UI.els.confirm.disabled = true;
    help("Location confirmed. I'll use it to find places near you.");
    drawUser(); updateBar();
    if (UI.map) UI.map.setView([state.location.lat, state.location.lng], 15);
    document.dispatchEvent(new CustomEvent("masar:location-confirmed", { detail: state.location }));
  }

  function clearLocation() {
    state.location = null; saveLocation();
    if (UI.userLayer) UI.userLayer.clearLayers();
    if (UI.candidateMarker && UI.map) UI.map.removeLayer(UI.candidateMarker);
    UI.candidateMarker = null; UI.candidate = null;
    UI.els.confirm.disabled = true;
    help("Your location was forgotten.");
    updateBar();
  }

  function popupFor(p, anchor) {
    const box = el("div", "geo-popup");
    box.appendChild(el("strong", null, (p.n ? p.n + ". " : "") + p.name));
    box.appendChild(el("div", null, p.category + " · " + formatDistance(p.distanceM)));
    const a = el("a", null, "Directions");
    a.href = directionsUrl(p, anchor); a.target = "_blank"; a.rel = "noopener";
    box.appendChild(a);
    return box;
  }

  // Draw a result set on the map and (optionally) highlight one place.
  function showResults(places, anchor, focusId) {
    if (!openPanel() || !UI.map || !places || !places.length) return;
    const L = root.L;
    UI.resultLayer.clearLayers();
    UI.shown = { places: places, anchor: anchor };
    const bounds = [];
    let focusMarker = null, focusPlaceObj = null;
    places.forEach(function (p) {
      const m = L.marker([p.lat, p.lng], { icon: pinIcon(String(p.n || "•"), "geo-pin--result"), title: p.name }).bindPopup(popupFor(p, anchor));
      m.addTo(UI.resultLayer);
      p._marker = m;
      bounds.push([p.lat, p.lng]);
      if (focusId && p.id === focusId) { focusMarker = m; focusPlaceObj = p; }
    });
    if (anchor && anchor.kind === "place") {
      L.marker([anchor.lat, anchor.lng], { icon: pinIcon("⌖", "geo-pin--anchor"), keyboard: false }).bindTooltip(anchor.label).addTo(UI.resultLayer);
      bounds.push([anchor.lat, anchor.lng]);
    }
    if (state.location) bounds.push([state.location.lat, state.location.lng]);
    if (focusMarker) {
      UI.map.setView([focusPlaceObj.lat, focusPlaceObj.lng], 16);
      focusMarker.openPopup();
    } else if (bounds.length) {
      UI.map.fitBounds(bounds, { padding: [36, 36], maxZoom: 16 });
    }
  }

  function initUI() {
    if (typeof document === "undefined") return;
    const panel = $("geo-panel");
    if (!panel || !$("geo-bar")) return;
    UI.els = { bar: $("geo-bar"), status: $("geo-status"), open: $("geo-open"), clear: $("geo-clear"), panel: panel, map: $("geo-map"),
               locate: $("geo-locate"), city: $("geo-city"), confirm: $("geo-confirm"), close: $("geo-close"), help: $("geo-help") };
    UI.ready = true;

    GAZETTEER.filter(function (g) { return g.type === "city" || g.type === "site"; }).forEach(function (g) {
      const o = document.createElement("option"); o.value = g.id; o.textContent = g.name; UI.els.city.appendChild(o);
    });

    UI.els.open.addEventListener("click", function () { startPicking(); });
    UI.els.locate.addEventListener("click", locateMe);
    UI.els.confirm.addEventListener("click", confirmCandidate);
    UI.els.clear.addEventListener("click", clearLocation);
    UI.els.close.addEventListener("click", function () { UI.els.panel.hidden = true; UI.picking = false; });
    UI.els.city.addEventListener("change", function () {
      const g = GAZETTEER.filter(function (x) { return x.id === UI.els.city.value; })[0];
      if (!g) return;
      startPicking();
      setCandidate(g.lat, g.lng, { source: "city", label: g.name });
      if (UI.map) UI.map.setView([g.lat, g.lng], 13);
      help("This is the centre of " + g.name + ". Drag the pin to where you are for more accurate results, then confirm.");
      UI.els.city.value = "";
    });
    updateBar();
  }

  /* ------------------------------------------------------------------
     11. RENDERING inside the speech cloud (textContent only — map data is untrusted)
  ------------------------------------------------------------------ */
  function row(icon, text, cls) {
    const r = el("div", "place-card__row" + (cls ? " " + cls : ""));
    r.appendChild(el("span", "place-card__icon", icon));
    r.appendChild(el("span", null, text));
    return r;
  }

  function buildCard(p, x) {
    const anchor = x.anchor;
    const card = el("article", "place-card");
    const head = el("div", "place-card__head");
    if (p.n) head.appendChild(el("span", "place-card__n", String(p.n)));
    const title = el("div", "place-card__title");
    title.appendChild(el("div", "place-card__name", p.name));
    if (p.altName) title.appendChild(el("div", "place-card__alt", p.altName));
    head.appendChild(title);
    card.appendChild(head);

    card.appendChild(row("📍", p.category));
    if (p.rating != null) card.appendChild(row("⭐", p.rating.toFixed(1) + (p.ratingCount ? " (" + p.ratingCount + ")" : "")));
    const from = !anchor || anchor.kind === "user" ? "away" : "from " + anchor.label;
    card.appendChild(row("📏", formatDistance(p.distanceM) + " " + from));
    if (p.address) card.appendChild(row("📌", p.address));
    if (p.hours || p.openNow != null) {
      const status = p.openNow === true ? (p.hours === "24/7" ? "Open 24 hours" : "Open now") : (p.openNow === false ? "Closed now" : "");
      const raw = p.hours && p.hours !== "24/7" ? (p.hours.length > 70 ? p.hours.slice(0, 67) + "…" : p.hours) : "";
      card.appendChild(row("🕐", [status, raw].filter(Boolean).join(" · "), p.openNow === true ? "is-open" : (p.openNow === false ? "is-closed" : "")));
    }
    if (p.description) card.appendChild(row("📝", p.description));

    const actions = el("div", "place-card__actions");
    const mapBtn = el("button", "btn btn-outline btn-sm", "🗺️ View on map");
    mapBtn.type = "button";
    mapBtn.addEventListener("click", function () { showResults(x.mapPlaces || [p], anchor, p.id); if (UI.els.panel && UI.els.panel.scrollIntoView) UI.els.panel.scrollIntoView({ behavior: "smooth", block: "nearest" }); });
    actions.appendChild(mapBtn);
    const dir = el("a", "btn btn-primary btn-sm", "➡️ Directions");
    dir.href = directionsUrl(p, anchor); dir.target = "_blank"; dir.rel = "noopener";
    actions.appendChild(dir);
    if (p.phone) { const call = el("a", "btn btn-outline btn-sm", "📞 Call"); call.href = "tel:" + p.phone.replace(/[^\d+]/g, ""); actions.appendChild(call); }
    if (p.website) { const web = el("a", "btn btn-outline btn-sm", "🌐 Website"); web.href = p.website; web.target = "_blank"; web.rel = "noopener noreferrer"; actions.appendChild(web); }
    card.appendChild(actions);
    return card;
  }

  function buildEmergency(block) {
    const box = el("div", "emergency-box");
    box.setAttribute("role", "group");
    box.setAttribute("aria-label", "Emergency numbers in Jordan");
    box.appendChild(el("div", "emergency-box__title", "🚨 Emergency numbers in Jordan"));
    const main = el("a", "emergency-box__main", "Call " + EMERGENCY.main.number);
    main.href = "tel:" + EMERGENCY.main.number;
    box.appendChild(main);
    box.appendChild(el("div", "emergency-box__sub", EMERGENCY.main.label + ", free, 24 hours"));
    const list = el("div", "emergency-box__lines");
    EMERGENCY.lines.forEach(function (l) {
      const a = el("a", "emergency-box__line" + (block && block.type === l.key ? " is-key" : ""), l.label + " · " + (l.shown || l.number));
      a.href = "tel:" + l.number;
      list.appendChild(a);
    });
    box.appendChild(list);
    return box;
  }

  function buildLocationPrompt(api) {
    const box = el("div", "geo-prompt");
    const btn = el("button", "btn btn-primary btn-sm", "📍 Confirm my location");
    btn.type = "button";
    btn.addEventListener("click", function () { startPicking(); });
    box.appendChild(btn);
    box.appendChild(el("p", "geo-prompt__hint", "Or just name a place, like “restaurants in Irbid”."));
    return box;
  }

  function renderExtras(cloud, reply, api) {
    const x = reply && reply.extras;
    if (!x) return;
    api = api || {};
    const wrap = cloud.parentElement;
    if (wrap) wrap.classList.add("cloud-wrap--rich");
    const log = typeof document !== "undefined" && document.getElementById("ai-log");
    if (log) log.classList.add("has-rich");

    const box = el("div", "cloud__extras");
    if (x.emergency) box.appendChild(buildEmergency(x.emergency));
    if (x.locationPrompt) box.appendChild(buildLocationPrompt(api));
    (x.groups || []).forEach(function (g) {
      if (g.title) box.appendChild(el("div", "place-group__title", g.title));
      g.places.forEach(function (p) { box.appendChild(buildCard(p, x)); });
    });
    if (x.note) box.appendChild(el("p", "place-note", x.note));
    if (x.suggestions && x.suggestions.length) {
      const chips = el("div", "cloud__chips");
      x.suggestions.forEach(function (s) {
        const b = el("button", "chip", s.label);
        b.type = "button";
        b.addEventListener("click", function () { if (api.ask) api.ask(s.message); });
        chips.appendChild(b);
      });
      box.appendChild(chips);
    }
    cloud.appendChild(box);

    if (x.openPicker) startPicking();
    else if (x.mapPlaces && x.mapPlaces.length) showResults(x.mapPlaces, x.anchor, x.focusId);
  }

  /* ------------------------------------------------------------------
     12. PUBLIC API
  ------------------------------------------------------------------ */
  root.MASAR_GEO = {
    CONFIG: CONFIG,
    handle: handle,
    renderExtras: renderExtras,
    onLocationConfirmed: onLocationConfirmed,
    hasPending: function () { return !!ctx.pending; },
    // Shape the AI/backend integration in ai.js asked for: real confirmed coordinates,
    // reused from state rather than re-requested, or null (never guessed) if unconfirmed.
    getLocation: function () {
      return state.location
        ? { latitude: state.location.lat, longitude: state.location.lng, locationConfirmed: true, source: state.location.source }
        : { locationConfirmed: false };
    },
    _test: { interpret: interpret, norm: norm, parseOpenNow: parseOpenNow, haversine: haversine, formatDistance: formatDistance,
             findPlace: findPlace, ctx: ctx, state: state, findPlaces: findPlaces, buildOverpassQuery: buildOverpassQuery, CATEGORIES: CATEGORIES }
  };

  loadLocation();
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initUI);
    else initUI();
  }
})(typeof window !== "undefined" ? window : globalThis);
