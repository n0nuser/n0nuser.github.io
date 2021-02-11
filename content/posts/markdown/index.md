---
title: "Markdown Cheatsheet"
description: "How to easily write beautiful formatted text with Markdown."
date: 2020-10-11
lastmod: 2020-10-11
author: "Pablo Jesús González Rubio"
cover: "post.png"
coverAlt: "*This post* markdown."
toc: true
tags: ["Cheatsheet"]
---


## Introduction

You can download the cheatsheet as a pdf from [here](./markdown.pdf)!

Writing a Word document sometimes might be a bit boring and tough as you have to select the text to be **bold**, _cursive_, or to create a bulleted/numbered list and such. With Markdown everything is reduced to a simple text file such as the typical `txt` file, but formatted. One example is the above one, which is this exact page!

## Formatted text

I would like to write this as simple as possible to have it at a glance whenever it's read again.

### Headers

They are written with `#` and as in a Word, they represent a Title, Subtitle, and so forth.

{{< img "headers.png" "Headers" "border" >}}

### Paragraphs

```md
Writing normal text will result in a paragraph
If you write it down it's added to the paragraph

But if you write with a breakline between, it's a new paragraph.
```

Writing normal text will result in a paragraph
If you write it down it's added to the paragraph

But if you write with a breakline between, it's a new paragraph.

### Line Dividers

```md
Text is separated with asterisks

---

or with underscores.

---

Like this.
```

Text is separated with asterisks

---

or with underscores.

---

Like this.

### Emphasis

```md
This text is in _italic_, this _too_
This text is in **bold**, this **too**
This text is in **_italic bold_**, this **_too_**
But also this text is in _**italic bold**_, this one _**too**_
The order of the text _\_DOES matter_\_, it keeps a LIFO pattern.
```

This text is in _italic_, this _too_

This text is in **bold**, this **too**

This text is in **_italic bold_**, this **_too_**

But also this one is in _**italic bold**_ and this one _**too**_

The order of the underscores and asterisks _\_DOES matter_\_, it keeps a LIFO pattern.

### Link

```md
This is a link to [Google](https://www.google.com)

They are always wrapped in [text](link)
```

This is a link to [Google](https://www.google.com)

They are always wrapped in [text](#link)

### Images

```md
This is almost the same as a link, but instead it has an ! in front of the text.

![Here we have a cute kitten](https://cdn.mos.cms.futurecdn.net/vChK6pTy3vN3KbYZ7UU7k3-1200-80.jpg)
```

This is almost the same as a link, but instead it has an ! in front of the text.

![Here we have a cute kitten](https://cdn.mos.cms.futurecdn.net/vChK6pTy3vN3KbYZ7UU7k3-1200-80.jpg)

### Tables

```md
| Column 1 | Column 2 |
| :------: | :------: |
| Data 1_1 | Data 1_2 |
| Data 2_1 | Data 2_2 |
```

| Column 1 | Column 2 |
| :------: | :------: |
| Data 1_1 | Data 1_2 |
| Data 2_1 | Data 2_2 |

You don't need to write it that beautiful, the table below is also valid:

```md
| Column 1 | Column 2 |
|:-:|:-:|
| Data 1_1 | Data 1_2 |
| Data 2_1 | Data 2_2 |
```

I have to note that `|:-:|` means centered column, whereas `|:-|` means aligned to left, and `|-:|` means to right.

There's [this page](https://www.tablesgenerator.com/markdown_tables) that makes it even easier for you.

### Blockquotes

```md
> In blockquotes text is written in the same quote even
> if the text it's in different lines.

This is a break

> This is **_another quote_**
```

> In blockquotes text is written in the same quote even
> if the text it's in different lines.

This is a break

> This is **_another quote_**

### Code blocks with syntax highlighting

```md
Inline code blocks are done with backticks like this: `Hello!`
```

**_Inline code blocks_** are done with backticks like this: `Hello!`

<pre>
```py
while(True):
    text = "This is a Python Code block with syntax highlighted"
    print(text)
```
</pre>

```py
while(True):
    text = "This is a Python Code block with syntax highlighted"
    print(text)
```

You can still use a block code without syntax highlighing by just removing the syntax language!

### Lists

```md
- This is
- an **_unordered_**
- list.

---

1. While this
2. is a **_numbered_**
3. list.

---

1. This is also
1. a **_numbered_** list
1. but easier!
```

- This is
- an **_unordered_**
- list.

---

1. While this
2. is a **_numbered_**
3. list.

---

1. This is also
1. a **_numbered_** list
1. but easier!

They have to be consecutive lines or this can happen (unless you put a line divider):

```md
- This is not

- a list
```

- This is not

- a list

### Raw HTML

```html
Markdown renders its language as HTML so in the end, it also accepts raw HTML.
One use case might be a breakline in a paragraph to separate paragraphs.<br />
Is better explained with a long text like this where I've used a `<br />`.
```

Markdown renders its language as HTML so in the end, it also accepts raw HTML. One use case might be a breakline in a paragraph to separate paragraphs.<br> Is better explained with a long text like this where I've used a `<br>`.

In the [Code Block section](./#code-blocks-with-syntax-highlighting) I have used a `<pre></pre>` section to be able to represent what a code block really is!

## End

While there are different flavors of Markdown depending on the app here is covered all of the standard Markdown and what I regularly use within the posts.

There are good multiplatform apps that render Markdown while writing like [Typora](https://typora.io/) if you don't like writing it in plain text (like I do 😝).

I also recommend viewing the source code of ReadMe's in Github to understand how some of them are done!
