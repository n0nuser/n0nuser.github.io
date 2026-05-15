#!/bin/bash
IP=$(ifconfig | sed -En 's/127.0.0.1//;s/.*inet (addr:)?(([0-9]*\.){3}[0-9]*).*/\2/p')
hugo server --bind $IP --baseURL http://$IP:1313 --gc --disableFastRender --noHTTPCache --ignoreCache

