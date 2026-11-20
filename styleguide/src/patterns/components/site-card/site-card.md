---
title: Site card
---

A site built with Pattern Dump, as a card in the home page's map and on In practice, top to bottom: the site's name,
a picture of it, one short line and one link to the page about the site. The page carries the details, so the card
has no running text and no second link.

The name is a heading at the size of the Guide steps' titles, one step below the section's heading, not a link. The picture runs across the card, with a
hairline round it; it is decoration (`alt=""`), since the name above it says what the site is. It is a raster image in
the assets, written by `{{pd-image}}` with a `srcset` of its widths, its `width` and `height`, and `loading="lazy"`.
The line has the size and colour of the map's notes. The link says where it leads ("See how the demo is built"),
never "Read more", and sits at the card's foot, so the links of two cards side by side line up.

Cards come in a list, [`components/site-cards`](pattern:components/site-cards). Each is one tag inside it:

```md
<pd-components-site-cards>
<pd-components-site-card title="The demo" image="/assets/screenshots/demo-home.webp" line="A Pattern Dump tour in eleven slides, on Sunset waves." href="/in-practice/demo/" link-label="See how the demo is built" />
</pd-components-site-cards>
```

`level` is the name's heading level, `3` by default: one below the heading the cards sit under. Set it on the list,
which hands it to every card and wins over a card's own.
