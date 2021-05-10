---
title: "Linux - Disk Space Management with Quotas"
description: "Quotes are necessary as in a multi-user system limits allow to distribute space to each user. This way, everyone has the same conditions. As administrators, we don't want a user to upload all his movies to the system and block system resources for other users."
date: 2021-05-10
lastmod: 2021-05-10
author: "Pablo Jesús González Rubio"
cover: "cover.png"
coverAlt: "Tux!"
toc: true
draft: false
tags: [ "SysAdmin", "Linux" ]
---

## Introduction

Any resource that’s going to be shared has to be administrated, and it varies depending on how many users use it.

Establishing a Quote System allows restricting/limiting the abuse of the resources. i.e.: Google Drive free plan limits normal users to 15 Gb., while educational organizations don’t have this restriction.

This Quotes can be CPU or Storage measured.

> Every OS needs at least between 10% and 15% of free disk space to work fine.

## Checking storage

## Commands

The following commands are used to check the used/free space of filesystems:

* `df`: Shows a report of the disk space usage by each *filesystem*. `fdisk -l` allows the same.

{{< img "df.png" "df" >}}

* `du`: Estimates the Disk Usage of each file in the *directory* (recursively).

{{< img "du.png" "du" >}}



### Exercises

To check the max free number of files (i-nodes) and the blocks that can still be written we can check the superblock with:

```bash
$ sudo tune2fs -l /dev/sda2 | grep "Free "
Free blocks:              6318621
Free inodes:              2852049
```

To check how much space is used by `/home` directory:

```bash
$ du -sh /home
8,4G	/home
```

## Quote System

Quotes are necessary as in a multi-user system limits allow to distribute space to each user. This way, everyone has the same conditions. As administrators, we don't want a user to upload all his movies to the system and block system resources for other users.

Quote Systems are only for filesystems, not directories, and can be applied to users or groups.

They have two modes to limit the use of the disk:

* **i-nodes**: Max number of files.
* **blocks**: Max size.

There are two limits:

* **Soft limit**: Informative limit. Where the user is told to be careful of how much data they have. Less than *Hard Limit*.
* **Hard limit**: Real limit. At this point, user is not allowed to write any data on the filesystem.

### Grace period

A *grace period* allows blocking usage from a user after the *Soft Limit*. This block can occur when the period is over, or when the user reaches the *Hard Limit*. By default, the *grace period* for blocks and inodes is 7 days.

To set the maximum time after the user surpassed the soft limit:

```bash
edquota -t
```

### Inconvenients

When a quota system is implemented, more or less a **30% of performance loss is expected** due to  constantly checking the space usage of a logged-in user.

To solve this, it's important to have a good division of the filesystem, limiting the loss of performance.

If a user doesn't have a quota assigned, it’s assumed that it doesn’t have delimited storage.

### Commands

* `quotaon`: Sets on the quota.
* `quotaoff`: Sets off the quota.
* `setquota`: Sets a quota.
* `edquota`: Allows to edit "*adquota*" files (in `/`) to set quotes. It's easier to use compared with `setquota`.
* `quota` and `repquota`: They show info about quotes and a report of the space consumed by each user and group.
  * `quota -u user` shows info about space used of a specific user.
* `quotacheck`: Runs over the filesystem block by block checking free and occupied i-nodes. Usually runs at boot.

### Installation

Install quota:

```bash
sudo apt install quota
```

Edit `etc/fstab`, adding `usrquota,grpquota` before the `errors=...`. There can't be any blank spaces!!

```conf
# /etc/fstab: static file system information.
#
# Use 'blkid' to print the universally unique identifier for a
# device; this may be used with UUID= as a more robust way to name devices
# that works even if disks are added and removed. See fstab(5).
#
# <file system> <mount point>   <type>  <options>       <dump>  <pass>
# / was on /dev/sda2 during installation
UUID=d5a25364-33cf-4fc6-a71a-da6861bfdbfe /               ext4    usrquota,grpquota,errors=remount-ro 0       1
```

Sets on the quota:

```bash
quotacheck -gum /
# -g : User quotas listed in the filesystems specified are to be checked.
# -u : Group quotas listed in the filesystems specified are to be checked.
# -m : Don't try to remount filesystem read-only
```

To set a quota to a user:

```bash
edquota -u user
```

> Change here the soft and the hard limit of the blocks or the i-nodes. As blocksize is measured in Kb, so 50 Mb are 51200 blocks.<br>Use this formula: `nº of blocks = nº of Mb · 1024`

To copy a quota from a user to another user:

```bash
edquota -u -p firstUser endUser
```

1. Reboot
2. Check that user has the quota applied with:

```bash
sudo repquota -u user
```

To check the soft/hard limit is applied we can generate a file with a similar space:

```bash
dd if=/dev/zero of=BIGFILE.iso bs=1M count=30000 # 30 Gb
```

Check again for surpassed quotas:

```bash
sudo repquota /
```
