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
    const backdrop = document.createElement("div");
    backdrop.className = "menu-backdrop";
    document.body.appendChild(backdrop);
    let savedOverflow = "";
    function setMenu(open, focus = false) {
      if (open) savedOverflow = document.body.style.overflow;
      hamburger.setAttribute("aria-expanded", String(open));
      hamburger.setAttribute(
        "aria-label",
        window.I18n.t(open ? "nav.close" : "text.040"),
      );
      mobileMenu.classList.toggle("is-open", open);
      mobileMenu.inert = !open;
      mobileMenu.setAttribute("aria-hidden", String(!open));
      backdrop.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : savedOverflow;
      if (focus) hamburger.focus();
    }
    hamburger.addEventListener("click", () =>
      setMenu(hamburger.getAttribute("aria-expanded") !== "true"),
    );
    mobileMenu.addEventListener("click", (e) => {
      if (e.target.closest("a")) setMenu(false);
    });
    backdrop.addEventListener("click", () => setMenu(false, true));
    document.addEventListener("pointerdown", (e) => {
      if (
        hamburger.getAttribute("aria-expanded") === "true" &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)
      )
        setMenu(false);
    });
    document.addEventListener("keydown", (e) => {
      if (hamburger.getAttribute("aria-expanded") !== "true") return;
      if (e.key === "Escape") setMenu(false, true);
      if (e.key === "Tab") {
        const items = [
            hamburger,
            ...mobileMenu.querySelectorAll("a, button, select"),
          ],
          first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
    window.matchMedia("(min-width: 1101px)").addEventListener("change", (e) => {
      if (e.matches && hamburger.getAttribute("aria-expanded") === "true")
        setMenu(false);
    });
    document.addEventListener("masar:language-change", () =>
      hamburger.setAttribute(
        "aria-label",
        window.I18n.t(
          hamburger.getAttribute("aria-expanded") === "true"
            ? "nav.close"
            : "text.040",
        ),
      ),
    );
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
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  const IMG = {
    petra:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Al-Khazneh_(The_Treasury),_Petra,_Jordan.jpg",
    petra2:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Al-Khazneh_(The_Treasury)_2,_Petra,_Jordan.jpg",
    wadirum:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Wadi_Rum_BW_27.JPG",
    wadirum2:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Wadi_Rum_BW_16.JPG",
    amman:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Amman_Citadel.jpg",
    ammanDowntown:
      "https://commons.wikimedia.org/wiki/Special:FilePath/AmmanDowntown.jpg",
    deadsea:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Dead_Sea_by_David_Shankbone.jpg",
    jerash:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Jerash_City.jpg",
    aqaba: "https://commons.wikimedia.org/wiki/Special:FilePath/Aqaba_BW_2.JPG",
  };

  const EXPERIENCES = [
    {
      id: "petra-explorer",
      name: window.I18n.source("text.242"),
      location: "petra",
      interests: ["history", "culture", "photography"],
      time: "1-day",
      walking: "active",
      budget: "moderate",
      image: IMG.petra,
      duration: window.I18n.source("text.243"),
      budgetLabel: window.I18n.source("price.0"),
      description: window.I18n.source("text.244"),
      tags: [
        window.I18n.source("text.245"),
        window.I18n.source("text.134"),
        window.I18n.source("text.246"),
      ],
      highlights: [
        window.I18n.source("text.247"),
        window.I18n.source("text.248"),
        window.I18n.source("text.249"),
      ],
    },
    {
      id: "petra-by-night",
      name: window.I18n.source("text.250"),
      location: "petra",
      interests: ["photography", "history", "relaxation"],
      time: "few-hours",
      walking: "some",
      budget: "moderate",
      image: IMG.petra2,
      duration: window.I18n.source("duration.3"),
      budgetLabel: window.I18n.source("price.1"),
      description: window.I18n.source("text.251"),
      tags: [window.I18n.source("text.246"), window.I18n.source("text.245")],
      highlights: [
        window.I18n.source("text.252"),
        window.I18n.source("text.253"),
        window.I18n.source("text.254"),
      ],
    },
    {
      id: "little-petra",
      name: window.I18n.source("text.255"),
      location: "petra",
      interests: ["history", "culture", "adventure"],
      time: "half-day",
      walking: "active",
      budget: "budget",
      image: IMG.petra,
      duration: window.I18n.source("duration.4"),
      budgetLabel: window.I18n.source("price.2"),
      description: window.I18n.source("text.256"),
      tags: [
        window.I18n.source("text.245"),
        window.I18n.source("text.134"),
        window.I18n.source("text.257"),
      ],
      highlights: [
        window.I18n.source("text.258"),
        window.I18n.source("text.259"),
        window.I18n.source("text.260"),
      ],
    },
    {
      id: "wadi-rum-adventure",
      name: window.I18n.source("text.261"),
      location: "wadi-rum",
      interests: ["adventure", "nature", "photography"],
      time: "1-day",
      walking: "very-active",
      budget: "premium",
      image: IMG.wadirum,
      duration: window.I18n.source("text.243"),
      budgetLabel: window.I18n.source("price.3"),
      description: window.I18n.source("text.262"),
      tags: [
        window.I18n.source("text.257"),
        window.I18n.source("text.135"),
        window.I18n.source("text.246"),
      ],
      highlights: [
        window.I18n.source("text.263"),
        window.I18n.source("text.264"),
        window.I18n.source("text.265"),
      ],
    },
    {
      id: "wadi-rum-night",
      name: window.I18n.source("text.266"),
      location: "wadi-rum",
      interests: ["culture", "relaxation", "nature"],
      time: "2-3-days",
      walking: "minimal",
      budget: "moderate",
      image: IMG.wadirum2,
      duration: window.I18n.source("text.267"),
      budgetLabel: window.I18n.source("price.4"),
      description: window.I18n.source("text.268"),
      tags: [
        window.I18n.source("text.134"),
        window.I18n.source("text.269"),
        window.I18n.source("text.135"),
      ],
      highlights: [
        window.I18n.source("text.270"),
        window.I18n.source("text.271"),
        window.I18n.source("text.272"),
      ],
    },
    {
      id: "wadi-rum-sunrise",
      name: window.I18n.source("text.273"),
      location: "wadi-rum",
      interests: ["adventure", "nature", "photography"],
      time: "few-hours",
      walking: "very-active",
      budget: "budget",
      image: IMG.wadirum,
      duration: window.I18n.source("duration.3"),
      budgetLabel: window.I18n.source("price.5"),
      description: window.I18n.source("text.274"),
      tags: [
        window.I18n.source("text.257"),
        window.I18n.source("text.135"),
        window.I18n.source("text.246"),
      ],
      highlights: [
        window.I18n.source("text.275"),
        window.I18n.source("text.276"),
        window.I18n.source("text.277"),
      ],
    },
    {
      id: "amman-food-culture",
      name: window.I18n.source("text.278"),
      location: "amman",
      interests: ["food", "culture", "history"],
      time: "half-day",
      walking: "some",
      budget: "budget",
      image: IMG.ammanDowntown,
      duration: window.I18n.source("duration.35"),
      budgetLabel: window.I18n.source("price.6"),
      description: window.I18n.source("text.279"),
      tags: [
        window.I18n.source("text.131"),
        window.I18n.source("text.134"),
        window.I18n.source("text.245"),
      ],
      highlights: [
        window.I18n.source("text.280"),
        window.I18n.source("text.281"),
        window.I18n.source("text.282"),
      ],
    },
    {
      id: "amman-different-side",
      name: window.I18n.source("text.283"),
      location: "amman",
      interests: ["culture", "nightlife", "food"],
      time: "half-day",
      walking: "some",
      budget: "moderate",
      image: IMG.ammanDowntown,
      duration: window.I18n.source("duration.4"),
      budgetLabel: window.I18n.source("price.1"),
      description: window.I18n.source("text.284"),
      tags: [
        window.I18n.source("text.134"),
        window.I18n.source("text.285"),
        window.I18n.source("text.131"),
      ],
      highlights: [
        window.I18n.source("text.286"),
        window.I18n.source("text.287"),
        window.I18n.source("text.288"),
      ],
    },
    {
      id: "amman-family-trail",
      name: window.I18n.source("text.289"),
      location: "amman",
      interests: ["family", "culture", "food"],
      time: "half-day",
      walking: "minimal",
      budget: "budget",
      image: IMG.amman,
      duration: window.I18n.source("duration.3"),
      budgetLabel: window.I18n.source("price.2"),
      description: window.I18n.source("text.290"),
      tags: [
        window.I18n.source("text.291"),
        window.I18n.source("text.134"),
        window.I18n.source("text.131"),
      ],
      highlights: [
        window.I18n.source("text.292"),
        window.I18n.source("text.293"),
        window.I18n.source("text.294"),
      ],
    },
    {
      id: "artisan-studio",
      name: window.I18n.source("text.295"),
      location: "amman",
      interests: ["culture", "family", "food"],
      time: "few-hours",
      walking: "minimal",
      budget: "moderate",
      image: IMG.ammanDowntown,
      duration: window.I18n.source("duration.25"),
      budgetLabel: window.I18n.source("price.7"),
      description: window.I18n.source("text.296"),
      tags: [
        window.I18n.source("text.134"),
        window.I18n.source("text.291"),
        window.I18n.source("text.131"),
      ],
      highlights: [
        window.I18n.source("text.297"),
        window.I18n.source("text.298"),
        window.I18n.source("text.299"),
      ],
    },
    {
      id: "dead-sea-float",
      name: window.I18n.source("text.300"),
      location: "dead-sea",
      interests: ["relaxation", "nature", "family"],
      time: "half-day",
      walking: "minimal",
      budget: "premium",
      image: IMG.deadsea,
      duration: window.I18n.source("duration.4"),
      budgetLabel: window.I18n.source("price.8"),
      description: window.I18n.source("text.301"),
      tags: [
        window.I18n.source("text.269"),
        window.I18n.source("text.135"),
        window.I18n.source("text.291"),
      ],
      highlights: [
        window.I18n.source("text.302"),
        window.I18n.source("text.303"),
        window.I18n.source("text.304"),
      ],
    },
    {
      id: "aqaba-dive",
      name: window.I18n.source("text.305"),
      location: "aqaba",
      interests: ["adventure", "nature", "photography"],
      time: "1-day",
      walking: "some",
      budget: "premium",
      image: IMG.aqaba,
      duration: window.I18n.source("text.243"),
      budgetLabel: window.I18n.source("price.9"),
      description: window.I18n.source("text.306"),
      tags: [
        window.I18n.source("text.257"),
        window.I18n.source("text.135"),
        window.I18n.source("text.246"),
      ],
      highlights: [
        window.I18n.source("text.307"),
        window.I18n.source("text.308"),
        window.I18n.source("text.309"),
      ],
    },
    {
      id: "aqaba-sunset-sail",
      name: window.I18n.source("text.310"),
      location: "aqaba",
      interests: ["relaxation", "nightlife", "nature"],
      time: "few-hours",
      walking: "minimal",
      budget: "moderate",
      image: IMG.aqaba,
      duration: window.I18n.source("duration.25"),
      budgetLabel: window.I18n.source("price.10"),
      description: window.I18n.source("text.311"),
      tags: [
        window.I18n.source("text.269"),
        window.I18n.source("text.285"),
        window.I18n.source("text.135"),
      ],
      highlights: [
        window.I18n.source("text.312"),
        window.I18n.source("text.313"),
        window.I18n.source("text.314"),
      ],
    },
    {
      id: "jerash-roman-walk",
      name: window.I18n.source("text.315"),
      location: "jerash",
      interests: ["history", "culture", "photography"],
      time: "half-day",
      walking: "active",
      budget: "budget",
      image: IMG.jerash,
      duration: window.I18n.source("duration.35"),
      budgetLabel: window.I18n.source("price.11"),
      description: window.I18n.source("text.316"),
      tags: [
        window.I18n.source("text.245"),
        window.I18n.source("text.134"),
        window.I18n.source("text.246"),
      ],
      highlights: [
        window.I18n.source("text.317"),
        window.I18n.source("text.318"),
        window.I18n.source("text.319"),
      ],
    },
  ];

  /* ===== More places across Jordan (added) ===== */
  const LOCATION_NAMES = {
    amman: window.I18n.source("text.035"),
    petra: window.I18n.source("text.034"),
    "wadi-rum": window.I18n.source("text.181"),
    aqaba: window.I18n.source("text.182"),
    "dead-sea": window.I18n.source("text.184"),
    jerash: window.I18n.source("text.183"),
    madaba: window.I18n.source("text.320"),
    karak: window.I18n.source("text.321"),
    shobak: window.I18n.source("text.322"),
    ajloun: window.I18n.source("text.323"),
    "umm-qais": window.I18n.source("text.324"),
    pella: window.I18n.source("text.325"),
    salt: window.I18n.source("text.326"),
    dana: window.I18n.source("text.327"),
    "wadi-mujib": window.I18n.source("text.328"),
    azraq: window.I18n.source("text.329"),
    "baptism-site": window.I18n.source("text.330"),
    anywhere: window.I18n.source("text.178"),
  };

  // Photos for these are looked up on Wikipedia at runtime (see resolveImage); `image` is the fallback.
  const wikiCache = {};
  function resolveImage(exp, imgEl) {
    if (!exp.wiki || !imgEl) return;
    imgEl.onerror = function () {
      imgEl.onerror = null;
      imgEl.src = exp.image;
    };
    if (exp._resolved) {
      imgEl.src = exp._resolved;
      return;
    }
    if (wikiCache[exp.wiki] === undefined) {
      wikiCache[exp.wiki] = fetch(
        "https://en.wikipedia.org/api/rest_v1/page/summary/" +
          encodeURIComponent(exp.wiki),
      )
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          const t = d && d.thumbnail && d.thumbnail.source;
          return t ? t.replace(/\/\d+px-/, "/960px-") : null;
        })
        .catch(() => null);
    }
    wikiCache[exp.wiki].then((src) => {
      if (src) {
        exp._resolved = src;
        imgEl.src = src;
      }
    });
  }

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  function X(
    id,
    name,
    location,
    wiki,
    fb,
    interests,
    time,
    walking,
    budget,
    duration,
    description,
    highlights,
  ) {
    return {
      id,
      name,
      location,
      wiki,
      image: fb,
      interests,
      time,
      walking,
      budget,
      duration,
      budgetLabel: window.I18n.source("text.331"),
      description,
      tags: interests.slice(0, 3).map(cap),
      highlights,
    };
  }

  EXPERIENCES.push(
    X(
      "petra-monastery-trek",
      window.I18n.source("text.332"),
      "petra",
      "Ad_Deir",
      IMG.petra2,
      ["adventure", "history", "photography"],
      "1-day",
      "very-active",
      "moderate",
      window.I18n.source("text.243"),
      window.I18n.source("text.333"),
      [
        window.I18n.source("text.334"),
        window.I18n.source("text.335"),
        window.I18n.source("text.336"),
      ],
    ),

    X(
      "dead-sea-resort-day",
      window.I18n.source("text.337"),
      "dead-sea",
      "Dead_Sea",
      IMG.deadsea,
      ["relaxation", "family", "nature"],
      "half-day",
      "minimal",
      "premium",
      window.I18n.source("duration.5"),
      window.I18n.source("text.338"),
      [
        window.I18n.source("text.339"),
        window.I18n.source("text.340"),
        window.I18n.source("text.341"),
      ],
    ),

    X(
      "aqaba-snorkel",
      window.I18n.source("text.342"),
      "aqaba",
      window.I18n.source("text.182"),
      IMG.aqaba,
      ["nature", "family", "relaxation"],
      "half-day",
      "minimal",
      "moderate",
      window.I18n.source("duration.4"),
      window.I18n.source("text.343"),
      [
        window.I18n.source("text.344"),
        window.I18n.source("text.345"),
        window.I18n.source("text.346"),
      ],
    ),

    X(
      "aqaba-old-town",
      window.I18n.source("text.347"),
      "aqaba",
      "Aqaba_Fort",
      IMG.aqaba,
      ["food", "culture", "history"],
      "few-hours",
      "some",
      "budget",
      window.I18n.source("duration.3"),
      window.I18n.source("text.348"),
      [
        window.I18n.source("text.349"),
        window.I18n.source("text.350"),
        window.I18n.source("text.351"),
      ],
    ),

    X(
      "jerash-local-guide",
      window.I18n.source("text.352"),
      "jerash",
      window.I18n.source("text.183"),
      IMG.jerash,
      ["history", "culture", "food"],
      "1-day",
      "active",
      "moderate",
      window.I18n.source("text.243"),
      window.I18n.source("text.353"),
      [
        window.I18n.source("text.354"),
        window.I18n.source("text.355"),
        window.I18n.source("text.356"),
      ],
    ),

    X(
      "amman-roman-citadel",
      window.I18n.source("text.357"),
      "amman",
      "Roman_Theatre_(Amman)",
      IMG.amman,
      ["history", "culture", "family"],
      "few-hours",
      "some",
      "budget",
      window.I18n.source("duration.3"),
      window.I18n.source("text.358"),
      [
        window.I18n.source("text.359"),
        window.I18n.source("text.360"),
        window.I18n.source("text.361"),
      ],
    ),

    X(
      "madaba-mosaics",
      window.I18n.source("text.362"),
      "madaba",
      window.I18n.source("text.363"),
      IMG.ammanDowntown,
      ["history", "culture", "photography"],
      "few-hours",
      "some",
      "budget",
      window.I18n.source("duration.3"),
      window.I18n.source("text.364"),
      [
        window.I18n.source("text.365"),
        window.I18n.source("text.366"),
        window.I18n.source("text.367"),
      ],
    ),

    X(
      "mount-nebo-view",
      window.I18n.source("text.368"),
      "madaba",
      "Mount_Nebo",
      IMG.deadsea,
      ["history", "nature", "photography"],
      "half-day",
      "some",
      "budget",
      window.I18n.source("duration.3"),
      window.I18n.source("text.369"),
      [
        window.I18n.source("text.370"),
        window.I18n.source("text.371"),
        window.I18n.source("text.372"),
      ],
    ),

    X(
      "main-hot-springs",
      window.I18n.source("text.373"),
      "madaba",
      "Hammamat_Ma'in",
      IMG.deadsea,
      ["relaxation", "nature", "family"],
      "half-day",
      "minimal",
      "moderate",
      window.I18n.source("duration.4"),
      window.I18n.source("text.374"),
      [
        window.I18n.source("text.375"),
        window.I18n.source("text.376"),
        window.I18n.source("text.377"),
      ],
    ),

    X(
      "karak-castle",
      window.I18n.source("text.378"),
      "karak",
      "Kerak_Castle",
      IMG.wadirum,
      ["history", "culture", "photography"],
      "half-day",
      "active",
      "budget",
      window.I18n.source("duration.4"),
      window.I18n.source("text.379"),
      [
        window.I18n.source("text.380"),
        window.I18n.source("text.381"),
        window.I18n.source("text.382"),
      ],
    ),

    X(
      "kings-highway-trip",
      window.I18n.source("text.383"),
      "karak",
      "King's_Highway_(Transjordan)",
      IMG.wadirum,
      ["history", "adventure", "photography"],
      "2-3-days",
      "some",
      "moderate",
      window.I18n.source("duration.days"),
      window.I18n.source("text.384"),
      [
        window.I18n.source("text.385"),
        window.I18n.source("text.386"),
        window.I18n.source("text.387"),
      ],
    ),

    X(
      "shobak-castle",
      window.I18n.source("text.388"),
      "shobak",
      "Shobak_Castle",
      IMG.wadirum,
      ["history", "photography", "adventure"],
      "few-hours",
      "active",
      "budget",
      window.I18n.source("duration.2to3"),
      window.I18n.source("text.389"),
      [
        window.I18n.source("text.390"),
        window.I18n.source("text.391"),
        window.I18n.source("text.392"),
      ],
    ),

    X(
      "ajloun-castle-forest",
      window.I18n.source("text.393"),
      "ajloun",
      "Ajloun_Castle",
      IMG.jerash,
      ["history", "nature", "family"],
      "half-day",
      "some",
      "budget",
      window.I18n.source("duration.4"),
      window.I18n.source("text.394"),
      [
        window.I18n.source("text.395"),
        window.I18n.source("text.396"),
        window.I18n.source("text.397"),
      ],
    ),

    X(
      "umm-qais-sunset",
      window.I18n.source("text.398"),
      "umm-qais",
      "Umm_Qais",
      IMG.jerash,
      ["history", "photography", "nature"],
      "half-day",
      "some",
      "budget",
      window.I18n.source("duration.34"),
      window.I18n.source("text.399"),
      [
        window.I18n.source("text.400"),
        window.I18n.source("text.401"),
        window.I18n.source("text.402"),
      ],
    ),

    X(
      "pella-ruins",
      window.I18n.source("text.403"),
      "pella",
      "Pella,_Jordan",
      IMG.jerash,
      ["history", "nature", "family"],
      "half-day",
      "some",
      "budget",
      window.I18n.source("duration.3"),
      window.I18n.source("text.404"),
      [
        window.I18n.source("text.405"),
        window.I18n.source("text.406"),
        window.I18n.source("text.407"),
      ],
    ),

    X(
      "salt-old-town",
      window.I18n.source("text.408"),
      "salt",
      window.I18n.source("text.409"),
      IMG.ammanDowntown,
      ["culture", "history", "food"],
      "few-hours",
      "some",
      "budget",
      window.I18n.source("duration.3"),
      window.I18n.source("text.410"),
      [
        window.I18n.source("text.411"),
        window.I18n.source("text.412"),
        window.I18n.source("text.413"),
      ],
    ),

    X(
      "dana-hike",
      window.I18n.source("text.414"),
      "dana",
      "Dana_Biosphere_Reserve",
      IMG.wadirum2,
      ["nature", "adventure", "photography"],
      "1-day",
      "active",
      "moderate",
      window.I18n.source("text.243"),
      window.I18n.source("text.415"),
      [
        window.I18n.source("text.416"),
        window.I18n.source("text.417"),
        window.I18n.source("text.418"),
      ],
    ),

    X(
      "dana-feynan-trek",
      window.I18n.source("text.419"),
      "dana",
      "Feynan_Ecolodge",
      IMG.wadirum2,
      ["adventure", "nature", "relaxation"],
      "2-3-days",
      "very-active",
      "premium",
      window.I18n.source("duration.days"),
      window.I18n.source("text.420"),
      [
        window.I18n.source("text.421"),
        window.I18n.source("text.422"),
        window.I18n.source("text.423"),
      ],
    ),

    X(
      "wadi-mujib-siq",
      window.I18n.source("text.424"),
      "wadi-mujib",
      "Wadi_Mujib",
      IMG.deadsea,
      ["adventure", "nature", "family"],
      "half-day",
      "very-active",
      "moderate",
      window.I18n.source("duration.34"),
      window.I18n.source("text.425"),
      [
        window.I18n.source("text.426"),
        window.I18n.source("text.427"),
        window.I18n.source("text.428"),
      ],
    ),

    X(
      "azraq-wetland-castle",
      window.I18n.source("text.429"),
      "azraq",
      "Azraq_Wetland_Reserve",
      IMG.wadirum2,
      ["nature", "history", "family"],
      "half-day",
      "some",
      "budget",
      window.I18n.source("duration.4"),
      window.I18n.source("text.430"),
      [
        window.I18n.source("text.431"),
        window.I18n.source("text.432"),
        window.I18n.source("text.433"),
      ],
    ),

    X(
      "baptism-site-visit",
      window.I18n.source("text.434"),
      "baptism-site",
      window.I18n.source("text.435"),
      IMG.deadsea,
      ["history", "culture", "relaxation"],
      "few-hours",
      "some",
      "budget",
      window.I18n.source("duration.3"),
      window.I18n.source("text.436"),
      [
        window.I18n.source("text.437"),
        window.I18n.source("text.438"),
        window.I18n.source("text.439"),
      ],
    ),

    X(
      "umm-qais-lunch",
      window.I18n.source("text.440"),
      "umm-qais",
      "Umm_Qais",
      IMG.jerash,
      ["culture", "food", "history"],
      "few-hours",
      "minimal",
      "budget",
      window.I18n.source("duration.3"),
      window.I18n.source("text.441"),
      [
        window.I18n.source("text.442"),
        window.I18n.source("text.443"),
        window.I18n.source("text.444"),
      ],
    ),

    X(
      "pella-valley-day",
      window.I18n.source("text.445"),
      "pella",
      "Pella,_Jordan",
      IMG.jerash,
      ["history", "food", "family"],
      "1-day",
      "some",
      "budget",
      window.I18n.source("text.243"),
      window.I18n.source("text.446"),
      [
        window.I18n.source("text.447"),
        window.I18n.source("text.448"),
        window.I18n.source("text.449"),
      ],
    ),

    X(
      "salt-market-food",
      window.I18n.source("text.450"),
      "salt",
      window.I18n.source("text.409"),
      IMG.ammanDowntown,
      ["food", "culture", "family"],
      "few-hours",
      "minimal",
      "budget",
      window.I18n.source("duration.2to3"),
      window.I18n.source("text.451"),
      [
        window.I18n.source("text.452"),
        window.I18n.source("text.453"),
        window.I18n.source("text.454"),
      ],
    ),

    X(
      "shobak-photo-walk",
      window.I18n.source("text.455"),
      "shobak",
      "Shobak_Castle",
      IMG.wadirum,
      ["photography", "history", "nature"],
      "few-hours",
      "some",
      "budget",
      window.I18n.source("duration.2"),
      window.I18n.source("text.456"),
      [
        window.I18n.source("text.457"),
        window.I18n.source("text.458"),
        window.I18n.source("text.459"),
      ],
    ),

    X(
      "ajloun-forest-walk",
      window.I18n.source("text.460"),
      "ajloun",
      "Ajloun_Forest_Reserve",
      IMG.jerash,
      ["nature", "family", "adventure"],
      "half-day",
      "active",
      "moderate",
      window.I18n.source("duration.4"),
      window.I18n.source("text.461"),
      [
        window.I18n.source("text.462"),
        window.I18n.source("text.463"),
        window.I18n.source("text.464"),
      ],
    ),

    X(
      "baptism-dead-sea-day",
      window.I18n.source("text.465"),
      "baptism-site",
      window.I18n.source("text.435"),
      IMG.deadsea,
      ["history", "relaxation", "culture"],
      "1-day",
      "some",
      "moderate",
      window.I18n.source("text.243"),
      window.I18n.source("text.466"),
      [
        window.I18n.source("text.467"),
        window.I18n.source("text.468"),
        window.I18n.source("text.469"),
      ],
    ),

    X(
      "azraq-desert-castles",
      window.I18n.source("text.470"),
      "azraq",
      "Desert_castles",
      IMG.wadirum2,
      ["history", "adventure", "photography"],
      "1-day",
      "some",
      "moderate",
      window.I18n.source("text.243"),
      window.I18n.source("text.471"),
      [
        window.I18n.source("text.472"),
        window.I18n.source("text.473"),
        window.I18n.source("text.474"),
      ],
    ),

    X(
      "mujib-dead-sea-road",
      window.I18n.source("text.475"),
      "wadi-mujib",
      "Wadi_Mujib",
      IMG.deadsea,
      ["nature", "photography", "relaxation"],
      "few-hours",
      "minimal",
      "budget",
      window.I18n.source("duration.2to3"),
      window.I18n.source("text.476"),
      [
        window.I18n.source("text.477"),
        window.I18n.source("text.478"),
        window.I18n.source("text.479"),
      ],
    ),

    X(
      "classic-jordan-3days",
      window.I18n.source("text.480"),
      "anywhere",
      window.I18n.source("text.481"),
      IMG.petra,
      ["history", "adventure", "photography"],
      "2-3-days",
      "active",
      "moderate",
      "3 days",
      window.I18n.source("text.482"),
      [
        window.I18n.source("text.483"),
        window.I18n.source("text.484"),
        window.I18n.source("text.485"),
      ],
    ),

    X(
      "north-jordan-loop",
      window.I18n.source("text.486"),
      "anywhere",
      window.I18n.source("text.323"),
      IMG.jerash,
      ["history", "nature", "culture"],
      "2-3-days",
      "some",
      "moderate",
      window.I18n.source("duration.days"),
      window.I18n.source("text.487"),
      [
        window.I18n.source("text.488"),
        window.I18n.source("text.489"),
        window.I18n.source("text.490"),
      ],
    ),

    X(
      "jordan-in-a-week",
      window.I18n.source("text.491"),
      "anywhere",
      window.I18n.source("text.481"),
      IMG.petra2,
      ["history", "adventure", "relaxation"],
      "week-plus",
      "active",
      "premium",
      "7+ days",
      window.I18n.source("text.492"),
      [
        window.I18n.source("text.493"),
        window.I18n.source("text.494"),
        window.I18n.source("text.495"),
      ],
    ),
  );
  /* ===== end of added places ===== */

  const TIME_ORDER = [
    "few-hours",
    "half-day",
    "1-day",
    "2-3-days",
    "week-plus",
  ];
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
      if (
        answers.location === "anywhere" ||
        exp.location === answers.location
      ) {
        score += 35;
      } else if (exp.location === "anywhere") {
        score += 22; // multi-stop routes fit any starting point
      }
    }

    max += 30;
    if (answers.interests && answers.interests.length) {
      const overlap = exp.interests.filter((i) =>
        answers.interests.includes(i),
      ).length;
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
    return pool
      .map((exp) => ({ exp, score: scoreExperience(exp, answers) }))
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

  const SAVED_EXPERIENCES_KEY = "masar_saved_destinations";

  function getSavedExperiences() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_EXPERIENCES_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      console.error("Unable to read saved experiences:", error);
      return [];
    }
  }

  function saveExperience(exp) {
    const saved = getSavedExperiences();

    if (saved.some((item) => item.id === exp.id)) {
      showToast(window.I18n.source("text.497"));
      return;
    }

    saved.push({
      id: exp.id,
      name: exp.name,
      description: exp.description,
      image: exp.image,
      location: exp.location,
      duration: exp.duration,
      tags: exp.tags || [],
    });

    localStorage.setItem(SAVED_EXPERIENCES_KEY, JSON.stringify(saved));
    showToast(window.I18n.source("text.498"));
  }

  document.addEventListener("click", (e) => {
    const saveBtn = e.target.closest("[data-save]");
    if (!saveBtn) return;

    const experienceId = saveBtn.getAttribute("data-save");
    const exp = EXPERIENCES.find((item) => item.id === experienceId);

    if (exp) {
      saveExperience(exp);
    }
  });

  const finderApp = document.getElementById("finder-app");
  if (finderApp) {
    const QUESTIONS = [
      {
        key: "location",
        label: window.I18n.source("text.026"),
        hint: window.I18n.source("text.066"),
        multi: false,
        options: [
          { v: "amman", t: window.I18n.source("text.035") },
          { v: "petra", t: window.I18n.source("text.034") },
          { v: "wadi-rum", t: window.I18n.source("text.181") },
          { v: "aqaba", t: window.I18n.source("text.182") },
          { v: "dead-sea", t: window.I18n.source("text.184") },
          { v: "jerash", t: window.I18n.source("text.183") },
          { v: "madaba", t: window.I18n.source("text.320") },
          { v: "karak", t: window.I18n.source("text.321") },
          { v: "shobak", t: window.I18n.source("text.322") },
          { v: "ajloun", t: window.I18n.source("text.323") },
          { v: "umm-qais", t: window.I18n.source("text.324") },
          { v: "pella", t: window.I18n.source("text.325") },
          { v: "salt", t: window.I18n.source("text.326") },
          { v: "dana", t: window.I18n.source("text.327") },
          { v: "wadi-mujib", t: window.I18n.source("text.328") },
          { v: "azraq", t: window.I18n.source("text.329") },
          { v: "baptism-site", t: window.I18n.source("text.499") },
          { v: "anywhere", t: window.I18n.source("text.500") },
        ],
      },
      {
        key: "time",
        label: window.I18n.source("text.501"),
        hint: window.I18n.source("text.502"),
        multi: false,
        options: [
          { v: "few-hours", t: window.I18n.source("text.503") },
          { v: "half-day", t: window.I18n.source("text.504") },
          { v: "1-day", t: window.I18n.source("duration.1") },
          { v: "2-3-days", t: window.I18n.source("duration.23") },
          { v: "week-plus", t: window.I18n.source("duration.week") },
        ],
      },
      {
        key: "interests",
        label: window.I18n.source("text.505"),
        hint: window.I18n.source("text.506"),
        multi: true,
        options: [
          { v: "history", t: window.I18n.source("text.245") },
          { v: "adventure", t: window.I18n.source("text.257") },
          { v: "nature", t: window.I18n.source("text.135") },
          { v: "food", t: window.I18n.source("text.131") },
          { v: "culture", t: window.I18n.source("text.134") },
          { v: "relaxation", t: window.I18n.source("text.269") },
          { v: "photography", t: window.I18n.source("text.246") },
          { v: "family", t: window.I18n.source("text.291") },
          { v: "nightlife", t: window.I18n.source("text.285") },
        ],
      },
      {
        key: "walking",
        label: window.I18n.source("text.507"),
        hint: window.I18n.source("text.508"),
        multi: false,
        options: [
          { v: "minimal", t: window.I18n.source("text.509") },
          { v: "some", t: window.I18n.source("text.510") },
          { v: "active", t: window.I18n.source("text.511") },
          { v: "very-active", t: window.I18n.source("text.512") },
        ],
      },
      {
        key: "budget",
        label: window.I18n.source("text.513"),
        hint: window.I18n.source("text.514"),
        multi: false,
        options: [
          { v: "budget", t: window.I18n.source("text.515") },
          { v: "moderate", t: window.I18n.source("text.516") },
          { v: "premium", t: window.I18n.source("text.517") },
          { v: "luxury", t: window.I18n.source("text.518") },
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
      answers: {
        location: null,
        time: null,
        interests: [],
        walking: null,
        budget: null,
      },
      status: "question", // question | loading | results
    };

    const mediaImg = finderApp.querySelector("[data-finder-media]");
    const progressWrap = finderApp.querySelector("[data-finder-progress]");
    const stepLabel = finderApp.querySelector("[data-finder-step-label]");
    const questionTitle = finderApp.querySelector(
      "[data-finder-question-title]",
    );
    const questionHint = finderApp.querySelector("[data-finder-question-hint]");
    const optionsWrap = finderApp.querySelector("[data-finder-options]");
    const backBtn = finderApp.querySelector("[data-finder-back]");
    const nextBtn = finderApp.querySelector("[data-finder-next]");
    const selectedCount = finderApp.querySelector(
      "[data-finder-selected-count]",
    );
    const finderBody = finderApp.querySelector("[data-finder-body]");
    const finderQuestionBlock = finderApp.querySelector(
      "[data-finder-question-block]",
    );
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
      finderBody.querySelector(".finder-loading-panel")?.remove();
      state.status = "question";
      const q = QUESTIONS[state.step];
      if (mediaImg)
        mediaImg.src = FINDER_IMAGES[state.step % FINDER_IMAGES.length];
      buildProgress();
      stepLabel.textContent = window.I18n.t("finder.step", {
        step: state.step + 1,
        total: QUESTIONS.length,
      });
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
      const answered = q.multi
        ? state.answers[q.key].length > 0
        : !!state.answers[q.key];
      nextBtn.disabled = !answered;
      nextBtn.innerHTML =
        state.step === QUESTIONS.length - 1
          ? '<i18n-text data-i18n="text.104">Find My Experience</i18n-text> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
          : '<i18n-text data-i18n="text.068">Next</i18n-text> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

      const count = q.multi ? state.answers[q.key].length : answered ? 1 : 0;
      selectedCount.textContent =
        count > 0 ? window.I18n.t("finder.selected", { count }) : "";

      finderQuestionBlock.hidden = false;
      if (resultsSection) resultsSection.classList.remove("is-active");
      finderApp.hidden = false;
    }

    function renderLoading() {
      state.status = "loading";
      finderQuestionBlock.hidden = true;
      const loadingPanel = document.createElement("div");
      loadingPanel.className = "finder-loading-panel";
      loadingPanel.innerHTML =
        '<div class="finder__loading">' +
        '<p class="finder__step-label"><i18n-text data-i18n="finder.results">RESULTS</i18n-text></p>' +
        '<h3><i18n-text data-i18n="finder.loading">Finding something you might enjoy…</i18n-text></h3>' +
        '<div class="dot-loader"><span></span><span></span><span></span></div>' +
        "</div>";
      finderBody.appendChild(loadingPanel);
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
        " — " +
        prettyLocation(exp.location) +
        '" loading="lazy"><span class="result-card__match">' +
        window.I18n.t("finder.match", { score }) +
        "</span></div>" +
        '<div class="result-card__body">' +
        '<div class="result-card__meta"><span>' +
        prettyLocation(exp.location) +
        "</span><span>" +
        exp.duration +
        "</span><span>" +
        window.I18n.t("finder.walking", {
          level: window.I18n.translateText(prettyWalking(exp.walking)),
        }) +
        "</span></div>" +
        "<h3>" +
        exp.name +
        "</h3>" +
        '<p class="desc">' +
        exp.description +
        "</p>" +
        '<div class="result-card__tags">' +
        exp.tags
          .map((t) => '<span class="tag-pill">' + t + "</span>")
          .join("") +
        "</div>" +
        '<div class="result-card__actions">' +
        '<button class="btn btn-dark btn-sm" data-view="' +
        exp.id +
        '"><i18n-text data-i18n="experience.view">View Experience</i18n-text></button>' +
        '<button class="btn btn-outline btn-sm" data-save="' +
        exp.id +
        '"><i18n-text data-i18n="experience.save">Save</i18n-text></button>' +
        "</div></div>";
      resolveImage(exp, card.querySelector(".result-card__img img"));
      return card;
    }

    function prettyLocation(v) {
      return LOCATION_NAMES[v] || v;
    }
    function prettyWalking(v) {
      return (
        {
          minimal: window.I18n.source("text.509"),
          some: window.I18n.source("text.520"),
          active: window.I18n.source("text.511"),
          "very-active": window.I18n.source("text.512"),
        }[v] || v
      );
    }
    function prettyBudget(v) {
      return (
        {
          budget: window.I18n.source("text.515"),
          moderate: window.I18n.source("text.516"),
          premium: window.I18n.source("text.517"),
          luxury: window.I18n.source("text.518"),
        }[v] || v
      );
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
        state.answers = {
          location: null,
          time: null,
          interests: [],
          walking: null,
          budget: null,
        };
        finderApp.querySelector(".finder__foot").hidden = false;
        finderApp.hidden = false;
        if (resultsSection) resultsSection.classList.remove("is-active");
        renderQuestion();
        finderApp.scrollIntoView({ behavior: "smooth", block: "start" });
      }),
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
          '"><button class="modal__close" data-modal-close aria-label="Close" data-i18n-aria-label="common.close">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>' +
          '<div class="modal__body">' +
          '<p class="eyebrow">' +
          prettyLocation(exp.location) +
          "</p>" +
          "<h3>" +
          exp.name +
          "</h3>" +
          '<div class="modal__meta"><span><strong><i18n-text data-i18n="experience.duration">Duration</i18n-text></strong> ' +
          exp.duration +
          "</span>" +
          '<span><strong><i18n-text data-i18n="experience.walking">Walking</i18n-text></strong> ' +
          prettyWalking(exp.walking) +
          "</span>" +
          '<span><strong><i18n-text data-i18n="experience.budget">Budget</i18n-text></strong> ' +
          prettyBudget(exp.budget) +
          " (" +
          exp.budgetLabel +
          ")</span></div>" +
          "<p>" +
          exp.description +
          "</p>" +
          '<ul class="modal__highlights">' +
          exp.highlights
            .map(
              (h, i) =>
                '<li><span class="idx">0' +
                (i + 1) +
                "</span><span>" +
                h +
                "</span></li>",
            )
            .join("") +
          "</ul>" +
          '<div class="result-card__actions"><button class="btn btn-primary" data-save="' +
          exp.id +
          '"><i18n-text data-i18n="experience.saveFull">Save Experience</i18n-text></button></div>' +
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
          const exp = EXPERIENCES.find(
            (x) => x.id === viewBtn.getAttribute("data-view"),
          );
          if (exp) openModal(exp);
        }
        if (
          e.target.closest("[data-modal-close]") ||
          e.target === modalOverlay
        ) {
          closeModal();
        }
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
      });
    }

    document.addEventListener("masar:language-change", () => {
      if (state.status === "question") renderQuestion();
    });

    const presetLoc = new URLSearchParams(window.location.search).get("loc");
    const validLocs = QUESTIONS[0].options.map((o) => o.v);
    if (presetLoc && validLocs.includes(presetLoc)) {
      state.answers.location = presetLoc;
      state.step = 1;
    }

    renderQuestion();
  }
})();
