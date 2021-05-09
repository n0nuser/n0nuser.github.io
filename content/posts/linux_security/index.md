---
title: "Linux - Security Administration"
description: ""
date: 2021-04-07
lastmod: 2021-04-07
author: "Pablo Jesús González Rubio"
cover: "cover.png"
coverAlt: "Tux!"
toc: true
draft: false
tags: [ "SysAdmin", "Linux" ]
---

## Introduction

Security detection and prevention involves:

* Analysis of psychological factors.
* The behavior of the users of the system.
* The possible intentions of the attackers.

First thing to evaluate:

* What are we trying to keep safe?
* Against what are we trying to be protected?
* Against who are we trying to be protected?

Linux has the duty of:

* Protecting users against each other.
* Protect itself.
* Ensure the services are active.

Today there are numerous attack strategies and patterns: ramsonware,DDoS, rootkits, cryptomining programs, botnets... including physical attacks.

There is a gradual line that implies comfort and security. An ultrasecure system is almost to none comfortable, while a super comfortable flow isn't always the most secure.

## Physical security

There is no point in securing networks and services if the computers themselves are not protected.

* Who can enter the server room?
* Is access monitored?

These questions deserve to be considered (and answered) when assessing physical security.
Physical safety also includes taking into account accident risks, such as:

* Fires.
* Backup in separate buildings, or at least in a fireproof safe.

* Recover computer systems and data from a computer disaster.
* Natural or attack
  * In a fire:
    * Systems that release gases and consume oxygen to put out the fire.
    * Concrete anti-fire systems
  * Floods
  * Earthquakes
  * Car crashing against the building.

### BIOS

* Deactivate in the BIOS the USB ports and the rest of the peripherals like (CD/DVD rom.)
* Add a password to the grub.

### Bootloaders

At startup, we may have problems due to the physical access that an intruder could have to the machine.
One of the problems is already in the system boot. If the system can be booted from disk or CD, an attacker could access the data on a GNU / Linux partition (or also Windows) just by mounting the filesystem and could be registered as a user root without needing to know any passwords.

In this case, you need:

* Protect the system boot from the BIOS, for example, protecting access by password, so that booting from CD or pendrive is not allowed.
* Update the BIOS, as it may also have security flaws.

In addition, you have to be careful, because many of the BIOS manufacturers offer known extra passwords (a kind of backdoor), so we cannot depend on these measures exclusively.

### Init to Root shell

The first process is the init program (a symbolic link to / lib / systemd / systemd). However, it is possible to provide an init option to the kernel by specifying a different program. Anyone with access to the computer can press the Reset button and thus restart it.

Then it is possible, at the bootloader prompt, pass the init = / bin / sh option to the kernel to gain root access without knowing the administrator password.

### Privilege escalation

An attacking user probably would try to get a normal user and then escalate to root via:

* Programs with errors (bugs which are later exploited)
* Bad configs in services
* Decipher of passwords

### Improving security

Use the / etc / shadow files, where the password is stored. This file is only readable by root, and by no one else. In this case, an (X) appears in / etc / passwd where the encrypted password used to be. By default, current GNU / Linux distributions use shadow passwords unless you tell them not to.

Improving password security in Linux Managing user accounts in Linux is one of the most critical jobs for Linux system administrators. Password security should be considered the primary concern for any secure Linux system.

With the PAM module (Pluggable Authentication Modules) you can configure and improve password policies in Linux:

* Prevent using old passwords.
* Set minimum password length.
* Define password complexity.
* Define the period in which the password expires

#### Steps

* Change the password encryption system for one that is more complex and difficult to break. Debian offers passwords per SHA512 (by default).
* Use of strong passwords: Many users use weak passwords that can be discovered through a brute force attack.
* The type of passwords allowed and some other characteristic associated with them is configured in the file: /etc/pam.d/common-password. The default configuration uses the pam unix module.
* To avoid the use of weak passwords, it contains a feature called pam cracklib that
forces the user to use strong and secure passwords. It would be enough to add to the file
/etc/pam.d/system-auth directive:

