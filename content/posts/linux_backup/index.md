---
title: "Linux - Backup"
description: "A backup or backup is the safe copy of a digital file, a set of files, or all of the data considered important enough to be preserved."
date: 2021-05-09
lastmod: 2021-05-09
author: "Pablo Jesús González Rubio"
cover: "cover.png"
coverAlt: "Tux!"
toc: true
draft: false
tags: [ "Linux" ]
---

A backup or backup is the safe copy of a digital file, a set of files, or all of the data considered important enough to be preserved.

## Why is it important

- Recover computer systems and data from a computer disaster.
- Natural or attack
  - In a fire:
    - Systems that release gases and consume oxygen to put out the fire.
    - Concrete anti-fire systems
  - Floods
  - Earthquakes
  - Car crashing against the building.
- Restore information that has been accidentally deleted.
  - Family photos
  - They miss something that does not exist
- Corrupt information
- Computer attack: ramsonware, ...
- Save historical information in ways cheaper than a hard disk.
  - Oldest information on worst hard drives (slower) and newer on newer (faster).
- Transfer to other locations and replicas.

### Things to take in count

In terms of location, they are usually in a building on the top ground floor.

When selecting what content to save, we must always think about the level of importance of the information.

The periodicity to make the backup copies of our data will depend on the greater or lesser movement of the information that we carry out.

Backup copies (pen drives, hard drives, magnetic tapes) are usually stored in fireproof safes.

## Strategies

### Full Copy

Directly copy all selected files every time the process is launched.

If it weighs a lot, it will take a long time to run, and that is why it would be done once a week or a month.

Even if this information is not modified, it continues to be copied. So it's redundant and saturates the storage.

Think it this way, for a company like Google Drive or Dropbox, storage and time are money, so it's better not to waste them. And it would be nonsense to store the same information without modification every time they do the copy.

### Differential or cumulative copy

*Only* copy files that have been *created or modified* since the *last complete copy* (reference copy).

A *complete copy* is made on Sunday.<br>On Monday, a file is created and made its copy. On Tuesday, another file is created.<br>Then both files from Monday and Tuesday are copied.

Differential copies are best when small changes are made, but with large and continuous changes it is practically the same as a full copy. That is why it is called *cumulative*.

{{< img "matrioska.jpg" "Matrioskas" "border" >}}

**To retrieve the information** of a day you need the first full copy and the copy (differential) of that day.

The **problem** with this is that if some part of the copy is corrupted, it is twice as difficult to recover it.

### Incremental copy

*Only* copies files *created or modified* since the *last backup*.

To recover the data from the backup, we need the first complete copy and all the incremental copies made up to that day.

Google Drive and other similar companies do this.

### Summary

The type of copy to be made depends on the volume of data to be handled.

- Small volume -> full copy
- Large volume -> differential and incremental.

When planning a backup is better to make 4 complete copies every week and 7 incremental/differential copies (with its respective 7 devices to store the copies), than 1 full copy monthly and 30 devices for the incremental/differential copies.

This is because there is a good chance that one of those 30 devices can break down.

### Problems

If the backup is badly done and we use an incremental/differential method, all the information will be lost.

There are methods such as CRC, hash, checksum, and others that are used to check the integrity of the files.

## Tools

### Tar (Tape ARchiver)

Important backups aren't made to hard drives due to the failure rate and the probability of file loss. Magnetic tapes are used in large companies to support this and [Tar](https://linux.die.net/man/1/tar) is used for this purpose.

Tar allows you to make a copy of a directory directly to a magnetic tape.

```bash
# Create a backup: -c
# File mode (not magnetic tape): -f
# Compress with GZip: -z
# Verbose mode: -v
tar -cfzv myBackup.tar directory
```

To list the files inside a ".tar":

```bash
# To list: -t
tar -tf myBackup.tar
```

To extract something from a ".tar" file:

```bash
# Extract everything
tar -xfv myBackup.tar
# Extract something in particular
tar -xfv myBackup.tar myfile
```

When absolute directories are compressed (e.g: `/home`), the directory slash is removed as a security measure. When it's decompressed, it is done in a separate directory and is the user who has to overwrite the data.

