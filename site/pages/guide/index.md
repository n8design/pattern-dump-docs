---
title: Guide
description: How to build a design system with Pattern Dump, step by step, from an empty folder to a style guide you run, check and publish.
layout: doc
order: 4
---

Where does a design system start? With an empty folder and one command. This guide takes you from there, one step per page. Read it in order: each step ends at something that works, and the next step starts from it.

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

## Where you end up

At the end you have a style guide in a project of its own: components with their docs, a workbench to see them in, an audit, a site built from the same components, and a static build to publish.

Start by [creating a style guide](/guide/create-a-style-guide/).
