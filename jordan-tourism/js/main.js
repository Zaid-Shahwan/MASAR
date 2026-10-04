(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  if (header) {
    const hasHero = document.querySelector(".hero");
    const setNavState = () => {
      if (!hasHero || window.scrollY > 72) {
        header.classList.add("is-solid");
        header.classList.remove("is-transparent");
      } else {
        header.classList.add("is-transparent");
        header.classList.remove("is-solid");
      }
    };

    setNavState();
    window.addEventListener("scroll", setNavState, { passive: true });
  }

  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");
  if (hamburger && mobileMenu) {
    const closeMenu = () => {
      hamburger.setAttribute("aria-expanded", "false");
      mobileMenu.classList.remove("is-open");
      document.body.style.overflow = "";
    };

    const openMenu = () => {
      hamburger.setAttribute("aria-expanded", "true");
      mobileMenu.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };

    hamburger.addEventListener("click", () => {
      const isOpen = hamburger.getAttribute("aria-expanded") === "true";
      isOpen ? closeMenu() : openMenu();
    });

    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", closeMenu)
    );

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  const revealTargets = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealTargets.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  
  const IMG = {
    petra: "https://commons.wikimedia.org/wiki/Special:FilePath/Al-Khazneh_(The_Treasury),_Petra,_Jordan.jpg",
    petra2: "https://commons.wikimedia.org/wiki/Special:FilePath/Al-Khazneh_(The_Treasury)_2,_Petra,_Jordan.jpg",
    wadirum: "https://commons.wikimedia.org/wiki/Special:FilePath/Wadi_Rum_BW_27.JPG",
    wadirum2: "https://commons.wikimedia.org/wiki/Special:FilePath/Wadi_Rum_BW_16.JPG",
    amman: "https://commons.wikimedia.org/wiki/Special:FilePath/Amman_Citadel.jpg",
    ammanDowntown: "https://commons.wikimedia.org/wiki/Special:FilePath/AmmanDowntown.jpg",
    deadsea: "https://commons.wikimedia.org/wiki/Special:FilePath/Dead_Sea_by_David_Shankbone.jpg",
    jerash: "https://commons.wikimedia.org/wiki/Special:FilePath/Jerash_City.jpg",
    aqaba: "https://commons.wikimedia.org/wiki/Special:FilePath/Aqaba_BW_2.JPG",
  };

  const EXPERIENCES = [
    {
      id: "petra-explorer",
      name: "Petra Explorer",
      location: "petra",
      interests: ["history", "culture", "photography"],
      time: "1-day",
      walking: "active",
      budget: "moderate",
      image: IMG.petra,
      duration: "Full day",
      budgetLabel: "25–40 JOD",
      description:
        "Walk the Siq at first light and watch the Treasury reveal itself, then wander past the Royal Tombs with a local guide who knows where the crowds aren't.",
      tags: ["History", "Culture", "Photography"],
      highlights: [
        "Enter through the Siq before the tour buses arrive",
        "Meet a Bedouin family running tea stalls inside the site",
        "Climb to a quiet viewpoint above the Treasury",
      ],
    },
    {
      id: "petra-by-night",
      name: "Petra at Golden Hour",
      location: "petra",
      interests: ["photography", "history", "relaxation"],
      time: "few-hours",
      walking: "some",
      budget: "moderate",
      image: IMG.petra2,
      duration: "3 hours",
      budgetLabel: "15–25 JOD",
      description:
        "A shorter, slower visit timed for the light — the Siq glows rose-gold in late afternoon and the crowds thin out fast.",
      tags: ["Photography", "History"],
      highlights: [
        "Best light for photos, roughly 4pm onward",
        "Easy pace, minimal climbing required",
        "Finish with mint tea across from the Treasury",
      ],
    },
    {
      id: "little-petra",
      name: "Little Petra & Bedouin Village",
      location: "petra",
      interests: ["history", "culture", "adventure"],
      time: "half-day",
      walking: "active",
      budget: "budget",
      image: IMG.petra,
      duration: "4 hours",
      budgetLabel: "10–18 JOD",
      description:
        "Skip the crowds at Siq al-Barid, Petra's quieter sibling, then share a meal with a Bedouin family in the surrounding hills.",
      tags: ["History", "Culture", "Adventure"],
      highlights: [
        "Explore carved facades with almost nobody around",
        "Learn how caravan traders once used this route",
        "Share flatbread baked in a saj oven",
      ],
    },
    {
      id: "wadi-rum-adventure",
      name: "Wadi Rum Desert Adventure",
      location: "wadi-rum",
      interests: ["adventure", "nature", "photography"],
      time: "1-day",
      walking: "very-active",
      budget: "premium",
      image: IMG.wadirum,
      duration: "Full day",
      budgetLabel: "45–70 JOD",
      description:
        "4x4 across the red dunes, a scramble up a rock bridge, and sandboarding before sunset paints the mountains copper.",
      tags: ["Adventure", "Nature", "Photography"],
      highlights: [
        "Jeep route through Khazali Canyon and the dunes",
        "Climb Burdah Rock Bridge with a Bedouin guide",
        "Watch sunset from the top of a sand dune",
      ],
    },
    {
      id: "wadi-rum-night",
      name: "Wadi Rum Bedouin Night",
      location: "wadi-rum",
      interests: ["culture", "relaxation", "nature"],
      time: "2-3-days",
      walking: "minimal",
      budget: "moderate",
      image: IMG.wadirum2,
      duration: "Overnight",
      budgetLabel: "35–55 JOD",
      description:
        "Sleep under more stars than you knew existed, after a zarb dinner cooked in a pit beneath the sand.",
      tags: ["Culture", "Relaxation", "Nature"],
      highlights: [
        "Zarb dinner, slow-cooked underground",
        "Storytelling and music around the fire",
        "Sunrise tea outside your tent",
      ],
    },
    {
      id: "wadi-rum-sunrise",
      name: "Wadi Rum Sunrise Hike",
      location: "wadi-rum",
      interests: ["adventure", "nature", "photography"],
      time: "few-hours",
      walking: "very-active",
      budget: "budget",
      image: IMG.wadirum,
      duration: "3 hours",
      budgetLabel: "12–20 JOD",
      description:
        "An early scramble up a sandstone ridge for a sunrise that turns the whole valley pink, then breakfast with a Bedouin family.",
      tags: ["Adventure", "Nature", "Photography"],
      highlights: [
        "Meet your guide before dawn",
        "Moderate scramble, no climbing experience needed",
        "Bedouin breakfast overlooking the valley",
      ],
    },
    {
      id: "amman-food-culture",
      name: "Amman Food & Culture Walk",
      location: "amman",
      interests: ["food", "culture", "history"],
      time: "half-day",
      walking: "some",
      budget: "budget",
      image: IMG.ammanDowntown,
      duration: "3.5 hours",
      budgetLabel: "8–15 JOD",
      description:
        "Downtown's gold souk, spice stalls and the best knafeh in the city, with stops at a Roman theatre along the way.",
      tags: ["Food", "Culture", "History"],
      highlights: [
        "Taste knafeh at a decades-old sweet shop",
        "Browse the gold and spice souks",
        "Stand inside the 2nd-century Roman Theatre",
      ],
    },
    {
      id: "amman-different-side",
      name: "A Different Side of Amman",
      location: "amman",
      interests: ["culture", "nightlife", "food"],
      time: "half-day",
      walking: "some",
      budget: "moderate",
      image: IMG.ammanDowntown,
      duration: "4 hours",
      budgetLabel: "15–25 JOD",
      description:
        "Rainbow Street cafés, independent art spaces and a rooftop dinner with a view over the seven hills.",
      tags: ["Culture", "Nightlife", "Food"],
      highlights: [
        "Coffee at a family-run Rainbow Street café",
        "Browse a local design and print studio",
        "Rooftop dinner as the city lights come on",
      ],
    },
    {
      id: "amman-family-trail",
      name: "Amman Family Discovery Trail",
      location: "amman",
      interests: ["family", "culture", "food"],
      time: "half-day",
      walking: "minimal",
      budget: "budget",
      image: IMG.amman,
      duration: "3 hours",
      budgetLabel: "10–18 JOD",
      description:
        "An easy citadel visit, a hands-on mosaic craft stop, and ice cream on the way back down — built for travelling with kids.",
      tags: ["Family", "Culture", "Food"],
      highlights: [
        "Short, shaded walk around the Citadel ruins",
        "Try a 20-minute mosaic workshop",
        "Finish with Amman's best booza (ice cream)",
      ],
    },
    {
      id: "artisan-studio",
      name: "Artisan Pottery & Mosaic Studio",
      location: "amman",
      interests: ["culture", "family", "food"],
      time: "few-hours",
      walking: "minimal",
      budget: "moderate",
      image: IMG.ammanDowntown,
      duration: "2.5 hours",
      budgetLabel: "18–28 JOD",
      description:
        "Sit at the wheel with a third-generation potter and take home something you shaped with your own hands.",
      tags: ["Culture", "Family", "Food"],
      highlights: [
        "Hands-on pottery lesson with a local maker",
        "Mint tea and sweets while pieces dry",
        "Take your piece home, fired and packed",
      ],
    },
    {
      id: "dead-sea-float",
      name: "Dead Sea Float & Spa",
      location: "dead-sea",
      interests: ["relaxation", "nature", "family"],
      time: "half-day",
      walking: "minimal",
      budget: "premium",
      image: IMG.deadsea,
      duration: "4 hours",
      budgetLabel: "30–60 JOD",
      description:
        "Float in the saltiest water on earth, cover yourself in mineral mud, then rinse off with a view over the lowest point on the planet.",
      tags: ["Relaxation", "Nature", "Family"],
      highlights: [
        "Guided first float — trickier than it looks",
        "Free access to mineral mud stations",
        "Sunset views across to the West Bank hills",
      ],
    },
    {
      id: "aqaba-dive",
      name: "Aqaba Red Sea Discovery",
      location: "aqaba",
      interests: ["adventure", "nature", "photography"],
      time: "1-day",
      walking: "some",
      budget: "premium",
      image: IMG.aqaba,
      duration: "Full day",
      budgetLabel: "40–65 JOD",
      description:
        "Snorkel or dive over coral reefs and a sunken tank, then eat fresh-grilled fish on the beach as the sun drops behind Eilat.",
      tags: ["Adventure", "Nature", "Photography"],
      highlights: [
        "Boat trip to two reef sites",
        "Beginner-friendly, gear included",
        "Grilled fish lunch on the shore",
      ],
    },
    {
      id: "aqaba-sunset-sail",
      name: "Aqaba Sunset Sail",
      location: "aqaba",
      interests: ["relaxation", "nightlife", "nature"],
      time: "few-hours",
      walking: "minimal",
      budget: "moderate",
      image: IMG.aqaba,
      duration: "2.5 hours",
      budgetLabel: "20–35 JOD",
      description:
        "A slow boat out on the Gulf of Aqaba, four countries visible at once, and dinner back on the marina.",
      tags: ["Relaxation", "Nightlife", "Nature"],
      highlights: [
        "See Jordan, Israel, Egypt and Saudi Arabia at once",
        "Swim stop weather permitting",
        "Marina dinner recommendation included",
      ],
    },
    {
      id: "jerash-roman-walk",
      name: "Jerash Roman Time Walk",
      location: "jerash",
      interests: ["history", "culture", "photography"],
      time: "half-day",
      walking: "active",
      budget: "budget",
      image: IMG.jerash,
      duration: "3.5 hours",
      budgetLabel: "10–20 JOD",
      description:
        "One of the best-preserved Roman cities anywhere, from Hadrian's Arch to the columned Oval Plaza — usually with hardly a crowd in sight.",
      tags: ["History", "Culture", "Photography"],
      highlights: [
        "Walk the full Cardo colonnaded street",
        "Stand at the centre of the Oval Plaza",
        "Catch a chariot-race re-enactment if timed right",
      ],
    },
  ];

  /* ===== More places across Jordan (added) ===== */
  const LOCATION_NAMES = {
    amman: "Amman", petra: "Petra", "wadi-rum": "Wadi Rum", aqaba: "Aqaba", "dead-sea": "Dead Sea", jerash: "Jerash",
    madaba: "Madaba & Mount Nebo", karak: "Karak", shobak: "Shobak", ajloun: "Ajloun", "umm-qais": "Umm Qais",
    pella: "Pella", salt: "Salt", dana: "Dana", "wadi-mujib": "Wadi Mujib", azraq: "Azraq",
    "baptism-site": "Baptism Site (Al-Maghtas)", anywhere: "Across Jordan",
  };

  // Photos for these are looked up on Wikipedia at runtime (see resolveImage); `image` is the fallback.
  const wikiCache = {};
  function resolveImage(exp, imgEl) {
    if (!exp.wiki || !imgEl) return;
    imgEl.onerror = function () { imgEl.onerror = null; imgEl.src = exp.image; };
    if (exp._resolved) { imgEl.src = exp._resolved; return; }
    if (wikiCache[exp.wiki] === undefined) {
      wikiCache[exp.wiki] = fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(exp.wiki))
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          const t = d && d.thumbnail && d.thumbnail.source;
          return t ? t.replace(/\/\d+px-/, "/960px-") : null;
        })
        .catch(() => null);
    }
    wikiCache[exp.wiki].then((src) => { if (src) { exp._resolved = src; imgEl.src = src; } });
  }

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  function X(id, name, location, wiki, fb, interests, time, walking, budget, duration, description, highlights) {
    return {
      id, name, location, wiki, image: fb, interests, time, walking, budget, duration,
      budgetLabel: "check current prices", description,
      tags: interests.slice(0, 3).map(cap), highlights,
    };
  }

  EXPERIENCES.push(
    X("petra-monastery-trek", "Petra Monastery & High Place Trek", "petra", "Ad_Deir", IMG.petra2,
      ["adventure", "history", "photography"], "1-day", "very-active", "moderate", "Full day",
      "Climb the rock-cut stairway to the Monastery, then take in the wide views from the High Place of Sacrifice trail.",
      ["Climb the long stairway up to Ad Deir", "Rest at a viewpoint with desert views", "Start early to beat the heat"]),

    X("dead-sea-resort-day", "Dead Sea Float & Spa Day", "dead-sea", "Dead_Sea", IMG.deadsea,
      ["relaxation", "family", "nature"], "half-day", "minimal", "premium", "5 hours",
      "Float in the saltiest water you will ever swim in, coat yourself in mineral mud and unwind by the lowest point on land.",
      ["Float effortlessly in the Dead Sea", "Try the mineral mud", "Relax at a resort pool or spa"]),

    X("aqaba-snorkel", "Red Sea Snorkel & Glass-Bottom Boat", "aqaba", "Aqaba", IMG.aqaba,
      ["nature", "family", "relaxation"], "half-day", "minimal", "moderate", "4 hours",
      "Drift over the coral reefs of the Gulf of Aqaba by boat or with a mask and snorkel, with no experience needed.",
      ["Snorkel over colorful reefs", "See the reef from a glass-bottom boat", "Swim and sunbathe on the Red Sea coast"]),

    X("aqaba-old-town", "Aqaba Fort & Seafront Walk", "aqaba", "Aqaba_Fort", IMG.aqaba,
      ["food", "culture", "history"], "few-hours", "some", "budget", "3 hours",
      "Visit Aqaba Fort, wander the town centre and finish with a meal by the sea.",
      ["Explore Aqaba Fort", "Stroll the seafront at sunset", "Eat fresh seafood in town"]),

    X("jerash-local-guide", "Jerash with a Local Guide", "jerash", "Jerash", IMG.jerash,
      ["history", "culture", "food"], "1-day", "active", "moderate", "Full day",
      "Go beyond the columns: a guide brings the temples, theatres and streets of Jerash to life, followed by a local lunch.",
      ["Hear the stories behind the Temple of Artemis", "Walk the colonnaded main street", "Have lunch at a local restaurant nearby"]),

    X("amman-roman-citadel", "Amman Citadel & Roman Theatre", "amman", "Roman_Theatre_(Amman)", IMG.amman,
      ["history", "culture", "family"], "few-hours", "some", "budget", "3 hours",
      "Climb the Citadel hill for city views, then walk down to the Roman Theatre in the heart of downtown.",
      ["Explore the Temple of Hercules on the Citadel", "See the Roman Theatre downtown", "Finish with coffee in the old market"]),

    X("madaba-mosaics", "Madaba Mosaics & Old Town", "madaba", "Madaba", IMG.ammanDowntown,
      ["history", "culture", "photography"], "few-hours", "some", "budget", "3 hours",
      "Known as the City of Mosaics, Madaba keeps a famous Byzantine mosaic map of the Holy Land on the floor of St George's Church.",
      ["See the Byzantine mosaic map at St George's Church", "Visit a mosaic workshop", "Wander the old town streets"]),

    X("mount-nebo-view", "Mount Nebo Viewpoint", "madaba", "Mount_Nebo", IMG.deadsea,
      ["history", "nature", "photography"], "half-day", "some", "budget", "3 hours",
      "Stand where tradition says Moses looked out over the Promised Land, with sweeping views of the Jordan Valley and Dead Sea.",
      ["Take in the panorama over the valley and Dead Sea", "Visit the memorial church and its mosaics", "Time it for late afternoon light"]),

    X("main-hot-springs", "Ma'in Hot Springs Soak", "madaba", "Hammamat_Ma'in", IMG.deadsea,
      ["relaxation", "nature", "family"], "half-day", "minimal", "moderate", "4 hours",
      "Soak in naturally hot waterfalls and pools set in a desert valley near Madaba.",
      ["Relax in warm mineral pools", "Walk up to the hot waterfalls", "Combine it with a Dead Sea day"]),

    X("karak-castle", "Karak Castle & Town", "karak", "Kerak_Castle", IMG.wadirum,
      ["history", "culture", "photography"], "half-day", "active", "budget", "4 hours",
      "Explore a large Crusader-era castle on a hilltop, with long vaulted corridors and views over the surrounding valleys.",
      ["Wander the vaulted halls and passages", "Look out over the countryside from the walls", "Try a local meal in Karak town"]),

    X("kings-highway-trip", "King's Highway Road Trip", "karak", "King's_Highway_(Transjordan)", IMG.wadirum,
      ["history", "adventure", "photography"], "2-3-days", "some", "moderate", "2-3 days",
      "Follow the ancient route that links Madaba, Karak, Shobak and Petra, stopping at castles and canyon viewpoints along the way.",
      ["Stop at Madaba, Karak and Shobak", "Drive past dramatic canyon viewpoints", "End the trip in Petra"]),

    X("shobak-castle", "Shobak Crusader Castle", "shobak", "Shobak_Castle", IMG.wadirum,
      ["history", "photography", "adventure"], "few-hours", "active", "budget", "2-3 hours",
      "Visit the Crusader fortress of Shobak, perched on a hill between Karak and Petra and often much quieter than the big sites.",
      ["Explore the ruined fortress", "Take in the views over the valley", "Pair it with a visit to Petra"]),

    X("ajloun-castle-forest", "Ajloun Castle & Forest Trails", "ajloun", "Ajloun_Castle", IMG.jerash,
      ["history", "nature", "family"], "half-day", "some", "budget", "4 hours",
      "Visit a hilltop castle from the Ayyubid era, then walk among the oak and pine woods of northern Jordan.",
      ["Climb through the castle's halls and towers", "See the Jordan Valley from the top", "Walk a forest trail in the hills"]),

    X("umm-qais-sunset", "Umm Qais (Gadara) at Sunset", "umm-qais", "Umm_Qais", IMG.jerash,
      ["history", "photography", "nature"], "half-day", "some", "budget", "3-4 hours",
      "Explore the ancient ruins of Gadara, including a theatre of black basalt, with views across to the Sea of Galilee and the Golan Heights.",
      ["See the black basalt theatre", "Walk the old colonnaded street", "Watch the sunset over the valley"]),

    X("pella-ruins", "Pella Hilltop Ruins", "pella", "Pella,_Jordan", IMG.jerash,
      ["history", "nature", "family"], "half-day", "some", "budget", "3 hours",
      "Explore the remains of Pella, one of the ancient Decapolis cities, overlooking the Jordan Valley and usually a quiet visit.",
      ["Walk among ruins from many different eras", "Enjoy valley views from the hill", "Bring water, shade is limited"]),

    X("salt-old-town", "Salt Old Town Walk", "salt", "As-Salt", IMG.ammanDowntown,
      ["culture", "history", "food"], "few-hours", "some", "budget", "3 hours",
      "Walk the hillside streets of Salt, known for its Ottoman-era stone buildings and listed as a UNESCO World Heritage site.",
      ["Admire the old limestone houses", "Browse the local market", "Stop for tea or coffee with the locals"]),

    X("dana-hike", "Dana Reserve Day Hike", "dana", "Dana_Biosphere_Reserve", IMG.wadirum2,
      ["nature", "adventure", "photography"], "1-day", "active", "moderate", "Full day",
      "Hike trails in Jordan's largest nature reserve, with sweeping views over Wadi Dana, best done with a local guide.",
      ["Walk a marked reserve trail", "Look for wildlife and wildflowers (season permitting)", "Spend time in the village of Dana"]),

    X("dana-feynan-trek", "Dana to Feynan Trek & Eco-lodge", "dana", "Feynan_Ecolodge", IMG.wadirum2,
      ["adventure", "nature", "relaxation"], "2-3-days", "very-active", "premium", "2-3 days",
      "A guided trek down from the highlands into the desert valley of Feynan, with a night at a remote eco-lodge.",
      ["Trek with a local guide", "Stay overnight at an eco-lodge", "Enjoy a night sky with very little light"]),

    X("wadi-mujib-siq", "Wadi Mujib Siq Trail", "wadi-mujib", "Wadi_Mujib", IMG.deadsea,
      ["adventure", "nature", "family"], "half-day", "very-active", "moderate", "3-4 hours",
      "Wade and scramble through a narrow gorge on a water trail that is usually open only in the warmer months, so check before you go.",
      ["Wade through cool water between canyon walls", "Wear water shoes and bring a change of clothes", "Check seasonal opening and flooding"]),

    X("azraq-wetland-castle", "Azraq Wetland & Desert Castle", "azraq", "Azraq_Wetland_Reserve", IMG.wadirum2,
      ["nature", "history", "family"], "half-day", "some", "budget", "4 hours",
      "Visit an oasis in the eastern desert known for birdlife, then see the black basalt fortress that T. E. Lawrence used as a base.",
      ["Walk the wetland reserve", "Look for birds, especially during migration seasons", "Explore the basalt castle"]),

    X("baptism-site-visit", "Baptism Site (Al-Maghtas) Visit", "baptism-site", "Al-Maghtas", IMG.deadsea,
      ["history", "culture", "relaxation"], "few-hours", "some", "budget", "3 hours",
      "Visit the UNESCO-listed site on the east bank of the Jordan River, traditionally linked to the baptism of Jesus.",
      ["Walk the site with a guide", "See the Jordan River up close", "Combine it with a Dead Sea stop"]),

    X("umm-qais-lunch", "Umm Qais Ruins & Lunch with a View", "umm-qais", "Umm_Qais", IMG.jerash,
      ["culture", "food", "history"], "few-hours", "minimal", "budget", "3 hours",
      "A slower visit: a stroll through the Gadara ruins, then a meal at a local restaurant overlooking the valley.",
      ["Walk the main ruins at an easy pace", "Enjoy the view across to the Sea of Galilee", "Have lunch at a local restaurant"]),

    X("pella-valley-day", "Pella & Jordan Valley Day Out", "pella", "Pella,_Jordan", IMG.jerash,
      ["history", "food", "family"], "1-day", "some", "budget", "Full day",
      "Combine the hilltop ruins of Pella with a drive through the farmland of the Jordan Valley.",
      ["Explore the ruins of Pella", "Drive through the fertile Jordan Valley", "Stop for a simple local meal"]),

    X("salt-market-food", "Salt Market & Local Bites", "salt", "As-Salt", IMG.ammanDowntown,
      ["food", "culture", "family"], "few-hours", "minimal", "budget", "2-3 hours",
      "Taste your way through Salt's market streets and cafes, an easy half-day from Amman.",
      ["Sample local snacks at market stalls", "Sit for tea or coffee in the old town", "Pick up local sweets to take home"]),

    X("shobak-photo-walk", "Shobak Castle Photo Walk", "shobak", "Shobak_Castle", IMG.wadirum,
      ["photography", "history", "nature"], "few-hours", "some", "budget", "2 hours",
      "A short, photogenic visit to the hilltop castle, best in the soft light of early morning or late afternoon.",
      ["Frame the castle against the hills", "Shoot the valley views from the walls", "Go early or late for better light"]),

    X("ajloun-forest-walk", "Ajloun Forest Reserve Walk", "ajloun", "Ajloun_Forest_Reserve", IMG.jerash,
      ["nature", "family", "adventure"], "half-day", "active", "moderate", "4 hours",
      "Walk the trails of Ajloun's wooded hills, with oak trees, wildflowers in season and fresh air far from the city.",
      ["Hike a marked forest trail", "Look for wildflowers in spring", "Bring water and sturdy shoes"]),

    X("baptism-dead-sea-day", "Baptism Site & Dead Sea Day", "baptism-site", "Al-Maghtas", IMG.deadsea,
      ["history", "relaxation", "culture"], "1-day", "some", "moderate", "Full day",
      "Start at the Baptism Site on the Jordan River, then head to the Dead Sea for a float and some rest.",
      ["Guided walk at the Baptism Site", "Float in the Dead Sea", "Relax by the shore in the afternoon"]),

    X("azraq-desert-castles", "Desert Castles Loop", "azraq", "Desert_castles", IMG.wadirum2,
      ["history", "adventure", "photography"], "1-day", "some", "moderate", "Full day",
      "Drive a loop through the eastern desert to see Umayyad-era desert castles, such as Qasr Amra and Qasr Kharana.",
      ["Visit Qasr Amra and Qasr Kharana", "Stop at Azraq Castle", "Drive through open desert scenery"]),

    X("mujib-dead-sea-road", "Mujib Gorge Viewpoints & Dead Sea Road", "wadi-mujib", "Wadi_Mujib", IMG.deadsea,
      ["nature", "photography", "relaxation"], "few-hours", "minimal", "budget", "2-3 hours",
      "A relaxed alternative to the water trail: stop at viewpoints along the Dead Sea road near the Mujib gorge.",
      ["Take in views of the gorge and the Dead Sea", "Easy stops with almost no walking", "Good for photos in the morning light"]),

    X("classic-jordan-3days", "Classic Jordan in 3 Days", "anywhere", "Jordan", IMG.petra,
      ["history", "adventure", "photography"], "2-3-days", "active", "moderate", "3 days",
      "A first-time route linking the big names: start in Amman, spend a day in Petra, and finish in Wadi Rum.",
      ["Day 1: Amman or Jerash", "Day 2: Petra", "Day 3: Wadi Rum"]),

    X("north-jordan-loop", "Northern Jordan Loop", "anywhere", "Ajloun", IMG.jerash,
      ["history", "nature", "culture"], "2-3-days", "some", "moderate", "2-3 days",
      "A relaxed loop through the green north: Roman Jerash, the castle at Ajloun and the views at Umm Qais.",
      ["Jerash ruins", "Ajloun Castle and forest", "Umm Qais at sunset"]),

    X("jordan-in-a-week", "Jordan in a Week", "anywhere", "Jordan", IMG.petra2,
      ["history", "adventure", "relaxation"], "week-plus", "active", "premium", "7+ days",
      "A full week from north to south: Amman, Jerash, Madaba, the Dead Sea, Karak, Petra, Wadi Rum and Aqaba.",
      ["Roman ruins in the north", "Castles and canyons along the way", "Desert and Red Sea to finish"])
  );
  /* ===== end of added places ===== */

  const TIME_ORDER = ["few-hours", "half-day", "1-day", "2-3-days", "week-plus"];
  const WALK_ORDER = ["minimal", "some", "active", "very-active"];
  const BUDGET_ORDER = ["budget", "moderate", "premium", "luxury"];

  function distanceScore(order, a, b, weight) {
    if (!a || !b) return 0;
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia === -1 || ib === -1) return 0;
    const d = Math.abs(ia - ib);
    return Math.max(0, weight - d * (weight / (order.length - 1)));
  }

  function scoreExperience(exp, answers) {
    let score = 0;
    let max = 0;

    max += 35;
    if (answers.location) {
      if (answers.location === "anywhere" || exp.location === answers.location) {
        score += 35;
      } else if (exp.location === "anywhere") {
        score += 22; // multi-stop routes fit any starting point
      }
    }

    max += 30;
    if (answers.interests && answers.interests.length) {
      const overlap = exp.interests.filter((i) => answers.interests.includes(i)).length;
      score += Math.min(30, overlap * 12);
    }

    max += 15;
    score += distanceScore(TIME_ORDER, answers.time, exp.time, 15);

    max += 10;
    score += distanceScore(WALK_ORDER, answers.walking, exp.walking, 10);

    max += 10;
    score += distanceScore(BUDGET_ORDER, answers.budget, exp.budget, 10);

    return Math.round((score / max) * 100);
  }

  function getRecommendations(answers, count) {
    // A specific place returns only experiences in that place; "Anywhere" returns everything.
    const pool =
      answers.location && answers.location !== "anywhere"
        ? EXPERIENCES.filter((exp) => exp.location === answers.location)
        : EXPERIENCES;
    return pool.map((exp) => ({ exp, score: scoreExperience(exp, answers) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, count || 3);
  }

  window.MASAR = window.MASAR || {};
  window.MASAR.EXPERIENCES = EXPERIENCES;
  window.MASAR.getRecommendations = getRecommendations;

  function ensureToast() {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg><span></span>';
      document.body.appendChild(toast);
    }
    return toast;
  }
  function showToast(message) {
    const toast = ensureToast();
    toast.querySelector("span").textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }
  window.MASAR.showToast = showToast;

  document.addEventListener("click", (e) => {
    const saveBtn = e.target.closest("[data-save]");
    if (saveBtn) {
      showToast("Experience saved");
    }
  });

  const finderApp = document.getElementById("finder-app");
  if (finderApp) {
    const QUESTIONS = [
      {
        key: "location",
        label: "Where are you?",
        hint: "Choose your current location.",
        multi: false,
        options: [
          { v: "amman", t: "Amman" },
          { v: "petra", t: "Petra" },
          { v: "wadi-rum", t: "Wadi Rum" },
          { v: "aqaba", t: "Aqaba" },
          { v: "dead-sea", t: "Dead Sea" },
          { v: "jerash", t: "Jerash" },
          { v: "madaba", t: "Madaba & Mount Nebo" },
          { v: "karak", t: "Karak" },
          { v: "shobak", t: "Shobak" },
          { v: "ajloun", t: "Ajloun" },
          { v: "umm-qais", t: "Umm Qais" },
          { v: "pella", t: "Pella" },
          { v: "salt", t: "Salt" },
          { v: "dana", t: "Dana" },
          { v: "wadi-mujib", t: "Wadi Mujib" },
          { v: "azraq", t: "Azraq" },
          { v: "baptism-site", t: "Baptism Site" },
          { v: "anywhere", t: "Anywhere in Jordan" },
        ],
      },
      {
        key: "time",
        label: "How much time do you have?",
        hint: "Pick what fits your day.",
        multi: false,
        options: [
          { v: "few-hours", t: "A few hours" },
          { v: "half-day", t: "Half a day" },
          { v: "1-day", t: "1 day" },
          { v: "2-3-days", t: "2–3 days" },
          { v: "week-plus", t: "A week+" },
        ],
      },
      {
        key: "interests",
        label: "What interests you?",
        hint: "Pick as many as you feel like.",
        multi: true,
        options: [
          { v: "history", t: "History" },
          { v: "adventure", t: "Adventure" },
          { v: "nature", t: "Nature" },
          { v: "food", t: "Food" },
          { v: "culture", t: "Culture" },
          { v: "relaxation", t: "Relaxation" },
          { v: "photography", t: "Photography" },
          { v: "family", t: "Family" },
          { v: "nightlife", t: "Nightlife" },
        ],
      },
      {
        key: "walking",
        label: "How much walking?",
        hint: "Be honest — it'll shape your whole day.",
        multi: false,
        options: [
          { v: "minimal", t: "Minimal" },
          { v: "some", t: "Some walking" },
          { v: "active", t: "Active" },
          { v: "very-active", t: "Very active" },
        ],
      },
      {
        key: "budget",
        label: "What's your budget?",
        hint: "Per person, roughly.",
        multi: false,
        options: [
          { v: "budget", t: "Budget" },
          { v: "moderate", t: "Moderate" },
          { v: "premium", t: "Premium" },
          { v: "luxury", t: "Luxury" },
        ],
      },
    ];

    const FINDER_IMAGES = [
      "https://commons.wikimedia.org/wiki/Special:FilePath/AmmanDowntown.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Al-Khazneh_(The_Treasury),_Petra,_Jordan.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Wadi_Rum_BW_27.JPG",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dead_Sea_by_David_Shankbone.jpg",
      "https://commons.wikimedia.org/wiki/Special:FilePath/Aqaba_BW_2.JPG",
    ];

    const state = {
      step: 0,
      answers: { location: null, time: null, interests: [], walking: null, budget: null },
      status: "question", // question | loading | results
    };

    const mediaImg = finderApp.querySelector("[data-finder-media]");
    const progressWrap = finderApp.querySelector("[data-finder-progress]");
    const stepLabel = finderApp.querySelector("[data-finder-step-label]");
    const questionTitle = finderApp.querySelector("[data-finder-question-title]");
    const questionHint = finderApp.querySelector("[data-finder-question-hint]");
    const optionsWrap = finderApp.querySelector("[data-finder-options]");
    const backBtn = finderApp.querySelector("[data-finder-back]");
    const nextBtn = finderApp.querySelector("[data-finder-next]");
    const selectedCount = finderApp.querySelector("[data-finder-selected-count]");
    const finderBody = finderApp.querySelector("[data-finder-body]");
    const finderQuestionBlock = finderApp.querySelector("[data-finder-question-block]");
    const resultsSection = document.getElementById("finder-results");

    function buildProgress() {
      progressWrap.innerHTML = "";
      QUESTIONS.forEach((_, i) => {
        const span = document.createElement("span");
        if (i < state.step) span.className = "is-done";
        if (i === state.step) span.className = "is-current";
        span.innerHTML = "<i></i>";
        progressWrap.appendChild(span);
      });
    }

    function renderQuestion() {
      state.status = "question";
      const q = QUESTIONS[state.step];
      if (mediaImg) mediaImg.src = FINDER_IMAGES[state.step % FINDER_IMAGES.length];
      buildProgress();
      stepLabel.textContent = "STEP " + (state.step + 1) + " OF " + QUESTIONS.length;
      questionTitle.textContent = q.label;
      questionHint.textContent = q.hint;

      optionsWrap.innerHTML = "";
      q.options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip";
        btn.setAttribute("data-value", opt.v);
        const isSelected = q.multi
          ? state.answers[q.key].includes(opt.v)
          : state.answers[q.key] === opt.v;
        btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
        btn.innerHTML =
          '<svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg><span>' +
          opt.t +
          "</span>";
        btn.addEventListener("click", () => {
          if (q.multi) {
            const arr = state.answers[q.key];
            const idx = arr.indexOf(opt.v);
            if (idx > -1) arr.splice(idx, 1);
            else arr.push(opt.v);
          } else {
            state.answers[q.key] = opt.v;
          }
          renderQuestion();
        });
        optionsWrap.appendChild(btn);
      });

      backBtn.hidden = state.step === 0;
      const answered = q.multi ? state.answers[q.key].length > 0 : !!state.answers[q.key];
      nextBtn.disabled = !answered;
      nextBtn.innerHTML =
        state.step === QUESTIONS.length - 1
          ? 'Find My Experience <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
          : 'Next <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

      const count = q.multi ? state.answers[q.key].length : answered ? 1 : 0;
      selectedCount.textContent = count > 0 ? count + " selected" : "";

      finderQuestionBlock.hidden = false;
      if (resultsSection) resultsSection.classList.remove("is-active");
      finderApp.hidden = false;
    }

    function renderLoading() {
      state.status = "loading";
      finderQuestionBlock.innerHTML =
        '<div class="finder__loading">' +
        '<p class="finder__step-label">RESULTS</p>' +
        '<h3>Finding something you might enjoy…</h3>' +
        '<div class="dot-loader"><span></span><span></span><span></span></div>' +
        "</div>";
      finderApp.querySelector(".finder__foot").hidden = true;
    }

    function renderResults() {
      state.status = "results";
      const recs = window.MASAR.getRecommendations(state.answers, 6);
      const grid = resultsSection.querySelector("[data-results-grid]");
      const empty = resultsSection.querySelector("[data-results-empty]");
      const noMatchNote = resultsSection.querySelector("[data-no-match]");

      grid.innerHTML = "";
      const bestScore = recs.length ? recs[0].score : 0;

      if (!recs.length) {
        empty.hidden = false;
        grid.hidden = true;
      } else {
        empty.hidden = true;
        grid.hidden = false;
        noMatchNote.hidden = bestScore >= 45;
        recs.forEach(({ exp, score }) => {
          grid.appendChild(buildResultCard(exp, score));
        });
      }

      finderApp.hidden = true;
      resultsSection.classList.add("is-active");
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function buildResultCard(exp, score) {
      const card = document.createElement("article");
      card.className = "result-card reveal is-visible";
      card.innerHTML =
        '<div class="result-card__img"><img src="' +
        exp.image +
        '" alt="' +
        exp.name +
        ' — ' +
        prettyLocation(exp.location) +
        '" loading="lazy"><span class="result-card__match">' +
        score +
        '% match</span></div>' +
        '<div class="result-card__body">' +
        '<div class="result-card__meta"><span>' +
        prettyLocation(exp.location) +
        "</span><span>" +
        exp.duration +
        "</span><span>" +
        prettyWalking(exp.walking) +
        " walking</span></div>" +
        "<h3>" +
        exp.name +
        "</h3>" +
        '<p class="desc">' +
        exp.description +
        "</p>" +
        '<div class="result-card__tags">' +
        exp.tags.map((t) => '<span class="tag-pill">' + t + "</span>").join("") +
        "</div>" +
        '<div class="result-card__actions">' +
        '<button class="btn btn-dark btn-sm" data-view="' +
        exp.id +
        '">View Experience</button>' +
        '<button class="btn btn-outline btn-sm" data-save>Save</button>' +
        "</div></div>";
      resolveImage(exp, card.querySelector(".result-card__img img"));
      return card;
    }

    function prettyLocation(v) {
      return LOCATION_NAMES[v] || v;
    }
    function prettyWalking(v) {
      return { minimal: "Minimal", some: "Light", active: "Active", "very-active": "Very active" }[v] || v;
    }
    function prettyBudget(v) {
      return { budget: "Budget", moderate: "Moderate", premium: "Premium", luxury: "Luxury" }[v] || v;
    }

    nextBtn.addEventListener("click", () => {
      if (state.step < QUESTIONS.length - 1) {
        state.step++;
        renderQuestion();
      } else {
        renderLoading();
        setTimeout(renderResults, 700);
      }
    });

    backBtn.addEventListener("click", () => {
      if (state.step > 0) {
        state.step--;
        renderQuestion();
      }
    });

    const resetBtns = document.querySelectorAll("[data-finder-reset]");
    resetBtns.forEach((btn) =>
      btn.addEventListener("click", () => {
        state.step = 0;
        state.answers = { location: null, time: null, interests: [], walking: null, budget: null };
        finderApp.querySelector(".finder__foot").hidden = false;
        finderApp.hidden = false;
        if (resultsSection) resultsSection.classList.remove("is-active");
        renderQuestion();
        finderApp.scrollIntoView({ behavior: "smooth", block: "start" });
      })
    );

    // Modal for "View Experience"
    const modalOverlay = document.getElementById("experience-modal");
    if (modalOverlay) {
      const modalBody = modalOverlay.querySelector("[data-modal-body]");
      function openModal(exp) {
        modalBody.innerHTML =
          '<div class="modal__img"><img src="' +
          exp.image +
          '" alt="' +
          exp.name +
          '"><button class="modal__close" data-modal-close aria-label="Close">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>' +
          '<div class="modal__body">' +
          '<p class="eyebrow">' + prettyLocation(exp.location) + "</p>" +
          "<h3>" + exp.name + "</h3>" +
          '<div class="modal__meta"><span><strong>Duration</strong> ' + exp.duration + "</span>" +
          '<span><strong>Walking</strong> ' + prettyWalking(exp.walking) + "</span>" +
          '<span><strong>Budget</strong> ' + prettyBudget(exp.budget) + " (" + exp.budgetLabel + ")</span></div>" +
          "<p>" + exp.description + "</p>" +
          '<ul class="modal__highlights">' +
          exp.highlights
            .map((h, i) => '<li><span class="idx">0' + (i + 1) + "</span><span>" + h + "</span></li>")
            .join("") +
          "</ul>" +
          '<div class="result-card__actions"><button class="btn btn-primary" data-save>Save Experience</button></div>' +
          "</div>";
        resolveImage(exp, modalBody.querySelector(".modal__img img"));
        modalOverlay.classList.add("is-open");
        document.body.style.overflow = "hidden";
      }
      function closeModal() {
        modalOverlay.classList.remove("is-open");
        document.body.style.overflow = "";
      }
      document.addEventListener("click", (e) => {
        const viewBtn = e.target.closest("[data-view]");
        if (viewBtn) {
          const exp = EXPERIENCES.find((x) => x.id === viewBtn.getAttribute("data-view"));
          if (exp) openModal(exp);
        }
        if (e.target.closest("[data-modal-close]") || e.target === modalOverlay) {
          closeModal();
        }
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
      });
    }

    const presetLoc = new URLSearchParams(window.location.search).get("loc");
    const validLocs = QUESTIONS[0].options.map((o) => o.v);
    if (presetLoc && validLocs.includes(presetLoc)) {
      state.answers.location = presetLoc;
      state.step = 1;
    }

    renderQuestion();
  }
})();