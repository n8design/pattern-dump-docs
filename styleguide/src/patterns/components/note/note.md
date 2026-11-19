---
title: Note
---

A short aside, between hairlines above and below. Its heading says what kind of note it is. A warning (`kind:
"warning"`, the `~warning` variant) turns the line above into a rule in the warning colour, and its heading with
it; the default `kind` is `"note"`. A page places one with values of its own:

```md
<pd-components-note heading="Note">
Text, in **markdown**.
</pd-components-note>

<pd-components-note kind="warning" heading="Warning">
Text, in **markdown**.
</pd-components-note>
```
