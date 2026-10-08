---
title: Relations vs. tags for categorising content
description: Free-form tags are quick to add; a category collection gives each one a name, colour and page of its own.
pubDate: 2026-10-06
tags:
  - notes
  - databases
category: backend
draft: false
---

Tags on this blog are a fixed `select` list. Categories are a collection of their own, and posts reference them by slug.

## Tags

- Quick to add, no extra files.
- No metadata: a tag is only a string.

## A category collection

- Each category has a name, description and colour.
- Editors pick from a dropdown that searches the collection.
- Astro's `reference()` validates the slug at build time, so a typo fails the build instead of shipping a broken link.

```ts title="src/content.config.ts"
category: reference('labCategories').optional(),
```

> [!TIP]
> It's the same trade-off as a free-text column vs. a foreign key.