```bash
/ lb / security / $ ISA / pam cracklib.so retry = 3 minlen = 8 lcredit = 1 ucredit = -2 dcredit = -2 ocredit = -1
```

The reserved words mean:

* lcredit = lower-case
* ucredit = upper-case
* dcredit = digits
* other = others

* Prevent users from reusing passwords: Especially old passwords. On Debian, edit the /etc/pam.d/common-password file. Add to the password section:

```conf
password sufficient pum unix.so nullok use authtok md5 shadow remember = 5
# (to prevent a user from reusing the last 5 passwords used).
```

* Check the validity time of user passwords. To set the expiration date of the password of a user, you need to use the chage command. To know the time of use, validity or days since the last password change, the command:

```bash
chage -l username
```

* Verify accounts without passwords. Any user account with an empty password means a open door for unauthorized access from anywhere in the world. It must be ensured that all user accounts have strong and secure passwords. To check if accounts with empty passwords exists, the following set of commands can be used:

```bash
cat / etc / shadow | awk -F: ’($ 2 ==) print $ 1’
```

This command will obtain the entire list of users in the system and will show those that their
password is empty.

* Manual blocking and unblocking of accounts. This feature is very useful to avoid deleting user accounts, as it is used to specify a period of time in which user accounts will be locked. This is done with the command:

```bash
# passwd -l username
```

To unlock the user, use the command:

```bash
# passwd -u username
```

It is worth mentioning that if the root user logs in as some locked user, if he can log in
session.

* fstab: nodev, noexec, nosuid

* [chkrootkit](https://www.chkrootkit.org)
* rkhunter

### SUID and SGID

Two particular permissions are relevant for executable files: setuid and setgid (represented by the letter s). We will frequently refer to bits since each of these Boolean values can be represented by a 0 or a 1.

These two permissions allow any user to run the program with the permissions of the owner or the group respectively.

This mechanism provides access to functionalities that need more permissions than you normally would. Since a program owned by root with setuid enabled will run systematically with the identity of the superuser, it is very important to ensure that it is safe and reliable.

The **setuid** bit. Allows a user to run (either an executable or a shell script) with the permissions of another user. This may be useful in some cases, but it is potentially dangerous. Is he
case, for example:

* From programs with root setuid: a user, although he does not have root permissions, can execute a program with setuid that may have internal root user permissions.

This is very dangerous in case of scripts, since they could be edited and modified to do anything. Therefore, these programs must be controlled, and in case the setuid is not needed, eliminate it.

The bit is set by: chmod + s, either applying it to the owner (then called suid) or to the group (called bit sgid); can be removed with -s.

In the case of displaying with ls, the file will appear with: –rwSrw-rw (look at the S), if it is only suid, in sgid the S would appear after the second w.

**Sticky Bit** is only useful in directories. It is used mainly in temporary directories where we want some groups (sometimes unrelated) or any user to be able to write, but that can only delete, either the owner of the directory, or the owner of the file that is in the directory . A classic example of this bit is the temporary directory / tmp.

You have to watch that there are no directories of this type, since they can allow anyone to write to them, so you have to check that there are only those that are purely necessary as temporary.

The bit is set by: `chmod + t dir`, and can be removed with -t.
In a ls it will appear as a directory with permissions: drwxrwxrwt (look at the last t).

```bash
find / -perm -4000 -type f -print #
find / -perm -2000 -type f -print # 
```

## Root security

* Try not to use Root account.
* Execute commands in a secure way, verifying previously the action that's going to occur.
* Don't use Root password in an insecure network.
* Use strictly the system consoles as `/etc/securetty`.
* When doing an SSH, enter first as a normal user and then use `su`.

## System Security

## Local security

## Network security

## Intrusion Detection System

* Tripwire

## Security Tools

SELinux
