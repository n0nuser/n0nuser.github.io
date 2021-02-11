---
title: "Google Dorks Cheatsheet"
description: "Doing advanced searches with the use of Google Operators nowadays is a must to be able to extend and improve our findings. From searching for a specific filetype such a pdf or a png image, to use it for hacking and bug bounty!"
date: 2020-10-20
author: "Pablo Jesús González Rubio"
cover: "cover.jpg"
coverAlt: "Google Dorks"
toc: true
tags: [ "Cheatsheet" ]
---

## Introduction

You can download the cheatsheet as a pdf from [here](./dorks.pdf)!

Searching in Google has become something as normal as drinking water and sometimes we desperately search some information but we can't find it, neither in other languages. 

Doing advanced searches with the use of Google Operators nowadays is a must to be able to extend and improve our findings. From searching for a specific filetype such a pdf or a png image, to use it for hacking and bug bounty!

## Operators

Mixing these operators will let us customize our search to the point of having neat results. In any case, it's best to try them yourself so that you learn them and get comfortable using them in a normal basis. Believe me, a good search will save you lots of time!

I've found some more but the result is nearly the same as a normal search, so I decided not to include them. In any case, if you know some that really makes a difference contact me and I'll add them! 😊

### Restrict Search

| Operators | Example | Meaning |
|:-:|:-:|:-:|
| " " | "Tres tristes tigres" | Search will only show results that exactly match "Tres tristes tigres" |
| OR | trump OR biden | Shows pages that either contains "trump" or contains "biden" |
| AND | trump AND biden | Shows pages that contains "trump" and "biden". Not much difference with a normal search |
| () | (razer OR logitech) mouse | Groups multiple operators for a better search |
| - | elon musk -twitter.com | Will search Elon Musk but Twitter pages won't appear |
| * | index of * | Acts as a wildcard, matching anything |
| #..# | 2006..2008 | Will search the range [2006, 2007, 2008] |
| AROUND(x) | index of AROUND(3) cgi-bin | Will match pages that has 3 words at max of distance between "index of" and "cgi-bin" |
| site: | site:twitter.com | Search results are restricted to Twitter.com page |
| filetype: | filetype:pdf | Search results will only include pdf files |
| imagesize:WIDTHxHEIGHT | imagesize:1920x1080 | Search result will only include FullHD resolution images/videos |
| intitle: | intitle:cibersecurity | Pages that include "cibersecurity" in the title |
| allintitle: | allintitle: OSCP guide | Pages with "OSCP" and "guide" in the title |
| inurl: | inurl:deer | Pages that contain "deer" in the URL |
| allinurl: | allinurl:code python | Pages that contain "code" and "python" in the URL |
| intext: | intext:deer | Pages that contain "deer" in the text |
| allintext: | allintext:code python | Pages that contain "code" and "python" in the text |
| related: | related:aliexpress.com | Pages that are similar to Aliexpress |
| cache: | cache:soundcloud.com | Displays Google's cached version of Soundcloud |

### Common

| Operators | Example | Meaning |
|:-:|:-:|:-:|
| stocks: | stocks:amz | Show the stock value of Amazon |
| define: | define:book | Searches definitions of "book" |
| movie: | movie: patria | Searches info. about "Patria" serie's |

### Maths

| Operators |  Usage | Result |
|:-:|:-:|:-:|
| + | 5 + 10 | 15 |
| – | 5 - 10 | -5 |
| * | 5 * 10 | 50 |
| / | 5 / 10 | 0.5 |
| `% of` | 10% of 300 | 30 |
| ^ | 5^2 | 25 |
| ** | 5**2 | 25 |

## Use of Dorks for Hacking

I found some pages full of examples in which they mix operators with default service/application behaviour so it ends up with an insecure open service that could be exploited. This is very very useful in bug bounties!

- [GBHackers](https://gbhackers.com/latest-google-dorks-list/)
- [Steven Swafford](https://gist.github.com/stevenswafford/393c6ec7b5375d5e8cdc)
- [Exploit-DB](https://www.exploit-db.com/google-hacking-database)