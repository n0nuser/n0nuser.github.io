---
title: "High Frequency (13.56 MHz)"
description: "RFID is seen today in many scenarios: the bus card, the sub ticket, gym access, access cards, payments via NFC… In this post we’ll talk only about one of the most common ones: 13.56 MHz"
date: 2020-06-28
lastmod: 2020-08-06T01:33:10+02:00
author: "Pablo Jesús González Rubio"
cover: "card.png"
coverAlt: "Transparent 13.56 MHz chip card"
toc: true
tags: [ "RFID" ]
---

## Introduction

### Frequency

HF ranges between 3 MHz and 30 MHz.

NFC works exactly at **13.56 MHz** and that’s why we are able to pay with our phones instead of a normal card, also a phone’s ability to read card data (not totally in some cases because of its cipher).

### Attacks

As one might think, yes, the HF can be listened with an **SDR** and use in a [Replay Attack](https://salmg.net/2019/06/16/nfcopy85/) or in a [Relay Attack](https://salmg.net/2018/12/01/intro-to-nfc-payment-relay-attacks/) with a device like the [HackRF](https://greatscottgadgets.com/hackrf/one/) as the [CC1101](https://www.ti.com/product/CC1101) can’t operate in NFC’s frequency.

### Range

The range from the card to the reader is around **10 centimeters**.

### Common Uses

The most **common uses** are payments like the bus card, access control applications where there’s the need of knowing who entered/left or access to some privileged area which depends on a job position… generally where some info needs to be stored.

### Images

The most common card tag is:

{{< img "card.jpg" "Card" "border" >}}

But it can also shape a sticker or a tag:

{{< img "sticker.png" "Sticker" "border" >}}


## ISO 14443

The ISO 14443 is the international standard approved by ISO and IEC for 13.56 MHz identification proximity cards, like the access pass I said before.

This standard is split into 4 parts:

- **Part 1: Physical Characteristics**: It defines the physical dimensions, the dynamic flexibility, the alternate electric and magnetic field, static electricity and static magnetic field, and the temperature.
- **Part 2: Radiofrequency power and signal interface**: It defines the electric dimensions, the first dialogue for the card, the working frequency (13.56 MHz), the range of the magnetic resistance and the communication for type A and B.
  - **Type A**: Communicates with reader modulating the signal in `Manchester` code, but if the reader communicated with the tag, the tag would receive the signal coded in `ASK` (*Amplitude Shift Keying*) at 100%. It has a 30% of noise tolerance in the signal, which is pretty high.
  - **Type B**: Communicates with reader modulating the signal in `NRZ` code, but if the reader communicates with the tag, the tag would receive the signal coded in `NRZ` at 10%. It has a 3% of noise tolerance in the signal, which is pretty low.
  {{< img "differenceAB.png" "Difference" "border" >}}
- **Part 3: Initialization and anti-collision**: It explains the communication between reader and card and defines an anti-collision method; for type A it’s called *Wise Arbitration* and type B it’s called *Time-Slot Method*.
- **Part 4: Transmission Protocol**: It specifies the protocol for half-duplex block transmission protocol as it defines the necessities for transmission without contact and the activation/deactivation sequences of the protocol.
    - *Calypso* cards comply with this standard in parts 1,2,3,4 of type B.
    - *[Mifare](https://www.mifare.net/en/products/chip-card-ics/)* cards comply with this standard in parts 1,2,3 of type A.

## HF Chips

There are some brands like iCLASS, Legic, Felica, MIFARE… but MIFARE is the most common.

### MIFARE

> In MIFARE Plus you can choose between: UID (Unique Identity Number) and NUID (Non Unique Identity Number).<br>
Parenthesis are for versions of each specification, for simplicity.

- MIFARE Ultralight:
    - Security (EV1): 32 bit password.
    - Security (C): 3DES (112 bit key length)
    - Uses: Ticketing
    - UID: 7 bytes.
    - Storage (EV1): 48/128 bytes divided in pages of 4 bytes.
    - Storage (C): 144 bytes divided in pages of 4 bytes.
- MIFARE Classic 1K/4K
    - Security: Memory in 2 segments.
    - Uses: Transport, Parking Lot, Toll Highway…
    - UID: 32 bits.
    - Storage (1K): 1024 bytes. 752 bytes for data divided in 16 sectors.
    - Storage (4K): 4096 bytes. 3,440 bytes for data divided in 32 sectors.
- MIFARE Plus
    - Security: AES (128 bit key lenght) and Crypto1 (48 bit key lenght)
    - Uses: Public transport, Campus cards, Access management.
    - UID: 7 bytes
    - NUID: 4 bytes
    - Storage: 1 Kb (SE), 2 Kb (S, X, EV1), 4 Kb (S, X, EV1) bytes.
- MIFARE DESFire (EV1/EV2)
    - Security: DES/2K3DES/3K3DES/AES (128 bit key length)
    - Uses: Advanced public transport, Access management, Micropayment
    - UID: 7 bytes
    - Storage: 2 Kb, 4 Kb and 8 Kb.

## Special Mentions

Credit Cards uses [EMV](https://en.wikipedia.org/wiki/EMV) technology. Info about it's [safety](https://www.thalesgroup.com/en/markets/digital-identity-and-security/banking-payment/cards/contactless/how-it-works).


## END

I hope you enjoyed the post and learned something!

If there was any type of error, incompletion or something is not clear, just message me and I’ll fix it 😇

Same goes if you have any doubt or feel like something is missing in the post, so it can help others ✌️:neckbeard:✌️