---
title: "Wireguard Setup"
description: "How to setup Wireguard server and client the easy way."
date: 2022-07-27
lastmod: 2022-07-27
author: "Pablo Jesús González Rubio"
cover: "cover.png"
coverAlt: "WireGuard"
toc: true
draft: false
tags: [ "SysAdmin", "Linux" ]
---

## Wireguard Server Setup

The easiest way to setup a Wireguard server is to use the [Wireguard Easy](https://github.com/WeeJeWel/wg-easy/) docker image from [Emile Nijssen](https://github.com/WeeJeWel).

{{< img "repository.jpg" "WG-Easy" "border" >}}

Following the instructions, you must have Docker installed:

```bash
curl -sSL https://get.docker.com | sh
sudo usermod -aG docker $(whoami)
exit
```

This tutorial will considerate the following diagram:

{{< img "network.jpg" "Network" "border" >}}

Our WAN IP is **123.123.123.123**, our Router LAN IP is **192.168.1.1**, our server IP is **192.168.1.50**. Our public UDP port where we will connect to the VPN is **10000** as a secure measurement: the Docker container will still be listening on UDP port **51820**, while the server will be listening on UDP port **10000**. This will allow to obscure the port used by the server so attackers will have a harder time.

Then, install and run wg-easy:

```bash
docker run -d \
  --name=wg-easy \
  -e WG_HOST=123.123.123.123 \
  -e PASSWORD=mySuperSecurePa$$word \
  -e WG_PORT=PUBLIC PORT \
  -v ~/.wg-easy:/etc/wireguard \
  -p 51820:51820/udp \
  -p 51821:51821/tcp \
  --cap-add=NET_ADMIN \
  --cap-add=SYS_MODULE \
  --sysctl="net.ipv4.conf.all.src_valid_mark=1" \
  --sysctl="net.ipv4.ip_forward=1" \
  --restart unless-stopped \
  weejewel/wg-easy
```

🚨 **Be sure to change the values from the environmental variables. `WG_HOST` to suit your WAN IP, `PASSWORD` to be your admin password and `WG_PORT` to be the default 51820 or another one to be more obscure to potential attackers.**

Once the server is running, you can access the admin panel at [http://localhost:51821/](http://localhost:51821/).

{{< img "wireguard.png" "Wireguard" "border" >}}

In order to access from [http://123.123.123.123:51821](http://123.123.123.123:51821), you must do port forwarding in your router or firewall:

* HOST: 192.168.1.50. INTERNAL PORT: 10000. EXTERNAL PORT: 10000. PROTOCOL: UDP
* HOST: 192.168.1.50. INTERNAL PORT: 51821. EXTERNAL PORT: 51821. PROTOCOL: TCP

## Wireguard Client Setup

First, login to the admin panel.

{{< img "login.png" "Login" "border" >}}

Then, create a client on the web app and give it a name.

### PC

Go to the Wireguard web and [download the installer](https://www.wireguard.com/install/) for your operative system.

#### Windows

Once you have installed the Windows Wireguard client, you should download the config file from the server.

{{< img "windows.png" "Windows" "border" >}}

Click on "Import Tunnel(s) from file" and select the config file.

Voilá, you have a Windows Wireguard client.

#### Linux

In order to connect to the Wireguard server, first you need to install the Wireguard client.

```bash
sudo apt-get install wireguard wireguard-tools
```

Then, download the configuration from the server and save it in the Wireguard configuration folder:

```bash
sudo cp ~/Downloads/peer.conf /etc/wireguard/wg0.conf
```

Then, enable Wireguard to start at boot:

```bash
sudo systemctl enable wg-quick@wg0.service
sudo systemclt start wg-quick@wg0.service
```

Or just start it manually:

```bash
sudo wg-quick up wg0
```

### Phone

Install the Wireguard app from the [Play Store](https://play.google.com/store/apps/details?id=com.wireguard.android) or the [App Store](https://apps.apple.com/us/app/wireguard/id1441195209).

Scan the QR by clicking the "+" icon on the top right, and then select "Create from QR" or if you downloaded the config file, select "Create from file".

{{< img "app.png" "App" "border" >}}

After scanning the QR it should automatically add the Wireguard server to the list.
