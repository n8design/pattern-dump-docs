---
title: Checks
description: Why Pattern Dump's build refuses instead of warning: what each check guards, where its findings show, and what automated checks can't catch.
layout: doc
order: 5
---

A warning nobody has to act on soon becomes a warning nobody reads. Pattern Dump takes the view that a check is worth running only if breaking it stops something. So when `pd build` finds an error, it writes nothing, and the site you published last stays as it was.

The checks are what make a component's contract hold. Its schema says what it promises ([Components](/concepts/components/#the-schema-is-the-contract) explains how); the checks refuse a site that breaks the promise, and `pd audit` refuses a component that does.

## All or nothing

`pd build` runs every check before it writes a single file, and only then does it write, never straight over your output. Each output goes into a hidden folder beside it and takes the earlier one's place by a rename, the workbench first, then the site. A build that stops on the way leaves both folders as they were. Your project's files are checked for changes at the start, again before writing and again after each part is written, so a file you save while the build runs stops it too: `pd build: the project changed while it was being built, so nothing was written. Run pd build again once the files are saved:`

So there is no half-built site. A broken link on one page doesn't ship next to forty pages that are fine, and a deploy that runs `pd build` stops there, since the build exits with 1. One case is out of step: when the workbench has taken its place and the site then can't take its own, the build says so and asks you to run it again.

Only an error stops the build. A warning is printed, and the build goes on: a class no style defines (unless `site.checks.classes` is `"error"`), an accessibility rule at moderate or minor impact, and every `best-practice` rule. Two checks can be skipped, `a11y` and `html`, and then the build's last line names what wasn't checked, `[pd build] NOT CHECKED: …`. The other checks can't be skipped.

A component's own findings never fail `pd build`, a render error or a required value missing from its sample data among them. Those are for `pd audit`, which renders every component and every variant and exits with 1 on any error. The recommendation here: run both before you publish, the build for the site and the audit for the style guide.

## What each check guards

In the order `pd build` runs them:

Component schemas
: A schema that isn't valid JSON can't be checked against, so the build stops on one, with or without a site.

Symbol images
: Every symbol image in the assets can be used, and each one written as a file of its own answers.

The site's pages
: Each page against its layout's contract, each placed component against its schema, and every problem a page has on its own: `pd build: the site has problems, so nothing was written:`.

The search index
: Built in memory before anything is written; if Pagefind fails, the build stops.

Links
: Every link and anchor between your pages. Links to other hosts are noted, not checked.

Custom properties
: A `var()` without a fallback that nothing defines: the skin would read a value that isn't there.

Classes
: A class in the site's markup that no style in the design system defines. A warning by default.

Accessibility
: axe-core on every page and the 404 page. A rule with a WCAG tag at critical or serious impact is an error. Each page needs exactly one `<main>` and one `<h1>`.

In a browser
: With `--browser`, the rules that need a rendered page, colour contrast among them, at two sizes, and the site's images, base path and search.

[Checks](/reference/checks/) in the reference has every rule and message.

## Where findings show

The same checks answer in four places, depending on whether a finding is about a component or a site page, and whether you are working on one thing or looking at all of them.

![A grid of two rows and two columns. Rows: Components and Site pages. Columns: while you work, and over the whole project. Components while you work: the Diagnostics tab, for the component on the Stage, counted on the tab. Components over the whole project: pd audit and the Audit tab, every component and variant; an error makes pd audit exit with 1. Site pages while you work: pd dev, a page that can't be built, and warnings in the terminal. Site pages over the whole project: pd build, every page before writing; an error means nothing is written. pd build is marked in the accent colour.](#where-findings-show "Findings by subject and by moment. Only the right-hand column fails anything: pd audit for the components, pd build for the site.")

The Diagnostics tab
: The findings of the component on the Stage, grouped by where they come from, the worst group first. Its marker counts the errors, else the warnings. The checks that need a rendered page, such as colour contrast, run there while the tab is open.

`pd audit` and the Audit tab
: Every component and every variant, each under its own id, in one report. The Audit tab shows the same report in the workbench. [Check your work](/guide/check-your-work/) walks through it.

`pd dev`
: A site page with problems shows as "The page <route> cannot be built", with each problem listed. Links to missing pages or anchors, image problems and a page without exactly one `<main>` and one `<h1>` are warnings in the terminal.

`pd build`
: The site's checks, all of them. Broken links, image problems and the page basics, which `pd dev` only warns about, are errors here.

## What checks can't cover

A check finds what a machine can find in markup. `pd audit` says so itself: "No findings means no static, machine-detectable defects, not that a component is fully accessible or correct." It doesn't cover checks that need a rendered page, interaction, a page's structure, or components that need data to render.

Automated accessibility checks don't cover colour contrast in what a single render doesn't show, such as hover and focus states or text over images, nor keyboard order and focus, what a screen reader announces, cognitive accessibility, or WCAG AAA. A review by hand against WCAG 2.1 AA is still needed.

The checks clear the ground, so that review starts on what only a person can judge. [Check your work](/guide/check-your-work/) is where to start.
