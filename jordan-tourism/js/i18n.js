/* Shared text dictionary. Source keys keep persisted experience data language-neutral. */
(function () {
  "use strict";
  const catalogs = window.MASAR_LOCALES,
    supported = Object.keys(catalogs);
  const normalize = (text) => text.replace(/\s+/g, " ").trim();
  const sourceKeys = new Map(
    Object.entries(catalogs.en).map(([key, value]) => [normalize(value), key]),
  );
  const bindings = new WeakMap(),
    attributeBindings = new WeakMap(),
    renderedKeys = new Map();
  const parameterKeys = new Map();
  for (const catalog of Object.values(catalogs))
    for (const [key, value] of Object.entries(catalog)) {
      if (!value.includes("{")) parameterKeys.set(normalize(value), key);
    }
  let language = "en",
    observer = null;
  try {
    language =
      localStorage.getItem("masar_language") ||
      navigator.language.split("-")[0];
  } catch (_) {
    language = navigator.language.split("-")[0];
  }
  if (!supported.includes(language)) language = "en";
  function t(key, params = {}) {
    const result = (catalogs[language][key] ?? catalogs.en[key] ?? key).replace(
      /\{(\w+)\}/g,
      (_, name) =>
        typeof params[name] === "string" &&
        parameterKeys.has(normalize(params[name]))
          ? catalogs[language][parameterKeys.get(normalize(params[name]))]
          : (params[name] ?? "{" + name + "}"),
    );
    renderedKeys.set(normalize(result), { key, params });
    return result;
  }
  function translateText(text) {
    const key = sourceKeys.get(normalize(text));
    if (key) return t(key);
    if (text.includes(" — "))
      return text.split(" — ").map(translateText).join(" — ");
    return text;
  }
  function ignored(el) {
    return el?.closest(
      "script, style, [data-i18n-ignore], .bubble-user, #profileName, #profileEmail, #infoName, #infoEmail, #profileAvatar, .leaflet-control-attribution",
    );
  }
  function render(root = document) {
    observer?.disconnect();
    root.querySelectorAll?.("[data-i18n]").forEach((el) => {
      if (!el.firstChild)
        el.appendChild(document.createTextNode(t(el.dataset.i18n)));
    });
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || (ignored(parent) && !parent.hasAttribute("data-i18n")))
        continue;
      const explicit = parent.getAttribute("data-i18n");
      let binding = bindings.get(node);
      if (!binding || (node.nodeValue !== binding.last && !explicit)) {
        const generated = renderedKeys.get(normalize(node.nodeValue));
        const key =
          explicit ||
          generated?.key ||
          sourceKeys.get(normalize(node.nodeValue));
        binding = key
          ? {
              key,
              params: generated?.params,
              prefix: node.nodeValue.match(/^\s*/)[0],
              suffix: node.nodeValue.match(/\s*$/)[0],
            }
          : null;
        if (binding) bindings.set(node, binding);
        else bindings.delete(node);
      }
      if (binding) {
        const next =
          binding.prefix + t(binding.key, binding.params) + binding.suffix;
        if (node.nodeValue !== next) node.nodeValue = next;
        binding.last = next;
      }
    }
    for (const el of root.querySelectorAll ? root.querySelectorAll("*") : []) {
      if (ignored(el)) continue;
      let saved = attributeBindings.get(el);
      if (!saved) {
        saved = {};
        attributeBindings.set(el, saved);
      }
      for (const attr of [
        "alt",
        "placeholder",
        "aria-label",
        "title",
        "data-question",
        "content",
      ]) {
        if (!el.hasAttribute(attr)) continue;
        const value = el.getAttribute(attr),
          explicit = el.getAttribute("data-i18n-" + attr);
        if (!saved[attr] || (value !== saved[attr].last && !explicit)) {
          const generated = renderedKeys.get(normalize(value));
          const key =
            explicit || generated?.key || sourceKeys.get(normalize(value));
          saved[attr] = key
            ? { key, params: generated?.params }
            : value.includes(" — ")
              ? { source: value }
              : null;
        }
        const binding = saved[attr];
        if (binding) {
          const next = binding.source
            ? translateText(binding.source)
            : t(binding.key, binding.params);
          if (value !== next) el.setAttribute(attr, next);
          binding.last = next;
        }
      }
    }
    document
      .querySelectorAll("[data-language-select]")
      .forEach((el) => (el.value = language));
    languagePickers.forEach((picker) => picker.sync());
    observer?.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [
        "alt",
        "placeholder",
        "aria-label",
        "title",
        "data-question",
      ],
    });
  }

  /* Enhance the native selects without changing the translation/persistence flow. */
  const languagePickers = [];
  function initLanguagePickers() {
    document
      .querySelectorAll("[data-language-select]")
      .forEach((select, index) => {
        const root = document.createElement("div");
        root.className = "language-picker";
        root.setAttribute("data-i18n-ignore", "");
        select.before(root);
        root.appendChild(select);
        select.classList.add("language-native");
        select.tabIndex = -1;
        select.setAttribute("aria-hidden", "true");
        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "language-trigger";
        trigger.setAttribute("aria-haspopup", "menu");
        trigger.setAttribute("aria-expanded", "false");
        trigger.setAttribute("aria-controls", "language-options-" + index);
        trigger.innerHTML =
          '<svg class="language-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"/></svg><span class="language-name"></span><span class="language-code" aria-hidden="true"></span><svg class="language-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>';
        root.appendChild(trigger);
        const menu = document.createElement("div");
        menu.className = "language-options";
        menu.id = "language-options-" + index;
        menu.setAttribute("role", "menu");
        menu.hidden = true;
        const heading = document.createElement("p");
        heading.className = "language-heading";
        heading.setAttribute("aria-hidden", "true");
        menu.appendChild(heading);
        const options = [...select.options].map((option) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "language-option";
          button.setAttribute("role", "menuitemradio");
          button.dataset.language = option.value;
          button.innerHTML =
            '<span class="language-badge" aria-hidden="true"></span><span class="language-option-name"></span><svg class="language-check" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m4 10 4 4 8-8"/></svg>';
          button.querySelector(".language-badge").textContent =
            option.value.toUpperCase();
          const name = button.querySelector(".language-option-name");
          name.textContent = option.textContent;
          name.lang = option.value;
          button.addEventListener("click", () => {
            close(true);
            select.value = option.value;
            select.dispatchEvent(new Event("change", { bubbles: true }));
          });
          menu.appendChild(button);
          return button;
        });
        root.appendChild(menu);
        function close(focus = false) {
          menu.hidden = true;
          trigger.setAttribute("aria-expanded", "false");
          if (focus) trigger.focus({ preventScroll: true });
        }
        function open(focus = false) {
          languagePickers.forEach((picker) => picker.close());
          menu.hidden = false;
          trigger.setAttribute("aria-expanded", "true");
          if (focus)
            (
              options.find((option) => option.dataset.language === language) ||
              options[0]
            ).focus();
        }
        function sync() {
          const selected = [...select.options].find(
            (option) => option.value === language,
          );
          const name = selected?.textContent || language.toUpperCase();
          trigger.querySelector(".language-name").textContent = name;
          trigger.querySelector(".language-code").textContent =
            language.toUpperCase();
          trigger.setAttribute("aria-label", t("nav.language") + ": " + name);
          menu.setAttribute("aria-label", t("nav.language"));
          heading.textContent = t("nav.language");
          options.forEach((option) =>
            option.setAttribute(
              "aria-checked",
              String(option.dataset.language === language),
            ),
          );
        }
        trigger.addEventListener("click", () =>
          menu.hidden ? open() : close(),
        );
        root.addEventListener("keydown", (event) => {
          if (event.key === "Escape" && !menu.hidden) {
            event.preventDefault();
            event.stopPropagation();
            close(true);
          } else if (
            ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
          ) {
            event.preventDefault();
            event.stopPropagation();
            if (menu.hidden) {
              open(true);
              return;
            }
            const current = options.indexOf(document.activeElement);
            const next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? options.length - 1
                  : (current +
                      (event.key === "ArrowDown" ? 1 : -1) +
                      options.length) %
                    options.length;
            options[next].focus();
          } else if (event.key === "Tab" && !menu.hidden) close(true);
        });
        root.addEventListener("focusout", (event) => {
          if (!root.contains(event.relatedTarget)) close();
        });
        languagePickers.push({ root, close, sync });
        sync();
      });
    document.addEventListener("pointerdown", (event) => {
      languagePickers.forEach((picker) => {
        if (!picker.root.contains(event.target)) picker.close();
      });
    });
  }

  function setLanguage(value, persist = true) {
    if (!supported.includes(value)) return;
    language = value;
    document.documentElement.lang = value;
    document.documentElement.dir = /^(ar|he|fa|ur)$/.test(value)
      ? "rtl"
      : "ltr";
    if (persist) {
      try {
        localStorage.setItem("masar_language", value);
      } catch (_) {}
    }
    render();
    document.dispatchEvent(
      new CustomEvent("masar:language-change", { detail: { language: value } }),
    );
  }
  window.I18n = {
    t,
    source: (key) => catalogs.en[key] ?? key,
    translateText,
    setLanguage,
    render,
    get language() {
      return language;
    },
  };
  document.documentElement.lang = language;
  document.documentElement.dir = /^(ar|he|fa|ur)$/.test(language)
    ? "rtl"
    : "ltr";
  // Translate parsed content before first paint where possible; later changes are observed.
  observer = new MutationObserver(() => render());
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
  });
  document.addEventListener("DOMContentLoaded", () => {
    initLanguagePickers();
    setLanguage(language, false);
    document.addEventListener("change", (e) => {
      if (e.target.matches("[data-language-select]"))
        setLanguage(e.target.value);
    });
  });
})();
