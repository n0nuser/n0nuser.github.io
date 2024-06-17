---
title: "Linux - Managing users and groups"
description: ""
date: 2021-03-21
lastmod: 2021-03-21
author: "Pablo Jesús González Rubio"
cover: "cover.png"
coverAlt: "Tux!"
toc: true
draft: true
tags: [ "Linux" ]
---

Search every file/directory that has no owner nor group owner:

```bash
find / -nouser -o -nogroup
```

This can happen when a user is deleted, its files are then orphans.