This is done to prevent someone from modifying the "passwd" file, for example, and it being overwritten on our system.

### DD

[DD - Convert and copy a file](https://linux.die.net/man/1/dd).

It's widely known and used for copying entire filesystems into files and viceversa.

Clone a file: `dd if=payments.pdf of=payments2.pdf`

Clone a partition: `dd if=/dev/sda1 of=/dev/sdb1`

Clone a disk: `dd if=/dev/sdX of=/dev/sdY`

To send a tape to a backup robot on the other side of the world that saves the files on magnetic tape, and then in a safe:

```bash
tar cf -. | ssh 192.168.0.165 dd of=/dev/sr0
```

### Dump and Restore

[Dump](https://linux.die.net/man/8/dump) and [Restore](https://linux.die.net/man/8/restore) allow copies of incremental filesystems.

```bash
dump [-level] [options] [files2save]
```

```bash
# Do the full copy
dump -0uf/backups/backup.dump/dev/sda78
# Make incremental copy
dump -1uf/backups/backup.dump/dev/sda78
```

```bash
# Interactive mode
restore -if backup.dump

# List contents
restore -tf backup.dump

# Extract directly
restore -xf backup.dump
```

Interactive console commands:

- ls: move around the filesystem.
- add: add file/directory to recover.
- extract: extract from the backup. When ordering volume number: 1.

### Rsync

[Rsync](https://linux.die.net/man/1/rsync) is a fast, versatile, remote (and local) **Incremental** file-copying tool.

```bash
# Simulation mode: -n
rsync -anv source/destination
# Send it directly
rsync -av
```

Remote SSH:

```bash
# Progress Bar: -P
rsync -azP source/n0nuser@192.168.1.15:folder
```

When it detects the difference of the file, it does not replace that file but automatically changes the part of the modified content.
It's used by companies such as Google Drive, Dropbox, AlFresco...
It works very very well.

### High level

- [`amanda`](http://www.amanda.org/)
- [`bacula`](https://www.bacula.org/)
- [`rsync`](https://linux.die.net/man/1/rsync)
- [`unison`](https://github.com/bcpierce00/unison)

## Useful things

### Synchronize content on logout

We can run this Perl script in the logout script: `/home/myUser/.bash_logout`

```perl
use File::Rsync;
 
$obj=File::Rsync->new(
    archive      => 1,
    compress     => 1,
    rsh          => '/usr/local/bin/ssh',
    'rsync-path' => '/usr/local/bin/rsync'
);
 
$obj->exec( src => '~/myFolder', dest => '/mnt/pendrive' )
    or warn "rsync failed\n";
```

### Copying a CD with DD

1. Read the block size and the volume size of the CD

    ```bash
    ➜  ~ isoinfo -d -i /dev/cdrom | grep -i -E 'block size|volume size' 
    Logical block size is: 2048
    Volume size is: 6248
    ```

2. Clone the CD

    ```bash
    dd if=/dev/cdrom of=CopyOfMyDisk.iso bs=2048 count=6248 status=progress
    ```

To make an ISO of a CD-Rom: `dd if=/dev/cdrom of=micd.iso`

### Backup of a Raspberry Pi

1. Insert the SD in a PC with Linux
2. Check its partition

    ```bash
    sudo blkid
    ```

3. Clone it and compress it

    ```bash
    sudo dd bs=4M if=/dev/mmcblk0 | gzip > ~/myImage.gz
    ```

4. Restore it

    ```bash
    gzip -dc ~/myImage.gz | sudo dd bs=4M of=/dev/mmcblk0
    ```

I highly recommend using **[pishrink](https://github.com/Drewsif/PiShrink)** after you get the backup image. Mainly because you are getting a 32 Gb., 64Gb. (your SD card size) image and you may not necessarily occupied that much space. This tool allows to shrink that image, into its real size.

In my case, I had a Retropie with lots of ROMs that I wanted to keep as a single image. Just to have it and know I can copy the image into the RPi with all the ROMs and erase the hassle of sending it again over Samba or FTP. It's really useful!!
