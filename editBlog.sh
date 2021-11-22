#!/bin/bash
IP=$(ifconfig | sed -En 's/127.0.0.1//;s/.*inet (addr:)?(([0-9]*\.){3}[0-9]*).*/\2/p')
xdg-open content/posts/
code .
nohup firefox $IP:1313 &
hugo server --bind $IP --baseURL http://$IP:1313

