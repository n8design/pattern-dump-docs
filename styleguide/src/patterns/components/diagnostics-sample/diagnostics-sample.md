---
title: Diagnostics sample
description: Kept for the Diagnostics screenshot. Not for pages.
status: draft
---

This component exists for one screenshot: `workbench-diagnostics-tab`, taken by `npm run screenshots`. A clean
style guide has no findings to show, so this one keeps a single finding on purpose.

It uses the `note`, `note-heading` and `note-text` classes without including `components/note`. That borrows the
note's stylesheet, which the Diagnostics tab reports as an info (`STYLE_BORROWED`). The finding stays on this
component's Diagnostics tab and is not part of `pd audit`, so the audit stays clean.

Don't fix the finding, and don't place this component on a page. The screenshot script names it and fails if it is
gone.
