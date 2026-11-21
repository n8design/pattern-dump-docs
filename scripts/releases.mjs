// Writes site/pages/reference/releases.md from the CHANGELOG.md of the pinned pattern-dump, one heading per version,
// so the page always matches the version this site is built with. Run by the site's predev and prebuild scripts;
// the page it writes is generated, and ignored by git.
//
//   node scripts/releases.mjs
//
// The changelog stays as it is, with two changes a site page needs: its own "# Changelog" heading goes (the layout
// writes the page's <h1>), and a relative link, which points into the pattern-dump repository, points there on
// GitHub, at the pinned version's tag.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = join(root, "site");
const require = createRequire(join(site, "package.json"));
const packageFile = require.resolve("pattern-dump/package.json");
const { version } = JSON.parse(readFileSync(packageFile, "utf8"));
const changelog = readFileSync(join(dirname(packageFile), "CHANGELOG.md"), "utf8");

const repository = `https://github.com/n8design/pattern-dump/blob/v${version}/`;
const body = changelog
  .replace(/^# Changelog\s*\n/, "")
  .replace(/\]\((?![a-z][a-z0-9+.-]*:|\/|#)([^)\s]+)/gi, (_, path) => `](${repository}${path}`);

const page = `---
title: Releases
description: Every release of Pattern Dump, what it added, changed and fixed, and what to change when you upgrade.
layout: doc
---

The changelog of \`pattern-dump\` ${version}, the version this site is built with.

${body.trim()}
`;

writeFileSync(join(site, "pages", "reference", "releases.md"), page);
console.log(`site/pages/reference/releases.md: the changelog of pattern-dump ${version}`);
