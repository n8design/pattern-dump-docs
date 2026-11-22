---
title: Guide
description: How to build a design system with Pattern Dump, step by step, from an empty folder to a style guide you run, check and publish.
layout: doc
order: 4
---

A design system starts with an empty folder and one command:

```sh
npx pattern-dump@latest init my-design-system
```

This guide takes you from there, one step per page. Read it in order: each step ends at something that works, and the next step starts from it.

## What you need

- **Node.js 22.22 or later.** The `pattern-dump` package requires it.
- **npm.** `pd init` runs `npm install` for you, unless you tell it not to.
- **git, if you want a repository.** Outside an existing repository, `pd init` offers to create one. If `git init` fails, Pattern Dump says so and sets the project up anyway.

## The commands

Pattern Dump is one npm package, `pattern-dump`, with one command-line tool, `pd`. `npx pattern-dump@latest` runs it before you have a project, and `npx pd` inside one. The guide uses four of its commands:

`pd init`
: Sets up a project: a style guide, a site on an existing style guide, or both in one project.

`pd dev`
: Runs the workbench while you work, at `http://localhost:4000` unless you set a port.

`pd audit`
: Writes a report of what Pattern Dump finds in your components.

`pd build`
: Writes the workbench as static files, and the site, when there is one.

`pd help` prints every command with its options, and `pd --version` the version you have.

## The steps

Nine steps, in order:

1. [Create a style guide](/guide/create-a-style-guide/): set the project up with `pd init`, and see what each file it writes is for.
2. [Run the workbench](/guide/run-the-workbench/): start `pd dev` and find your way around the workbench, where your components render.
3. [Add a component](/guide/add-a-component/): a template with its data, its documentation and a schema, then a variant.
4. [Style a component](/guide/style-a-component/): a stylesheet of its own, a rule in the base layer and design tokens in your themes.
5. [Check your work](/guide/check-your-work/): the Diagnostics tab while you work, and `pd audit` for the whole style guide.
6. [Add a page to your site](/guide/add-a-site/): a page in markdown, with a live example of your own component.
7. [A site on a style guide](/guide/a-site-on-a-style-guide/): the style guide as a package and the site as content only, in one repository.
8. [Publish](/guide/publish/): build both with `pd build`, fix what it refuses, and publish them on any host.
9. [Upgrade](/guide/upgrade/): move the pin to a new version, and read what changed first.

## Where you end up

At the end you have a style guide in a project of its own: components with their docs, a workbench to see them in, an audit, a site built from the same components, and a static build to publish.

Start by [creating a style guide](/guide/create-a-style-guide/).
