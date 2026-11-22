// Checks x-ray (styleguide/src/scripts/xray.ts) on every page of the built site: that no frame crosses content or
// another frame, no chip covers content or another chip, and no chip leaves the window. Each page at 390px and
// 1280px, light and dark, and at 1280px with the text at 200%; a page with a video once more with the player open,
// which must take the poster's place, inside the video's box.
//
//   npm run xray-check                         the built site (site/dist/site), served from a small server of its own
//   npm run xray-check -- --url <address>      a published site, e.g. https://draft.pattern-dump.design
//
// Run it by hand after a change to x-ray, to a marked component, or to what sits around one; build the site first.
// The pages are the built site's either way. It reads the page in Chromium (Playwright), with reduced motion, and
// fails with the problems listed, each with the pages it was seen on.
//
// What a reader can't see isn't checked: text hidden for screen readers, what is under the sticky header and footer
// (the page's content, its chips, the lines of its frames), and the bars' lines against content outside the window.
import { createServer } from "node:http";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const siteDir = join(root, "site/dist/site");
const urlArg = process.argv.indexOf("--url");
const published = urlArg > 0 ? process.argv[urlArg + 1]?.replace(/\/$/, "") : undefined;
if (urlArg > 0 && !published) throw new Error("xray-check: --url needs an address");

// Every page of the built site, as its route: each index.html in the site's frame (.site), so not the live examples'
// previews.
const routes = [];
const walk = dir => {
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) { if (!name.startsWith("_")) walk(path); }
    else if (name === "index.html" && readFileSync(path, "utf8").includes('class="site"')) routes.push(`/${relative(siteDir, dir).split(sep).join("/")}/`.replace(/^\/\/$/, "/"));
  }
};
try { walk(siteDir); } catch { /* reported below */ }
if (!routes.length) throw new Error("xray-check: no pages in site/dist/site: build the site first");

let server;
let base = published;
if (!base) {
  const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".mp4": "video/mp4", ".json": "application/json" };
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

// Runs in the page: the problems x-ray has as it is laid out now.
const inspect = () => {
  const R = element => element.getBoundingClientRect();
  const overlap = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
  const contains = (a, b) => a.left <= b.left + 0.5 && a.top <= b.top + 0.5 && a.right >= b.right - 0.5 && a.bottom >= b.bottom - 0.5;
  const ours = element => element.closest(".xray-frame, .xray-label, .xray-veil");
  const seen = element => element.checkVisibility({ visibilityProperty: true, opacityProperty: true });
  const inBar = element => !!element.closest(".site-header, .site-footer");
  // Text for screen readers only, clipped to nothing, isn't seen.
  const forScreenReaders = element => {
    for (let e = element; e; e = e.parentElement) if (getComputedStyle(e).clipPath.startsWith("inset(50%")) return true;
    return false;
  };
  const chipName = label => label.textContent.replace(/\s*»$/, "");

  // The sticky bars, and what they hide: the part of a page element under one isn't seen.
  const bars = [...document.querySelectorAll(".site > .site-header, .site > .site-footer")]
    .filter(bar => getComputedStyle(bar).position === "sticky").map(R);
  const hidden = rect => bars.some(bar => rect.top >= bar.top - 1 && rect.bottom <= bar.bottom + 1);
  const unhidden = (rect, element) => {
    if (inBar(element)) return rect;
    let top = rect.top, bottom = rect.bottom;
    for (const bar of bars) {
      if (bar.top <= top && bar.bottom > top) top = bar.bottom;
      if (bar.top < bottom && bar.bottom >= bottom) bottom = bar.top;
    }
    return bottom - top > 2 ? new DOMRect(rect.left, top, rect.width, bottom - top) : null;
  };

  // The content: each line of text, and each image, drawing, frame, video and field.
  const content = [];
  const add = (raw, element, what) => {
    if (raw.width <= 2 || raw.height <= 2) return;
    const rect = unhidden(raw, element);
    if (!rect) return;
    const top = Math.max(raw.top, 0), bottom = Math.min(raw.bottom, innerHeight);
    const onScreen = bottom - top > 2 ? unhidden(new DOMRect(raw.left, top, raw.width, bottom - top), element) : null;
    content.push({ rect, onScreen, inBar: inBar(element), what });
  };
  const walker = document.createTreeWalker(document.querySelector(".site"), NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const element = node.parentElement;
    if (!node.textContent.trim() || ours(element) || !seen(element) || forScreenReaders(element)) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const raw of range.getClientRects()) add(raw, element, `"${node.textContent.trim().slice(0, 30)}"`);
  }
  for (const element of document.querySelectorAll(".site :is(img, svg:not(svg svg), iframe, video, input)")) {
    if (!ours(element) && seen(element)) add(R(element), element, element.localName);
  }

  const problems = [];
  const frames = [...document.querySelectorAll(".xray-frame")];
  const labels = [...document.querySelectorAll(".xray-label")].filter(label => label.classList.contains("xray-in-bar") || !hidden(R(label)));
  const frameName = frame => chipName(document.querySelector(`.xray-label[style*="${frame.style.getPropertyValue("anchor-name")}"]`) ?? frame);
  // A bar's frame or chip is checked against what is on screen; a page's against the page, but not against the bars,
  // which are drawn over it.
  const against = (thing, item) => {
    const barThing = thing.classList.contains("xray-in-bar");
    if (!barThing && item.inBar && bars.length) return null;
    return barThing && bars.length ? item.onScreen : item.rect;
  };

  // A frame's line crosses content that lies on both sides of it, along the line's length.
  for (const frame of frames) {
    const f = R(frame);
    const acrossRow = (y, q) => q.top < y - 1 && q.bottom > y + 1 && q.right > f.left + 1 && q.left < f.right - 1;
    const acrossColumn = (x, q) => q.left < x - 1 && q.right > x + 1 && q.bottom > f.top + 1 && q.top < f.bottom - 1;
    for (const item of content) {
      const q = against(frame, item);
      if (q && (acrossRow(f.top, q) || acrossRow(f.bottom, q) || acrossColumn(f.left, q) || acrossColumn(f.right, q))) {
        problems.push(`frame ${frameName(frame)} crosses ${item.what}`);
      }
    }
  }
  // Two frames cross when they overlap and neither holds the other. A bar's own frame sits on its edge and the page
  // scrolls under it, so a page frame and a bar's frame aren't compared.
  for (let i = 0; i < frames.length; i++) {
    for (let j = i + 1; j < frames.length; j++) {
      const a = R(frames[i]), b = R(frames[j]);
      const barAndPage = frames[i].classList.contains("xray-bar-frame") !== frames[j].classList.contains("xray-bar-frame")
        && !(frames[i].classList.contains("xray-in-bar") && frames[j].classList.contains("xray-in-bar"));
      if (overlap(a, b) && !contains(a, b) && !contains(b, a) && !barAndPage) problems.push(`frames ${frameName(frames[i])} and ${frameName(frames[j])} cross`);
    }
  }
  for (const label of labels) {
    const l = R(label);
    for (const item of content) {
      const q = against(label, item);
      if (q && overlap(l, q)) problems.push(`chip ${chipName(label)} covers ${item.what}`);
    }
    if (l.left < -0.5 || l.right > innerWidth + 0.5) problems.push(`chip ${chipName(label)} leaves the window`);
  }
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      // A page chip partly under a bar is only seen outside it.
      const seenRect = label => label.classList.contains("xray-in-bar") ? R(label) : unhidden(R(label), label);
      const a = seenRect(labels[i]), b = seenRect(labels[j]);
      if (a && b && overlap(a, b)) problems.push(`chips ${chipName(labels[i])} and ${chipName(labels[j])} touch`);
    }
  }

  // An open video: the player in the poster's place, inside the video's box and its frame.
  for (const details of document.querySelectorAll("details.video[open]")) {
    const video = details.querySelector("video");
    const d = R(details), v = R(video);
    const names = getComputedStyle(details).getPropertyValue("anchor-name").split(",").map(name => name.trim());
    const frame = frames.find(f => names.includes(f.style.getPropertyValue("position-anchor")));
    if (!video.checkVisibility()) problems.push("the open video's player isn't shown");
    else if (!contains(d, v) || !contains(v, d)) problems.push(`the open video's player (${Math.round(v.width)}×${Math.round(v.height)}) isn't in its box (${Math.round(d.width)}×${Math.round(d.height)})`);
    if (frame && !contains(R(frame), v)) problems.push("the open video's player is outside its frame");
  }
  return { chips: labels.length, problems: [...new Set(problems)] };
};

