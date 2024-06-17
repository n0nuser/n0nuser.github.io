---
title: "Linux - Security Administration"
description: "Today there are numerous attack strategies and patterns: ramsonware,DDoS, rootkits, cryptomining programs, botnets... including physical attacks. In this post, I'll try to show you numerous things to take in consideration when hardening a Linux system."
date: 2021-06-12
lastmod: 2021-06-12
author: "Pablo Jesús González Rubio"
cover: "cover.png"
coverAlt: "Tux!"
toc: true
draft: false
tags: [ "Linux" ]
---

## Introduction

Today there are numerous attack strategies and patterns: ramsonware,DDoS, rootkits, cryptomining programs, botnets... including physical attacks.

In this post, I'll try to show you numerous things to take in consideration when hardening a Linux system.

> Things to evaluate:
>
>* What are we trying to keep safe?
>* Against what are we trying to be protected?
>* Against who are we trying to be protected?

There is a gradual line that implies comfort and security. An ultrasecure system is almost none comfortable, while a super comfortable flow isn't always the most secure.

>Security detection and prevention involves:
>
>* Analysis of psychological factors.
>* The behavior of the users of the system.
>* The possible intentions of the attackers.

## Physical security

There is no point in securing networks and services if the computers themselves are not protected.

* Who can enter the server room?
* Is access monitored?

These questions deserve to be considered (and answered) when assessing physical security.
Physical safety also includes taking into account accident risks, such as:

* Recover computer systems and data from a computer disaster.
* Natural disaster or intentional attack
  * In a fire:
    * Systems that release gases and consume oxygen to put out the fire.
    * Concrete anti-fire systems
    * Backups are kept in separate buildings, or at least in a fireproof safe.
  * Floods
  * Earthquakes
  * Car crashing against the building.

And so on...

### Bootloaders

If the system can be booted from a disk or CD, an attacker could access the data on a GNU/Linux partition (or also Windows) just by mounting the filesystem and could create a root user without needing to know any passwords (just by modifying *passwd* and *shadow* files).

In this case, you need:

* Protect the system boot from the BIOS, for example, protecting access by password, so that booting from CD or pen drive is not allowed.
* Update the BIOS, as it may also have security flaws.

In addition, you have to be careful because many of the BIOS manufacturers offer known extra passwords (a kind of backdoor). So we cannot depend on these measures exclusively.

### Getting Root Shell without the password

The first process is the init daemon (nowadays with Systemd, a symbolic link to */lib/systemd/systemd*). However, it is possible to provide an init option to the kernel by specifying a different program.

Anyone with access to the computer can press the Reset button and thus restart it. Then, at the bootloader prompt is possible to pass the `init=/bin/sh` option to the kernel. This way, we can gain root access without knowing the administrator's user password.

## SUID and SGID

Two particular permissions are relevant for executable files: setuid and setgid (represented by the letter s). We will frequently refer to bits since each of these Boolean values can be represented by a 0 or a 1.

