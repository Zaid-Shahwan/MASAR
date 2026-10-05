/* Browser regression checks; requires Playwright via PLAYWRIGHT_PATH or a local installation.
   Firebase and AI are mocked so these checks do not write to real accounts or call paid APIs. */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import express from "express";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const app = express();
app.use(express.static(path.resolve("jordan-tourism")));
const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const origin = "http://127.0.0.1:" + server.address().port;
const browser = await chromium.launch({ headless: true, channel: "msedge" });
const report = [],
  errors = [];
fs.mkdirSync(".codex-qa", { recursive: true });
const user = {
  uid: "test-user",
  displayName: "Test Visitor",
  email: "test@example.com",
  providerData: [],
};
const mockAuth = [
  "const user = " + JSON.stringify(user) + ";",
  "export const getAuth = () => ({currentUser:user});",
  "export const onAuthStateChanged = (auth, callback) => { callback(user); return () => {}; };",
  "export const signOut = async () => {};",
  "export const sendPasswordResetEmail = async () => {};",
  "export const setPersistence = async () => {};",
  "export const browserLocalPersistence = {};",
  "export const createUserWithEmailAndPassword = async () => ({user});",
  'export const signInWithEmailAndPassword = async () => { throw {code:"auth/invalid-credential"}; };',
  "export const updateProfile = async () => {};",
].join("\n");
try {
  for (const width of [320, 375, 768, 1280]) {
    for (const language of ["en", "ar", "fr"]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        locale: language,
        hasTouch: width < 769,
      });
      await context.route("https://www.gstatic.com/firebasejs/**", (route) =>
        route.fulfill({
          contentType: "text/javascript",
          headers: { "access-control-allow-origin": "*" },
          body: route.request().url().includes("firebase-app")
            ? "export const initializeApp = () => ({});"
            : mockAuth,
        }),
      );
      await context.route("**/api/masar-chat", async (route) => {
        const request = route.request().postDataJSON();
        assert.equal(request.language, language);
        await route.fulfill({
          json: {
            reply: {
              en: "A local test answer.",
              ar: "إجابة محلية للاختبار.",
              fr: "Une réponse locale de test.",
            }[language],
          },
        });
      });
      const page = await context.newPage();
      page.on("pageerror", (error) =>
        errors.push({ width, language, error: error.message }),
      );
      for (const file of [
        "index.html",
        "explore.html",
        "ai.html",
        "signin.html",
        "profile.html",
      ]) {
        await page.goto(origin + "/" + file, { waitUntil: "domcontentloaded" });
        await page.waitForFunction(
          () => window.I18n && document.querySelector("[data-language-select]"),
        );
        await page.waitForTimeout(150);
        assert.equal(await page.locator("html").getAttribute("lang"), language);
        assert.equal(
          await page.locator("html").getAttribute("dir"),
          language === "ar" ? "rtl" : "ltr",
        );
        const overflow = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          viewport: innerWidth,
        }));
        assert.ok(
          overflow.scroll <= width,
          file +
            " " +
            language +
            " overflows at " +
            width +
            ": " +
            JSON.stringify(overflow),
        );
        if (file === "index.html")
          await page.screenshot({
            path: ".codex-qa/home-" + width + "-" + language + ".png",
          });
        const missing = await page.evaluate(() =>
          [...document.querySelectorAll("[data-i18n]")]
            .filter((el) => !window.MASAR_LOCALES.en[el.dataset.i18n])
            .map((el) => el.dataset.i18n),
        );
        assert.deepEqual(missing, []);
        const untranslated = await page.evaluate(() =>
          [...document.querySelectorAll("[data-i18n]")]
            .filter(
              (el) =>
                el.textContent.trim().replace(/\\s+/g, " ") !==
                I18n.t(el.dataset.i18n).trim().replace(/\\s+/g, " "),
            )
            .map((el) => el.dataset.i18n),
        );
        assert.deepEqual(untranslated, []);
        if (file !== "signin.html") {
          const overlap = await page.evaluate(() => {
            const children = [
              ...document.querySelector(".site-header .container").children,
            ]
              .filter((el) => getComputedStyle(el).display !== "none")
              .map((el) => el.getBoundingClientRect());
            return children.some((a, i) =>
              children.some(
                (b, j) => i < j && a.left < b.right && b.left < a.right,
              ),
            );
          });
          assert.equal(
            overlap,
            false,
            "Header overlaps: " + file + " " + width + " " + language,
          );
        }
        if (file !== "signin.html" && width < 1101) {
          const toggle = page.locator(".hamburger"),
            menu = page.locator("#mobile-menu");
          const box = await toggle.boundingBox();
          assert.ok(box.width >= 44 && box.height >= 44);
          assert.equal(await menu.evaluate((el) => el.inert), true);
          await toggle.click();
          assert.equal(await toggle.getAttribute("aria-expanded"), "true");
          assert.equal(await menu.evaluate((el) => el.inert), false);
          await page.keyboard.press("Shift+Tab");
          assert.equal(
            await page.evaluate(
              () =>
                document.activeElement ===
                document.querySelector("#mobile-menu a:last-child"),
            ),
            true,
          );
          await page.keyboard.press("Tab");
          assert.equal(
            await page.evaluate(
              () =>
                document.activeElement === document.querySelector(".hamburger"),
            ),
            true,
          );
          await page.keyboard.press("Escape");
          assert.equal(await toggle.getAttribute("aria-expanded"), "false");
          await toggle.click();
          await toggle.click();
          assert.equal(await toggle.getAttribute("aria-expanded"), "false");
          await toggle.click();
          await page.evaluate(() => {
            const link = document.querySelector("#mobile-menu a");
            link.addEventListener("click", (event) => event.preventDefault(), {
              once: true,
            });
            link.click();
          });
          await page.waitForLoadState("domcontentloaded");
          assert.equal(await toggle.getAttribute("aria-expanded"), "false");
          await toggle.click();
          await page
            .locator(".menu-backdrop")
            .click({
              position: { x: 3, y: 880 - (await menu.boundingBox()).y },
            });
          assert.equal(await toggle.getAttribute("aria-expanded"), "false");
        }
        // Switching twice must restore both text and direction without reloading.
        await page
          .locator("[data-language-select]")
          .first()
          .selectOption(language === "ar" ? "en" : "ar");
        assert.equal(
          await page.evaluate(() => I18n.language),
          language === "ar" ? "en" : "ar",
        );
        await page
          .locator("[data-language-select]")
          .first()
          .selectOption(language);
        assert.equal(
          await page.evaluate(() => localStorage.getItem("masar_language")),
          language,
        );
        await page.reload({ waitUntil: "domcontentloaded" });
        assert.equal(await page.locator("html").getAttribute("lang"), language);
        console.log("PASS " + width + " " + language + " " + file);
        report.push({ width, language, page: file, passed: true });
      }
      await page.goto(origin + "/explore.html", {
        waitUntil: "domcontentloaded",
      });
      for (const choice of ["amman", "few-hours", "food", "some", "moderate"]) {
        await page.locator('[data-value="' + choice + '"]').click();
        await page.locator("[data-finder-next]").click();
      }
      await page.waitForSelector(".result-card");
      await page
        .locator("[data-language-select]")
        .first()
        .selectOption(language === "ar" ? "fr" : "ar");
      await page.waitForTimeout(50);
      assert.ok(
        (
          await page.locator(".result-card__match").first().innerText()
        ).includes(language === "ar" ? "correspondance" : "تطابق"),
      );
      assert.ok(
        (
          await page
            .locator(".result-card__img img")
            .first()
            .getAttribute("alt")
        ).startsWith(await page.locator(".result-card h3").first().innerText()),
      );
      await page
        .locator("[data-language-select]")
        .first()
        .selectOption(language);
      await page.locator("[data-view]").first().click();
      await page.waitForSelector(".modal-overlay.is-open");
      await page.keyboard.press("Escape");
      await page.locator("[data-save]").first().click();
      assert.ok(
        await page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("masar_saved_destinations"))
              .length > 0,
        ),
      );
      await page.locator("[data-finder-reset]").first().click();
      await page.locator('[data-value="petra"]').click();
      await page.locator("[data-finder-next]").click();
      assert.ok(
        (await page.locator("[data-finder-question-title]").innerText())
          .length > 0,
      );
      await page.goto(origin + "/signin.html", {
        waitUntil: "domcontentloaded",
      });
      await page.locator("#signInEmail").fill("test@example.com");
      await page.locator("#signInPassword").fill("badpassword");
      await page.locator("#signInForm button[type=submit]").click();
      await page.waitForFunction(
        () =>
          document.getElementById("signInError").textContent.trim().length > 0,
      );
      await page.goto(origin + "/ai.html", { waitUntil: "domcontentloaded" });
      await page.locator("#ai-input").fill("Hello");
      await page.locator("#ai-send").click();
      await page.waitForFunction(() => document.querySelector(".cloud .word"));
      await context.close();
    }
  }
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    ".codex-qa/report.json",
    JSON.stringify({ checks: report.length, errors, report }, null, 2),
  );
  console.log(JSON.stringify({ checks: report.length, errors }, null, 2));
} finally {
  await browser.close();
  server.close();
}
