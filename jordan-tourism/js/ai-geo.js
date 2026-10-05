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
    { name: window.I18n.source("text.035"), lat: 31.9539, lng: 35.9106 },
    { name: window.I18n.source("text.611"), lat: 32.0728, lng: 36.0876 },
    { name: window.I18n.source("text.612"), lat: 32.5556, lng: 35.85 },
    { name: window.I18n.source("text.613"), lat: 32.3406, lng: 36.208 },
    { name: window.I18n.source("text.183"), lat: 32.2747, lng: 35.8961 },
    { name: window.I18n.source("text.323"), lat: 32.3326, lng: 35.7517 },
    { name: window.I18n.source("text.326"), lat: 32.0392, lng: 35.7272 },
    { name: window.I18n.source("text.363"), lat: 31.7196, lng: 35.7936 },
    { name: window.I18n.source("text.184"), lat: 31.559, lng: 35.4732 },
    { name: window.I18n.source("text.321"), lat: 31.1853, lng: 35.7048 },
    { name: window.I18n.source("text.614"), lat: 30.8375, lng: 35.6042 },
    { name: window.I18n.source("text.615"), lat: 30.3285, lng: 35.4444 },
    { name: window.I18n.source("text.616"), lat: 30.1962, lng: 35.7341 },
    { name: window.I18n.source("text.181"), lat: 29.5764, lng: 35.4195 },
    { name: window.I18n.source("text.182"), lat: 29.5321, lng: 35.0063 },
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
    if (helpEl) helpEl.textContent = window.I18n.source("text.617");
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
      statusEl.textContent = window.I18n.t("geo.confirmed", {
        city: window.I18n.translateText(confirmed.city),
      });
      openBtn.textContent = window.I18n.source("text.619");
      clearBtn.hidden = false;
    } else {
      statusEl.textContent = window.I18n.source("text.023");
      openBtn.textContent = window.I18n.source("text.024");
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
      attribution: window.I18n.source("text.620"),
    }).addTo(map);

    map.on("click", function (e) {
      setPick(e.latlng.lat, e.latlng.lng, false);
    });

    if (confirmed) setPick(confirmed.lat, confirmed.lng, true);
  }

  function setPick(lat, lng, fly) {
    if (!inJordan(lat, lng)) {
      setHelp(window.I18n.source("text.621"));
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
      window.I18n.t("geo.selected", {
        city: window.I18n.translateText(nearestCity(lat, lng)),
      }),
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

    addUserBubble(
      window.I18n.t("geo.near", { city: window.I18n.translateText(city) }),
    );
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
      setHelp(window.I18n.source("text.624"));
      return;
    }
    setHelp(window.I18n.source("text.625"));
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        setPick(pos.coords.latitude, pos.coords.longitude, true);
      },
      function () {
        setHelp(window.I18n.source("text.626"));
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
      text: window.I18n.source("text.627"),
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
      b.textContent = window.I18n.source("text.629");
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
    var city = confirmed ? confirmed.city : window.I18n.source("text.630");
    var reply = {
      text: window.I18n.t("geo.reply", {
        city: window.I18n.translateText(city),
      }),
    };
    if (pendingQuestion) {
      reply = {
        text: window.I18n.t("geo.previous", {
          city: window.I18n.translateText(city),
        }),
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
