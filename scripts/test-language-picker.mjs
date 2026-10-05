import fs from "node:fs";
import assert from "node:assert/strict";
import express from "express";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const app = express();
app.use(express.static("jordan-tourism"));
const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const origin = "http://127.0.0.1:" + server.address().port;
const browser = await chromium.launch({ channel: "msedge", headless: true });
const errors = [],
  checks = [];
fs.mkdirSync(".codex-qa", { recursive: true });
const auth =
  'const user={uid:"test",displayName:"Test Visitor",email:"test@example.com",providerData:[]}; export const getAuth=()=>({currentUser:user}); export const onAuthStateChanged=(a,cb)=>{cb(user);return ()=>{}};export const signOut=async()=>{};export const sendPasswordResetEmail=async()=>{};export const setPersistence=async()=>{};export const browserLocalPersistence={};export const createUserWithEmailAndPassword=async()=>({user});export const signInWithEmailAndPassword=async()=>({user});export const updateProfile=async()=>{};';
try {
  for (const width of [320, 375, 768, 1280])
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
            ? "export const initializeApp=()=>({});"
            : auth,
        }),
      );
      const page = await context.newPage();
      page.on("pageerror", (e) => errors.push(e.message));
      for (const file of [
        "index.html",
        "explore.html",
        "ai.html",
        "signin.html",
        "profile.html",
      ]) {
        await page.goto(origin + "/" + file, { waitUntil: "domcontentloaded" });
        await page.waitForSelector(".language-trigger");
        const picker = page.locator(".language-picker").first(),
          trigger = picker.locator(".language-trigger"),
          menu = picker.locator(".language-options");
        assert.equal(await trigger.getAttribute("aria-expanded"), "false");
        const size = await trigger.boundingBox();
        assert.ok(size.height >= 44 && size.width >= 44);
        await trigger.click();
        assert.equal(await trigger.getAttribute("aria-expanded"), "true");
        const box = await menu.boundingBox();
        assert.ok(box.x >= 0 && box.x + box.width <= width + 1);
        assert.equal(
          await picker
            .locator('[aria-checked="true"]')
            .getAttribute("data-language"),
          language,
        );
        if (file === "index.html")
          await page.screenshot({
            path: ".codex-qa/language-" + width + "-" + language + ".png",
          });
        await page.keyboard.press("Escape");
        assert.equal(await trigger.getAttribute("aria-expanded"), "false");
        await trigger.focus();
        await page.keyboard.press("ArrowDown");
        assert.equal(
          await page.evaluate(() =>
            document.activeElement.getAttribute("aria-checked"),
          ),
          "true",
        );
        await page.keyboard.press("End");
        assert.equal(
          await page.evaluate(() => document.activeElement.dataset.language),
          "fr",
        );
        await page.keyboard.press("Home");
        assert.equal(
          await page.evaluate(() => document.activeElement.dataset.language),
          "en",
        );
        await page.keyboard.press("Escape");
        await trigger.click();
        await page.mouse.click(2, 880);
        assert.equal(await trigger.getAttribute("aria-expanded"), "false");
        const selected = language === "ar" ? "fr" : "ar";
        await trigger.click();
        await picker.locator('[data-language="' + selected + '"]').click();
        assert.equal(await page.locator("html").getAttribute("lang"), selected);
        assert.equal(
          await page.evaluate(() => localStorage.getItem("masar_language")),
          selected,
        );
        assert.equal(await trigger.getAttribute("aria-expanded"), "false");
        await trigger.click();
        await picker.locator('[data-language="' + language + '"]').click();
        if (file !== "signin.html" && width < 1101) {
          await page.locator(".hamburger").click();
          const mobile = page.locator("#mobile-menu .language-picker");
          await mobile.locator(".language-trigger").click();
          await page.keyboard.press("Escape");
          assert.equal(
            await mobile
              .locator(".language-trigger")
              .getAttribute("aria-expanded"),
            "false",
          );
          assert.equal(
            await page.locator(".hamburger").getAttribute("aria-expanded"),
            "true",
          );
          await mobile.locator(".language-trigger").click();
          await mobile.locator('[data-language="' + selected + '"]').click();
          assert.equal(await page.evaluate(() => I18n.language), selected);
          await mobile.locator(".language-trigger").click();
          await mobile.locator('[data-language="' + language + '"]').click();
          await page.keyboard.press("Escape");
          assert.equal(
            await page.locator(".hamburger").getAttribute("aria-expanded"),
            "false",
          );
        }
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        );
        assert.equal(overflow, false);
        if (file !== "signin.html") {
          const overlap = await page.evaluate(() => {
            const boxes = [
              ...document.querySelector(".site-header .container").children,
            ]
              .filter((el) => getComputedStyle(el).display !== "none")
              .map((el) => el.getBoundingClientRect());
            return boxes.some((a, i) =>
              boxes.some(
                (b, j) => i < j && a.left < b.right && b.left < a.right,
              ),
            );
          });
          assert.equal(
            overlap,
            false,
            "Header overlap: " + width + " " + language + " " + file,
          );
        }
        checks.push({ width, language, file });
        console.log("PASS " + width + " " + language + " " + file);
      }
      await context.close();
    }
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    ".codex-qa/language-report.json",
    JSON.stringify({ checks: checks.length, errors }, null, 2),
  );
  console.log(JSON.stringify({ checks: checks.length, errors }));
} finally {
  await browser.close();
  server.close();
}