**The setuid bit allows a user X to run [a non-interpreted binary file](https://unix.stackexchange.com/a/2910) owned by user Y, as it if was being user Y**. For example, I'm user *peter*, now let's say that root has a binary file that can be executed by anyone. Normally, it would run with my user, but if that file has the SUID bit, it would run as root.

> **To be able to run scripts with SUID**, it's better to create a wrapper in C that runs your script, then compile it and give it SUID permissions.

This is very dangerous in the case of scripts since they could be edited and modified to do anything. Therefore, these programs must be controlled, and in case the setuid is not needed, eliminate it.

The bit is set with: `chmod u+s` or with `chmod +4000`.  This will apply to the owner (called *suid bit*) and to the group (called *sgid bit*); can be removed with `chmod u-s` or `chmod -4000`.

In the case of displaying with *ls*, the file will appear with: `–rwSrw-rw`. If the file is only suid it will have an *S*; in sgid the *S* would appear after the second *w*.

To **check all of the SUID and the SGID files** we can use `find`:

```bash
find / -perm /4000 > filesWithSUID.txt
find / -perm /2000 > filesWithSGID.txt
```

### Example

Code in C to check Effective UID.

```c
#include <stdio.h>
#include <unistd.h>

int main(int argc, char **argv)
{
    printf("UID:%d, EUID:%d",getuid(),geteuid());
    fflush(stdin);
}
```

Once compiled with *gcc* try the following:

```bash
./uid
sudo ./uid
ls -axilsh uid
sudo chown root:root uid
ls -axilsh uid
./uid
sudo chmod +4000 uid
./uid
```

Result:

{{< img "suid.png" "SUID file" "border" >}}

## Sticky Bit

It is mainly used shared/public directories in which users can write BUT can't delete. The only user that can delete the contents inside the folder, is the owner of the directory.

The bit is set by: `chmod +t dir`, and can be removed with -t.

In a ls it will appear as a directory with permissions: `drwxrwxrwt` (look at the last t).

Example case: a directory where my friends can upload movies; they have all of the permissions but if the directory has the sticky bit they won't be able to erase anything.

## Improving security

Managing user accounts in Linux is one of the most critical jobs for Linux system administrators. Password security should be considered the primary concern for any secure Linux system.

### BIOS

* Deactivate in the BIOS the USB ports and the rest of the peripherals like (CD/DVD rom.)
  * To deactivate USB ports with Linux, we can create (as root) a file in modprobe's configuration directory:

    ```bash
    echo "install usb-storage /bin/true" > /etc/modprobe.d/no-usb
    ```

* Add a password to the GRUB.

### Rhost files

They allow someone to connect via SSH to our server with our user without even entering a password. This is used for backups, IT Admins... but can also used by cyber criminals.

Those files are created by users in their personal directories.

These files can't be ignored BUT we can cap the file by eliminating the read permissions, or deactivating r.hosts in the ssh config.

In any case, is still better to use a private key.

If you are managing a server, take care of looking for r.hosts file in your system:

```bash
find /home -name .rhost >> rhost_files.log
```

### Password

* **Change the password encryption system** for one that is more complex and difficult to break. Debian offers passwords per SHA512 (by default).
* Use of strong passwords: Many users use weak passwords that can be discovered through a brute force attack.
* **Check the validity time of user passwords**. To set the expiration date of the password of a user, you need to use the chage command. To know the time of use, validity or days since the last password change, the command:

  ```bash
  chage -l username
  ```

### PAM

With the PAM module (Pluggable Authentication Modules) you can configure and improve password policies in Linux:

* Prevent using old passwords
* Set minimum password length
* Define password complexity
* Define the period in which the password expires

The type of passwords allowed and some other characteristic associated with them is configured in the file: /etc/pam.d/common-password. The default configuration uses the pam unix module.

**To avoid use of weak passwords**, it contains a feature called pam cracklib that forces the user to use strong and secure passwords. It would be enough to add to the file */etc/pam.d/common-password* (Debian based distros) the following directive:

```bash
password required pam_cracklib.so retry=3 minlen=8 lcredit=1 ucredit=-2 dcredit=-2 ocredit=-1 difok=3
```

The reserved words mean:

* lcredit = lower-case
* ucredit = upper-case
* dcredit = digits
* ocredit = others
* difok = sets the minimum number of characters that must be different from the previous password

And to **prevent users from reusing passwords** (specially old passwords). we canedit the */etc/pam.d/common-password* file (only on Debian based distros). Add to the password section:

```conf
password sufficient pam_unix.so nullok use authtok md5 shadow remember = 5
# (to prevent a user from reusing the last 5 passwords used).
```

### Managing users

* **Verify accounts without passwords**. Any user account with an empty password means a open door for unauthorized access from anywhere in the world. It must be ensured that all user accounts have strong and secure passwords. To check if accounts with empty passwords exists, the following set of commands can be used:

  ```bash
  cat /etc/shadow | awk -F: ’($ 2 ==) print $ 1’
  ```

  This command will obtain the entire list of users in the system and will show those that their password is empty.
* **Manual locking and unlocking of accounts**. This feature is very useful to avoid deleting user accounts, as it is used to specify a period of time in which user accounts will be locked. This is done with the command:

  ```bash
  passwd -l username
  ```

  To unlock the user, use the command:

  ```bash
  passwd -u username
  ```

  Or, we can set the **Expiration Date to 0**:

  ```bash
  chage -E 0 username
  ```

  To unlock it:

  ```bash
  chage -E -1 username
  ```

### Root user

* Try not to use Root account.
* Execute commands in a secure way, verifying previously the action that's going to occur.
* Use strictly the system consoles as `/etc/securetty`.
* When doing an SSH, **enter first as a normal user and then use `su -`**.
  * Don't use Root password in an insecure network.

### Editing filesystem permissions

Edit filesystems in */etc/fstab* with the following parameters:

* **nodev**: Specifies that the filesystem cannot contain special devices.
* **noexec**: Prevents code from being executed directly from the filesystem.
* **nosuid**: Specifies that the filesystem cannot contain SUID files.

```conf
UUID=d5a25364-33cf-4fc6-a71a-da6861bfdbfe /tmp               ext4    defaults,nodev,nosuid,noexec        1 2
```

### Security Tools

Install tools to improve security such as:

* [Chkrootkit](https://www.chkrootkit.org)<br>
  It allows to check with a checksum if our versions of services and applications are safe.

  ```bash
  sudo apt install chkrootkit -y
  chkrootkit
  chkrootkit -q # Show menaces
  ```

* [Rkhunter](http://rkhunter.sourceforge.net/)<br>
  It is much more advanced and more detailed than *chkrootkit* as it detects troyans and worms.

  ```bash
  sudo apt install rkhunter -y
  rkhunter --list tests #check the different types of tests that this tool executes
  rkhunter --check # complete scan of the system
  ```

  Can be configured in the config file to send emails. Can be used in a cron for daily checkups.
* [Tripwire](https://www.tripwire.com/)<br>
  It generates an encrypted database with the properties of each element of our file system. This database is used to check the changes that have occurred in the file system. If these modifications have been made and / or authorized by us, the database will be updated, otherwise, it would be necessary to investigate what happened.

  ```bash
  sudo apt install tripwire -y # It will ask 4 times the password
  tripwire -m i # Database creation
  tripwire -m c # Testing the integrity of the database
  tripwire --check > report.txt # Report creation
  ```

  Every time a file is changed it reports it.
* [Fail2Ban](https://www.fail2ban.org/wiki/index.php/Main_Page)
  * I have a [post about it](../fail2ban).
* [Snort](https://www.snort.org/)
* [Modsecurity](https://github.com/SpiderLabs/ModSecurity)
* [JShielder](https://github.com/Jsitech/JShielder)
* [Lynis](https://cisofy.com/lynis/)
* [OpenSCAP](https://www.open-scap.org/tools/openscap-base/)
* [SELinux](http://selinuxproject.org/page/Main_Page)

<!--
## System Security

## Local security

## Network security

## Intrusion Detection System

## Checking for flaws
-->