const browser = await chromium.launch();
const views = [];
try {
  for (const [width, scheme, text] of [[390, "light", 1], [390, "dark", 1], [1280, "light", 1], [1280, "dark", 1], [1280, "dark", 2]]) {
    const context = await browser.newContext({ viewport: { width, height: 800 }, colorScheme: scheme, reducedMotion: "reduce" });
    await context.addInitScript(() => sessionStorage.setItem("pd-docs-xray", "on"));
    const page = await context.newPage();
    // The browser's text size (16px by default), as a reader sets it.
    if (text !== 1) {
      const cdp = await context.newCDPSession(page);
      await cdp.send("Page.enable");
      await cdp.send("Page.setFontSizes", { fontSizes: { standard: 16 * text, fixed: 13 * text } });
    }
    const view = `${width} ${scheme}${text !== 1 ? `, text ${text * 100}%` : ""}`;
    for (const route of routes) {
      await page.goto(base + route, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(250);
      views.push({ route, view, ...await page.evaluate(inspect) });
      // Each video once more, open: the player takes the poster's place and gets the focus, which scrolls to it.
      const videos = page.locator("details.video > summary");
      for (let i = 0; i < await videos.count(); i++) {
        await videos.nth(i).click();
        await page.waitForTimeout(500);
        views.push({ route, view: `${view}, video ${i + 1} open`, ...await page.evaluate(inspect) });
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
  server?.close();
}

const chips = views.reduce((sum, view) => sum + view.chips, 0);
const byProblem = new Map();
for (const view of views) {
  for (const problem of view.problems) byProblem.set(problem, [...byProblem.get(problem) ?? [], `${view.route} (${view.view})`]);
}
const where = published ?? "site/dist/site";
if (!byProblem.size) {
  console.log(`xray-check: ${views.length} page views of ${where}, ${chips} chips, no problems`);
} else {
  console.error(`xray-check: ${views.length} page views of ${where}, ${chips} chips, ${byProblem.size} problem(s):`);
  for (const [problem, seenOn] of [...byProblem].sort((a, b) => b[1].length - a[1].length)) {
    console.error(`  - ${problem}: ${seenOn.length} view(s), ${seenOn.slice(0, 3).join(", ")}${seenOn.length > 3 ? ", …" : ""}`);
  }
  process.exitCode = 1;
}
