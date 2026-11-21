---
title: Benchmarks
description: How long pd build takes and how much memory it uses at 50, 500 and 2,000 pages, against a floor that only writes the same pages.
layout: doc
order: 10
---

A `pd build` does more than turn markdown into HTML. It checks every page and every component before it writes anything, and it writes the workbench next to the site. That takes time, and the question is how much, and where it goes.

This page answers it for Pattern Dump 0.8.0, measured on one machine at 50, 500 and 2,000 pages. Each size is built three ways: with every check, with the two checks you can skip left out, and as a floor: the same pages written with no tool, by a script that turns the markdown into HTML in the same post layout and does nothing else.

## What Pattern Dump adds, and what the checks cost

![Build time in seconds at 50, 500 and 2,000 pages, each with every check, with the checks skipped, and the floor: at 2,000 pages 41.96 s, 7.06 s and 3.32 s](#benchmark-build-time "With the checks skipped, Pattern Dump stays within 4 s of the floor at every size. Every check is what grows with the pages.")

With the two checks skipped, a build takes 1.23 s more than the floor at 50 pages, 1.88 s more at 500 and 3.74 s more at 2,000. In that time Pattern Dump still renders every page from the design system's components, checks every link and the styles against the style guide, audits the components, and writes the workbench beside the site.

Every check costs 1.36 s at 50 pages, 9.05 s at 500 and 34.90 s at 2,000. The two checks are the accessibility of the site's pages and the components' markup against HTML's content model, the ones [`--skip-checks`](/reference/checks/#skipping-checks) can leave out. Both run over every page, so their cost grows with the site, while the rest of the build stays close to the floor.

![Peak memory in MB at 50, 500 and 2,000 pages, with every check and with the checks skipped: at 2,000 pages 2,856 MB and 625 MB](#benchmark-build-memory "Memory follows the checks more than the pages.")

With every check, the build's peak memory is above 2 GB already at 50 pages (2,216 MB) and reaches 2,856 MB at 2,000. With the checks skipped, it stays between 415 and 625 MB.

## Where the time goes at 2,000 pages

`pd build` prints how long each step took. In one build with every check at 2,000 pages (42.00 s in all):

- the accessibility check of 2,003 pages: 29.7 s;
- rendering the site and checking it, HTML validation included: 10.3 s, of which the HTML validation is about 5.1 s (the same step takes 5.2 s with it skipped);
- the links, 30,678 references on 2,003 pages: 0.2 s;
- the styles against the style guide: 0.3 s;
- the themes, the components, the folder overviews and the corpus audit: 0.4 s;
- writing the site, 2,002 pages in 2,020 files: 0.3 s;
- starting the server, starting up and exiting: about 0.7 s.

The accessibility check runs [axe-core](/reference/checks/#accessibility) on every page. At this size it is more than two thirds of the build.

## How it was measured

The machine: an Apple M3 Max with 16 cores and 128 GB, macOS 27.2.1, Node 24.22.3, on mains power, on 2026-11-21. Pattern Dump 0.8.0 came from npm, pinned to that exact version.

The project is generated, the same bytes for the same page count. Each page is a post of about 3 KB of markdown, with headings, a list, a link, a JavaScript code block and one photo (every third post two). The design system has six components and one theme. The build writes the site and the workbench: at 2,000 pages, the site in 2,020 files and the workbench in 62.

Each build was cold. Before every build, the output, the image cache and Pattern Dump's scratch folder were removed; the operating system's file cache stayed warm, after one build per setting and size that was not timed. The time is the wall time of the whole `pd build` process, and the memory its peak resident memory.

Each number is the median of 5 builds. Per size, the settings took turns: one build of each per round, the order reversed every other round, so that a change in the machine during the session fell on every setting alike. At 2,000 pages one build of each setting was slow (48.77 s with every check, 8.45 s with the checks skipped); the other four were within 1 % of each other with every check, and within 2 % with the checks skipped.

Each build started only once the machine was idle, measured right before it: CPU at least 90 % idle, the 1-minute load below 4.0, no other process above 10 % CPU, no backup running, no thermal limit and at least 20 % of memory free. The machine's virus scanner, scanning on access, and Spotlight ran as they do every day, reacting to each build's new files, the same for every build. The numbers include them. Spotlight indexing was on for the 50 and 500-page builds and off for the 2,000-page builds.

## What these numbers don't tell you

They come from one machine and one generated project. A design system with more components, more images per page or longer pages will not scale the same way, and neither will another machine, another Node version, Windows or Linux. They cover `pd build` only: not `pd dev`, not a build that reuses an earlier one, and not [`--browser`](/reference/checks/#in-a-browser), which checks the pages in Chromium.

They also don't compare 0.8.0 with 0.7.0. The earlier measurements ran their builds back to back, without waiting for an idle machine, and the method changes the numbers: the floor itself took about 21 % less time under the new method, at every size. A change between releases can only be read from both measured the same way, and that has not been done yet.

## Run it yourself

The benchmark is a repository of its own, linked here once it is public. From its folder:

```sh
npm run setup
npm run bench:v6
```

`npm run setup` installs each tool's folder, with Pattern Dump 0.8.0 locked. `npm run bench:v6` runs the builds on this page, and a few reference builds the page doesn't show, then writes the results and a report. It waits for an idle machine before each build, so close dev servers and anything that backs up or indexes; if the machine never gets quiet, it stops after 6 hours.

To see what the checks find on your own site, and what each one covers, read [Checks](/reference/checks/).
