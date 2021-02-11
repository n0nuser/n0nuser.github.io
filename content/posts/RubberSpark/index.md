---
title: "RubberSpark"
description: "BadUSB with a cheap Arduino DigiSpark! (4€)"
date: 2019-11-21
lastmod: 2020-09-12
author: "Pablo Jesús González Rubio"
cover: "digispark.jpg"
coverAlt: "Digispark board"
toc: true
tags: [ "Projects" ]
---

## Introduction

Watching Mr. Robot I got impressed by Rubber Ducky and how you could inject code to a PC by emulating a keyboard, so I decided to get one.

{{< img "rubberducky_mr-robot.png" "RubberDuckys used in Mr. Robot series" "border" >}}

Unfortunately, it costs 60€ in Spain, so I searched over the internet how I could replicate the same idea and firstly I found that pen drives with Physon driver could do that, but to buy one with it is a bit of a lottery. So next was DigiSpark, which is a tiny Arduino board with a USB output, and 3 of them in Amazon costs around 12€, so it’s very cheap.

{{< img "digispark.jpg" "A digispark" "border" >}}

DigiSpark can also inject code but it’s a little bit trickier as in Rubber Ducky you have to put the file.duck into it. Here we have to write the .duck and transform it to a .ino Arduino readable.

## Get Started

First of all, I’m assuming you are on Linux as the script to change it is in bash. It could also be done in Windows with Python, but you then have to install Python and add it to your Environmental Path. So to keep it simple I’ll just stick with Linux, however, if reading this you feel like you need this guide for Windows, tell me and I’ll make a part for it!

### Installing Arduino and DigiSpark Drivers

To install Arduino, first download it from [Arduino IDE Download](https://www.arduino.cc/en/Main/Software), scroll down and select `linux 64 bits`. When download it go to the directory and extract, if via CLI: 

```
tar -xf arduino*.tar.xz
```

Then move that folder to `/opt/` and enter it. Run `./install.sh` and done!

```
sudo mv arduino*/ /opt/
cd arduino*
sudo ./install.sh
```

In general, when installed it should have created a symbolic link in `/usr/local/bin/arduino`, so it should work just by executing `sudo arduino`.

Then run arduino and in `File` go to `Preferences`, in `Additional Board Manager URLs` write this ↓ and press OK.

```
http://digistump.com/package_digistump_index.json
```

After that, go to `Tools`, then `Board`, and `Boards Manager`. In the search bar, put `Digistump` and click install on `Digistump AVR Boards`. Then select in `Board` the option `Digispark (Default - 16.5mhz)` and that's it for this part!

### Coding .duck

Rubber Ducky language is ___very simple___ there are few commands, the rest is up to your imagination and skills!

Commands:

- `REM Hello` its for commentaries
- `STRING Hola` writes and entire string
- `DELAY 20` enters a sleep/wait

Keys:

- `ENTER`
- `GUI`, `SHIFT`, `ALT` GUI is the Windows or the Mac key
- `LEFT`, `UP`, `DOWN`, `RIGHT` basic movement keys
- `CTRL-SHIFT ENTER` for key combos


### Converting .duck to .ino

For this [Marcus Mengs](https://github.com/mame82) created two python scripts that transform `.duck` to `.bin` ([DuckEncoder](https://github.com/mame82/duckencoder.py)) and `.bin` to `.ino` ([Duck2Spark](https://github.com/mame82/duck2spark)).

I've automatized this so you just:

```bash
git clone https://github.com/n0nuser/RubberSpark.git
```

When downloaded, there's a folder called Scripts, inside you can create folders with your ducky scripts and to compile them and open them in arduino, run:

```bash
# From RubberSpark folder
chmod +x compile # Just Once
./compile Scripts/Your_Script_Folder/NAME_of_your_script
```

Don't stick the DigiSpark to the PC for now!

### Uploading the code

And it will open the script compiled in .ino with Arduino, so to upload the script to DigiSpark, click this button:

{{< img "arduino_upload.png" "How to upload the code" "border" >}}

And then plug the DigiSpark 🐦️

And that's it for this project tutorial!

### End

I'm planning on doing a Python framework that generates different payloads, it takes a python script with the actual payload programmed and is run to 
