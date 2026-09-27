---
slug: "linux-users-and-groups"
title: "Linux Users and Groups: useradd and sudo"
description: "Manage Linux users and groups from the command line: /etc/passwd and /etc/shadow, useradd, usermod, groups, sudo rules, password ageing and orphaned files."
date: 2026-09-27T00:30:00+02:00
lastmod: 2026-09-27
author: "Pablo Jesús González Rubio"
toc: true
draft: false
tags: [ "Linux" ]
---

> **Linux series:** **Users & Groups** → [Filesystem](/posts/linux-filesystem-inodes-partitions/) → [Monitoring Processes](/posts/linux-process-management/) → [System Auditing](/posts/linux-system-auditing/) → [Backup](/posts/linux-server-backup/) → [Startup & Shutdown](/posts/linux-boot-process/) → [Disk Quotas](/posts/linux-disk-quotas/) → [Security](/posts/linux-hardening-guide/)

## Introduction

Every file, process and permission on Linux comes back to one question: *which user, which group?* By the end of this post you'll know where that information lives, how to create, change and remove users and groups, how to hand out `sudo` without handing out root, and how to clean up after a deleted account.

It's aimed at anyone running their own Linux box or server. The commands work on Debian, Ubuntu, Fedora and Arch; where a distro differs, I'll say so. Almost everything here needs root, so expect a lot of `sudo`.

## Where users and groups live

Linux keeps accounts in plain text files under `/etc`. You rarely edit them by hand, but knowing their format makes every command below make sense.

### /etc/passwd

One line per user, seven fields separated by colons:

```txt
alice:x:1000:1000:Alice Smith:/home/alice:/bin/bash
```

| Field | Value | Meaning |
|---|---|---|
| 1 | `alice` | Username |
| 2 | `x` | Password placeholder (the real hash is in `/etc/shadow`) |
| 3 | `1000` | UID, the user ID |
| 4 | `1000` | GID of the user's primary group |
| 5 | `Alice Smith` | Comment (GECOS), usually the full name |
| 6 | `/home/alice` | Home directory |
| 7 | `/bin/bash` | Login shell |

UIDs tell you what kind of account it is:

- **0**: `root`.
- **1–999**: system accounts for services (`www-data`, `sshd`, `postgres`...).
- **1000+**: regular humans.

The exact ranges are set in `/etc/login.defs` (`UID_MIN`, `SYS_UID_MAX`).

### /etc/shadow

The password hashes and ageing rules, readable only by root:

```txt
alice:$y$j9T$...:20358:0:99999:7:::
```

The second field is the hash. Its prefix tells you the algorithm: `$y$` is yescrypt (the default on current Debian, Ubuntu and Fedora), `$6$` is SHA-512. A `!` or `*` there means password login is disabled for that account. The numbers after it are the ageing fields we'll set with `chage` later.

### /etc/group

One line per group:

```txt
developers:x:1005:alice,bob
```

Group name, password placeholder, GID, and the list of **supplementary** members. A user's **primary** group isn't listed here: it comes from the GID field in `/etc/passwd`.

To see all of this for a given user without reading files:

```bash
id alice
# uid=1000(alice) gid=1000(alice) groups=1000(alice),27(sudo),1005(developers)
```

## Managing users

### Create a user

`useradd` is the low-level tool that exists on every distro:

```bash
sudo useradd -m -s /bin/bash -c "Alice Smith" alice
sudo passwd alice
```

- `-m` creates `/home/alice` and copies the starter files from `/etc/skel` into it. Without it, some distros (Debian included) create no home directory at all.
- `-s /bin/bash` sets the shell. Debian's `useradd` defaults to `/bin/sh` otherwise.
- `-c` fills in the comment field.
- `passwd` sets the password interactively.

On Debian and Ubuntu there's also `adduser`, a friendlier wrapper that asks for the password and details and creates the home directory for you:

```bash
sudo adduser alice
```

### Change a user

`usermod` changes any field of an existing account. The ones you'll use most:

```bash
# Add alice to extra groups (keeps her current ones)
sudo usermod -aG developers,docker alice

# Change her login shell
sudo usermod -s /bin/zsh alice

# Rename the account and move the home directory with it
sudo usermod -l alicia -d /home/alicia -m alice
```

> **Careful with `-G`:** always pair it with `-a` (append). `usermod -G docker alice` without `-a` *replaces* all her supplementary groups with just `docker`, and that's how people lose `sudo` on their own account.

### Lock and unlock an account

```bash
# Lock the password and expire the account
sudo usermod -L -e 1 alice

# Undo both
sudo usermod -U -e "" alice
```

`-L` only disables the **password**: a user with an SSH key can still log in. Setting the expiry date to `1` (1 January 1970) blocks every login method, which is what you want for someone who's left.

### Delete a user

```bash
sudo userdel -r alice
```

