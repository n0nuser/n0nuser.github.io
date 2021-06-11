---
title: "Linux - System Startup and Shutdown"
description: "In this post I'll explain with detail how Unix uses *initd* or *systemd* to manage the boot/shutdown process: runlevels, targets, and how to run a script/program at certain points like boot or shutdown."
date: 2021-05-10
lastmod: 2021-05-10
author: "Pablo Jesús González Rubio"
cover: "cover.png"
coverAlt: "Tux!"
toc: true
draft: false
tags: [ "SysAdmin", "Linux" ]
---


## Introduction

In this post I'll explain with detail how Unix uses *initd* or *systemd* to manage the boot/shutdown process: runlevels, targets, and how to run a script/program at certain points like boot or shutdown.

We can check the startup log with `dmesg` as it displays the system boot information. If we put a peripheral and the system does not start, this is where we look. A similar tool is `journalctl -f`.

## Startup Commands

- `shutdown`: Put the system in Maintenance mode. It allows scheduling maintenance by notifying users with a maintenance message. It can also be used to reboot. Does a `telinit 1`.
  - For example:
    ```bash
    shutdown +5 "The system is going to shut down"
    ```
- `halt`: Puts the OS in the minimum state. Leaves CPUs with almost no task. Rest state without cutting off the power.
- `poweroff`: Sends an ACPI message to the BIOS that forces the power off.
- `insserv`: Utility that no longer exists and allows, at startup, to execute different programs. Now, crons or systemd services/timers are used instead.

## Runlevels

A runlevel is the mode in which the OS booted, and there are seven boot levels in total.

Running `runlevel` shows which runlevel was the last used and which is using now. The number that appears on the left is the previous runlevel (if an N appears, there was none), and the one on the right is the current one.

{{< img "runlevel.png" "Runlevel command" "border" >}}

The OS can be configured to start in any of these modes:

- ***`0`*** : *Stop* status (shuts down the system completely).
  - Shut down the OS, is to boot the OS in a mode. Manage the completion of programs.
  - If this mode is set by default, the computer starts up and shuts down. A bad joke.
- ***`1`*** : Single user mode. It is used to do very rough administration tasks.
  - In a compromised system the first thing to do is to expel all users. The +1 mode manages the OS in such a way that it cuts off-network access and only allows physical access to one user. This is why it is used on compromised systems.
  - Adding new hardware to the system configuration or suspicion of hardware failure.
  - Administrative tasks such as update some applications, perform system backups or manage quotas.
- ***`2`*** : Multi-user mode.
- ***`3`*** : Multi-user mode with command-line access.
- ***`4`*** : Same as 3. Not used. It was intended for future uses.
- ***`5`*** : Same as 3 but also allows graphic session IF YOU HAVE IT, else is the same as 3.
- ***`6`*** : Restart the system.
  - If it is set to be the default runlevel, the system boots and restarts continuously. Another bad joke.

`telinit` command allows you instantly switch between levels.

`inittab` file had the configuration for which level was to run at boot, but has now been replaced by systemd's feature `set-default`.

## Startup systems

### SysVinit

1. The BIOS is in charge of verifying that the integrity of the peripherals and hardware is in a safe state.
2. Then load the Bootloader (it is in a partition of the hard disk and stores the information of the partitions to boot)
3. After, the kernel is started in RAM, and it calls `init`.
4. `init` is the first process and loads the most basic things (`rcS.d`). Things like the clock, udev, mounting the filesystem, checking for errors, starting daemons, enabling peripherals...
5. It also checks the runlevel (`rcX.d` with X from 0 to 6), and depending on this, it starts some things or others.
6. The console (`getty`) is started.

The files in `/etc /rcS.d /` are always executed. And depending on the runlevel we are in, the rc1, rc5... programs are loaded.

That is, if I am in runlevel 5, the programs in the rc5 directory will be executed.

#### Example

I want to start Spotify at startup (startup), put the Spotify startup script in `init.d`, and then depending on the runlevel at which we want it to run, we would make a symbolic link in the `rcX` to the `script init.d`.

These scripts start with an *S* (Start) or a *K* (Kill) and a number after that indicates the priority (from 01 to 99).

