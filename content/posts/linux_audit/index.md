---
title: "Linux - System Auditing"
description: "System auditing allows to save information in logs about different interactions of the system (like crashes, logins, reports of services, etc.) and use to investigate incidents on the system."
date: 2021-04-28
lastmod: 2021-04-28
author: "Pablo Jesús González Rubio"
cover: "cover.png"
coverAlt: "Tux!"
toc: true
draft: false
tags: [ "Linux" ]
---

## Introduction

System auditing allows to save information in logs about different interactions of the system (like crashes, logins, reports of services, etc.) and use to investigate incidents on the system.

Auditing of a system is legal and every connection must be saved for at least two years. In Spain, a network company called **Movistar** (in particular its department [Nemesys](https://www.movistar.es/nemesys)), have in their [privacy policy](https://www.movistar.es/particulares/centro-de-privacidad/#Plazos) stated:

>"La información sobre tráfico, navegación y localización se tratará durante un periodo que puede oscilar entre 3 y 12 meses para cumplir con las obligaciones de mantenimiento de la seguridad de las redes o prevención del fraude."

And

>"En cumplimiento de la Ley 25/2007, se conservarán los datos de tráfico y localización 12 meses que podrán ser solicitados mediante requerimiento judicial."

Which basically translates to: we save the data (traffic, navigation and location) for one year in case of fraud and may be requested by court order.

You can read more about Data Retention in [this wikipedia post](https://en.wikipedia.org/wiki/Data_retention).

As administrators we should do the same, because if our system has been hacked is our duty to report it to the suitable institution. Or in case an incident happened, it's useful to check exactly what happened.

## Accounting

Linux kernel and daemons usually generate diferent type of message that are stored in logs in `/var/log`.

They are useful to :

* Have a trace of its operation.
* Detect errors, malfunction warnings or critical situations.
* Immediately detect an attack
* Check for incorrect uses of the resources

But, can be bad because:

* It generates so much data that it can be used for DDoS
* Can be difficult to analyze the data for the vastness of it. (Solved with logrotate).

Logs in general are owned by the root user and the root group, and haven't permissions assigned for others.

## Activating accounting

Run the following commands

```bash
apt install acct
accton # This creates /var/log/account/pacct
```

And that's it!. `pacct` file is like the database for accounting.

## rsyslog

The daemon in charge of receiving the messages from other services, peripherals and programs is called ***rsyslog***. It stores it in files as declared in `/etc/rsyslog.conf` (global file  which defines parameters like the default permissions for all log files) and `/etc/rsyslog.d/50-default.conf`.

By default logs are stored in `/var/log`. But we can send them to:

* A remote location changing the resulting log file with the server `@log.myserver.com`. Would be a good idea since if a cyber criminal tries to remove his footprints, he/she won't be able to.
* Piping to another process
* Another user
* A text console (`/dev/tty7`)

It's best to read logs with `less` and `tail`.

`logger` command allows us to interact directly with *syslogd*.

### rsyslog config files

Facility levels:

| Facility code  |     Keyword     |                Description                |
|:--------------:|:---------------:|:-----------------------------------------:|
| 0              | kern            | Kernel messages                           |
| 1              | user            | User-level messages                       |
| 2              | mail            | Mail system                               |
| 3              | daemon          | System daemons                            |
| 4              | auth            | Security/authentication messages          |
| 5              | syslog          | Messages generated internally by syslogd  |
| 6              | lpr             | Line printer subsystem                    |
| 7              | news            | Network news subsystem                    |
| 8              | uucp            | UUCP subsystem                            |
| 9              | cron            | Clock daemon                              |
| 10             | authpriv        | Security/authentication messages          |
| 11             | ftp             | FTP daemon                                |
| 12             | ntp             | NTP subsystem                             |
| 13             | security        | Log audit                                 |
| 14             | console         | Log alert                                 |
| 15             | solaris-cron    | Scheduling daemon                         |
| 16–23          | local0 – local7 | Locally used facilities                   |

These are like groups by which rsyslog creates log files. Example of `50-default.conf`:

```conf
# First some standard log files.  Log by facility.
#
auth,authpriv.*   /var/log/auth.log
*.*;auth,authpriv.none  -/var/log/syslog
#cron.*    /var/log/cron.log
#daemon.*   -/var/log/daemon.log
kern.*    -/var/log/kern.log
#lpr.*    -/var/log/lpr.log
mail.*    -/var/log/mail.log
#user.*    -/var/log/user.log

#
# Logging for the mail system.  Split it up so that
# it is easy to write scripts to parse these files.
#
#mail.info   -/var/log/mail.info
#mail.warn   -/var/log/mail.warn
mail.err   /var/log/mail.err
```

Severity levels:

| Value |    Severity   | Keyword | Deprecated keywords |            Description            |
|:-----:|:-------------:|:-------:|:-------------------:|:---------------------------------:|
| 0     | Emergency     | emerg   | panic[7]            | System is unusable                |
| 1     | Alert         | alert   |                     | Action must be taken immediately  |
| 2     | Critical      | crit    |                     | Critical conditions               |
| 3     | Error         | err     | error[7]            | Error conditions                  |
| 4     | Warning       | warning | warn[7]             | Warning conditions                |
| 5     | Notice        | notice  |                     | Normal but significant conditions |
| 6     | Informational | info    |                     | Informational messages            |
| 7     | Debug         | debug   |                     | Debug-level messages              |

> Both tables from [Wikipedia](https://en.wikipedia.org/wiki/Syslog#Message_components).

Knowing the facilities and the severities, we can understand how the `50-default.config` is build, lines are formed by two columns separated by tabs:

* 1º Column have the facility and the severity separated with a dot.
* 2º Column refers to the file where the log is going to be saved.

### Don't do this

I said [here](#accounting) that log files tend to increase and can DDoS with depleting space, well we can obliterate the Hard Drive Disk (NOT RECOMMENDED) with the following:

1. `touch /var/log/all.log`
2. Edit `/etc/rsyslog.conf` and add the following line at the end of the file:

```bash
*.* /var/log/all.log
```

### Creating our own log file w/ logger

Edit `/etc/rsyslog.conf` and add:

```bash
local6.info /var/log/myPersonalLogFile
```

Reboot rsyslog service:

```bash
systemctl restart rsyslog
```

To send a message to syslog we use:

```bash
logger -p local6.info "My first log message"
```

Check the file is created.

```bash
tail -f /var/log/myPersonalLogFile
```

This is used a lot in scripts. For example:

```bash
logger -t myTag -f /var/log/myPersonalLogFile "My second message"
```

Will result in something like:

```txt
April 28 20:58:10 n0nuser myTag: My second message
```

## logrotated

When logs grow up in size, *log rotate* is in charge of dividing old logs, compress them (generally with gzip) and rename them to be manageable.

We can configurate logrotate to do its tasks weekly, monthly... You can see the default config file (`/etc/logrotate.conf`) below.

```conf
# see "man logrotate" for details
# rotate log files weekly
weekly

# use the adm group by default, since this is the owning group
# of /var/log/syslog.
su root adm

# keep 4 weeks worth of backlogs
rotate 4

# create new (empty) log files after rotating old ones
create

# use date as a suffix of the rotated file
#dateext

# uncomment this if you want your log files compressed
#compress

# packages drop log rotation information into this directory
include /etc/logrotate.d

# system-specific logs may be also be configured here.
```

### Implementing a log rotation

This script to rotate logs for a week can be executed everyday with cron:

```bash
#!/bin/bash
DAYS=7
FILENAME="pacct"
FILENAME2="pacc"

cd /var/log/account
if [ -f "$FILENAME.$DAYS" ];
then
    rm "$FILENAME.$DAYS"
fi

for (( i=$DAYS; i<=1; i-- ))
do
    mv "$FILENAME.$($DAYS-1)" "$FILENAME.$DAYS"
done
mv "$FILENAME" "$FILENAME.1"

cat /dev/null > "$FILENAME2"
```

## Audit

### Commands

`accton`: Enable accounting.

`sa` (summary accounting): Get statistics from used commands.

{{< img "sa.png" "sa command" >}}

`ac`: Print statistics about users' connect time.

{{< img "ac.png" "ac command" >}}

`last`: Show a listing of last logged in users.

{{< img "last.png" "last command" >}}

`lastb`: Show a listing of last users that failed to log in.

{{< img "lastb.png" "lastb command" >}}

`lastlog`: Show a listing of when was the last login for every user. Reads `/var/log/wtmp`.

{{< img "lastlog.png" "lastlog command" >}}

`w`: Show who is logged on and what they are doing.

{{< img "w.png" "w command" >}}

`finger`: Displays information about the system users.

{{< img "finger.png" "finger command" >}}

`who`: Show who is logged in. Reads `/var/log/wtmp`.

{{< img "who.png" "who command" >}}

### Examples

Check how many login tries have been made in our system:

```bash
tail -f /var/log/auth.log
```

Check which are the biggest files/folders:

```bash
du -h /var/log
```

Users that have been connected the most time:

```bash
ac -p
ac -p | head -1 # To grab the user with most time
ac -p | tail -n 1 # To grab the user with the least time
```

5 commands that has been executed the most (in order):

```bash
sa -nd 
sa -nd | head -6 | tail -n 5 # Takes the 4 most used commands
```

5 commands that have consumed the most CPU time:

```bash
sa -ak | head -6 | tail -n 5 # -k to order by CPU time average memory usage
```

Check syslog messages in live:

```bash
tail -f /var/log/messages
```

## Another tools

I'll add more tools here with the time.

* [logcheck](https://logcheck.org/)
* [fail2ban](https://www.fail2ban.org/wiki/index.php/Main_Page)
* [sshguard](https://www.sshguard.net/)
