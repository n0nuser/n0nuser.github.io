---
title: "Low Frequency (125 KHz)"
description: "RFID is seen today in many scenarios: the bus card, the sub ticket, gym access, access cards, payments via NFC… In this post we’ll talk only about one of the most common ones: 125 KHz"
date: 2020-06-28
lastmod: 2020-08-06T00:50:52+02:00
author: "Pablo Jesús González Rubio"
cover: "tag.jpg"
coverAlt: "One of the most common door access tags"
toc: true
tags: [ "RFID" ]
---

## Introduction

RFID is seen today in many scenarios: the bus card, the sub ticket, gym access, access cards, payments via NFC…

This technology is based on Radio Frequency as its name indicates (Radio Frequency Identification).

The most common frequencies are **125**-134.2 kHz for Low Frequency (LF) and **13.56** MHz for High Frequency (HF). There are [more frequencies](https://en.wikipedia.org/wiki/Radio-frequency_identification##Frequencies) but they are much less common.

In this post we’ll talk only about the most common to make it simpler.

{{< img "bus.jpg" "Bus" "border" >}}

## How it works

It’s based on [induction](https://en.wikipedia.org/wiki/Electromagnetic_coil), the chip is powered via a surrounding coil that generates voltage due to some external varying magnetic field passing through the interior of the coil.

So basically a reader powers on the chip as it approaches, giving the voltage needed.

{{< img "coil.jpg" "Coil" "border" >}}

### Data Transmission

It’s important to note how much space is stored on the chips based on the frequency as with LF you can’t pass too much information as you can with HF.

The information that LF can carry is very little compared to the higher frequencies (due to the Capacity of a given system, `C = 2W` where `W` is the bandwidth such that `W = 2*PI / T` with `T` being Tau, the first cut with Zero of the specter).

If the amplitude is higher, the first cut with Zero of Tau will be further from point 0. And being further implies that the bandwidth is smaller. It can transmit fewer data per second if this was the case. If the amplitude was smaller, the bandwidth would be higher and more data could be carried.

### Storage

There are different types of storage:

- Only Read: UID is unique and provided by vendor.
- Read/Write: Information can be modified by a reader.
- Anticollision: Special tags that allow to read multiple tags at a time.

## Low Frequency

LF ranges between 30 kHz and 300 kHz.

One of its unique **properties** is that it can penetrate metal and water due to its long wavelength, the opposite as with HF or UHF (Ultra High Frequency).

Due to its low storage capabilities it’s **primarily used** to store an Identification, a number. Examples of them are the tags in [animal tracking](https://youtu.be/-j-KAxujbPM?t=61) or neighborhood communities doors that require no identification of the person, just an ID.

They can be read from a maximum of **30 centimeters distance**.

The **communication** between the reader and the tag is done:

- [Wiegand](https://en.wikipedia.org/wiki/Wiegand_effect) protocol (1972): Are only read tags. The keycards are programmed based on the presence or absence of the coil wires, if there’s a wire it sends a 1, else a 0.
  - Fun Fact 😸 : lots of access doors have a base in a 48 years old security protocol.
- Serial: The reader just extracts the information within the EEPROM of the chip (Listed below), so depending on the chip it can be rewritable or only read.

The most common door tag is:

{{< img "tag.jpg" "Tag" "border" >}}

Although there are others as this IButton tag (which I think it might use Wiegand as I can't read it with a Proxmark):

{{< img "ibutton.jpg" "IButton" "border" >}}


### LF Chips

- [TK4100](http://www.egrfid.com/products/cards/contactless-card/tk4100-proximity-contactless-card): Read Only
- T5577: Read/Write
- [EM4100](https://www.digchip.com/datasheets/parts/datasheet/147/EM4100.php):Read Only
- [EM4033](https://www.emmicroelectronic.com/product/nfc-high-frequency-ics/em4033): Read Only
- [EM4133](https://www.emmicroelectronic.com/product/nfc-high-frequency-ics/em4133): Read/Write
- [EM4200](https://www.emmicroelectronic.com/product/lf-animal-access-ics/em4200): Read Only
- [EM4205/4305](https://www.emmicroelectronic.com/product/lf-animal-access-ics/em42054305): Read/Write
- [EM4233](https://www.emmicroelectronic.com/product/nfc-high-frequency-ics/em4233): Read/Write
- EM4237: Read/Write
- [EM4450](https://www.emmicroelectronic.com/product/lf-animal-access-ics/em4450): Read/Write
- [EM4582](https://www.emmicroelectronic.com/product/lf-animal-access-ics/em4582): Read/Write

## End

I hope you enjoyed the post and learned something!

If there was any type of error, incompletion or something is not clear, just message me and I’ll fix it 😇

The same goes if you have any doubt or feel like something is missing in the post, so it can help others ✌️