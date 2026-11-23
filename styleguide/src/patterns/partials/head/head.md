---
title: Head
---

What the skin adds to every page's `<head>`: the icon (`assets/icon.svg`, the berry mark with no ground in light, the
lime mark on the dark shield in dark), the home-screen icon for iOS (`assets/apple-touch-icon.png`, 180 by 180, the mark
on the dark ground; iOS doesn't read an SVG icon), a preload for the three faces every page shows at once (Archivo
italic for the site title, Archivo upright for the headings, Atkinson Hyperlegible Next for the text), and `<meta name="text-scale" content="scale">`, which lets
the browser scale the root font size with the operating system's text size (Chrome 146 and later; other browsers
ignore it). Every size is in `rem` or `em` and the root font size is never set, so the whole page follows. Pattern
Dump writes the title, the description, the search and link-preview tags and the stylesheets itself, so they don't
belong here.

The preloads start the fonts with the page, not when the stylesheet asks for them. On the next page they come from the
cache before the first paint, so the crossfade between pages (`pages/frame`) shows the real fonts, not the fallback
swapping to them. `crossorigin` is needed even on the same origin: fonts are fetched in CORS mode, and a preload without
it would be fetched twice. The mono face is left out: only code uses it.

**Analytics, on the production site only.** When the site's globals carry `analyticsKey`, the head loads Ahrefs Web
Analytics (`https://analytics.ahrefs.com/analytics.js`, `async`, the key in its `data-key`). It is cookieless, and it is
the only third-party script on the site. The key comes from the environment variable `PD_ANALYTICS_KEY`, which only the
production build on Cloudflare Pages sets (`site/pattern-dump.config.ts`). The draft, local builds, `pd dev` and CI
leave it unset, so their pages carry no analytics.
