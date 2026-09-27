---
slug: "bash-aliases"
title: "My Bash Aliases"
description: "The Bash aliases and small functions I keep in ~/.bash_aliases: systemd shortcuts, WireGuard, networking, file helpers and a few fun ones, each explained."
date: 2020-10-12
lastmod: 2026-09-27
author: "Pablo Jesús González Rubio"
toc: true
tags: [ "Bash" ]
---

These are the Bash aliases and small functions I keep in `~/.bash_aliases` to cut down on repetitive typing. Skim the sections, copy whatever fits your workflow, and load them with:

```bash
source ~/.bash_aliases
```

On Debian and Ubuntu, the default `~/.bashrc` already sources `~/.bash_aliases` if it exists, so new shells pick them up automatically. On other distros, add `[ -f ~/.bash_aliases ] && . ~/.bash_aliases` to your `~/.bashrc`.

> **Aliases vs functions:** an alias is plain text substitution, so it can't use arguments like `$1`. Anything below that takes an argument is written as a function instead. That's also why a few entries changed from my [original gist](https://gist.github.com/n0nuser/34fc14a084436ae89c2b3405ad453f0a): as aliases, they silently ignored their arguments.

## Reloading

```bash
alias aliases='source ~/.bash_aliases'
```

Edit the file, type `aliases`, and the changes apply to the current shell.

## System and desktop

```bash
# Boot to the console (no GUI) from now on, and reboot
alias rebootNoGui='sudo systemctl set-default multi-user.target && sudo reboot'

# Boot to the desktop from now on, and reboot
alias rebootGui='sudo systemctl set-default graphical.target && sudo reboot'

# Start the GNOME desktop once, without changing the default
alias startGui='sudo systemctl start gdm3'

# Switch your login shell: changesh zsh
changesh() { chsh -s "$(command -v "$1")"; }
```

The two reboot aliases change the default **systemd target**, the modern replacement for runlevels (more in [the Linux boot process post](/posts/linux-boot-process/)). `startGui` uses `gdm3`, the service name on Debian and Ubuntu; on Fedora and Arch it's `gdm`.

## WireGuard

```bash
alias wireguard-on='sudo wg-quick up wg0 && sudo systemctl enable wg-quick@wg0'
alias wireguard-off='sudo wg-quick down wg0 && sudo systemctl disable wg-quick@wg0'
```

These bring the `wg0` tunnel up or down *and* set whether it starts at boot, so the state survives a reboot. If you don't have a WireGuard server yet, [here's how I set mine up](/posts/wireguard/).

## Networking

```bash
# Your interfaces and addresses, one line each, in colour
alias ipconfig='ip -c -br addr'

# Your public IP
alias publicip='curl -s ifconfig.me; echo'

# Edit the hosts file
alias hosts='sudo nano /etc/hosts'

# Open TCP connections, with the process that owns each one
alias connections='sudo ss -tp state established'

# Who's on my local network
alias arpscan='sudo arp-scan -l'
```

`ipconfig` is a nod to Windows muscle memory; underneath it's the modern `ip` command, not the deprecated `ifconfig`. If `ifconfig.me` is ever down, `icanhazip.com`, `ipinfo.io/ip` and `api.ipify.org` return the same thing.

For quick HTTP testing, this loop creates one alias per HTTP method using `lwp-request` (from the `libwww-perl` package):

```bash
for method in GET HEAD POST PUT DELETE OPTIONS; do
  alias "$method"="lwp-request -m $method"
done
```

Now `GET https://example.com` or `HEAD https://example.com` works straight from the shell.

## Files and utilities

```bash
# Serve the current directory on http://localhost:8000
alias www='python3 -m http.server'

# Resume interrupted downloads instead of starting over
alias wget='wget -c'

# Extract any tar archive (.tar, .tar.gz, .tar.xz...)
alias untar='tar -xvf'

# Pipe anything to the clipboard: cat key.pub | copy
alias copy='xclip -selection clipboard'

# Open a file or URL with the default app
alias open='xdg-open'

# Coloured diff (needs the colordiff package)
alias diff='colordiff'

# Print a file in lower or upper case: filelower notes.txt
filelower() { tr '[:upper:]' '[:lower:]' < "$1"; }
fileupper() { tr '[:lower:]' '[:upper:]' < "$1"; }
```

`copy` and `open` make the terminal feel less isolated from the desktop: `copy` works on X11; on Wayland, use `wl-copy` from `wl-clipboard` instead.

### Wiping a disk

```bash
# Overwrite a whole device with zeros: wipe /dev/sdX
wipe() { sudo dd if=/dev/zero of="$1" bs=4M status=progress; }
```

> **Danger:** this destroys everything on the target, instantly and without confirmation. Double-check the device name with `lsblk` first; `/dev/sda` is very often the disk you're booted from.

## Just for fun

```bash
# Weather in your terminal: weather Madrid, or weather Madrid es for Spanish
weather() { curl -H "Accept-Language: ${2:-en}" "wttr.in/${1}?0pn"; }

# Crypto prices: crypto, or crypto btc for one coin
crypto() { curl "rate.sx/$1"; }

# Make your computer talk: say "hello there" (needs espeak)
say() { echo "$*" | espeak -s 120 2>/dev/null; }

# Set a GNOME wallpaper from a file in the current directory
changeBackground() { gsettings set org.gnome.desktop.background picture-uri "file://$(realpath "$1")"; }
```

On recent GNOME with the dark style enabled, `changeBackground` also needs the `picture-uri-dark` key set to the same value, or you won't see the change.

## Wrapping up

Aliases are the cheapest productivity win on Linux: every command you type more than a few times a day is a candidate. When one grows past a single command or needs arguments, promote it to a function, and when a function grows past a few lines, promote it to a script in `~/.local/bin`. For writing those scripts, the [Bash scripting cheatsheet](/posts/bash-scripting-cheatsheet/) has the syntax.
