---
title: "Email Server - Postfix, Dovecot and Roundcube"
description: "Step-by-step Linux email server setup with Postfix, Dovecot, and Roundcube, including installation, configuration, and security basics."
date: 2021-05-21
lastmod: 2026-09-27
author: "Pablo Jesús González Rubio"
toc: true
draft: false
tags: [ "Linux" ]
howToSteps: [ "Postfix", "Dovecot", "Roundcube", "Port forwarding", "SPF, DKIM and DMARC", "Send emails with Gmail via IMAP" ]
---

## Introduction

This is a step-by-step guide to running your own mail server on Linux: **Postfix** for sending (SMTP), **Dovecot** for reading over IMAP, and **Roundcube** for webmail, then wiring it all up so you can also send and receive through Gmail. It's aimed at self-hosters who are comfortable on the command line.

> **Before you start:** self-hosted email is hard to get *delivered*. Most residential ISPs block outbound port 25, and mail from a new IP without **SPF, DKIM and DMARC** records (plus a clean reverse DNS) usually lands in spam or is rejected outright. The server setup comes first; the [SPF, DKIM and DMARC](#spf-dkim-and-dmarc) section then covers the DNS records you need before relying on it for real mail.

## Postfix

### Installation

```bash
sudo apt update -y && sudo apt install postfix -y
```

Here press Ok.

{{< img "postfix1.png" "Postfix" "border" >}}

* **No configuration**: Config files will be blank.
* **Internet site**: Choose this if you have a domain.
* **Internet with smarthost**: Emails are received on this server, but emails are sent from another server.
* **Satellite System**: Postfix acts as a relay to another server.
* **Local only**: Will only be working for LAN users.

{{< img "postfix2.png" "Postfix" "border" >}}

If you chose **Internet Site**, enter your domain here.

{{< img "postfix3.png" "Postfix" "border" >}}

### Configuration

We'll need to modify some files as root, so you can use the next command to edit these files:

```bash
sudo nano /directory/file.ext
```

If you don't have SSL certificates (made on your own with OpenSSL or with the help of Let's Encrypt), you can follow [this little explanation](../apache/#https---lets-encrypt) I made on the Apache server, on how to get the certificates.<br>It's very easy, literally, it just borrows 3 minutes of your time.

File **/etc/postfix/main.cf**:

This is the main config file, here we can configure the use of SSL, SASL, and basic settings. Add these lines if you don't have them, and modify them based on your needs.

In the `home_mailbox` I've chosen to use **Maildir** instead of **Mailbox**. Maildir allows saving each email as a single file, while Mailbox saves all of the emails in a single file. In terms of efficiency and performance, Mailbox is worse because searching for an email in a file (locating the pointer in the file, removing each line that corresponds with the email and the saving) do a lot of I/O operations, while Maildir only creates/appends/deletes a file.

```conf
myorigin = /etc/mailname
mydomain = mydomain.com
myhostname = mydomain.com
smtp_tls_security_level = may
smtpd_tls_cert_file = /etc/letsencrypt/live/mydomain.com/fullchain.pem
smtpd_tls_key_file = /etc/letsencrypt/live/mydomain.com/privkey.pem
smtpd_tls_security_level = may
smtpd_sasl_auth_enable = yes
smtpd_sasl_type = dovecot
smtpd_sasl_path = private/auth
home_mailbox = Maildir/
```

To receive emails from outside the server, we need to map the domain to localhost. With this, every email that is sent to "user@mydomain" will be received by "user@localhost" (local user).

File **/etc/postfix/vmailbox**:

Just write `@mydomain.com @localhost` in the file.

Then, to map the domains just run:

```bash
sudo postmap /etc/postfix/vmailbox
```

To enable other clients such as Gmail to access the server configuration, we have to uncomment some lines in the following file.

File **/etc/postfix/master.cf**:

```conf
smtp      inet  n       -       y       -       -       smtpd
#smtp      inet  n       -       y       -       1       postscreen
#smtpd     pass  -       -       y       -       -       smtpd
#dnsblog   unix  -       -       y       -       0       dnsblog
#tlsproxy  unix  -       -       y       -       0       tlsproxy
submission inet n       -       y       -       -       smtpd
  -o syslog_name=postfix/submission
  -o smtpd_tls_security_level=encrypt
  -o smtpd_tls_wrappermode=no
  -o smtpd_sasl_auth_enable=yes
  -o smtpd_relay_restrictions=permit_sasl_authenticated,reject
  -o smtpd_recipient_restrictions=permit_mynetworks,permit_sasl_authenticated,reject
  -o smtpd_sasl_type=dovecot
  -o smtpd_sasl_path=private/auth
  -o smtpd_tls_auth_only=yes
  -o smtpd_reject_unlisted_recipient=no
  -o smtpd_client_restrictions=$mua_client_restrictions
  -o smtpd_helo_restrictions=$mua_helo_restrictions
  -o smtpd_sender_restrictions=$mua_sender_restrictions
  -o smtpd_recipient_restrictions=
  -o milter_macro_daemon_name=ORIGINATING
```

## Dovecot

### Installation

```bash
sudo apt install dovecot-imapd -y
```

### Configuration

> **Dovecot version check:** run `dovecot --version`. The snippets below use **2.3** syntax (Debian 12, Ubuntu 24.04). Debian 13 ships **2.4**, which isn't backward-compatible: the config must start with `dovecot_config_version` and `dovecot_storage_version`, and several settings were renamed:
>
> | Dovecot 2.3 | Dovecot 2.4 |
> |---|---|
> | `mail_location = maildir:~/Maildir` | `mail_driver = maildir` + `mail_path = ~/Maildir` |
> | `disable_plaintext_auth = yes` | `auth_allow_cleartext = no` (now the default) |
> | `ssl_cert` / `ssl_key` | `ssl_server_cert_file` / `ssl_server_key_file` |
> | `ssl_prefer_server_ciphers` | `ssl_server_prefer_ciphers` |
> | `passdb { driver = pam }` | `passdb pam { }` |
> | `userdb { driver = passwd }` | `userdb passwd { }` |
>
> The [2.3 to 2.4 upgrade guide](https://doc.dovecot.org/2.4.1/installation/upgrade/2.3-to-2.4.html) has the full list.

We'll need to modify some files as root, so you can use the next command to edit these files:

```bash
sudo nano /directory/file.ext
```

First we configure Dovecot so that the mails arrive to the user's folder:

**/etc/dovecot/conf.d/10-mail.conf** file.

And we change the line:

```conf
mail_location = mbox:~/mail:INBOX=/var/mail/%u 
```

By:

```conf
mail_location = maildir:~/Maildir
```

Next thing to do is enabling SSL and configure the Postfix section:

**/etc/dovecot/conf.d/10-master.conf** file.

We uncomment the following:

```conf
inet_listener imap {
    port = 143
  }

inet_listener imaps {
    port = 993
    ssl = yes
  }
```

The standard unencrypted IMAP port is 143 (Gmail uses STARTTLS encryption), but it is recommended to use SSL encryption, which corresponds to port 993 (Gmail uses SSL encryption).

We enable port 587, used for outgoing messages:

```conf
service submission-login {
  inet_listener submission {
    port = 587
  }
}
```

In the "lmtp" section we change the following:

```conf
unix_listener lmtp {
    #mode = 0666
  }
```

With this:

```conf
unix_listener lmtp {
    mode = 0600
    user = postfix
    group = postfix
  }
```

And change the Postfix section, the default is this:

```conf
# Postfix smtp-auth
#unix_listener /var/spool/postfix/private/auth {
#  mode = 0666
#}
```

We change it for this:

```conf
# Postfix smtp-auth
  unix_listener /var/spool/postfix/private/auth {
    mode = 0666
    user = postfix
    group = postfix
  }
```

Now we will configure some authentication settings.

**/etc/dovecot/conf.d/10-auth.conf** file.

Uncomment the following line:

```conf
disable_plaintext_auth = yes
```

And we change the following line:

```conf
auth_mechanisms = plain
```

Adding the "login":

```conf
auth_mechanisms = plain login
```

We must also check that SSL is enabled so that connections are encrypted. Gmail needs to have this enabled to use our mail server.

**/etc/dovecot/conf.d/10-ssl.conf** file.

```conf
ssl = required
ssl_prefer_server_ciphers = yes
ssl_min_protocol = TLSv1.2
```

Finally, it remains to verify that the authentication method is PAM.

**/etc/dovecot/conf.d/auth-system.conf.ext** file.

And we check that in "passdb" it's like this:

```conf
passdb {
  driver = pam
  # [session=yes] [setcred=yes] [failure_show_msg=yes] [max_requests=<n>]
  # [cache_key=<key>] [<service name>]
  #args = dovecot
  args = %s
}
```

And in "userdb" as follows:

```conf
userdb {
  # <doc/wiki/AuthDatabase.Passwd.txt>
  driver = passwd
  # [blocking=no]
  #args =

  # Override fields from passwd
  #override_fields = home=/home/%n/Mail/received
}
```

## Roundcube

### Installation

```bash
sudo apt install roundcube -y
```

### Configuration

You'll need to have installed Apache2 for Roundcube to work, and have enabled the "rewrite" module: `sudo a2enmod rewrite`.

To access the mail interface, we will have to make a symbolic link from the original Roundcube directory to the web page.

```bash
sudo ln -s /usr/share/roundcube/ /var/www/html/webmail
```

To access the webmail now you can use this address: [https://mydomain.com/webmail](https://mydomain.com/webmail)

## Port forwarding

To receive emails we’ll need to **open a port for SMTP (port 25)** in our router, redirecting every petition to our server.

Once all of the above is configured, we will be able to send messages:

* From inside the system to other local users.
* To other users from other domains.

Thanks to the address mapping we did in Postfix, we will be able to receive emails from outside the network.

> **Heads-up:** most residential ISPs block port 25, usually outbound and often inbound too. If `nc -vz gmail-smtp-in.l.google.com 25` times out from your server, that's why. Your options are asking the ISP to unblock it (some do for business plans), running the server on a VPS that allows port 25, or sending through an SMTP relay with Postfix's `relayhost`.

## SPF, DKIM and DMARC

A working server isn't enough: Gmail, Outlook and friends check three DNS records before trusting your mail. Without them, expect the spam folder or a flat rejection. Replace `mydomain.com` with your domain in everything below.

### Reverse DNS (PTR)

Your server's public IP should resolve back to your hostname (`mydomain.com`, matching `myhostname` in Postfix). You can't set this in your own DNS zone: it's set by whoever owns the IP, so look for "reverse DNS" in your VPS panel or ask your ISP. Check it with:

```bash
dig -x <your-public-ip> +short
```

### SPF

SPF lists which servers may send mail for your domain. Add a TXT record on the domain itself:

```txt
mydomain.com.  TXT  "v=spf1 mx -all"
```

`mx` means "the servers in my MX record may send", and `-all` means "reject everything else". If you send through a relay, add it too (your provider documents the exact `include:`).

### DKIM with OpenDKIM

DKIM signs every outgoing message with a private key; receivers verify it with a public key you publish in DNS. Install OpenDKIM and generate a key pair with the selector `mail`:

```bash
sudo apt install opendkim opendkim-tools -y
sudo mkdir -p /etc/opendkim/keys/mydomain.com
sudo opendkim-genkey -b 2048 -s mail -d mydomain.com -D /etc/opendkim/keys/mydomain.com
sudo chown -R opendkim:opendkim /etc/opendkim/keys
```

That creates `mail.private` (keep it secret, never commit it) and `mail.txt` (the DNS record).

File **/etc/opendkim.conf**, set or add:

```conf
Domain    mydomain.com
Selector  mail
KeyFile   /etc/opendkim/keys/mydomain.com/mail.private
Socket    inet:8891@localhost
```

A TCP socket on localhost avoids fighting Postfix's chroot over a Unix socket path.

File **/etc/postfix/main.cf**, append:

```conf
milter_default_action = accept
milter_protocol = 6
smtpd_milters = inet:localhost:8891
non_smtpd_milters = $smtpd_milters
```

Restart both:

```bash
sudo systemctl restart opendkim postfix
```

Now publish the public key. `cat /etc/opendkim/keys/mydomain.com/mail.txt` prints it split over several quoted strings; join them into one value for a TXT record named `mail._domainkey`:

```txt
mail._domainkey.mydomain.com.  TXT  "v=DKIM1; k=rsa; p=<public key from mail.txt>"
```

Once DNS has propagated, check that the published key matches the private one:

```bash
sudo opendkim-testkey -d mydomain.com -s mail -vvv
```

`key OK` is what you want. (`key not secure` just means your zone doesn't use DNSSEC; it's fine.)

### DMARC

DMARC tells receivers what to do when SPF or DKIM fail, and where to send reports. Start in monitoring mode:

```txt
_dmarc.mydomain.com.  TXT  "v=DMARC1; p=none; rua=mailto:postmaster@mydomain.com"
```

Read the reports for a couple of weeks. Once your legitimate mail passes, tighten it to `p=quarantine`, then `p=reject`.

### Test it

Send a message to a Gmail address, open it, and choose **Show original**: SPF, DKIM and DMARC should all say `PASS`. For a more detailed score, send one to the address that [mail-tester.com](https://www.mail-tester.com/) gives you.

## Send emails with Gmail via IMAP

To use our email server with Gmail we’ll need to open another two ports, one for fetching the emails and another to send emails from Gmail, called the submission port.

We can do it with POP3 too, but the whole installation we have been configuring for IMAP. To use POP3, you just need to modify the Dovecot file **/etc/dovecot/conf.d/10-master.conf** and allowing POP3 and POP3s (in case you want to use SSL).

* **Without SSL**: Open ports 143 (IMAP) and 587 (submission) in your router.
* **With SSL**: Open ports 993 (IMAPs) and 587 (submission) in your router.

Then follow these steps:

1. Click on the drop-down and search the "Settings" button.
   {{< img "gmail1.jpg" "" "border" >}}
2. Click on "Add account".
   {{< img "gmail2.jpg" "" "border" >}}
3. Select "Another service".
   {{< img "gmail3.jpg" "" "border" >}}
4. Write your email ("<myuser@mydomain.com>").
   {{< img "gmail4.jpg" "" "border" >}}
5. Select IMAP.
   {{< img "gmail5.jpg" "" "border" >}}
6. Write your the system's user password.
   {{< img "gmail6.jpg" "" "border" >}}
7. Check settings are right for IMAP.
   {{< img "gmail7.jpg" "" "border" >}}
8. Config some miscellaneous settings.
   {{< img "gmail8.jpg" "" "border" >}}
9. Done!

Sometimes this screens doesn’t appear in the same order, it may ask for some security settings like using STARTTLS (without SSL) or SSL, selecting one or another will modify the port to use.

If you followed the steps in every config file of the different services, you shouldn’t encounter any problem with this. But if that's the case, feel free to [contact](../../#contact) me!
