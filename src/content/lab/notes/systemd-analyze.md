---
title: Find what slows your boot
kind: snippet
category: linux
tags: [systemd]
date: 2026-09-20
rating: 3
---
```sh
systemd-analyze blame | head
systemd-analyze critical-chain
```
