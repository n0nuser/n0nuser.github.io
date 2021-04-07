---
title: "Linux - Filesystem"
description: ""
date: 2021-04-07
lastmod: 2021-04-07
author: "Pablo Jesús González Rubio"
cover: "cover.png"
coverAlt: "Tux!"
toc: true
tags: [ "SysAdmin", "Linux" ]
---

## Introduction

The filesystem is the group formed by the file structure, directories and inodes tables (which references each file in the filesystem).

Each inode stores this information of a file:

* Propietary user and group
* File type
* Access permissions
* File C/A/M date
* Inode modification date
* Number of links to the file
* Size of file
* Location in blocks  

In Linux, everything is (treated as) a file:

* Commands: `/bin/ls`
* I/O Devices: `/dev/sda`, `/dev/tty0`
* Communication between processes: sockets, pipelines
* Folders, files, config files...
* Linux kernel

{{< img "filesystem.png" "Filesystem" >}}

## Filesystem structure

Linux follows the [FHS (Filesystem Hierarchy Standard)](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/index.html), which defines the main directories and its contents.

It is .

* `/`: Root directory, beginning of everything.
* `/bin`: Basic executables files
* `/boot`: Boot loader files
* `/dev`: Device files (`/dev/sda1`, `/dev/tty`, `/dev/null`, ...)
* `/etc`: Most of the system config files
  * `etc/skel`: All files contained in this directory will be copied to the new user's $HOME.
* `/home`: User home directories
* `/lib`: Libraries used for binaries
* `/media`: Mount points for removable media such as pendrives or CD-ROMs
* `/mnt`: Mounted systems
* `/opt`: Optional application software. People use this directory to host apps they use and don't want them either in a binary folder or home folder
* `/proc`: Provides info. about processes and kernel.
* `/root`: Home directory for *root* user
* `/sbin`: Essential system binaries
* `/sys`: Improved version of `/proc` directory
* `/tmp`: Temporary files
* `/usr`: Read-only user utilities and applications
  * `/usr/bin`: Non-essential user binaries
  * `/usr/include`: Standard include files
  * `/usr/lib`: Libraries for binaries in `/usr/bin` and `/usr/sbin`
  * `/usr/sbin`: Non-essential system binaries (e.g: daemons, etc.)
  * `/usr/share`: Architecture-independent data
  * `/usr/src`: Source code (e.g: kernel)
  * `/usr/local`: Specific data for this host
    * `/usr/local/bin`
    * `/usr/local/lib`
    * `/usr/local/share`
* `/var`: Variable files. Files that are continuesly being modified such as logs
  * `/var/cache`: Application cache data
  * `/var/crash`
  * `/var/games` 
  * `/var/lock`: Files keeping track of resources currently in use.
  * `/var/log`
  * `/var/mail`
  * `/var/opt`
  * `/var/run`
  * `/var/spool`
  * `/var/spool/mail`
  * `/var/tmp`

{{< img "directories.png" "Directories" >}}

## File Types

In Linux files can be:

* Normal
* Directory
* Special file of block (`b`): They Send/receive blocks of information. They work with buffers and are mostly used for storing data. e.g: Hard Drive Disk
* Special file of character (`c`): They Send/receive character to character. They are *very* prioritary as they need to provide fast responses. e.g: Keyboard, GPU card, Sound card
* Hard link: It is a copy of a file, so they have the same inode
  * Only in files of the same partition
  * Can't be done to directories
* Symbolic link (`l`): It is more of a direct access to a file than a copy itself, therefore, it has a different inode
* Socket (`s`)
* Pipe (`p`)

{{< figure "filetype.png" "Filetypes in /dev directory" >}}

## Partitioning

Linux is installed in a disk, or more concisely in a partition. There are a lot of partitions such as NTFS (which is the one Windows use), FAT32 (most pendrives have it), etc.*

But Linux systems use different types of file system:

