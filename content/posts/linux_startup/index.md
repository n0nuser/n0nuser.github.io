---
title: "Linux - System Startup and Shutdown"
description: ""
date: 2021-03-21
lastmod: 2021-03-21
author: "Pablo Jesús González Rubio"
cover: "cover.png"
coverAlt: "Tux!"
toc: true
draft: true
tags: [ "SysAdmin", "Linux" ]
---


## Boot

- `dmesg`: Vuelva en pantalla la información del arranque del sistema. Si ponemos un periférico y el sistema no arranca, es aquí donde se mira.
  - Parecido es `journalctl -f`
- `inittab`: Se puede modificar el tipo de arranque para que se inicie sin que se arranque ninguna aplicación. **Fichero en el que se modifica el runlevel.**
- `shutdown`: Poner el sistema en modo Mantenimiento. Permite programar un mantenimiento avisando a los usuarios con un mensaje de ese mantenimiento. Se puede utilizar también para reiniciar. Hace un `telinit 1`.
  - e.g.: `shutdown +5 "El sistema se va a apagar"`
- `halt`: Pone al SO en estado mínimo. Deja a las CPUs con casi ninguna tarea. Estado de reposo sin cortar la energía.
- `poweroff`: Manda un mensaje ACPI a la BIOS que obliga a cortar la energía.
- `init`: PID 1, primer proceso que se arranca y se encarga de arrancar todo, montar el sistema de ficheros, comprobar errores, arrancar demonios (udev), habilita perifericos.
- `telinit`: Permite arrancar en un modo de arranque u otro.
- `runlevel`: Informa en qué modo ha arrancado el ordenador.
  - El número que aparece a la izquierda es el runlevel anterior (si aparece una N es que no había ninguno), y el de la derecha es el actual.
- `insserv`: Utilidad que ya no existe y permite al inicio del arranque, ejecutar distintos programas, lo que se llama el startup.

Hay 7 niveles de arranque. Se puede configurar el SO para que arranque en cualquiera de estos modos:

- 0: Estado de *parada* (apara el sistema por completo).
  - Apagar el SO, es arrancar el SO en un modo. Gestiona la finalización de los programas.
  - Si se pone por defecto este modo, el ordenador arranca y se apaga. Está feo ajja.
- 1: Modo mono-usuario. Sirve para hacer tareas de administración muy bruscas.
  - En un sistema comprometido lo primero que hay que hacer es expulsar a todos los usuarios.
  - El modo +1 gestiona el SO de tal forma que corta el acceso a red y sólo permite el acceso físico a un usuario. Por eso se utiliza en sistemas comprometidos.
- 2: Modo multi-usuario.
- 3: Modo multi-usuario con acceso a línea de comandos.
- 4: Igual que el 3. No se utiliza. Se pensó para usos futuros.
- 5: Igual que el 3 pero además permite sesión gráfico SI LO TIENE.
- 6: Reinicia el sistema.
  - Si se pone que sea el runlevel por defecto, el sisetema se arranca y se reinicia continuamente. Broma de mal gusto.

## Sistemas de arranque

### SysVinit

1. La BIOS se encarga de verificar que la integridad de los periféricos y hardware está en un estado seguro.

2. A continuación carga el Bootloader (está en una partición del disco duro y almacena la información de las particiones a arrancar)

3. Después se arranca el Kernel en memoria RAM y este llama a `init`.

4. `init` carga las cosas más básicas (`rcS.d`). Cosas tipo el reloj, udev, etc...

5. También comprueba el runlevel (`rcX.d` con X del 0 al 6) y dependiendo de este arranca unas cosas u otras.

6. Se arranca la consola (`getty`).

Los ficheros de `/etc/rcS.d/` se ejecutan siempre. Y dependiendo de los runlevel en los que nos encontremos, se cargan los programas del rc1, rc5, etc...

Es decir, si yo estoy en el runlevel 5, se ejecutarán los programas del directorio rc5.

#### Ejemplo

Yo quiero arrancar Spotify al inicio (startup), se mete el script de arranque de Spotify en `init.d` y a continuación dependiendo del runlevel en el que queramos que se ejecute, haríamos un enlace simbólico en el `rcX` al script del `init.d`.

Estos scripts, empiezan con una *S* (Start) o una *K* (Kill) y un número a continuación que indica la prioridad (de 01 a 99).

Si quieres que Spotify se arranque en el runlevel 2, habría que poner el S en el rc2, pero si cambias al runlevel 3 o al 4, en ellos habría que poner la K.

Si tenemos dos números con el mismo número de prioridad, se ejecuta antes por orden alfabético.

