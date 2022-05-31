---
title: "Distributed Systems - Models"
description: ""
date: 2022-05-31T13:30:00+02:00
author: "Pablo Jesús González Rubio"
cover: "cover.png"
coverAlt: "Distributed Systems"
toc: true
tags: [ "Distributed Systems" ]
---

## Components

### Platform

{{< img "cover.png" "Platform" "border" >}}

### Middleware

Software layer whose purpose is to mask the underlying diversity and provide a convenient programming model

Supports abstractions such as:

- Remote Invocation Procedures (RPC).
- Communication between groups of processes
- Event notification
- Shared data replication
- Real-time data transmission

Some examples:

- Sun RPC: Sun Remote Procedure Call
- CORBA: Common Object Request Broker Architecture
- Java RMI: Java Remote Method Invocation
- SOAP: Simple Object Access Protocol
- REST: Representational State Transfer

## Physical Models

|   **Generation**  |          **1º (Beginning)**         |                   **2º (Internet)**                  |                **3º (Contemporary)**                |
|:-----------------:|:-----------------------------------:|:----------------------------------------------------:|:---------------------------------------------------:|
|     **Period**    |              1970-1985              |                       1985-2005                      |                       2005-Now                      |
|  **Scalability**  |                 Low                 |                         High                         |                      Very High                      |
| **Heterogeneity** | Limited (homogeneous configuration) | Significative (platforms, new languages, middleware) |       New Dimensions (architectures, devices)       |
| **Extensibility** |            Not a priority           |               Significative (standards)              | Challenge (standards doesn't cover complex systems) |
|    **Quality**    |              Beginning              |             Significative (some services)            |  Challenge (services doesn't cover complex systems) |

## Architectural models

### Client - server

{{< img "client-server.png" "Client-Server" "border" >}}

#### Multiple servers

Replication can be used to increase performance and availability. Many web services redirect to multiple replicated servers to balance the load.

#### Proxy

{{< img "proxy.png" "Proxy" "border" >}}

Increase availability and performance. They use caches with the data most recently requested by customers.

Can also be used for security reasons: hiding the real server from the client, which can perform attacks.

#### Mobile code (applets)

An applet is a very small application, especially a utility program performing one or a few simple functions.

The code of a program on the server is transferred to the client and executed locally.

#### Mobile agent

An executing program (code and data) is moved/copied from one computer to another in the network
a computer to another computer in the network performing a certain task:

- Software installation and maintenance
- Product price comparison
- Intensive calculation using several computers
- Viruses, spam, phishing, etc.

#### Networked computers

Most of the programs executed by the client are downloaded from the network, including the operating system.
downloaded from the network, including the operating system. Applications are launched locally but files are stored on a file server.

#### Lightweight clients

Like a networked computer, applications are launched in remote mode (e.g. UNIX X11 window system).

Very useful for heavy computations, by using powerful computational servers (or groups of servers
servers (or groups of servers -clusters-) for computation.

Disadvantage: highly interactive and computationally intensive activities: graphical interfaces.

#### Cloud Computing

Evolution of the lightweight client. The client does not lose its autonomy (operating system
The client does not lose its autonomy (operating system, local applications) but can access remote services and files.

Examples:

- Amazon Web, Digital Ocean, Netlify, Heroku...
- Google Drive, DropBox, Mega, OneDrive, iCloud...
- Google Docs, Github Codespaces...

### Peer to peer

{{< img "p2p.png" "Peer to Peer" "border" >}}

Reduces communication delays.

Elimination of intermediaries.

- Additional customer requirements

Examples:

- Voice: Skype, VoIP
- Data: Napster, BitTorrent
- Communications: ad hoc networks

## Fundamental models

### Interaction models

There are limitations due to communication. It is impossible to predict the delay with which a message arrives.

- Latency: Delay between sending a message and receiving it.
- Bandwidth: Information that can be transmitted in a time interval.
- Jitter: Variation in the time taken to deliver a series of messages.

Each computer has its internal clock (local clock).

Can be used in local processes for time stamps
Clock drift rate (clock drift rate)
Evolution of the difference between a local clock and a "perfect" reference clock.

Two types of interaction models:

- Synchronous: The execution time of each stage of a process has certainly known lower and upper bounds.
- Asynchronous: There are no limitations in terms of
  - Processing speed
  - Message transmission delays
  - Clock drift rates

> Real distributed systems are usually asynchronous (e.g. Internet).

### Failure models

In processes, failures can be caused by:

- Crashes
- Normal termination
- Omission of important steps
- Performance of unnecessary or undesirable steps
- Arbitrary omission of responses to messages

In communication channels, failures can be caused by:

- Omission of delivery
- Omission in the communication channel
- Omission at receival
- Message corruption
- Delivery of nonexistent messages
- Duplicated messages

To preserve users' calm, services should be designed to handle failures. Being that hiding them or converting them to more manageable failures.

These failures can be masked by:

- Using a checksum to verify if the message is corrupted
- Retransmission of messages in case of failure
- Stop sending messages in case of failure

Two criteria should be used to establish a reliable communication:

- Validity of the message: no omission failures on the network channel
- Integrity of the message: the received message is identical to the sent one, and there are no duplicated messages.
