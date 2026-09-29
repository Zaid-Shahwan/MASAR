/* ==========================================================================
   MASAR — optional places proxy (EXAMPLE, not used unless you switch to it)

   Why: Google Places returns ratings, price levels and live opening status, which
   OpenStreetMap does not. The secret key must stay on a server, so the browser
   calls THIS file, and this file calls Google.

   Setup
     1. Enable "Places API (New)" in Google Cloud and create a key.
        Restrict the key to that API (and to your server's IP).
     2. Run:  GOOGLE_MAPS_API_KEY=your_key node places-proxy.example.js
        (Node 18+, no dependencies.)
     3. In jordan-tourism/js/ai-geo.js set  CONFIG.provider = "backend"
        and CONFIG.backendUrl to this server's /api/places URL.
     4. Serve the site and this endpoint from the same origin (or add CORS).

   Contract (what ai-geo.js expects):
     GET /api/places?lat=..&lng=..&category=restaurant[&cuisine=..][&budget=..]
     -> { "places": [ { id, name, category, lat, lng, distanceM, address, rating,
                        ratingCount, openNow, hours, phone, website, description } ] }
   ========================================================================== */
"use strict";
const http = require("http");

const KEY = process.env.GOOGLE_MAPS_API_KEY;
const PORT = process.env.PORT || 8787;
if (!KEY) { console.error("Set GOOGLE_MAPS_API_KEY first."); process.exit(1); }

// MASAR category id -> Google place types. Check the current list ("Table A" in Google's docs);
// a type Google doesn't know is rejected, so adjust here if a category returns an error.
const TYPES = {
  restaurant: ["restaurant"], cafe: ["cafe"], fast_food: ["fast_food_restaurant"], dessert: ["dessert_shop", "ice_cream_shop"],
  hotel: ["lodging"], attraction: ["tourist_attraction"], museum: ["museum"], historic: ["historical_landmark"],
  park: ["park"], hospital: ["hospital"], clinic: ["doctor"], pharmacy: ["pharmacy"], police: ["police"],
  fire_station: ["fire_station"], embassy: ["embassy"], bank: ["bank"], atm: ["atm"], fuel: ["gas_station"],
  supermarket: ["supermarket"], mall: ["shopping_mall"], shopping: ["shopping_mall"], university: ["university"],
  car_rental: ["car_rental"], transport: ["bus_station", "transit_station", "taxi_stand"], beach: ["beach"]
};
const RADIUS = { restaurant: 2000, cafe: 2000, fast_food: 2000, pharmacy: 3000, atm: 2000, bank: 3000, fuel: 5000 };

const FIELDS = ["places.id", "places.displayName", "places.formattedAddress", "places.location", "places.rating",
  "places.userRatingCount", "places.currentOpeningHours", "places.nationalPhoneNumber", "places.websiteUri",
  "places.editorialSummary", "places.primaryTypeDisplayName", "places.priceLevel"].join(",");

function distance(a, b, c, d) {
  const r = Math.PI / 180, R = 6371000, x = (c - a) * r, y = (d - b) * r;
  const h = Math.sin(x / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(y / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname !== "/api/places") { res.writeHead(404); return res.end(); }
  try {
    const lat = parseFloat(url.searchParams.get("lat")), lng = parseFloat(url.searchParams.get("lng"));
    const category = url.searchParams.get("category");
    if (!isFinite(lat) || !isFinite(lng) || !TYPES[category]) { res.writeHead(400); return res.end("bad request"); }

    const g = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": FIELDS },
      body: JSON.stringify({
        includedTypes: TYPES[category], maxResultCount: 20, rankPreference: "DISTANCE",
        locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius: RADIUS[category] || 10000 } }
      })
    });
    if (!g.ok) { res.writeHead(502); return res.end("upstream error " + g.status); }
    const data = await g.json();

    const places = (data.places || []).map((p) => ({
      id: p.id, name: p.displayName && p.displayName.text, category: p.primaryTypeDisplayName && p.primaryTypeDisplayName.text,
      lat: p.location.latitude, lng: p.location.longitude,
      distanceM: distance(lat, lng, p.location.latitude, p.location.longitude),
      address: p.formattedAddress, rating: p.rating, ratingCount: p.userRatingCount,
      openNow: p.currentOpeningHours && p.currentOpeningHours.openNow,
      hours: null,
      phone: p.nationalPhoneNumber, website: p.websiteUri, description: p.editorialSummary && p.editorialSummary.text
    }));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ places, radius: RADIUS[category] || 10000 }));
  } catch (e) {
    res.writeHead(500); res.end("server error");
  }
}).listen(PORT, () => console.log("places proxy on :" + PORT));
