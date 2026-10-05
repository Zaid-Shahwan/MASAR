// Run from the repository root: node scripts/build-locales.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../jordan-tourism/locales",
);
const catalogs = {};
for (const file of fs
  .readdirSync(root)
  .filter((file) => file.endsWith(".json"))
  .sort()) {
  const data = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  catalogs[file.slice(0, -5)] = Object.fromEntries(
    Object.entries(data).filter(([key]) => !key.startsWith("_")),
  );
}
const englishKeys = Object.keys(catalogs.en);
for (const [language, catalog] of Object.entries(catalogs)) {
  for (const key of englishKeys) {
    if (typeof catalog[key] !== "string" || !catalog[key])
      throw new Error(language + " is missing " + key);
    const parameters = (text) =>
      [...text.matchAll(/\{(\w+)\}/g)]
        .map((match) => match[1])
        .sort()
        .join(",");
    if (parameters(catalog[key]) !== parameters(catalogs.en[key]))
      throw new Error(language + " has different placeholders for " + key);
  }
}
fs.writeFileSync(
  path.join(root, "catalog.js"),
  "// Generated from locale JSON. Run node scripts/build-locales.mjs after editing.\nwindow.MASAR_LOCALES = " +
    JSON.stringify(catalogs) +
    ";\n",
);
console.log(
  "Built " +
    Object.keys(catalogs).length +
    " languages, " +
    englishKeys.length +
    " keys each.",
);
