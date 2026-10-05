/* ==========================================================================
   MASAR — AI Guide page (ai.js)
   Plain JavaScript, no libraries. Sections:
     1. Settings              5. Chat messages (user, thinking, cloud)
     2. Page elements & state 6. Replies (mock now, real AI later)
     3. Character (eyes/mood) 7. Sending a message (the main flow)
     4. Small helpers         8. Events & start-up
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     1. SETTINGS — the only things you normally need to change
  ------------------------------------------------------------------ */
  const CONFIG = {
    // true  = use the sample answers in section 6 (no server needed)
    // false = call your own backend at `apiUrl` (see getAIReply below)
    useMockReplies: false,
    apiUrl: "/api/masar-chat",

    thinkingMinMs: 900, // "Thinking..." always shows at least this long
    thinkingMaxMs: 1600, // ...and mock replies never take longer than this
    typingPauseMs: 1200, // eyes return to the tourist this long after typing stops
    happyMs: 3000, // how long MASAR keeps its happy face after answering
    maxHistory: 10, // how many past messages are sent to a real AI
  };

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ------------------------------------------------------------------
     2. PAGE ELEMENTS & STATE
  ------------------------------------------------------------------ */
  const form = document.getElementById("ai-form");
  const input = document.getElementById("ai-input");
  const sendButton = document.getElementById("ai-send");
  const log = document.getElementById("ai-log");
  const character = document.getElementById("ai-character");
  const chips = document.querySelectorAll(".ai-chips [data-question]");

  const state = {
    busy: false, // true while MASAR is thinking/answering
    history: [], // [{ role: "user" | "assistant", content: "..." }]
    typingTimer: null,
    thinkTimer: null,
    happyTimer: null,
  };

  /* ------------------------------------------------------------------
     3. CHARACTER — eyes and mood
     Eyes are moved with two CSS variables (--look-x, --look-y) that ai.css
     uses to slide the pupils and lean the head. Numbers are small: about
     -7 to +7. Positive y = looking down (toward the chat and input).
  ------------------------------------------------------------------ */
  function setLook(x, y) {
    if (!character) return;
    character.style.setProperty("--look-x", x);
    character.style.setProperty("--look-y", y);
  }

  // mood: "idle" | "listening" | "thinking" | "happy"  (changes eyebrows + mouth)
  function setMood(mood) {
    if (character) character.dataset.mood = mood;
  }

  // Default pose: looking straight at the tourist.
  function lookAtTourist() {
    setMood("idle");
    setLook(0, 0);
  }

  // Tourist is typing: look down toward the input, drifting sideways as the text grows.
  function lookAtInput() {
    const length = Math.min(input.value.length, 40);
    const x = (length / 40) * 8 - 4; // -4 (start of text) to +4 (long text)
    setMood("listening");
    setLook(x, 6);
  }

  // Message just sent: look toward the new message (bottom right of the chat).
  function lookAtNewMessage() {
    setMood("listening");
    setLook(5, 7);
  }

  // While thinking: glance at the message, then look around like someone thinking.
  function startThinkingLook() {
    setMood("thinking");
    setLook(5, 6);
    const glances = [
      [-5, -4],
      [5, -3],
      [0, -5],
    ];
    let i = 0;
    state.thinkTimer = setTimeout(function next() {
      const g = glances[i % glances.length];
      setLook(g[0], g[1]);
      i++;
      state.thinkTimer = setTimeout(next, 1000);
    }, 600);
  }

  function stopThinkingLook() {
    clearTimeout(state.thinkTimer);
  }

  // Answer is on screen: look at the cloud with a happy face.
  function lookAtAnswer() {
    setMood("happy");
    setLook(0, 5);
    clearTimeout(state.happyTimer);
    state.happyTimer = setTimeout(settleEyes, CONFIG.happyMs);
  }

  // Go back to a calm pose (or keep watching the input if the tourist is typing).
  function settleEyes() {
    if (state.busy) return;
    if (document.activeElement === input && input.value.length > 0) {
      lookAtInput();
    } else {
      lookAtTourist();
    }
  }

  // Runs on every keystroke in the input.
  function handleTyping() {
    if (state.busy) return; // thinking/answering animations win
    clearTimeout(state.happyTimer);
    clearTimeout(state.typingTimer);
    if (input.value.length === 0) {
      lookAtTourist();
      return;
    }
    lookAtInput();
    // When typing pauses, the eyes gently return to the tourist.
    state.typingTimer = setTimeout(function () {
      if (!state.busy) lookAtTourist();
    }, CONFIG.typingPauseMs);
  }

  /* ------------------------------------------------------------------
     4. SMALL HELPERS
  ------------------------------------------------------------------ */
  function wait(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function randomBetween(min, max) {
    return Math.floor(min + Math.random() * (max - min));
  }

  // Keep the newest message in view. A very long answer is scrolled so that
  // its *top* is visible instead of its end.
  function scrollToMessage(element) {
    requestAnimationFrame(function () {
      const tooTall = element && element.offsetHeight > log.clientHeight * 0.8;
      const top = tooTall ? element.offsetTop - 28 : log.scrollHeight;
      log.scrollTo({
        top: top,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }

  function setBusy(isBusy) {
    state.busy = isBusy;
    sendButton.disabled = isBusy;
    chips.forEach(function (chip) {
      chip.disabled = isBusy;
    });
    form.setAttribute("aria-busy", isBusy ? "true" : "false");
  }

  /* ------------------------------------------------------------------
     5. CHAT MESSAGES
  ------------------------------------------------------------------ */

  // The tourist's message (textContent, never innerHTML, so nothing typed can run as code).
  function addUserMessage(text) {
    const bubble = document.createElement("div");
    bubble.className = "bubble-user";
    bubble.textContent = text;
    log.appendChild(bubble);
    scrollToMessage(bubble);
  }

  // Only the newest cloud floats; older ones stay still.
  function clearLatestCloud() {
    log.querySelectorAll(".cloud-wrap.is-latest").forEach(function (el) {
      el.classList.remove("is-latest");
    });
  }

  function makeTail() {
    const tail = document.createElement("span");
    tail.className = "cloud__tail";
    tail.setAttribute("aria-hidden", "true");
    tail.innerHTML = "<i></i><i></i>";
    return tail;
  }

  // Small cloud with bouncing dots + "Thinking...". It is later filled with the answer.
  function addThinkingCloud() {
    clearLatestCloud();
    const wrap = document.createElement("div");
    wrap.className = "cloud-wrap cloud-wrap--pop is-latest";

    const cloud = document.createElement("div");
    cloud.className = "cloud is-thinking";
    cloud.appendChild(makeTail());

    const dots = document.createElement("span");
    dots.className = "dots";
    dots.setAttribute("aria-hidden", "true");
    dots.innerHTML = "<span></span><span></span><span></span>";
    cloud.appendChild(dots);

    const label = document.createElement("span");
    label.textContent = window.I18n.source("text.559");
    cloud.appendChild(label);

    wrap.appendChild(cloud);
    log.appendChild(wrap);
    scrollToMessage(wrap);
    return wrap;
  }

  // Turn the thinking cloud into the real answer and make it pop up.
  // `reply` looks like: { text: "...", link: { href: "...", label: "..." } (optional) }
  function fillCloud(wrap, reply) {
    const cloud = wrap.querySelector(".cloud");
    cloud.className = "cloud";
    cloud.setAttribute("data-i18n-ignore", "");
    cloud.innerHTML = "";
    cloud.appendChild(makeTail());

    // Split the text into paragraphs, and every paragraph into words.
    reply.text = window.I18n.translateText(reply.text);
    const paragraphs = reply.text.split(/\n+/).filter(Boolean); // each line = one paragraph
    const totalWords = reply.text.split(/\s+/).filter(Boolean).length;
    // Words appear one after another, but a long answer never takes more than ~2 seconds.
    const step = prefersReducedMotion
      ? 0
      : Math.min(40, 2000 / Math.max(totalWords, 1));
    let wordIndex = 0;

    paragraphs.forEach(function (paragraph) {
      const p = document.createElement("p");
      paragraph
        .trim()
        .split(/\s+/)
        .forEach(function (word, i, all) {
          const span = document.createElement("span");
          span.className = "word";
          span.style.animationDelay = 250 + wordIndex * step + "ms";
          span.textContent = word;
          p.appendChild(span);
          if (i < all.length - 1) p.appendChild(document.createTextNode(" "));
          wordIndex++;
        });
      cloud.appendChild(p);
    });

    if (reply.link) {
      const a = document.createElement("a");
      a.className = "btn btn-outline btn-sm cloud__link";
      a.href = reply.link.href;
      a.textContent = reply.link.label;
      cloud.appendChild(a);
    }

    // Place cards, emergency numbers, location prompt, quick-reply chips (from ai-geo.js).
    if (reply.extras && window.MASAR_GEO) {
      window.MASAR_GEO.renderExtras(cloud, reply, { ask: sendMessage });
    }

    // Restart the pop animation for the real answer.
    wrap.classList.remove("cloud-wrap--pop");
    void wrap.offsetWidth; // forces the browser to notice the change
    wrap.classList.add("cloud-wrap--pop");
    scrollToMessage(wrap);
  }

  /* ------------------------------------------------------------------
     6. REPLIES
  ------------------------------------------------------------------ */

  // The one function the rest of the page calls to get an answer.
  // Must return (a Promise of) { text: "...", link?: { href, label } }.
  async function getAIReply() {
    const lastUserMessage = state.history[state.history.length - 1].content;
    const jordanAnalysis = window.MASAR_JORDAN_AI
      ? window.MASAR_JORDAN_AI.analyze(lastUserMessage)
      : null;
    const jordanPrompt = window.MASAR_JORDAN_AI
      ? window.MASAR_JORDAN_AI.buildPrompt(lastUserMessage, jordanAnalysis)
      : "";

    // Places / location / emergency questions are answered by js/ai-geo.js from real map data.
    // It returns null for everything else, so the tourism answers below work exactly as before.
    if (window.MASAR_GEO) {
      const placesReply = await window.MASAR_GEO.handle(lastUserMessage, {
        knowledge: getMockReply,
      });
      if (placesReply) return placesReply;
    }

    if (CONFIG.useMockReplies) {
      return getMockReply(lastUserMessage);
    }

    // ---- REAL AI: connect your backend here ---------------------------------
    // Your server (not this file!) should hold the secret API key, add a system
    // prompt such as "You are MASAR, a friendly, concise Jordan tourism guide...",
    // call the AI provider, and answer with JSON:  { "reply": "text", "link": {...} }
    // NEVER put an API key in JavaScript that runs in the browser.
    const response = await fetch(CONFIG.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: window.I18n.language,
        messages: [
          {
            role: "system",
            content: jordanPrompt,
          },
        ].concat(state.history.slice(-CONFIG.maxHistory)),
        // optional: only present after the visitor confirmed a location
        location: window.MASAR_GEO ? window.MASAR_GEO.getLocation() : null,
      }),
    });
    if (!response.ok) throw new Error("Server error " + response.status);
    const data = await response.json();
    return { text: data.reply, link: data.link };
  }

  // ---- Sample answers (demo only) ------------------------------------------
  // Each rule = a pattern to look for + the answer. The first match wins, so
  // more specific rules come first. Add or edit rules freely.
  const ARABIC_MOCK_RULES = [
    {
      test: /عمان|عمّان|عمان/,
      keywords:
        /سياح|اماكن|أماكن|زيارة|ازور|أزور|فعال|وين|شو في|شو ممكن|تنزه|طلعة/,
      text: window.I18n.source("text.562"),
    },
    {
      test: /بترا|البتراء|petra/,
      keywords: /سياح|اماكن|أماكن|زيارة|ازور|أزور|شو|وين|ممكن/,
      text: window.I18n.source("text.563"),
    },
    {
      test: /وادي رم|وادي رَم|wadi rum/,
      keywords: /سياح|اماكن|أماكن|زيارة|ازور|أزور|شو|وين|ممكن/,
      text: window.I18n.source("text.564"),
    },
    {
      test: /العقبة|عقبة|aqaba/,
      keywords: /سياح|اماكن|أماكن|زيارة|ازور|أزور|شو|وين|ممكن|بحر/,
      text: window.I18n.source("text.565"),
    },
    {
      test: /جرش|jerash/,
      keywords: /سياح|اماكن|أماكن|زيارة|ازور|أزور|شو|وين|ممكن/,
      text: window.I18n.source("text.566"),
    },
    {
      test: /البحر الميت|بحر الميت|dead sea/,
      keywords: /سياح|اماكن|أماكن|زيارة|ازور|أزور|شو|وين|ممكن|سباحة|استرخاء/,
      text: window.I18n.source("text.567"),
    },
    {
      test: /مادبا|مادبا|madaba/,
      keywords: /سياح|اماكن|أماكن|زيارة|ازور|أزور|شو|وين|ممكن/,
      text: window.I18n.source("text.568"),
    },
    {
      test: /وين|أين|شو في|شو ممكن|اقترح|اقتراح|احسن|أحسن|افضل|أفضل/,
      keywords: /سياح|اماكن|أماكن|طلعات|زيارة|ازور|أزور|اشي|شي/,
      text: window.I18n.source("text.569"),
    },
  ];

  const MOCK_RULES = [
    {
      test: /madaba|mosaic map|mount nebo/,
      text: window.I18n.source("text.570"),
      link: {
        href: "explore.html?loc=amman",
        label: window.I18n.source("text.571"),
      },
    },
    {
      test: /petra|treasury|\bsiq\b|monastery/,
      text: window.I18n.source("text.572"),
      link: {
        href: "explore.html?loc=petra",
        label: window.I18n.source("text.573"),
      },
    },
    {
      test: /wadi rum|desert|bedouin|camp/,
      text: window.I18n.source("text.574"),
      link: {
        href: "explore.html?loc=wadi-rum",
        label: window.I18n.source("text.575"),
      },
    },
    {
      test: /aqaba|red sea|snorkel|diving|\bdive\b|beach/,
      text: window.I18n.source("text.576"),
      link: {
        href: "explore.html?loc=aqaba",
        label: window.I18n.source("text.577"),
      },
    },
    {
      test: /dead sea|float|salt water|mud/,
      text: window.I18n.source("text.578"),
      link: {
        href: "explore.html?loc=dead-sea",
        label: window.I18n.source("text.579"),
      },
    },
    {
      test: /jerash|\broman\b|hadrian|ruins/,
      text: window.I18n.source("text.580"),
      link: {
        href: "explore.html?loc=jerash",
        label: window.I18n.source("text.581"),
      },
    },
    {
      test: /amman/,
      text: window.I18n.source("text.582"),
      link: {
        href: "explore.html?loc=amman",
        label: window.I18n.source("text.583"),
      },
    },
    {
      test: /mansaf|national dish/,
      text: window.I18n.source("text.584"),
      link: {
        href: "explore.html?loc=amman",
        label: window.I18n.source("text.585"),
      },
    },
    {
      test: /food|\beat\b|dish|restaurant|hungry|breakfast|lunch|dinner|cuisine/,
      text: window.I18n.source("text.586"),
      link: {
        href: "explore.html?loc=amman",
        label: window.I18n.source("text.585"),
      },
    },
    {
      test: /family|kids|children|child/,
      text: window.I18n.source("text.587"),
      link: { href: "explore.html", label: window.I18n.source("text.588") },
    },
    {
      test: /night|evening|after dark|nightlife/,
      text: window.I18n.source("text.589"),
      link: { href: "explore.html", label: window.I18n.source("text.590") },
    },
    {
      test: /outdoor|hik|adventure|active|nature|canyon/,
      text: window.I18n.source("text.591"),
      link: { href: "explore.html", label: window.I18n.source("text.592") },
    },
    {
      test: /\b(1|one)[ -]?day\b|a day in|day trip/,
      text: window.I18n.source("text.593"),
    },
    {
      test: /\b(\d+|two|three|four|five|six|seven)[ -]?days?\b|a week|week in/,
      text: window.I18n.source("text.594"),
      link: { href: "explore.html", label: window.I18n.source("text.595") },
    },
    {
      test: /plan|itinerary|trip|route|schedule/,
      text: window.I18n.source("text.596"),
    },
    {
      test: /know before|before (i )?(visit|travel|go|come)|tips|prepare|advice|visa|currency|money|safe/,
      text: window.I18n.source("text.597"),
    },
    {
      test: /culture|custom|people|tradition|hospitality|etiquette|language|arabic/,
      text: window.I18n.source("text.598"),
    },
    {
      test: /near me|nearby|around me|close to me|where i am/,
      text: window.I18n.source("text.599"),
      link: { href: "explore.html", label: window.I18n.source("text.600") },
    },
    {
      test: /today|right now|this afternoon|this morning|tonight|\bnow\b/,
      text: window.I18n.source("text.601"),
      link: { href: "explore.html", label: window.I18n.source("text.602") },
    },
    {
      test: /visit|\bsee\b|\bgo\b|place|where|recommend|best|should/,
      text: window.I18n.source("text.603"),
      link: { href: "explore.html", label: window.I18n.source("text.604") },
    },
    {
      test: /thank|thanks|shukran|great|awesome|perfect/,
      text: window.I18n.source("text.605"),
    },
    {
      test: /^(hi|hello|hey|hola|salam|marhaba|good (morning|afternoon|evening))\b|who are you|what are you|what can you do/,
      text: window.I18n.source("text.606"),
    },
  ];

  const MOCK_FALLBACK = {
    text: window.I18n.source("text.607"),
    link: { href: "explore.html", label: window.I18n.source("text.608") },
  };

  function getMockReply(message) {
    const text = message.toLowerCase();

    // Arabic / Jordanian questions
    const arabicRule = ARABIC_MOCK_RULES.find(function (r) {
      return r.test.test(text) && r.keywords.test(text);
    });

    if (arabicRule) {
      return {
        text: arabicRule.text,
        link: arabicRule.link || null,
      };
    }

    // Existing English rules
    const rule = MOCK_RULES.find(function (r) {
      return r.test.test(text);
    });

    const reply = rule || MOCK_FALLBACK;

    return {
      text: reply.text,
      link: reply.link || null,
    };
  }

  /* ------------------------------------------------------------------
     7. SENDING A MESSAGE — the main flow
        send -> user bubble -> eyes look at it -> thinking cloud
        -> answer arrives -> cloud pops -> happy face -> calm again
  ------------------------------------------------------------------ */
  function nudgeEmptyInput() {
    form.classList.remove("is-nudging");
    void form.offsetWidth;
    form.classList.add("is-nudging");
    input.focus();
  }

  async function sendMessage(rawText) {
    const text = rawText.trim();

    if (!text) {
      // empty or spaces only: don't send
      nudgeEmptyInput();
      return;
    }
    if (state.busy) return; // one answer at a time

    setBusy(true);
    clearTimeout(state.typingTimer);
    clearTimeout(state.happyTimer);

    input.value = "";
    state.history.push({ role: "user", content: text });
    addUserMessage(text);
    lookAtNewMessage();

    const thinkingCloud = addThinkingCloud();
    startThinkingLook();

    // Wait for the answer AND a minimum "thinking" time, so it never feels instant or robotic.
    const minimumThinking = wait(
      randomBetween(CONFIG.thinkingMinMs, CONFIG.thinkingMaxMs),
    );
    let reply;
    try {
      const results = await Promise.all([getAIReply(), minimumThinking]);
      reply = results[0];
    } catch (error) {
      console.error("MASAR AI error:", error);
      reply = {
        text: window.I18n.source("text.610"),
      };
    }

    stopThinkingLook();
    fillCloud(thinkingCloud, reply);
    state.history.push({ role: "assistant", content: reply.text });
    setBusy(false);
    lookAtAnswer();
    if (document.activeElement !== input && window.innerWidth > 700)
      input.focus({ preventScroll: true });
  }

  // The visitor confirmed a location on the map: continue the search they were waiting for.
  async function respondToConfirmedLocation() {
    if (!window.MASAR_GEO) return;
    while (state.busy) await wait(200);
    setBusy(true);
    const cloud = addThinkingCloud();
    startThinkingLook();
    const minimumThinking = wait(
      randomBetween(CONFIG.thinkingMinMs, CONFIG.thinkingMaxMs),
    );
    let reply;
    try {
      const results = await Promise.all([
        window.MASAR_GEO.onLocationConfirmed(),
        minimumThinking,
      ]);
      reply = results[0];
    } catch (error) {
      console.error("MASAR AI error:", error);
      reply = {
        text: window.I18n.source("text.610"),
      };
    }
    stopThinkingLook();
    fillCloud(cloud, reply);
    state.history.push({ role: "assistant", content: reply.text });
    setBusy(false);
    lookAtAnswer();
  }

  /* ------------------------------------------------------------------
     8. EVENTS & START-UP
  ------------------------------------------------------------------ */
  function init() {
    if (!form || !input || !log) return;

    // Send button, and the Enter key (a form submits on Enter automatically).
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      sendMessage(input.value);
    });

    // Eyes follow typing.
    input.addEventListener("input", handleTyping);
    input.addEventListener("blur", function () {
      clearTimeout(state.typingTimer);
      if (!state.busy) lookAtTourist();
    });

    // Suggestion chips: put a ready-made question into the chat.
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        sendMessage(chip.getAttribute("data-question"));
      });
    });

    document.addEventListener(
      "masar:location-confirmed",
      respondToConfirmedLocation,
    );

    lookAtTourist();
  }

  // Lets you test the sample answers from the browser console:
  //   MASAR_AI.getMockReply("where is petra")
  window.MASAR_AI = { getMockReply: getMockReply };

  init();
})();
