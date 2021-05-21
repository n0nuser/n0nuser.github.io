---
title: "Email Server - Postfix, Dovecot and Roundcube"
description: ""
date: 2021-05-10
lastmod: 2021-05-10
author: "Pablo Jesús González Rubio"
cover: "cover.png"
coverAlt: "Tux!"
toc: true
draft: true
tags: [ "SysAdmin", "Linux" ]
---

## Introduction

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
smtp_use_tls = yes
smtp_tls_security_level = may
smtpd_tls_cert_file = /etc/letsencrypt/live/mydomain.com/fullchain.pem
smtpd_tls_key_file = /etc/letsencrypt/live/mydomain.com/privkey.pem
smtpd_tls_security_level = may
smtpd_sasl_auth_enable = yes
smtpd_sasl_type = dovecot
smtpd_sasl_path = private/auth
home_mailbox = Maildir/
```

To be able to receive emails from outside the server, we need to map the domain to localhost. With this, every email that comes to our server directed to "user@mydomain" will be received by "user@localhost", and thus, will be received by the system user (local user).

File **/etc/postfix/vmailbox**:

Just write `@mydomain.com @localhost` in the file.

Then, to map the domains just run:

```bash
sudo postmap /etc/postfix/vmailbox
```

To enable other clients such as Gmail to access the server configuration, we have to enable the following configuration by uncommenting the parameters in the following file.

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

The standard unencrypted IMAP port is 143 (in Gmail it uses STARTTLS encryption), but it is recommended to use SSL encryption, which corresponds to port 993 (in Gmail it uses SSL encryption).

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

We must also check that SSL is enabled so that connections are encrypted. Gmail needs to have this enabled in order to use our mail server.

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

In order for us to access the mail interface we will have to make a symbolic link from the original Roundcube directory to the web page.

```bash
sudo ln -s /usr/share/roundcube/ /var/www/html/webmail
```

To access the webmail now you can use this address: [https://mydomain.com/webmail](https://mydomain.com/webmail)

## Port forwarding

To be able to receive messages we'll need to open a port for SMTP (port 25) in our router, redirecting every petition to our server.

Once all of the above is configured, we will be able to send messages from inside the system to users local to the system, and outside; also, thanks to the address mapping we did in Postfix, we will be able to receive mails from outside the network.

## Send emails with Gmail via IMAP

To be able to use our email server with Gmail we'll need to open another two ports, one for fetching the emails and another in case we want to send an email from Gmail, called the submission port.

We can do it with POP3 too, but the whole installation we have been configuring it for IMAP. To use POP3 you just need to modify the Dovecot file **/etc/dovecot/conf.d/10-master.conf** and allowing POP3 and POP3s (in case you want to use SSL).

* **Without SSL**: Open ports 143 (IMAP) and 587 (submission) in your router.
* **With SSL**: Open ports 993 (IMAPs) and 587 (submission) in your router.

Then follow these steps:

1. Click on the drop-down and search the "Settings" button.
   {{< img "gmail1.jpg" "" "border" >}}
2. Click on "Add account".
   {{< img "gmail2.jpg" "" "border" >}}
3. Select "Another service".
   {{< img "gmail3.jpg" "" "border" >}}
4. Write your email ("myuser@mydomain.com").
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

Sometimes this screens doesn't appear in the same order, it may ask for some security settings like using STARTTLS (without SSL) or SSL, selecting one or another will modify the port to use.

If you followed the steps in every config file of the different services, you shouldn't encounter any problem with this. But if that's the case, feel free to [contact](../../#contact) me!
