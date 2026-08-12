---
slug: "linux-users-and-groups"
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

> **Linux series:** **Users & Groups** → [Filesystem](/posts/linux-filesystem-inodes-partitions/) → [Monitoring Processes](/posts/linux-process-management/) → [System Auditing](/posts/linux-system-auditing/) → [Backup](/posts/linux-server-backup/) → [Startup & Shutdown](/posts/linux-boot-process/) → [Disk Quotas](/posts/linux-disk-quotas/) → [Security](/posts/linux-hardening-guide/)

Search every file/directory that has no owner nor group owner:

```bash
find / -nouser -o -nogroup
```

This can happen when a user is deleted, its files are then orphans.
