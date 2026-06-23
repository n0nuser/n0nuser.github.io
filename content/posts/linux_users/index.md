---
title: "Linux - Managing users and groups"
description: "Notes on Linux user and group administration, including finding orphaned files left behind by deleted users."
date: 2021-03-21
lastmod: 2026-06-23
author: "Pablo Jesús González Rubio"
cover: "cover.png"
coverAlt: "Tux!"
toc: true
draft: true
tags: [ "Linux" ]
---

> **Linux series:** **Users & Groups** → [Filesystem](/posts/linux_filesystem/) → [Monitoring Processes](/posts/linux_processes/) → [System Auditing](/posts/linux_audit/) → [Backup](/posts/linux_backup/) → [Startup & Shutdown](/posts/linux_startup/) → [Disk Quotas](/posts/linux_diskmanagement/) → [Security](/posts/linux_security/)

Search every file/directory that has no owner nor group owner:

```bash
find / -nouser -o -nogroup
```

This can happen when a user is deleted, its files are then orphans.
