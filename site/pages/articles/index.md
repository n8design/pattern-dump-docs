---
title: Articles
description: Everything written here, newest first.
layout: listing
childLayout: article
sort: date
order: 2
nav: false
index: false
socialImage: false
childDefaults:
  index: false
  socialImage: false
---

This page is `site/pages/articles/index.md`. Every page in this folder is listed below, newest first, in the list view
(the listing layout's default). `view: grid` here would fail the page: the grid's card requires an `image`, and no
article has one. Add a markdown file with a `date` and it shows up here, with no link to write. Each article takes the article layout (`childLayout: article`), which lists its related
articles.
