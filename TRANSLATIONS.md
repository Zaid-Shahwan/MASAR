# Navigation and translations

MASAR remains plain HTML/CSS/JavaScript, served by the existing Express server. No production dependencies were added.

## Files
- The five HTML pages in jordan-tourism contain navigation and data-i18n bindings.
- css/style.css contains shared responsive navigation and RTL rules. css/profile.css and css/ai.css have small RTL additions.
- js/main.js handles menu dismissal, keyboard focus, the finder and results.
- js/i18n.js handles selection, persistence, document direction, text and attributes, including inserted UI.
- locales/en.json, ar.json and fr.json are the editable dictionaries.
- locales/catalog.js is generated and loaded before page content, so changing language requires no request or reload.
- server.js receives the selected language for new AI replies. The frontend calls the same server at /api/masar-chat.
- scripts/build-locales.mjs checks keys and interpolation parameters.
- scripts/test-i18n.mjs runs browser regression checks.

The sign-in page retains its form layout, with a language control above its tabs. Other pages have a selector in the header and mobile menu. Desktop navigation remains visible above 1100px; smaller screens use the menu to avoid crowded links.

## Edit a translation
1. Find its key in jordan-tourism/locales/en.json.
2. Edit the corresponding value in the desired language JSON.
3. Preserve parameters such as {step}, {count}, {city}, {email}.
4. Run npm run locales:build from the repository root.
5. Refresh after editing files. Language switching then happens without reloading.

Do not edit catalog.js directly. JSON does not support comments: _comments holds TODO notes for native-speaker review and is excluded from the browser catalog.

Existing HTML retains English fallback text for progressive enhancement. JSON determines the text shown with JavaScript enabled. Update fallback text too if changed wording must also appear with JavaScript disabled.

## Add a language
1. Copy en.json to jordan-tourism/locales/<code>.json, using a short code such as de.
2. Translate every value using the same keys and parameters.
3. Add an option, such as <option value="de" lang="de">Deutsch</option>, to every language select in the five HTML pages.
4. Add language.de with value Deutsch to every dictionary if binding the option with data-i18n.
5. Run npm run locales:build. JSON languages are discovered automatically.
6. Add its name to replyLanguage in server.js so new AI replies use it.
7. Extend the RTL check in js/i18n.js if necessary. Arabic, Hebrew, Persian and Urdu are recognized.

New text can use descriptive keys such as contact.title. Add the key to every dictionary and use <span data-i18n="contact.title"></span>. Attribute bindings are data-i18n-placeholder, data-i18n-alt, data-i18n-aria-label, data-i18n-title, data-i18n-content and data-i18n-data-question.

I18n.t(key) returns the chosen language. I18n.source(key) returns English from the dictionary for existing templates and language-neutral saved data. The shared renderer observes inserted UI and keeps it translated when the language changes. Use I18n.t(key, {count: 3}) for variable text. Keep visitor-entered names, emails and messages outside translation bindings.

## Run and verify
Run npm start with the existing environment configuration and open /index.html.

Browser checks need Playwright available and Microsoft Edge. Set PLAYWRIGHT_PATH to an existing Playwright package path if not locally installed, then run npm run test:i18n. Codex used its bundled Playwright runtime; no dependency was added.

Checks cover all five pages at 320, 375, 768 and 1280px in English, Arabic and French; toggle, Escape, outside tap, link dismissal, focus, header overlap, language and direction, persistent selection, finder steps, results, modal, saving, reset, form errors and AI request language. Screenshots and the report are saved in the ignored .codex-qa folder.

Firebase account operations and AI responses are mocked. Real sign-in and Gemini still depend on existing services and environment. User messages and previously generated live AI answers remain conversation content; new answers use the selected language.
