---
title: "Distributed Systems - Introduction"
description: ""
date: 2022-05-31T10:00:00+02:00
author: "Pablo Jesús González Rubio"
cover: "cover.jpg"
coverAlt: "Distributed Systems"
toc: true
tags: [ "Distributed Systems" ]
---

## What is it

It is a system in which the hardware or software components are distributed across multiple computers or devices. And communication between them is performed through a network via a common communication protocol.

## Characteristics

**Concurrency**: Several components access a shared resource at the same time.

**No global clock**: Necessity of coordination/synchronization between processes and devices.

**Independent failures**:

- Due to network isolation (network)
- By shutdown of a computer (hardware)
- Abnormal termination of a program (software)

## Challenges

### Heterogeneity

In a Distributed System there is heterogeneity at many levels:

- **Networks**: different network protocols
- **hardware**: different data representation
- **OS**: different system calls
- **Programming languages**: representation of data structures, method access, etc.
- **Implementations**: adoption of standards

Solution: ***Middleware***. software layer masking underlying heterogeneity.

### Extensibility

The extent to which new services can be added and published for use by a variety of customers.

### Security

Communication between devices can be manipulated by third parties.

Three main challenges:

- **Confidentiality**: any third parties can read the data.
- **Integrity**: any third party can manipulate the data.
- **Availability**: Multiple devices accessing the same resource.

### Scalability

A system is scalable if it retains its effectiveness in the face of a significant increase in the:

- Number of resources
- Number of users

Due to the increasing number of devices, the IP range is not enough to address all the devices. A solution could be to ***move from IPv4 to IPv6***.

Having many devices accessing the same resource in one machine could be a challenge if the device hasn’t enough power, as it could create a bottleneck (performance issue). A solution to this would be to ***replicate*** the resource in multiple machines.

But replicating in different machines means we need more devices to handle that resources, and in some cases, the costs aren’t acceptable. So a solution to this is ***decentralization***.

{{< img "hostSurvey.png" "Hosts Survey" "border" >}}

---

Check [the Opte page](https://www.opte.org/the-internet) to see how much the number of hosts using internet has grown.

A video of theirs:

{{< youtube OzDgI0sJQBA >}}

### Failure treatment

In a distributed system, failures are always partial.

To solve fault detection...

- Checksum for transmission failures
- Detection of server downtime

To mask failures...

- Retransmission of failed messages
- Proxy servers

To tolerate failures, redundancy is increased:

- Alternate routes between routers
- Duplicate naming systems
- File replication

### Concurrence

Each object representing a shared resource in a distributed system must be responsible for ensuring that it operates correctly in a concurrent environment.

- Some objects must be re-implemented to work correctly in distributed environments.
- Multithreaded servers.
- Synchronization through semaphores, critical sections or other mechanisms.

### Transparency

Hiding the components of a distributed system from the user and the application programmer, so the system is perceived as a whole, rather than as a collection of independent components.

#### Types

- **Access**: Local and remote resources are accessed by the same mechanism.
- **Location-based**: Resources are accessed without the need to know their location.
- **Concurrency**: Several processes operate concurrently without mutual interference.
- **Replication**: Use of multiple copies of each resource to increase reliability and performance without users needing to know about them.
- **Bug hiding**: Fault concealment by allowing the user or application program to complete its tasks despite hardware or software failures.
- **Mobility**: Relocation of resources and clients in a system without affecting the operation of users and programs operation of users and programs.
- **Features**: Reconfiguration of the system to improve performance as usage load varies varying usage load.
- **Scaling**: Expansion in size of the system or applications without changing the underlying structure or application algorithms underlying structure or application algorithms.

## Context

Depending on the context, some will have more relevance than others.

Business transactions by necessity need security, failure treatment, and concurrency.

On the other hand, Google, P2P, and DNS rely on scalability, high disponibility, and failure treatment.
