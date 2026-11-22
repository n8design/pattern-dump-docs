// The width of the site's sections in one line, for the header's phone menu (organisms/site-header): the header is
// one row with the menu button wherever its content is narrower than this, plus 0.5em, by a container query. The
// sections are the same on every page of a build, so the width is measured once, here, with the real fonts, and
// written into the style guide as a literal (a container query can't read a custom property).
//
//   npm run nav-width            measure, and write styleguide/src/styles/organisms/_site-nav-width.scss
//   node scripts/nav-width.mjs --check    no browser: fail when the nav is no longer the one that was measured
//
// Run it after a change to the nav (a section added, renamed or moved, its font), then build again. It reads the built
// site (site/dist/site), served from a small server of its own, in Chromium (Playwright), with the window wide enough
// for the sections to sit in one line. The width runs from the first section's left edge to the last one's right edge,
// in em of the header's font size (1rem), rounded up to 0.01em.
//
// Beside the width it writes a fingerprint of what it measured: the sections' labels, as the built home page writes
// them, the font files in styleguide/assets/fonts, and the nav's and the header's stylesheets (the sections' size and
// the gap between them). `npm run build` and `npm run pages` run the check, which computes the fingerprint again
// without a browser and fails when it differs.
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const siteDir = join(root, "site/dist/site");
const partial = join(root, "styleguide/src/styles/organisms/_site-nav-width.scss");
const check = process.argv.includes("--check");
const fontsDir = join(root, "styleguide/assets/fonts");
const styles = ["styleguide/src/styles/molecules/site-nav.scss", "styleguide/src/styles/organisms/site-header.scss"];

// The sections' labels as the built home page writes them, every font file, and the nav's and the header's
// stylesheets, hashed together.
const fingerprint = () => {
  const home = readFileSync(join(siteDir, "index.html"), "utf8");
  const labels = [...home.matchAll(/<a class="site-nav-link"[^>]*>([^<]*)<\/a>/g)].map(m => m[1]);
  if (!labels.length) throw new Error("nav-width: no .site-nav-link in site/dist/site/index.html: build the site first");
  const hash = createHash("sha256").update(labels.join("\n"));
  for (const file of readdirSync(fontsDir).filter(f => f.endsWith(".woff2")).sort()) {
    hash.update(file).update(readFileSync(join(fontsDir, file)));
  }
  for (const file of styles) hash.update(file).update(readFileSync(join(root, file)));
  return hash.digest("hex").slice(0, 16);
};

const committedText = readFileSync(partial, "utf8");
if (check) {
  const committed = committedText.match(/\$site-nav-width-fingerprint:\s*"([0-9a-f]+)";/)?.[1];
  const now = fingerprint();
  if (committed !== now) {
    console.error(`nav-width: the nav's labels, fonts or styles changed since its width was measured (fingerprint ${now}, _site-nav-width.scss has ${committed ?? "none"}): run \`npm run nav-width\`, then build again`);
    process.exit(1);
  }
  console.log("nav-width: the nav is the one that was measured");
  process.exit(0);
}

const { chromium } = await import("playwright");

const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".webp": "image/webp", ".json": "application/json" };
const server = createServer((req, res) => {
  let path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  let file = join(siteDir, path);
  try { if (statSync(file).isDirectory()) file = join(file, "index.html"); } catch { /* not found below */ }
  try {
    res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
    res.end(readFileSync(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));

let width;
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: "networkidle" });
  width = await page.evaluate(async () => {
    await document.fonts.ready;
    const items = [...document.querySelectorAll(".site-header .site-nav-item")];
    if (!items.length) throw new Error("no .site-nav-item in the header");
    const left = items[0].getBoundingClientRect().left;
    const right = items.at(-1).getBoundingClientRect().right;
    const tops = new Set(items.map(item => Math.round(item.getBoundingClientRect().top)));
    if (tops.size !== 1) throw new Error("the sections don't sit in one line at 1920px: widen the window in this script");
    const em = parseFloat(getComputedStyle(document.querySelector(".site-header")).fontSize);
    return Math.ceil(((right - left) / em) * 100) / 100;
  });
} finally {
  await browser.close();
  server.close();
}

const text = committedText
  .replace(/\$site-nav-width:\s*[\d.]+em;/, `$site-nav-width: ${width}em;`)
  .replace(/\$site-nav-width-fingerprint:\s*"[0-9a-f]*";/, `$site-nav-width-fingerprint: "${fingerprint()}";`);
writeFileSync(partial, text);
console.log(`nav-width: ${width}em written to styleguide/src/styles/organisms/_site-nav-width.scss, with its fingerprint`);