* ***Ext2***: Default type until kernel 2.4.
* ***Ext3***: Ext2 with *journaling* (creates logs of everything).
* ***Ext4***: Most widely used Unix filesystem.
* ***Btrfs***: In comparison with Ext4, improves max. size of file and claims to center in failure tolerance, repairing and having an easy administration.
* ***ReiserFS***: Very fast with small files, used for web services.
* ***XFS***: Like ReiserFS but with large files.

> Every filesystem type has *journaling* except *Ext2*.

{{< img "gparted.png" "GParted" >}}

Disk partitioners offers to create a *swap* partition. This partition is much like a Virtual RAM, once you set the number of bytes allocated to the partition, if you have more processes than your actual RAM can handle, it's carried by the *swap* partition.

### /home separated

Having `/home` directory in a separate partition allows to isolate users from the system.

The best thing is that we can always give them more space with another partition.

### /home, /var and /tmp separated

Same as above, but user won't be able to block the server consuming all of the space in the disk (as they can only full `/tmp` and `/home`).

Daemons won't either be able to block the system.

## Devices

In Linux, device files are located under the `/dev` directory.

{{< img "lsDev.png" "Files in /dev directory" >}}

### Udev

Modern OS uses accounting to register every important elements such as registering user authentication, devices that are plugged in, etc.

In Linux there is a daemon (service) called Udev, that checks connected devices at boot and *hot plug* devices, and creates the special files (when disconnected, it removes it) to be able to communicate with them, also charging the controllers needed by them.

It also communicates with `syslog` daemon to register this information into a log file.

With command `dmesg` we can get all of this information, but what it does is reading `/var/log/kern.log` with some highlighting.

### Mount points

Filesystems need to be mounted in order to be used:

```bash
# To mount it
mount <origin> <destination>

# -t : filesystem type
# -r : only read
# -w : read/write
# -o : options (nosuid, exec, remount, etc.)

# To unmount it
umount <mount point>
```

Example:

```bash
mount -t iso9660 -r /dev/cdrom /media/cdrom
```

