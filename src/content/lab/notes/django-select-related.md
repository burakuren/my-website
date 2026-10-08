---
title: select_related vs prefetch_related
kind: til
category: backend
tags: [django, databases]
date: 2026-10-01
rating: 5
pinned: true
---
`select_related` follows foreign keys with a SQL join; `prefetch_related` runs a second query and joins in Python. Use the first for many-to-one, the second for many-to-many.
