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
    apiUrl: "https://masar-rud6.onrender.com/api/masar-chat",

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
    label.textContent = "Thinking...";
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
    cloud.innerHTML = "";
    cloud.appendChild(makeTail());

    // Split the text into paragraphs, and every paragraph into words.
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
      text: "بعمان عندك خيارات كثير حلوة 👌\n\nإذا بتحب الأماكن التاريخية، ابدأ بقلعة عمّان والمسرح الروماني، وبعدها انزل على وسط البلد. وإذا بتحب الأجواء والمقاهي، Rainbow Street وجبل اللويبدة خيارات معروفة.\n\nإذا بتحكيلي شو بتحب أكثر — تاريخ، أكل، طبيعة، تسوق أو طلعات — بقدر أرتبلك اقتراحات أنسب.",
    },
    {
      test: /بترا|البتراء|petra/,
      keywords: /سياح|اماكن|أماكن|زيارة|ازور|أزور|شو|وين|ممكن/,
      text: "البتراء من أشهر الأماكن السياحية بالأردن. ممكن تبدأ بالممر السيق، وبعدها الخزنة، وإذا عندك وقت كمل للمقابر الملكية والدير.\n\nإذا بدك، بقدر أرتبلك برنامج زيارة للبتراء حسب عدد الساعات اللي معك.",
    },
    {
      test: /وادي رم|وادي رَم|wadi rum/,
      keywords: /سياح|اماكن|أماكن|زيارة|ازور|أزور|شو|وين|ممكن/,
      text: "وادي رم ممتاز إذا بتحب الطبيعة والمغامرة 🏜️\n\nمن أشهر الأشياء هناك جولات الجيب، مشاهدة الغروب، والمبيت بالمخيمات وتجربة أجواء الصحراء.\n\nإذا بتحب، احكيلي إذا بدك زيارة يوم واحد أو مبيت وبساعدك ترتبها.",
    },
    {
      test: /العقبة|عقبة|aqaba/,
      keywords: /سياح|اماكن|أماكن|زيارة|ازور|أزور|شو|وين|ممكن|بحر/,
      text: "بالعقبة عندك البحر الأحمر، الشواطئ، والأنشطة البحرية مثل السنوركلينغ والغوص، بالإضافة للمطاعم والتمشية على الواجهة البحرية.\n\nإذا بدك، بقدر أعطيك برنامج يوم كامل بالعقبة.",
    },
    {
      test: /جرش|jerash/,
      keywords: /سياح|اماكن|أماكن|زيارة|ازور|أزور|شو|وين|ممكن/,
      text: "جرش خيار ممتاز إذا بتحب التاريخ والآثار. أهم شيء تشوف الشارع المعمد، الساحة البيضاوية، والمسرح الجنوبي وقوس هادريان.\n\nوممكن تعملها كرحلة يوم من عمّان.",
    },
    {
      test: /البحر الميت|بحر الميت|dead sea/,
      keywords: /سياح|اماكن|أماكن|زيارة|ازور|أزور|شو|وين|ممكن|سباحة|استرخاء/,
      text: "البحر الميت مناسب إذا بدك استرخاء وتجربة مختلفة، خصوصًا الطفو بالمياه المالحة والاستمتاع بالمناظر.\n\nإذا بدك، بقدر أرتبلك طلعة للبحر الميت من عمّان.",
    },
    {
      test: /مادبا|مادبا|madaba/,
      keywords: /سياح|اماكن|أماكن|زيارة|ازور|أزور|شو|وين|ممكن/,
      text: "مادبا حلوة للي بحب التاريخ والثقافة. من أشهر الأماكن فيها خريطة مادبا الفسيفسائية، وممكن تجمعها مع جبل نيبو بنفس اليوم.",
    },
    {
      test: /وين|أين|شو في|شو ممكن|اقترح|اقتراح|احسن|أحسن|افضل|أفضل/,
      keywords: /سياح|اماكن|أماكن|طلعات|زيارة|ازور|أزور|اشي|شي/,
      text: "أكيد 👌 بالأردن عندك خيارات كثيرة: عمّان للتاريخ والأكل والجو المدني، جرش للآثار، مادبا وجبل نيبو للتاريخ، البحر الميت للاسترخاء، البتراء ووادي رم للمغامرة، والعقبة للبحر.\n\nإذا بتحكيلي بأي مدينة أنت وكم معك وقت، بقدر أضيّقلك الخيارات.",
    },
  ];

  const MOCK_RULES = [
    {
      test: /madaba|mosaic map|mount nebo/,
      text: "Madaba is a wonderful place to explore Jordanian history! Visit St. George's Church to see its famous Byzantine mosaic map of the Holy Land, wander through the Madaba Archaeological Park, and then continue to Mount Nebo for beautiful views over the valley.\n\nIt's an easy half-day trip from Amman.",
      link: {
        href: "explore.html?loc=amman",
        label: "See experiences near Amman",
      },
    },
    {
      test: /petra|treasury|\bsiq\b|monastery/,
      text: "Petra is pure magic! Walk through the Siq, a narrow canyon, until the Treasury appears in front of you. Then keep going to the Royal Tombs and, if you have the energy, climb the steps up to the Monastery. It's even bigger than the Treasury and much quieter.\n\nGo early for cooler air and soft light, wear comfy shoes, and bring plenty of water.",
      link: { href: "explore.html?loc=petra", label: "See Petra experiences" },
    },
    {
      test: /wadi rum|desert|bedouin|camp/,
      text: "Wadi Rum feels like another planet! Hop on a jeep tour through the red sand and giant rocks, watch the sunset from a dune, and spend a night in a Bedouin camp. The stars out there are unforgettable.\n\nLove walking? Ask your guide about a short hike up one of the rock bridges.",
      link: {
        href: "explore.html?loc=wadi-rum",
        label: "See Wadi Rum experiences",
      },
    },
    {
      test: /aqaba|red sea|snorkel|diving|\bdive\b|beach/,
      text: "Aqaba is Jordan's relaxed seaside escape on the Red Sea. You can snorkel or dive over colorful coral, take a boat trip, or simply enjoy fresh grilled fish by the water at sunset.\n\nThe weather is warm for much of the year, so it's a great place to slow down after Petra and Wadi Rum.",
      link: { href: "explore.html?loc=aqaba", label: "See Aqaba experiences" },
    },
    {
      test: /dead sea|float|salt water|mud/,
      text: "The Dead Sea is the lowest point on land, and the water is so salty that you float without trying! Cover yourself in mineral mud, take a relaxing float, and rinse off with a view across the water.\n\nA few tips: keep the water out of your eyes, avoid shaving right before, and don't stay in for too long.",
      link: {
        href: "explore.html?loc=dead-sea",
        label: "See Dead Sea experiences",
      },
    },
    {
      test: /jerash|\broman\b|hadrian|ruins/,
      text: "Jerash is one of the best-preserved Roman cities anywhere, about an hour north of Amman. Walk the long columned street, stand in the Oval Plaza, and see Hadrian's Arch at the entrance.\n\nGo in the morning when it's cooler and quieter.",
      link: {
        href: "explore.html?loc=jerash",
        label: "See Jerash experiences",
      },
    },
    {
      test: /amman/,
      text: "Amman is a city you discover slowly! Start at the Citadel for views over the hills, visit the Roman Theatre downtown, and wander the busy souks. Then head to Rainbow Street for cafes and a sunset.\n\nHungry? Try hummus and falafel for breakfast and finish with warm knafeh.",
      link: { href: "explore.html?loc=amman", label: "See Amman experiences" },
    },
    {
      test: /mansaf|national dish/,
      text: "Mansaf is Jordan's national dish, and you really should try it! It's tender lamb in a tangy dried-yogurt sauce, served over rice and traditionally shared from one big platter.\n\nMany Jordanian restaurants serve it, and it's extra special at a Bedouin camp or with a local family.",
      link: { href: "explore.html?loc=amman", label: "Find a food experience" },
    },
    {
      test: /food|\beat\b|dish|restaurant|hungry|breakfast|lunch|dinner|cuisine/,
      text: "Jordanian food is all about sharing! Try mansaf (lamb with rice and yogurt sauce), maqluba (a flipped-over rice and vegetable dish), and hummus with falafel for breakfast. For dessert, warm knafeh with cheese and syrup is a must.\n\nAnd say yes when someone offers you mint tea or Arabic coffee!",
      link: { href: "explore.html?loc=amman", label: "Find a food experience" },
    },
    {
      test: /family|kids|children|child/,
      text: "Jordan is great with kids! They'll love floating in the Dead Sea, riding in a jeep through Wadi Rum, and snorkeling in Aqaba. In Amman, an easy visit to the Citadel followed by ice cream is a big hit.\n\nTell me how old your kids are and I'll narrow it down.",
      link: { href: "explore.html", label: "Find family experiences" },
    },
    {
      test: /night|evening|after dark|nightlife/,
      text: "Evenings in Jordan are lovely! In Amman, enjoy a rooftop dinner on Rainbow Street. In Wadi Rum, stargazing is unbeatable. Petra also offers a candlelit night visit on certain evenings, so check the schedule, and Aqaba is perfect for a sunset walk along the waterfront.",
      link: { href: "explore.html", label: "Find evening experiences" },
    },
    {
      test: /outdoor|hik|adventure|active|nature|canyon/,
      text: "Jordan is a playground for outdoor lovers! Hike the trails around Petra, climb the rock bridges in Wadi Rum, dive the Red Sea in Aqaba, or explore the green Dana Biosphere Reserve. Some canyon trails are seasonal, so check what's open when you go.",
      link: { href: "explore.html", label: "Find adventure experiences" },
    },
    {
      test: /\b(1|one)[ -]?day\b|a day in|day trip/,
      text: "For one day, I'd stay in Amman. Morning: the Citadel and the Roman Theatre. Lunch: hummus and falafel downtown, then a stroll through the souks. Afternoon: coffee and sweets. Evening: sunset and dinner on Rainbow Street.\n\nWant something further away? Jerash is a lovely day trip from Amman.",
    },
    {
      test: /\b(\d+|two|three|four|five|six|seven)[ -]?days?\b|a week|week in/,
      text: "Here's a simple plan you can stretch or shorten:\n\nDay 1: Amman, with the Citadel, downtown and dinner, plus Jerash if you have energy.\nDay 2: Petra, starting early.\nDay 3: Wadi Rum for a jeep tour and a night under the stars, then the Dead Sea or Aqaba to relax.\n\nHave more days? Add Madaba and Mount Nebo. Tell me your pace and I'll adjust it!",
      link: { href: "explore.html", label: "Build your own shortlist" },
    },
    {
      test: /plan|itinerary|trip|route|schedule/,
      text: 'I\'d love to help you plan! How many days do you have? Tell me something like "3 days" or "one day in Amman", and add what you enjoy (history, food, adventure, relaxing) and I\'ll sketch a trip for you.',
    },
    {
      test: /know before|before (i )?(visit|travel|go|come)|tips|prepare|advice|visa|currency|money|safe/,
      text: "A few friendly basics: Jordan's currency is the Jordanian dinar (JOD), and spring and autumn are the most comfortable seasons. Dress modestly at religious sites, carry some cash for small shops, and bring water and sun protection.\n\nThe Jordan Pass can bundle entry fees, so it's worth checking its current rules on the official website before you fly.",
    },
    {
      test: /culture|custom|people|tradition|hospitality|etiquette|language|arabic/,
      text: "Jordanians are famous for their hospitality. You may be offered tea or coffee, and saying yes is a lovely way to connect. Dress modestly, especially at religious sites, and ask before photographing people. The weekend is Friday and Saturday.\n\nTwo words to try: marhaba (hello) and shukran (thank you)!",
    },
    {
      test: /near me|nearby|around me|close to me|where i am/,
      text: "I can't see where you are, but tell me your city or town (Amman, Petra, Aqaba...) and I'll suggest things close by. Or answer five quick questions and I'll match you with experiences.",
      link: { href: "explore.html", label: "Find experiences near me" },
    },
    {
      test: /today|right now|this afternoon|this morning|tonight|\bnow\b/,
      text: "Let's make today great! Tell me where you are and how much time you have. In the meantime, a good rule: see outdoor sights in the morning before the heat, enjoy a long local lunch, and catch the sunset from a viewpoint.",
      link: { href: "explore.html", label: "Find something for today" },
    },
    {
      test: /visit|\bsee\b|\bgo\b|place|where|recommend|best|should/,
      text: "Jordan has something for every traveler! You could explore Petra, float in the Dead Sea, discover the Roman ruins in Jerash, sleep under the stars in Wadi Rum, and enjoy the beaches of Aqaba. Amman ties it all together with great food.\n\nTell me what you enjoy and I'll narrow it down!",
      link: { href: "explore.html", label: "Find your experience" },
    },
    {
      test: /thank|thanks|shukran|great|awesome|perfect/,
      text: "You're so welcome! Ask me anything else about Jordan, anytime.",
    },
    {
      test: /^(hi|hello|hey|hola|salam|marhaba|good (morning|afternoon|evening))\b|who are you|what are you|what can you do/,
      text: "Hi there! I'm MASAR, your friendly guide to Jordan. I can suggest places to visit, local food to try, things to do today, and simple trip plans. What are you curious about?",
    },
  ];

  const MOCK_FALLBACK = {
    text: "I'm not certain about that specific detail, so I don't want to give you incorrect information. Try asking me about another topic related to Jordan.",
    link: { href: "explore.html", label: "Try the Experience Finder" },
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
        text: "Oops, I got a little lost there. Could you try asking again?",
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
        text: "Oops, I got a little lost there. Could you try asking again?",
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