Hay un comando de Debian 6 que hace todo esto: `update-rc.d /ruta/script start 90 2 3 4 5 . stop 0 1 6`. Donde 90 es la prioridad, pero esto hay que calcularlo.

Con Debian 7 se hace con `insserv`. Todo lo anterior del update que se pasa por parámetro, ahora se añade como una cabecera dentro del script, en la que no hay que asignar una prioridad porque lo gestiona algo llamado *facilities*:

- $local_fs
- $network
- $named
- $portmap
- $remote_fs
- $syslog
- $time
- $all: Tiene todas las dependencias.

### Systemd

RedHat crea `systemd`. Muchos sistemas lo adoptan y lo cambian por `init` y otros lo rechazan.

Ventaja de `systemd` en comparación con `init.d` (la forma tradicional) es que carga los procesos que serían los de `rcS.d` y `rcX.d` en paralelo.

Systemd en vez de llamar a los scripts, scripts, los llama unidades, y pueden ser servicios, puntos de montaje (en vez de `/etc/fstab`), dispositivos, sockets, targets (el runlevel vaya).

En vez de llamar a los runlevel por sus números, usan:

- `runlevel0.target` ó `poweroff.target`
- `runlevel1.target` ó `rescue.target`
- `runlevel2.target` ó `multi-user.target`
- `runlevel3.target` ó `multi-user.target`
- `runlevel4.target` ó `multi-user.target` ó `graphical.target`
- `runlevel5.target` ó `reboot.target`

Para ver el runlevel en el que estamos: `systemctl get-default`

Para cambiar de runlevel en vez de usar `telinit`, se usa `systemctl isolate rescue.target`.

Para cambiar el runlevel por defecto se usa: `systemctl set-default graphical.target`.

Si se quiere hacer un script de arranque con systemd, se crea un fichero `miscript.service` en `/lib/systemd/system/`. Un ejemplo del servicio `fail2ban`:

```txt
[Unit]
Description=Fail2Ban Service
Documentation=man:fail2ban(1)
After=network.target iptables.service firewalld.service ip6tables.service ipset.service
PartOf=firewalld.service

[Service]
Type=simple
ExecStartPre=/bin/mkdir -p /var/run/fail2ban
ExecStart=/usr/bin/fail2ban-server -xf start
# if should be logged in systemd journal, use following line or set logtarget to sysout in fail2ban.local
# ExecStart=/usr/bin/fail2ban-server -xf --logtarget=sysout start
ExecStop=/usr/bin/fail2ban-client stop
ExecReload=/usr/bin/fail2ban-client reload
PIDFile=/var/run/fail2ban/fail2ban.pid
Restart=on-failure
RestartPreventExitStatus=0 255

[Install]
WantedBy=multi-user.target
```

El parámetro `After` se refiere a la prioridad.

Como `multi-user.target` referencia a los runlevel 2, 3, 4 y 5, si se quisiera que se arrancara en uno de esos modos, habría que utiliza el otro nombre del que dispone (e.g.: `runlevel2.target`).

Para ver las unidades activas: `systemctl`.

Para ver las unidades instaladas:  `systemctl list-unit-files`.

Para ver las unidades que han fallado: `systemctl --failed`.

Para ver las dependencias de SSH: `systemctl list-dependencies ssh.service`.

Para ver los parámetros que tiene una unidad: `systemctl show cron.service`

> Systemd para evitar retrasos en el arranque, evita toda impresión por pantalla (stdout), para sobrescribir esto hay un parámetro (hay que buscarlo).

En SysVinit para arrancar un servicio se usaba `service cron start` y ahora `systemctl start cron.service`.

En SysVinit para habilitar un servicio se usaba `chkconfig cron on` y ahora `systemctl enable cron.service`.

En SysVinit para verificar si un servicio está habilitado `chkconfig cron` y ahora `systemctl is enabled cron.service`.

Para ver los mensajes del boot: `journalctl -b`.

Para ver los mensajes nuevos: `journalctl -f`.

Para ver los mensajes nuevos de una unidad: `journalctl -u`.

Hay un parámetro en systemd para especifica cuándo se va a ejecutar un script (timer). Diferencia entre `timer` y `cron`, que timer puede ejecutarse en el arranque.

### EJERCICIO - Bot Telegram

- BotFather
- Mandar mensaje por telegram desde Linux
- Sólo se puede hacer cuando la red está conectada: `After=network.target` supongo.
- Script en bash con switch-case (start, stop,...) que va en `/usr/bin/tarara` o demás parecidos.
- Crear servicio en `/lib/systemd/system/tarara.service`

Reproducir sonido con el speaker del sistema: `beep`.

Cómo se crea un programa de arranque, estructura del fichero, dónde se crea, SÓLO con systemd.

