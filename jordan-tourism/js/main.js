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

    mobileMenu
      .querySelectorAll("a")
      .forEach((a) => a.addEventListener("click", closeMenu));

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
    return EXPERIENCES.map((exp) => ({
      exp,
      score: scoreExperience(exp, answers),
    }))
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
      state.status = "question";
      const q = QUESTIONS[state.step];
      if (mediaImg)
        mediaImg.src = FINDER_IMAGES[state.step % FINDER_IMAGES.length];
      buildProgress();
      stepLabel.textContent =
        "STEP " + (state.step + 1) + " OF " + QUESTIONS.length;
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
        "<h3>Finding something you might enjoy…</h3>" +
        '<div class="dot-loader"><span></span><span></span><span></span></div>' +
        "</div>";
      finderApp.querySelector(".finder__foot").hidden = true;
    }

    function renderResults() {
      state.status = "results";
      const recs = window.MASAR.getRecommendations(state.answers, 3);
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
        score +
        "% match</span></div>" +
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
        exp.tags
          .map((t) => '<span class="tag-pill">' + t + "</span>")
          .join("") +
        "</div>" +
        '<div class="result-card__actions">' +
        '<button class="btn btn-dark btn-sm" data-view="' +
        exp.id +
        '">View Experience</button>' +
        '<button class="btn btn-outline btn-sm" data-save>Save</button>' +
        "</div></div>";
      return card;
    }

    function prettyLocation(v) {
      return (
        {
          amman: "Amman",
          petra: "Petra",
          "wadi-rum": "Wadi Rum",
          aqaba: "Aqaba",
          "dead-sea": "Dead Sea",
          jerash: "Jerash",
        }[v] || v
      );
    }
    function prettyWalking(v) {
      return (
        {
          minimal: "Minimal",
          some: "Light",
          active: "Active",
          "very-active": "Very active",
        }[v] || v
      );
    }
    function prettyBudget(v) {
      return (
        {
          budget: "Budget",
          moderate: "Moderate",
          premium: "Premium",
          luxury: "Luxury",
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
          '"><button class="modal__close" data-modal-close aria-label="Close">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>' +
          '<div class="modal__body">' +
          '<p class="eyebrow">' +
          prettyLocation(exp.location) +
          "</p>" +
          "<h3>" +
          exp.name +
          "</h3>" +
          '<div class="modal__meta"><span><strong>Duration</strong> ' +
          exp.duration +
          "</span>" +
          "<span><strong>Walking</strong> " +
          prettyWalking(exp.walking) +
          "</span>" +
          "<span><strong>Budget</strong> " +
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
          '<div class="result-card__actions"><button class="btn btn-primary" data-save>Save Experience</button></div>' +
          "</div>";
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

    const presetLoc = new URLSearchParams(window.location.search).get("loc");
    const validLocs = QUESTIONS[0].options.map((o) => o.v);
    if (presetLoc && validLocs.includes(presetLoc)) {
      state.answers.location = presetLoc;
      state.step = 1;
    }

    renderQuestion();
  }
})();