> CDRoms uses [ISO9660](https://www.iso.org/iso-9660-images-for-computer-files.html) filesystem type. It is also referred to as ISO images.

Here is a [list of filesystem types](https://www.reclaime.com/library/filesystem-types.aspx).

Depending on the mounted device, their associated files can have different names:

* `fd0`: First floppy device
* `fd1`: Second floppy device
* `hda`: IDE Hard Drive device in the first IDE port (Master)
* `hdb`: IDE Hard Drive device in the first IDE port (Slave)
* `hdc`: IDE Hard Drive device in the second IDE port (Master)
* `hdd`: IDE Hard Drive device in the second IDE port (Slave)
* `sda`: First SCSI Hard Disk device
* `sdb`: Second SCSI Hard Disk device
* `sda`: Entire disk
* `sda1`: First partition of the disk
* `sda5`: Fifth partition of the disk

Here are the partitions of my Raspberry Pi:

```txt
pablo@pi:~ $ lsblk
NAME        MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
mmcblk0     179:0    0 29,8G  0 disk 
├─mmcblk0p1 179:1    0  256M  0 part /boot
└─mmcblk0p2 179:2    0 29,6G  0 part /
```

This filesystem type isn't common, is called EMMC (Embedded Multi-Media Controller) and it refers to the SD card. `blk` comes from *block*.

## Filesystem management

### Checking devices

* `lsusb`: List USB devices.
* `lspci`: List PCI devices.
* `lshw`: List full info. of CPU, PCI, display, USB, multimedia devices, etc.
* `hwinfo`: Similar to the above, but visually better.
* `lscpu`: List full info. of processor.
* `blkid`: Locate and prints block device attributes.
* `lsblk`: List block devices.
* `fdisk -l`: Similar to the two above, but also lists other devices from `/dev`.

Some of this info can be read too from `/proc` directory:

* `/proc/devices`: List of recognised devices.
* `/proc/partitions`: List of recognised devices.
* `/proc/cpuinfo`: Info about the processor. `lscpu` reads this file and parses it with additional info. such as vulnerabilities.
* `/proc/filesystems`: Filesystems enabled in kernel.
* `/proc/version`: Kernel version and date.

`/proc` was replaced by `/sys` in the kernel in the version 2.6.

### Creating partitions with fdisk

Tools like `fdisk`, `cfdisk` and `sfdisk` helps with this.

Here is a [guide to partitioning with `fdisk`](https://tldp.org/HOWTO/Partition/fdisk_partitioning.html)

> I'll write a guide in another post.

It is always easier to use [GParted](https://gparted.org/).

### Create a filesystem with mkfs

mkfs [manual page](https://linux.die.net/man/8/mkfs).

```txt
mkfs -t ext4 /dev/sda3
```

* `-b` : Block size in bytes (1024)
* `-f` : Fragment size (smallest space asignation unit) for the filesystem (1024)
* `-c` : Check for bad blocks before writing the filesystem
* `-i` : number of bytes per inode (4096)
* `-m` : Percentage of reserved filesystem space (5%)

### Verying filesystems with fsck

fsck [manual page](https://linux.die.net/man/8/fsck).

In boot time *fsck* checks the consistency of the filesystem, detects errors and tries to solve them.

It acts over an unmounted filesystem (not the data within files).

The root filesystem must be mounted on read mode and can't be unmounted.

It can detect the following problems:

* A block is owned by more than one file.
* Blocks with "free" flag are being used.
* Blocks with "in use" flag are free.
* Wrong counters in inode links.
* Inconsistency between the stored size in an inode and the number of referenced blocks.
* Pointer to illegar file blocks.
* Lost files, inodes that aren't empty nor listed in any directory.
* Illegal numbers in inodes.

Repairing of a filesystem:

```txt
fsck /dev/sda2
```

### Checking filesystem parameters with tune2fs

tune2fs [manual page](https://linux.die.net/man/8/tune2fs).

Tune2fs is a tool that allows to adjust some parameters on ext2/3/4 filesystems.

It also allows to view or modify the *superblock*, which is a special block that has information about the filesystem, or how many i-nodes or blocks are free.

Example: `sudo tune2fs -l /dev/sda2`

```txt
tune2fs 1.45.6 (20-Mar-2020)
Filesystem volume name:   <none>
Last mounted on:          /
Filesystem UUID:          0d8cb9bb-7bd5-401c-a859-819f52b6f809
Filesystem magic number:  0xEF53
Filesystem revision #:    1 (dynamic)
Filesystem features:      has_journal ext_attr resize_inode dir_index filetype extent 64bit flex_bg sparse_super large_file huge_file dir_nlink extra_isize metadata_csum
Filesystem flags:         signed_directory_hash 
Default mount options:    user_xattr acl
Filesystem state:         clean
Errors behavior:          Continue
Filesystem OS type:       Linux
Inode count:              3121152
Block count:              12477696
Reserved block count:     623884
Overhead blocks:          274773
Free blocks:              9603760
Free inodes:              2786406
First block:              0
Block size:               4096
Fragment size:            4096
Group descriptor size:    64
Reserved GDT blocks:      1024
Blocks per group:         32768
Fragments per group:      32768
Inodes per group:         8192
Inode blocks per group:   512
Flex block group size:    16
Filesystem created:       Fri Mar  5 10:09:17 2021
Last mount time:          Mon Mar 15 23:28:58 2021
Last write time:          Tue Mar 16 00:28:57 2021
Mount count:              18
Maximum mount count:      -1
Last checked:             Fri Mar  5 10:09:17 2021
Check interval:           0 (<none>)
Lifetime writes:          23 GB
Reserved blocks uid:      0 (user root)
Reserved blocks gid:      0 (group root)
First inode:              11
Inode size:	          256
Required extra isize:     32
Desired extra isize:      32
Journal inode:            8
Default directory hash:   half_md4
Directory Hash Seed:      47b75cf5-ab22-4228-b359-cd698eef8f57
Journal backup:           inode blocks
Checksum type:            crc32c
Checksum:                 0x8a65527d
```

Parameters:

* `-l device`: List content of the superblock in that device.
* `-c max-mount-counts`: Max. number of mounts without executing `fsck`.
* `-L tag device`: Change tag to a device.
* `-m percentage device`: Establish percentage of reserved blocks in a device.
* `-r blocks`: Number of reserved blocks.

## fstab

The Filesystem Table is located in `/etc/fstab` and contains data of the devices that automatically are mounted on boot, such as the main partition (or other partitions in case `/home`, `/var` and `/tmp` were separated) and the swap partition.

An example of mine:

```conf
# /etc/fstab: static file system information.
#
# Use 'blkid' to print the universally unique identifier for a
# device; this may be used with UUID= as a more robust way to name devices
# that works even if disks are added and removed. See fstab(5).
#
# <file system> <mount point>   <type>  <options>       <dump>  <pass>
# / was on /dev/sda2 during installation
UUID=d5a25364-33cf-4fc6-a71a-da6861bfdbfe /               ext4    errors=remount-ro 0       1
# /boot/efi was on /dev/sda1 during installation
UUID=C2C0-9B5E  /boot/efi       vfat    umask=0077      0       1
/swapfile                                 none            swap    sw              0       0
```

### Automatic mounting

To automatically mount a drive follow this steps:

* Create a folder in the `/mnt` directory. This folder is going to be used to allocate the new mounted drive.
```bash
sudo mkdir /mnt/myDrive
```
* Give yourself access to that folder:
```bash
sudo chown myUser:myUser /mnt/myDrive
```
* Plug the drive and get its UUID with `sudo blkid`.
* Edit the fstab file 
```conf
UUID=YOUR_UUID /mnt/myDrive    auto nosuid,nodev,nofail,x-gvfs-show 0 0
```

## File/Directory Permissions

Files and directories have permissions, so that a user can't read or write on other users content.

Each file and directory has three permissions groups: user owner, group owner and the rest of the users.

Permissions allows a user or a group to do the following operations on a file or directory:

* Read (r) ~ 100 (4)
* Write (w) ~ 010 (2)
* Execute (w) ~ 001 (1)

> Numbers next to each operation are the values in **binary** and **octal** associated to the permission.

```txt
Read   Write  Execute

  r      w       x
  |      |       |
  4  +   2   +   1
  ╰──────┬───────╯
         7
```

### chmod

This numbers are useful because `chmod` uses them to manage file permissions.

For instance a file with: 

* `rwxrwxrwx` can be read, written and executed by anyone.
```bash
chmod 777 myFile
```
* `rw-------` can be read and written (not executed) by the user who created, groups that are associated with that user and the rest of the users can't touch that file.
```bash
chmod 600 myFile
```
* `r-xr-x---` can be read and executed by the user and group that owns the file/directory.
```bash
chmod 550 myDirectory
```

### chown

This command allows to change the owner and the group of a file.

```bash
# Syntax: chown <user>:<group> file
chown paul:staff file

# Changes '/tmp' owner to 'root'
chown root /tmp

# Changes 'myDrive' group owner to 'data'
chown :data myDrive 
```

* `-R` to operate on files and directories recursively
* `-H` traverse specified symbolic link to its directory
* `-L` traverse every symbolic link to a directory encountered

> `chgrp` does the same but only to a groups, not users as well.

### chattr

Allows to change file/directory attributes, its syntax:

```bash
chattr <args> <file>
```

* `a`: Append only file
* `i`: Immutable file

More arguments in the [chattr Manual](https://linux.die.net/man/1/chattr).