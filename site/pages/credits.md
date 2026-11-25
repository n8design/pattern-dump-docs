---
title: Credits
description: Who sponsors Pattern Dump, the fonts, tools and references this site is built with, who publishes it and how it handles your data.
layout: doc
toc: true
order: 9
nav: false
---

## Sponsors

[n8d](https://n8d.at) sponsors the development of Pattern Dump and these docs.

Anyone can sponsor Pattern Dump too, through [GitHub Sponsors](https://github.com/sponsors/StfBauer).

## Fonts

Self-hosted from `@fontsource-variable` 5.3.0, Latin only.

### Archivo

- Foundry: Omnibus-Type. Designer: Héctor Gatti; typeface development: Yorlmar Campos (from the project's README).
- Copyright: The Archivo Project Authors
- Licence: [SIL Open Font License 1.1](https://openfontlicense.org)
- Source: [Archivo on GitHub](https://github.com/Omnibus-Type/Archivo)
- Used for: headings, the home page headline and the site title.
- Instanced with fonttools: the upright is pinned to width 100 and keeps weights 700 to 900, the italic is pinned to
  width 125 and keeps weights 800 to 900.

### Atkinson Hyperlegible Next

- Braille Institute: the project's README names the family after the institute's founder and describes the
  institute. Font engineering and QA for version 2.001: Emma Marichal (from the README's changelog).
- Copyright: The Atkinson Hyperlegible Next Project Authors
- Licence: [SIL Open Font License 1.1](https://openfontlicense.org)
- Source: [Atkinson Hyperlegible Next on GitHub](https://github.com/googlefonts/atkinson-hyperlegible-next)
- Used for: body text and the interface.

### Atkinson Hyperlegible Mono

- Braille Institute: the project's README names the family after the institute's founder and describes the
  institute. Font engineering and QA for version 2.001: Emma Marichal (from the README's changelog).
- Copyright: The Atkinson Hyperlegible Mono Project Authors
- Licence: [SIL Open Font License 1.1](https://openfontlicense.org)
- Source: [Atkinson Hyperlegible Mono on GitHub](https://github.com/googlefonts/atkinson-hyperlegible-next-mono)
- Used for: code, the guide's step numbers and the search shortcut.

## Tools

### Pattern Dump

- Version 0.9.0, [MIT licence](https://github.com/n8design/pattern-dump/blob/main/LICENSE)
- Source: [Pattern Dump on GitHub](https://github.com/n8design/pattern-dump)
- Here: builds this site and the style guide's workbench.

### Stylelint

- Version 17.16.0, [MIT licence](https://github.com/stylelint/stylelint/blob/main/LICENSE)
- Source: [stylelint.io](https://stylelint.io)
- Here: checks the style sheets for units, colours and properties the site doesn't use.

### commitlint

- Version 21.0.2, with `@commitlint/config-conventional`, [MIT licence](https://github.com/conventional-changelog/commitlint/blob/master/license.md)
- Source: [commitlint.js.org](https://commitlint.js.org/)
- Here: checks each commit message against Conventional Commits.

### husky

- Version 9.1.7, [MIT licence](https://github.com/typicode/husky/blob/main/LICENSE)
- Source: [husky on GitHub](https://github.com/typicode/husky)
- Here: runs commitlint as a Git hook on each commit.

### fonttools

- Version 4.60.1, [MIT licence](https://github.com/fonttools/fonttools/blob/main/LICENSE)
- Source: [fonttools on GitHub](https://github.com/fonttools/fonttools)
- Here: cut the Archivo files down to the widths and weights in use.

### Phosphor Icons

- Version 2.1.1 of `@phosphor-icons/core`, bold weight, [MIT licence](https://github.com/phosphor-icons/core/blob/main/LICENSE)
- Source: [Phosphor Icons on GitHub](https://github.com/phosphor-icons/core)
- Here: the Copy and Check icons on code blocks, the menu button's List and X, the search field's magnifier and the
  arrow after links that leave the site, inlined as SVG.

### Octicons

- Version 19.42.0 of `@primer/octicons`, by GitHub, [MIT licence](https://github.com/primer/octicons/blob/main/LICENSE)
- Source: [Octicons on GitHub](https://github.com/primer/octicons)
- Here: GitHub's mark, `mark-github`, on the header's link to the repository, inlined as SVG.

## Guidance

- [Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance), Apache 2.0 licence: the
  practices the HTML, CSS and scripts were checked against.
- [MDN Web Docs](https://developer.mozilla.org): reference for HTML, CSS and browser support.

## Legal & publisher

### Publisher

Pattern Dump is a project by Stefan Bauer, [N8D e.U.](https://n8d.at), Vienna, Austria. [Contact](https://n8d.at/about/).

### Data protection

Controller
: Stefan Bauer, N8D e.U., Ziedlergasse 10/32, 1230 Vienna, Austria. [Contact](https://n8d.at/about/).

Hosting
: Cloudflare Pages, by Cloudflare, Inc., delivers the site. To serve pages and protect the site from abuse, Cloudflare
  processes technical request data such as your IP address.

Analytics
: Ahrefs Web Analytics, by Ahrefs Pte. Ltd., Singapore. It sets no cookies, keeps no persistent identifiers and doesn't
  track you across sites. Your IP address is used briefly to derive country and city, then discarded. Unique visitors
  are counted with a hash that changes daily.

Legal basis
: Legitimate interest (Art. 6(1)(f) GDPR) in running a secure site and understanding how it is used overall.

Transfers outside the EEA
: Cloudflare (USA) and Ahrefs (Singapore) may process data outside the EEA, under their data processing terms and the
  standard contractual clauses.

Cookies
: This site sets no cookies.

Your rights
: Access, rectification, erasure, restriction, objection and data portability (Art. 15 to 21 GDPR). Write to the
  controller above. You can also lodge a complaint with the Austrian Data Protection Authority,
  [Datenschutzbehörde](https://dsb.gv.at).
