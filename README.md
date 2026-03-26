# [n0nuser](https://www.pablogonzalez.me)

## Build 👨‍💻

[![Hugo v0.159.1](https://img.shields.io/badge/hugo-0.159.1-ff4088?logo=hugo&logoColor=white)](https://github.com/gohugoio/hugo)
[![GitHub repo size](https://img.shields.io/github/repo-size/n0nuser/n0nuser.github.io?color=009cdf&label=repo%20size&logo=git&logoColor=white)](https://github.com/n0nuser/n0nuser.github.io)
![Maintenance](https://img.shields.io/maintenance/yes/2026?color=009cdf&logoColor=white)
![Last Commit](https://img.shields.io/github/last-commit/n0nuser/n0nuser.github.io?color=009cdf&logoColor=white)

## Description 🌐

My IT Personal Blog built with [GoHugo](https://gohugo.io/) `v0.159.1` using a modified version of the [Color Your World](https://themes.gohugo.io/hugo-theme-color-your-world/) theme.

It's a Progressive Web Application: it can be installed on your device.

## Local Cloudflare-like build

To run a Linux build that matches Cloudflare Pages more closely, use Docker:

`.\build-cf.ps1`

Optional: use a different Hugo version:

`.\build-cf.ps1 -HugoVersion 0.159.1`

The script uses a pinned `hugomods/hugo` image variant with Hugo, Dart Sass, Node, and Git.

## Lint checks

Install lint dependencies:

`npm install`

Run all checks:

`npm run lint`

Available checks:

- `npm run lint:templates` (Hugo template delimiter sanity checks)
- `npm run lint:scss` (SCSS style checks)
- `npm run lint:js` (lint custom Node scripts)
- `npm run lint:md` (docs markdown checks)
- `npm run lint:hugo` (native Hugo production build validation)
