// Checks the header (organisms/site-header) across the phone menu's width: one page's window is dragged from 1600px down
// to 320px and back up, 4px at a time, at 100% and 200% text. At every width the header must be one row (its parts side
// by side, none under another) and hold its content without overflowing; the site's name may break onto a second line,
// but only between its words; the menu button must show exactly where the header's media query (--site-menu-query)
// matches; and no transition may run on the menu, so the sections leave the row the moment the button comes.
//
//   npm run header-check                         the built site (site/dist/site), served from a small server of its own
//   npm run header-check -- --url <address>      a published site, e.g. https://draft.pattern-dump.design
//
// Run it by hand after a change to the header; build the site first. It reads the pages in Chromium (Playwright) and
// fails with the problems listed, each with the widths it was seen at.
import { createServer } from "node:http";
import { readFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const siteDir = join(root, "site/dist/site");
const urlArg = process.argv.indexOf("--url");
const published = urlArg > 0 ? process.argv[urlArg + 1]?.replace(/\/$/, "") : undefined;
if (urlArg > 0 && !published) throw new Error("header-check: --url needs an address");
// A page with the home layout and one with the reading layout: the header is the same, the pages around it aren't.
const routes = ["/", "/guide/add-a-component/"];

let server;
let base = published;
if (!base) {
  const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".json": "application/json" };
  server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
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
  base = `http://127.0.0.1:${server.address().port}`;
}

// Runs in the page, two frames after the window changed: the header's problems at this width.
const inspect = async () => {
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const header = document.querySelector(".site-header");
  const menu = document.querySelector(".site-menu");
  const button = document.querySelector(".site-menu-button");
  const style = getComputedStyle(header);
  const query = style.getPropertyValue("--site-menu-query").trim();
  const problems = [];
  // The parts of the row: the name, the menu button, and while they are in the row, the sections, GitHub and the search.
  const parts = [...header.querySelectorAll(":scope > *, :scope > .site-menu > *")]
    .filter(part => !part.matches(".site-menu") && part.checkVisibility() && part.getClientRects().length > 0)
    .map(part => [part.className.split(" ")[0], part.getBoundingClientRect()]);
  for (const [name, a] of parts) {
    for (const [other, b] of parts) {
      if (name !== other && a.top >= b.bottom - 0.5) problems.push(`the header is more than one row (${name} under ${other})`);
    }
  }
  // The name: on one line or two, broken only between its words.
  const title = header.querySelector(".site-title-name");
  if (title && getComputedStyle(title).clipPath === "none") {
    const words = [];
    const text = title.firstChild;
    for (const match of text.textContent.matchAll(/\S+/g)) {
      const range = document.createRange();
      range.setStart(text, match.index);
      range.setEnd(text, match.index + match[0].length);
      words.push([match[0], new Set([...range.getClientRects()].map(rect => Math.round(rect.top)))]);
    }
    for (const [word, lines] of words) if (lines.size > 1) problems.push(`the name breaks inside "${word}"`);
    const lines = new Set(words.flatMap(([, tops]) => [...tops]));
    if (lines.size > 2) problems.push(`the name takes ${lines.size} lines`);
  }
  if (header.scrollWidth > header.clientWidth + 0.5) problems.push(`the header's content overflows it (${header.scrollWidth}px in ${header.clientWidth}px)`);
  if (!query) problems.push("the header has no --site-menu-query");
  else if (matchMedia(query).matches !== button.checkVisibility()) problems.push(`the menu button ${button.checkVisibility() ? "shows" : "is hidden"} where ${query} ${matchMedia(query).matches ? "matches" : "doesn't match"}`);
  if (menu.getAnimations().length) problems.push("a transition runs on the menu");
  return problems;
};

const browser = await chromium.launch();
const seen = new Map();
let views = 0;
try {
  for (const text of [1, 2]) {
    const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
    const page = await context.newPage();
    // The browser's text size (16px by default), as a reader sets it.
    if (text !== 1) {
      const cdp = await context.newCDPSession(page);
      await cdp.send("Page.enable");
      await cdp.send("Page.setFontSizes", { fontSizes: { standard: 16 * text, fixed: 13 * text } });
    }
    for (const route of routes) {
      await page.setViewportSize({ width: 1600, height: 900 });
      await page.goto(base + route, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const widths = [];
      for (let width = 1600; width >= 320; width -= 4) widths.push(width);
      for (const [direction, list] of [["narrowing", widths], ["widening", [...widths].reverse()]]) {
        for (const width of list) {
          await page.setViewportSize({ width, height: 900 });
          views++;
          for (const problem of await page.evaluate(inspect)) {
            // Grouped without the measurements, which change with the width; the first one is kept as an example.
            const key = `${route}, text ${text * 100}%, ${direction}: ${problem.replace(/ \([^)]*\)/g, "")}`;
            if (!seen.has(key)) seen.set(key, { example: problem, widths: [] });
            seen.get(key).widths.push(width);
          }
        }
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
  server?.close();
}

const where = published ?? "site/dist/site";
if (!seen.size) {
  console.log(`header-check: ${views} widths of ${where}, the header one row at every one`);
} else {
  console.error(`header-check: ${views} widths of ${where}, ${seen.size} problem(s):`);
  for (const [problem, { example, widths }] of seen) {
    console.error(`  - ${problem}: at ${widths.length} width(s), ${Math.min(...widths)}px to ${Math.max(...widths)}px (at ${widths[0]}px: ${example})`);
  }
  process.exitCode = 1;
}
