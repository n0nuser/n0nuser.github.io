---
title: "Linux - Backup"
description: ""
date: 2021-04-07
lastmod: 2021-04-07
author: "Pablo Jesús González Rubio"
cover: "cover.png"
coverAlt: "Tux!"
toc: true
draft: true
tags: [ "SysAdmin", "Linux" ]
---

## Why is it important

- Recuperar los sistemas informáticos y los datos de una catástrofe informática.
- Natural o ataque
  - En un incendio:
    - Sistemas que liberan gases y consumen el oxígeno para apagar el fuego.
    - Sistemas de hormigón anti-incendio
  - Inundación
  - Terremoto
  - Coche que se empotra contra el edificio.
- Restaurar una información que se ha eliminado de forma accidental.
  - Fotos familiares
  - Echan de menos algo que no existe
- Información corrupta
- Ataque informático: ramsonware,...
- Guardar información histórica en formas más económicas que un disco duro.
  - Información más antigua en peores discos duros (más lentos) y la más reciente en los más nuevos (más rápidos).
- Traslado a otras ubicaciones y réplicas.

En cuanto a localización suelen estar en un edificio en la última planta baja.

Las copias de seguridad (pendrives, discos duros, cintas magnéticas) se almacenan en cajas fuertes ignífugas.

## Commands

### Low level

- `tar`
- `cpio`: Está en desuso.
- `dd`
- `dump` y `restore`

### High level

- `amanda`: 
- `bacula`: 
- `rsync`: 
- `unison`: 

## Strategys

### Full Copy

Copiar directamente todos los archivos seleccionados cada vez que se lanza el proceso.

Si pesa mucho, tardará mucho tiempo en ejecutarlo y por eso se haría una vez a la semana o al mes.

Esta información aunque no se modifique, se sigue copiando. Por lo que satura el almacenamiento.

El espacio y el tiempo son dinero, y es mejor no malgastarlos.

### Copia diferencial o acumulativa

*Sólo* copia los ficheros que han sido *creados o modificados* desde la *última copia completa* (copia de referencia).

El domingo se hace una copia completa. El lunes se crea un archivo y hace su copia. El martes se crea otro archivo, entonces se copia el del lunes y del martes.

Esto con cambios pequeños es una maravilla, pero con cambios grandes y continuos es igual prácticamente que la full copy. Por eso se le llama acumulativa.

"foto muñeco matrioska"

Para recuperar la información de un día se necesita la primera full copy y la copia (diferencial) de ese día.

El problema que tiene esto es que si se corrompe algo en la copia, es el doble de díficil de recuperarlo.

### Copia incremental

*Sólo* copia los ficheros *creados o modificados* desde el *último backup*.

Para recuperar los datos se necesita la primera full copy y todos los cambios (copias) hechos hasta ese día.

Esto es lo que hace Google Drive y otras empresas de este tipo.

### Resumen

El tipo de copia que se va a hacer depende del volumen de datos que se va a manejar.

Volumen pequeño -> full copy; volumen grande -> diferencial e incremental.

### Problemas

Que la copia de seguridad esté bien hecha. Si está mal hecha y utilizamos un método incremental y alguna está mal hecha, toda la información se esa copia se pierde.

Entonces se utilizan métodos como el CRC, hash, checksum y demás para comprobar la integridad de los ficheros.

### Caso práctico

Mejor 4 copias completas semanales y 7 dispositivos en los que guardar la información, que 1 en el que hacer la copia completa y 30 para guardar los cambios.

Esto es porque de esos 30 hay muchas probabilidades de que alguno se pueda estropear.

## Tar (Tape ARchiver)

Las copias de seguridad no se hacen en discos duros por la tasa de fallo que tiene y la probabilidad de pérdida de los ficheros. En las grandes empresas se utilizan cintas magnéticas para soportar esto.

Tar permite hacer una copia de un directorio directamente a una cinta magnética.

```bash
# Crear una copia de seguridad: -c
# Modo fichero (no cinta magnetica): -f 
# Comprimir con GZip: -z
# Modo verbose: -v
tar -cfzv myBackup.tar directory
```

Para listar los ficheros que hay dentro de un ".tar":

```bash
# Para listar: -t
tar -tf myBackup.tar
```

Para extraer algo de un fichero ".tar":

```bash
# Extrae todo
tar -xfv myBackup.tar
# Extrae algo en particular
tar -xfv myBackup.tar myfile
```

Cuando se comprimen directorios absolutos (e.g: `/home`) se eliminan la barra del directorio absoluto por seguridad. Y cuando se descomprime se hace en un directorio aparte y es el usuario el que tiene que sobrescribir los datos.

Esto se hace para evitar que alguien modifique un fichero passwd, por poner un ejemplo, y este se sobrescriba en nuestro sistema.

## DD

Clonar un fichero: `dd if=pagos.pdf of=pagos2.pdf`
Clonar una partición: `dd if=/dev/sda1 of=/dev/sdb1`
Clonar un disco: `dd if=/dev/sdX of=/dev/sdY`
Para hacer un ISO de un CD-Rom: `dd if=/dev/cdrom of=micd.iso`

Para mandar una cinta a un robot de copia de seguridad en otro lado del mundo que guarde los ficheros en una cinta magnética y luego en una caja fuerte:

```bash
tar cf -. | ssh 192.168.0.165 dd of=/dev/sr0
```

## Dump y Restore

Permiten copias de sistemas de ficheros incrementales.

```bash
dump [-level] [options] [files2save]
```

```bash
# Hace el full copy
dump -0uf /backups/backup.dump /dev/sda78
# Hace la copia incremental
dump -1uf /backups/backup.dump /dev/sda78
```

```bash
# Modo interactivo
restore -if backup.dump

# Listar contenidos
restore -tf backup.dump

# Extraer directamente
restore -xf backup.dump
```

Comandos consola interactiva:

- ls : moverse por el sistema de ficheros
- add : añadir fichero/directorio a recuperar
- extract : Se extrae de la copia de seguridad. Al pedir número de volumen: 1.

## Rsync

**Incremental** remoto.

```bash
# Modo simulación: -n
rsync -anv origen/ destino
# Lo manda directamente
rsync -av
```

Remoto SSH:

```bash
# Progress Bar: -P
rsync -azP origen/ n0nuser@192.168.1.15:folder
```

Cuando detecta la diferencia del fichero, no reemplaza ese fichero si no que cambia automáticamente la parte del contenido modificado.
Lo utiliza Google Drive, Dropbox, AlFresco...
Funciona muy muy bien.

## Ejercicios

### Sincronizar contenido al cerrar sesión

```perl
use File::Rsync;
 
$obj = File::Rsync->new(
    archive      => 1,
    compress     => 1,
    rsh          => '/usr/local/bin/ssh',
    'rsync-path' => '/usr/local/bin/rsync'
);
 
$obj->exec( src => '~/myFolder', dest => '/mnt/pendrive' )
    or warn "rsync failed\n";
```