`-r` removes the home directory and mail spool too. Files alice owned *elsewhere* on the system stay behind, with nobody owning them. More on that in [Orphaned files](#orphaned-files).

## Managing groups

Groups are how you share access without sharing accounts.

```bash
# Create a group
sudo groupadd developers

# Add and remove members
sudo gpasswd -a bob developers
sudo gpasswd -d bob developers

# List a user's groups
groups bob

# Delete a group
sudo groupdel developers
```

Group changes apply at the **next login**. To pick them up in your current shell without logging out, run `newgrp developers`, or just open a new SSH session.

### A shared project directory

Here's the classic use: a folder that everyone in `developers` can write to, where new files automatically belong to the group.

```bash
sudo mkdir -p /srv/project
sudo chgrp developers /srv/project
sudo chmod 2775 /srv/project
```

The leading `2` is the **setgid** bit. On a directory, it makes every new file inside inherit the directory's group instead of the creator's primary group, so nobody has to remember to `chgrp`.

## Giving out sudo

`sudo` lets a user run commands as root, and logs every one of them. There are two ways to grant it.

### Full admin: the admin group

Add the user to the group your distro already trusts:

```bash
# Debian and Ubuntu
sudo usermod -aG sudo alice

# Fedora, RHEL and Arch
sudo usermod -aG wheel alice
```

On Arch, the `wheel` rule ships commented out: run `sudo EDITOR=nano visudo` and uncomment the `%wheel ALL=(ALL:ALL) ALL` line.

### Just one command: a sudoers.d rule

Often a user only needs one privileged command, like a deploy account restarting a service. Give them exactly that:

```bash
sudo visudo -f /etc/sudoers.d/deploy
```

```txt
deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart myapp
```

Now `deploy` can run `sudo systemctl restart myapp` without a password, and nothing else.

> **Always edit sudoers with `visudo`.** It checks the syntax before saving. A typo in a file saved with a plain editor can break `sudo` for *everyone*, and then you need a root shell or a rescue boot to fix it.

## System accounts for services

When you run your own service (a bot, a small API, a backup script), give it its own account instead of running it as root or as yourself:

```bash
sudo useradd --system --no-create-home --shell /usr/sbin/nologin myapp
```

- `--system` picks a UID below 1000.
- `--shell /usr/sbin/nologin` means nobody can log in as it, even with the right password.

If the service gets compromised, the attacker gets `myapp`'s permissions, not yours. Pair it with `User=myapp` in the service's systemd unit (see [Startup & Shutdown](/posts/linux-boot-process/)).

## Password ageing

`chage` controls how long a password stays valid. See the current rules first:

```bash
sudo chage -l alice
```

Then set what you need:

```bash
# Force a new password at next login
sudo chage -d 0 alice

# Password expires every 90 days, with a 7-day warning
sudo chage -M 90 -W 7 alice

# The whole account expires on a fixed date (a contractor, say)
sudo chage -E 2026-12-31 alice
```

Defaults for **new** users come from `PASS_MAX_DAYS`, `PASS_MIN_DAYS` and `PASS_WARN_AGE` in `/etc/login.defs`. Changing them doesn't touch existing accounts.

## Orphaned files

When a user is deleted, the files they owned outside their home directory stay on disk, now owned by a bare UID that maps to nobody. Find every file and directory with no valid owner or group:

```bash
sudo find / -xdev \( -nouser -o -nogroup \) 2>/dev/null
```

- `-xdev` stays on the root filesystem. Drop it to also search other mounted disks (and expect it to take a while).
- `2>/dev/null` hides the "permission denied" noise from `/proc`.

Then decide what to do with each one: hand it to someone who still works here, or delete it.

```bash
sudo chown bob:developers /srv/project/report.csv
```

> **Why it matters:** if you later create a new user who happens to get the same UID, they silently inherit every one of those orphaned files. Clean up before you reuse UIDs.

## Quick reference

| Task | Command |
|---|---|
| Create a user with a home | `useradd -m -s /bin/bash name` |
| Set a password | `passwd name` |
| Add to a group | `usermod -aG group name` |
| Lock completely | `usermod -L -e 1 name` |
| Delete with home | `userdel -r name` |
| Create a group | `groupadd group` |
| Remove from a group | `gpasswd -d name group` |
| Show IDs and groups | `id name` |
| Edit sudo rules | `visudo -f /etc/sudoers.d/file` |
| Password expiry | `chage -M 90 name` |
| Find orphaned files | `find / -xdev \( -nouser -o -nogroup \)` |

## Conclusion

Users and groups are the base layer of Linux security: every permission you set later assumes you got this part right. Keep humans above UID 1000, give services their own `nologin` accounts, hand out `sudo` as narrowly as you can, and clean up orphaned files when people leave.

Next in the series, [Filesystem](/posts/linux-filesystem-inodes-partitions/) looks at where all those files actually live: inodes, partitions and `fstab`.
