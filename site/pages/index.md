---
title: Design system documentation, derived from the code
layout: home
headline: [Build your design system., Reuse it everywhere., Iterate in one place.]
lede: A design system workbench: components with a contract, documentation derived from the code, and a build that refuses what breaks either. The same components also build sites like this one.
description: Pattern Dump is a design system workbench: components with a contract, design system documentation derived from the code, and a build that refuses what breaks either.
---

<pd-components-labelled-code region="start">
```sh
npx pattern-dump@latest init
```
</pd-components-labelled-code>

<pd-components-site-cards region="sites">
<pd-components-site-card title="The demo" image="/assets/screenshots/demo-home.webp" line="A Pattern Dump tour in eleven slides, on Sunset waves." href="/in-practice/demo/" link-label="See how the demo is built" />
<pd-components-site-card title="This site" image="/assets/screenshots/site-page.webp" line="These docs, and the style guide they're built from." href="/in-practice/this-site/" link-label="See how this site is built" />
</pd-components-site-cards>

pages/about.md

```md
<pd-components-note heading="Note" kind="danger">
The style guide comes first.
</pd-components-note>
```

npx pd build

```txt
[site] /about/:
  - about.md:5:36: <pd-components-note>.kind
    must be one of "note", "warning"
    (got "danger")
[pd] Error: pd build: the site has problems,
so nothing was written:
  - /about/: about.md:5:36:
    <pd-components-note>.kind must be one of
    "note", "warning" (got "danger")
```
