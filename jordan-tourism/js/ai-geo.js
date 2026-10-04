/* ==================================================
   MASAR — Location map for the AI Guide (ai-geo.js)
   - Visitor picks a spot on the map (click, drag, GPS or city list)
   - Confirming it posts a message into the chat
   - The confirmed location is sent to /api/masar-chat automatically
     (server.js already reads `location.city`)
   Needs: Leaflet (loaded before this file in ai.html)
================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "masar_location";

  var CITIES = [
    { name: "Amman", lat: 31.9539, lng: 35.9106 },
    { name: "Zarqa", lat: 32.0728, lng: 36.0876 },
    { name: "Irbid", lat: 32.5556, lng: 35.85 },
    { name: "Mafraq", lat: 32.3406, lng: 36.208 },
    { name: "Jerash", lat: 32.2747, lng: 35.8961 },
    { name: "Ajloun", lat: 32.3326, lng: 35.7517 },
    { name: "Salt", lat: 32.0392, lng: 35.7272 },
    { name: "Madaba", lat: 31.7196, lng: 35.7936 },
    { name: "Dead Sea", lat: 31.559, lng: 35.4732 },
    { name: "Karak", lat: 31.1853, lng: 35.7048 },
    { name: "Tafilah", lat: 30.8375, lng: 35.6042 },
    { name: "Petra (Wadi Musa)", lat: 30.3285, lng: 35.4444 },
    { name: "Ma'an", lat: 30.1962, lng: 35.7341 },
    { name: "Wadi Rum", lat: 29.5764, lng: 35.4195 },
    { name: "Aqaba", lat: 29.5321, lng: 35.0063 },
  ];

  /* rough bounding box of Jordan */
  var BOUNDS = { south: 29.1, north: 33.45, west: 34.85, east: 39.35 };

  var $ = function (id) {
    return document.getElementById(id);
  };

  var statusEl = $("geo-status");
  var openBtn = $("geo-open");
  var clearBtn = $("geo-clear");
  var panel = $("geo-panel");
  var closeBtn = $("geo-close");
  var mapEl = $("geo-map");
  var locateBtn = $("geo-locate");
  var citySelect = $("geo-city");
  var confirmBtn = $("geo-confirm");
  var helpEl = $("geo-help");
  var log = $("ai-log");

  if (!panel || !mapEl || !window.L) {
    if (helpEl)
      helpEl.textContent =
        "The map could not load. Check your internet connection.";
    return;
  }

  var map = null;
  var marker = null;
  var picked = null; // {lat, lng} not yet confirmed
  var confirmed = loadSaved();

  /* ---------- helpers ---------- */
  function loadSaved() {
    try {
      var v = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (v && typeof v.lat === "number" && typeof v.lng === "number") return v;
    } catch (e) {}
    return null;
  }

  function save(loc) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    } catch (e) {}
  }

  function inJordan(lat, lng) {
    return (
      lat >= BOUNDS.south &&
      lat <= BOUNDS.north &&
      lng >= BOUNDS.west &&
      lng <= BOUNDS.east
    );
  }

  function distanceKm(a, b) {
    var R = 6371,
      rad = Math.PI / 180;
    var dLat = (b.lat - a.lat) * rad,
      dLng = (b.lng - a.lng) * rad;
    var h =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a.lat * rad) *
        Math.cos(b.lat * rad) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function nearestCity(lat, lng) {
    var best = CITIES[0],
      bestD = Infinity;
    CITIES.forEach(function (c) {
      var d = distanceKm({ lat: lat, lng: lng }, c);
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    });
    return best.name;
  }

  function setHelp(text) {
    if (helpEl) helpEl.textContent = text || "";
  }

  function updateStatus() {
    if (confirmed) {
      statusEl.textContent = "📍 Location confirmed: " + confirmed.city;
      openBtn.textContent = "Change location";
      clearBtn.hidden = false;
    } else {
      statusEl.textContent = "📍 Location not confirmed";
      openBtn.textContent = "Confirm location";
      clearBtn.hidden = true;
    }
  }

  /* ---------- map ---------- */
  function pinIcon() {
    return L.divIcon({
      className: "geo-pin",
      html: "<span></span>",
      iconSize: [28, 38],
      iconAnchor: [14, 36],
    });
  }

  function initMap() {
    if (map) return;
    map = L.map(mapEl, {
      center: [31.2, 36.2],
      zoom: 7,
      minZoom: 6,
      maxBounds: [
        [28.2, 33.8],
        [34.3, 40.3],
      ],
      maxBoundsViscosity: 0.8,
    });

    /* CARTO raster tiles need the API key from js/config.js (?key=...) */
    var cartoKey = (window.MASAR_ENV && window.MASAR_ENV.CARTO_API_KEY) || "";
    var tileUrl =
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}" +
      (L.Browser.retina ? "@2x" : "") +
      ".png" +
      (cartoKey ? "?key=" + encodeURIComponent(cartoKey) : "");
    if (!cartoKey) {
      setHelp(
        "Map key missing: add CARTO_API_KEY to js/config.js (tiles will show a watermark).",
      );
    }
    L.tileLayer(tileUrl, {
      maxZoom: 18,
      subdomains: "abcd",
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    }).addTo(map);

    map.on("click", function (e) {
      setPick(e.latlng.lat, e.latlng.lng, false);
    });

    if (confirmed) setPick(confirmed.lat, confirmed.lng, true);
  }

  function setPick(lat, lng, fly) {
    if (!inJordan(lat, lng)) {
      setHelp(
        "That spot is outside Jordan. Please pick a place inside Jordan.",
      );
      confirmBtn.disabled = true;
      return;
    }
    picked = { lat: lat, lng: lng };

    if (!marker) {
      marker = L.marker([lat, lng], { icon: pinIcon(), draggable: true }).addTo(
        map,
      );
      marker.on("dragend", function () {
        var p = marker.getLatLng();
        setPick(p.lat, p.lng, false);
      });
    } else {
      marker.setLatLng([lat, lng]);
    }

    if (fly) map.flyTo([lat, lng], 11, { duration: 0.8 });

    confirmBtn.disabled = false;
    setHelp(
      "Selected: near " +
        nearestCity(lat, lng) +
        ". Press “Confirm this location”.",
    );
  }

  /* ---------- panel open / close ---------- */
  function openPanel() {
    panel.hidden = false;
    initMap();
    setTimeout(function () {
      map.invalidateSize();
    }, 50);
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function closePanel() {
    panel.hidden = true;
  }

  /* ---------- chat messages ---------- */
  function addUserBubble(text) {
    if (!log) return;
    var b = document.createElement("div");
    b.className = "bubble-user";
    b.textContent = text;
    log.appendChild(b);
  }

  /* ---------- confirm / forget ---------- */
  function confirmLocation() {
    if (!picked) return;
    var city = nearestCity(picked.lat, picked.lng);
    confirmed = { lat: picked.lat, lng: picked.lng, city: city };
    save(confirmed);
    updateStatus();
    closePanel();

    addUserBubble("📍 I'm near " + city);
    if (log) log.scrollTop = log.scrollHeight;

    /* ai.js listens for this and shows MASAR's thinking cloud + reply,
       using onLocationConfirmed() below to build the answer. */
    document.dispatchEvent(
      new CustomEvent("masar:location-confirmed", { detail: confirmed }),
    );
  }

  function forgetLocation() {
    confirmed = null;
    picked = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    if (marker && map) {
      map.removeLayer(marker);
      marker = null;
    }
    confirmBtn.disabled = true;
    setHelp("");
    updateStatus();
  }

  /* ---------- controls ---------- */
  CITIES.forEach(function (c) {
    var o = document.createElement("option");
    o.value = c.name;
    o.textContent = c.name;
    citySelect.appendChild(o);
  });

  citySelect.addEventListener("change", function () {
    var c = CITIES.filter(function (x) {
      return x.name === citySelect.value;
    })[0];
    if (c) setPick(c.lat, c.lng, true);
  });

  locateBtn.addEventListener("click", function () {
    if (!navigator.geolocation) {
      setHelp("Your browser can't share your location. Click the map instead.");
      return;
    }
    setHelp("Finding your location…");
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        setPick(pos.coords.latitude, pos.coords.longitude, true);
      },
      function () {
        setHelp(
          "Couldn't get your location. Click the map or choose a city instead.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });

  openBtn.addEventListener("click", openPanel);
  closeBtn.addEventListener("click", closePanel);
  confirmBtn.addEventListener("click", confirmLocation);
  clearBtn.addEventListener("click", forgetLocation);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) closePanel();
  });

  /* ---------- API used by ai.js ----------
     getLocation()        -> {city, lat, lng} or null (ai.js sends it to the server)
     handle(msg, ctx)     -> reply object, or null to let the AI answer normally
     renderExtras(...)    -> adds buttons under a cloud when a reply has `extras`
     onLocationConfirmed()-> reply shown right after the visitor confirms a spot */
  var pendingQuestion = null;

  var NEEDS_LOCATION =
    /\b(near me|nearby|nearest|close to me|close by|around me|around here)\b|قريب|أقرب|اقرب|حولي/i;

  function handle(message) {
    if (!message || confirmed || !NEEDS_LOCATION.test(message))
      return Promise.resolve(null);
    pendingQuestion = message;
    return Promise.resolve({
      text: "I'd love to help with that. First, tell me where you are by confirming your location on the map, and then I'll answer.",
      extras: { locationPrompt: true },
    });
  }

  function renderExtras(cloud, reply, ctx) {
    var extras = reply && reply.extras;
    if (!extras) return;
    var box = document.createElement("div");
    box.className = "geo-extras";

    if (extras.locationPrompt) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn btn-primary btn-sm";
      b.textContent = "📍 Confirm my location";
      b.addEventListener("click", openPanel);
      box.appendChild(b);
    }

    (extras.chips || []).forEach(function (q) {
      var c = document.createElement("button");
      c.type = "button";
      c.className = "chip";
      c.textContent = q;
      c.addEventListener("click", function () {
        if (ctx && ctx.ask) ctx.ask(q);
      });
      box.appendChild(c);
    });

    cloud.appendChild(box);
  }

  function onLocationConfirmed() {
    var city = confirmed ? confirmed.city : "your area";
    var reply = {
      text:
        "Got it, you're near " + city + ". What would you like to do or find?",
    };
    if (pendingQuestion) {
      reply = {
        text:
          "Got it, you're near " +
          city +
          ". Want me to answer your earlier question now?",
        extras: { chips: [pendingQuestion] },
      };
      pendingQuestion = null;
    }
    return Promise.resolve(reply);
  }

  window.MASAR_GEO = {
    getLocation: function () {
      return confirmed
        ? { city: confirmed.city, lat: confirmed.lat, lng: confirmed.lng }
        : null;
    },
    handle: handle,
    renderExtras: renderExtras,
    onLocationConfirmed: onLocationConfirmed,
  };

  updateStatus();
})();
