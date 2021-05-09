# Security

## SUID test code

```c
#include <stdio.h>
#include <unistd.h>

int main(int argc, char **argv)
{
    printf("UID:%d, EUID:%d",getuid(),geteuid());
    fflush(stdin);
}
```

Try the following:

```bash
./uid
sudo ./uid
ls -axilsh uid
sudo chown root:root uid
ls -axilsh uid
./uid
sudo chmod +4000 uid
./uid
```

Result:

{{< img "suid.png" "SUID file" "border" >}}

To check all of the SUID and the SGID files we can use `find`:

```bash
find / -perm /4000 > filesWithSUID.txt
find / -perm /2000 > filesWithSGID.txt
```

## Sticky bit

It's used for directories and has to do with permissions.

Content of a directory with a Sticky bit can only be erased by the propietary.

Example case: a directory where my friends upload movies, they have all of the permissions but if the directory has the sticky bit they won't be able to erase anything.

Usually used in share resources and public directories.

### Things to try

#### 1

Search every file/directory that has no owner nor group owner:

```bash
find / -nouser -o -nogroup
```

This can happen when a user is deleted, its files are then orphans.

#### 2

Search "r.host" files:

```bash
find /home -name .rhost >> rhost_files.log
```

It allows for someone to connect to our server with our user without even entering a password. This is used for backups, IT Admins... but can also used by cyber criminals.

Those files are created by users in their personal directories.

These files can't be ignored: we can cap the file by eliminating the read permissions, or deactivating r.hosts in the ssh config.

Is still better to use a private key.

## Rootkits

`chkrootkit` allow to check with a checksum if our versions of services and applications are safe

```bash
sudo apt install chkrootkit -y
chkrootkit
chkrootkit -q # Show menaces
```

`rkhunter` it's much more advanced and more detailed than `chkrootkit` as it detects troyans and worms.

```bash
sudo apt install rkhunter -y
rkhunter --list tests #check the different types of tests that this tool executes
rkhunter --check # complete scan of the system
```

Can be configured in the config file to send emails. Can be used in a cron for daily checkups.

### Network

To check things connected to our computer (or services we have listening) we can use:

```bash
netstat -an | more
```

To check ports and info about a foreign computer we can use `nmap`.

### Tripwire

It generates an encrypted database with the properties of each element of our file system. This database is used to check the changes that have occurred in the file system. If these modifications have been made and / or authorized by us, the database will be updated, otherwise, it would be necessary to investigate what happened.

```bash
sudo apt install tripwire -y # It will ask 4 times the password
tripwire -m i # Database creation
tripwire -m c # Testing the integrity of the database
tripwire --check > report.txt # Report creation
```

Every time a file is changed it reports it.

### ionice

```bash
ionice -c 3 # IDLE priority (none)
ionice -c 2 # Max priority
ionice -c 1 # Realtime priority (MAXIMUM)
ionice -c 0 # Default priority
```

### Cosas

Un universitario tenía su unidad Z donde sube sus programas. Le empiezan a salir archivos de psicología de otro tío y cambia su contraseña. Luego le borran los suyos y empiezan a salir los del otro.

Resulta que los dos usuarios tenían el mismo nombre de usuario (que eran las iniciales de sus nombres) con dos contraseñas distintas. Por ello lo mejor es utilizar identificadores numéricos.

Apache es pagado por Microsoft porque les interesa, el Open Source no lo es tanto. Ian Murdock (creador Debian) se negó.

Microsoft en el 2000 esnifaba los documentos word de todos sus usuarios y los subía a sus servidores.

Contra los lamers, cambiar los mensajes HELO del SO para que si soy de Linux digamos que soy de Windows y lo mismo con los servicios y las versiones. PREGUNTAR CÓMO SE HACE ESTO.
Mejor buscarlo

España no tiene convenio con china, india...

IPSec: Todas las comunicaciones sean cifradas aunque los protocolos no lo sean.
WEP es el cifrado que hay de ordenador a ordenador en una lAN.

Las centralitas VOIP como Asterix o Lync Server hace que cuando una centralita llama a otra se conecta a una especie de VPN llamada SEIP.

Comunicaciones unificadas.

WebRTC permite realizar conexiones P2P sin abrir puertos mediante rtctunnel. Está pensado para videollamadas.

Con Wireshark se pueden escuchar llamadas VOIP.

Filtros de contenidos con "Squids"