If you want Spotify to start in runlevel 2, you should put S in rc2, but if you change to runlevel 3 or 4, you should put K.

If we have two numbers with the same priority number, it is executed first in alphabetical order.

There is a Debian 6 command that does all of this:

```bash
update-rc.d /path/script start 90 2 3 4 5. stop 0 1 6
```

Where 90 is the priority, but this has to be calculated.

With Debian 7 it is done with `insserv`.<br>All of the above of the “update” that was passed by parameter, is now added as a header within the script.  In the header you don’t have to assign a priority because it is managed by something called facilities:

- $local_fs
- $network
- $named
- $portmap
- $remote_fs
- $syslog
- $time
- $all: Have all the dependencies.

### Systemd

Red Hat creates `systemd`. Many systems adopt it in exchange for `init`, and others reject it.

An advantage of `systemd` compared to `init.d` (the traditional way) is that it loads the processes that would be those of `rcS.d` and `rcX.d` in parallel.

Systemd instead of calling scripts, it calls them units, and they can be: services, mount points (instead of `/etc/fstab`), devices, sockets and targets (runlevel).

Instead of calling the runlevels by their numbers, they use:

|||
|:-:|:-:|
| `runlelel0.target` | `poweroff.target` |
| `runlevel1.target` | `rescue.target` |
| `runlevel2.target` | `multi-user.target` |
| `runlevel3.target` | `multi-user.target` |
| `runlevel4.target` | `multi-user.target`<br><br>`graphical.target` |
| `runlevel5.target` | `reboot.target` |

## Systemd service

If you want to make a systemd startup script, create a `myscriptd.service` file in `/lib/systemd/system/`.

Once the service is located in that directory, we can enable the service with:

```bash
systemctl enable myscript
```

### Example - Getting the weather

This script will always get the weather of the specified location and send it to a file, in the specified directory. The file will have as a filename the date of that day.

Service */lib/systemd/system/weatherd.service*:

```service
[Unit]
Description=Get the weather
After=network.target network-online.target
Requires=network-online.target

[Service]
RemainAfterExit=false
ExecStart=/usr/bin/weather "Spain" /root
[Install]
WantedBy=multi-user.target
```

Script */usr/bin/weather*:

```bash
date=$(date +%Y%m%dT%H%M%S)
curl wttr.in/$1 > $2/$date
```

Once those files are in their directories and the script has execution permissions, we can enable the service:

```bash
systemctl enable weatherd
```

> The `RemainAfterExit` set to false, is due to the script only executing once. If it was set to true, the service would still be activated even when the script has finished a while ago.

## Common commands

- To see active units: 
  ```bash
  systemctl
  ```
- To see installed units:
  ```bash
  systemctl list-unit-files
  ```
- To see units that have failed:
  ```bash
  systemctl --failed
  ```
- To view SSH dependencies:
  ```bash
  systemctl list-dependencies ssh.service
  ```
- To see what parameters a unit has:
  ```bash
  systemctl show cron.service
  ```
- To view boot messages:
  ```bash
  journalctl -b
  ```
- To view new messages:
  ```bash
  journalctl -f
  ```
- To view new messages for a drive:
  ```bash
  journalctl -u
  ```

|                                  |       SysVinit       |             Systemd             |
|:--------------------------------:|:--------------------:|:-------------------------------:|
| **Start a service**                  | `service cron start` | `systemctl start cron.service`  |
| **Enable a service**                 | `chkconfig cron on`  | `systemctl enable cron.service` |
| **Check if a service is enabled** | `chkconfig cron`     | `systemctl status cron.service` |
| **Check runlevel** | `runlevel` | `systemctl get-default` |
| **Change runlevel** | `telinit 1` | `systemctl isolate runlevel1.target` |
| **Change default runlevel** | (before was done with inittab file) | `systemctl set-default graphical.target` |

There is a parameter in systemd to specify when a script is to run (timer). The difference between a `timer` and a `cron`, is that the timer can be resource-specific at boot, which cron doesn't.

<!-- ## Creating a Systemd service

I've a post explaining on [how to create a Telegram bot](../telegrambot) with a service and a timer.
-->
