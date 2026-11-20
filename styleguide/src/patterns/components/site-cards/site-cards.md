---
title: Site cards
---

Sites built with Pattern Dump, as a list of [site cards](pattern:components/site-card). Where the list is `32em`
wide or more (in its own text size), two cards sit side by side, equal in width, their tops and feet level; anything
narrower stacks them, as on a phone. The gap between them is the page map's (`3rem` between rows, `4rem` between
columns), so in the home page's map each card sits under one column of the groups. The width is the list's own (a
container query): the same list stacks in the map's single column on a medium screen and on a phone, and sits side
by side in a page's text. Source order is reading order at every width.

Each card is a `pd-components-site-card` tag inside the list. `level` sets the heading level of every card's name,
`3` by default, for a list under an `h2`:

```md
<pd-components-site-cards>
<pd-components-site-card title="The demo" image="/assets/screenshots/demo-home.webp" line="A Pattern Dump tour in eleven slides, on Sunset waves." href="/in-practice/demo/" link-label="See how the demo is built" />
<pd-components-site-card title="This site" image="/assets/screenshots/site-page.webp" line="These docs, and the style guide they're built from." href="/in-practice/this-site/" link-label="See how this site is built" />
</pd-components-site-cards>
```

The home page shows at most three sites; In practice lists them all (see [the home layout](pattern:layouts/home)).

The list has `role="list"`: with `list-style: none`, Safari drops a list's semantics, so VoiceOver would announce
neither the list nor how many sites it holds. Its styles are in `components/site-card.scss`, one stylesheet for
both, so a page that places them loads one file, not two.
