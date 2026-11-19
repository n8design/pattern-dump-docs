---
title: Credits
description: The fonts, tools and references this site is built with.
layout: doc
toc: true
order: 9
nav: false
---

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

- Version 0.5.3, [MIT licence](https://github.com/n8design/pattern-dump/blob/main/LICENSE)
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

## Guidance

- [Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance), Apache 2.0 licence: the
  practices the HTML, CSS and scripts were checked against.
- [MDN Web Docs](https://developer.mozilla.org): reference for HTML, CSS and browser support.
