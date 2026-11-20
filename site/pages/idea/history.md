---
title: From Pattern Lab to Pattern Dump
description: How Pattern Dump grew out of Pattern Lab, Simple Style and hTWOo, told by Stefan Bauer, who built it.
layout: doc
order: 2
---

It started, I guess, around 2009 or 2010 with the emergence of responsive web design, when many people started to question how we build websites.

A few years later, Stephen Hay, author of [*Responsive Design Workflow*](https://www.peachpit.com/store/responsive-design-workflow-9780321887863), argued that we don't build websites any more, but systems of components. When Brad Frost came out with the idea of [atomic design](https://bradfrost.com/blog/post/atomic-web-design/), it became more interesting: an easily applicable system that made designing for the web like building with Lego blocks.

For the first time, it also offered a place where problems on the web could be solved once and documented in the medium, not in abstract static documentation.

## One language underneath

I was working at an international design and branding agency then, building SharePoint web parts. Those were already components that had to live in a larger custom design system. I built websites and WordPress themes there too, even though I already had my own blog. So HTML and CSS were the common denominator all those systems shared.

## Pattern Lab and Simple Style

I mostly wrote that HTML and CSS in dedicated HTML pages. Once [Pattern Lab](https://patternlab.io) was released, I used it. The downside was that its core was PHP driven. That was not a big problem, but the industry had already started to shift towards Node.js, and no Node.js version was in sight. So I started my own Pattern Lab implementation, called [Simple Style](https://github.com/StfBauer/generator-simplestyle).

It was one of the side projects where I wanted to learn more about Node.js. Simple Style used a Yeoman generator to provision new projects.

I stopped with it when the first version of Pattern Lab for Node.js came out, because it was more feature rich.

## hTWOo

Pattern Lab served my purpose fine for every customer project. One evening, a couple of years ago, I wanted to learn more about accessibility from the ground up: rethink and relearn HTML and CSS again. That's how I started to implement [hTWOo](https://htwoo.io), and it is still built on Pattern Lab today.

hTWOo uses a clear separation of concerns. The HTML and CSS come from Pattern Lab, while a framework implementation consumes only the ready-made HTML snippets and imports the CSS.

The benefit of HTML and CSS first is that it is easier to test for the core requirements, such as accessibility, while staying framework neutral. HTML and CSS can evolve over time, and the framework they get consumed by is pretty much irrelevant. It could be web components, React, Vue, Svelte, you name the framework.

## The inflection point

Sadly, Pattern Lab is now [deprecated](https://github.com/pattern-lab). That was the inflection point, but the thinking goes back way longer than that.

There were more things I was working on. One was automatic accessibility checking. Another was a way to present patterns other than the formal way of atomic design. It is great to have all these detailed components for debugging and fixing, but developers are more interested in components and designs they can use. Their requirements mostly start at a higher level than pure atoms, more at the molecule level. There was also the split of tools: Pattern Lab for the HTML and CSS, and the same wrapped into React components, which had to use Storybook. And some pieces of Pattern Lab were pretty hard to implement, such as a dedicated branding for the style guide itself.

I built Pattern Dump to answer three of them: accessibility checks, a view above atoms, and the style guide's own branding through the site, as [What it does](/idea/features/) shows.

## The name

I took the name directly from Pattern Lab, but more like: I want to dump my documentation and components somewhere and be able to reuse them. Not to throw them in the dumpster, but to have a place not only where I experiment, but where I can quickly try out new ideas or document existing ones. HTML and CSS give you the real look, without any real data or technical limits. Figma and Photoshop create pictures, not the real HTML, which then gets lost in translation.

## Who it is for

Web designers and web developers who work on style implementation, from small to large projects. I built it to optimise the work stream: while someone works on the technical implementation of the service, someone else can already work on the user experience and the user interface.

I also built it for another purpose. Themes and templates may get written first in a style guide and then converted into a theme or template. A well-documented system like this lets you implement a relaunch or redesign more safely.

The site feature showed me that Pattern Dump can build websites too, such as [this site](/in-practice/this-site/), with proper component and design documentation for the theme to rely on. Personally, I even use Pattern Dump to create the WordPress theme for my blog.

I see Pattern Dump as a design system tool for anyone who wants reliable design and style documentation of a website, an application or a customisation of enterprise software. Or simply an easy-to-use, designed static site generator.

![Stefan Bauer under the lamps of a dim office at night, leaning over his laptop and looking up, deep in thought.](/assets/images/stefan-bauer-at-work.jpg "Stefan Bauer. Photo: Philipp Schuster")

If Pattern Dump helps you, you can [sponsor it](https://github.com/sponsors/StfBauer).

[Stefan Bauer](https://www.linkedin.com/in/stfbauer/), [n8d](https://n8d.at)
