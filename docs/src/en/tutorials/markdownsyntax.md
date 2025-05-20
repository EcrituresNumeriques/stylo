---
title: Writing in Markdown
---

## Title levels

- The level 1 title - i.e. the article title - must be entered in the metadata.
- Level 2 titles (section titles) are preceded by two #s. For example: ## Introduction.
- Level 3 titles (sub-sections) are preceded by 3 #. For example: ### My subsection.
- And so on (level 4, ####, etc.).

## Paragraphs

To create paragraphs, leave a blank line between your blocks of text.

## Footnote 

There are several ways of inserting footnotes into your text. Footnotes can be inserted in the body of the text (inline) or with a footnote callout and backlink at the bottom of the article.

Examples:

```
Here's my text^[An inline footnote.].
```

will render :

Here's my text<sup><a href="syntaxemarkdown.md#note-1" id="#note-1-b">1</a></sup>.

*See end of article for footnote*.

Alternatively:

```
Here's my text[^2].

[^2]: A footnote with callout and cross-reference.
```

will render :

Here's my text<sup><a href="syntaxemarkdown.md#note-2" id="#note-2-b">2</a></sup>.

*See end of article for footnote*.

## Italics and bold 

- Italics are marked with _ or * before and after the italicized word or phrase. For example&nbsp;:

```
Here's an italicized _word_.
```

This gives:

Here is a word in italics

- Bold is tagged with two `__` or two `**` before and after the bold word or phrase. For example&nbsp;:

```
Here is a **word** in bold
```

This gives:

Here is a **word** in bold

- To use bold and italic at the same time, simply add three `*` or three `_` before and after a word. You can also use `_**` or `*__` on either side of the word. 

```
Here is a ***word*** in bold italics

Other _**example**_

```

This gives:

Here is a ***word*** in bold and italics

Other _**example**_

## List 

You can make lists using dashes `-`, a `+`, a `*` or numbers followed by a dot `1.`. To create a list nested within another, simply add an indent before your dash. **Warning**, you must leave an empty line before your list. 

```
- This is 
    + a 
    * list

or

1. Here is 
2. a 
3. list
```

This gives: 

- This is 
    + one 
    * list

or

1. Here is 
2. a 
3. list

## Images 

An image can be integrated into an article in the following way:

- An exclamation mark !
- followed by square brackets [] containing the image description ;
- and brackets () containing the image path or link.

Here is the markup:

```
![IMAGE Markdown logo](https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Markdown-mark.svg/langfr-130px-Markdown-mark.svg.png)
```

The result is:

![IMAGE Markdown logo](/uploads/images/refonte_doc/Markdown-mark.svg.png)

**Please note: images must be in PNG format (`.png`), which is required for PDF export.

- To insert a link to an image, add two square brackets `[]` around the image markup, followed by a link in parentheses. 

```
[![IMAGE Markdown logo](https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Markdown-mark.svg/langfr-130px-Markdown-mark.svg.png)](https://fr.wikipedia.org/wiki/Markdown)
```

This gives: 

[![IMAGE Markdown logo](/uploads/images/refonte_doc/Markdown-mark.svg.png)](https://fr.wikipedia.org/wiki/Markdown)


## Line

To create a separating line, use three `***`, `---` or a series of underscores `_______` on a single line. 

For example:

```
***

---

______________
```

This gives: 

***

---

___

## Links

Links are marked by distinguishing:

- the link, i.e. the word or expression indicated as a link, with square brackets [] ;
- and the target, the destination URL, with parentheses ().

Here is [a link to a Wikipedia page](https://fr.wikipedia.org/wiki/Marcello_Vitali-Rosati), and the corresponding tags&nbsp;:

```
[a link to a Wikipedia page](https://fr.wikipedia.org/wiki/Marcello_Vitali-Rosati)
```

You can also use square brackets `<>` to insert a URL. 

```
Marcello Vitali-Rosati's blog is: <https://vitalirosati.com/>
```

This gives:

Marcello Vitali-Rosati's blog is the following: <https://vitalirosati.com/>

## Citations 

- A quotation can be indicated semantically by the following markup: a closing bracket followed by a space at the beginning of the paragraph `> `. It is also possible to have more than one paragraph in your quotation, simply by adding an empty line with a closing bracket. Here is an example of a quotation:

> A hypertext link or hyperlink allows you to click on it to go to another part of the page, another page or another site deemed relevant by the author. 
> 
> Source: [Wikipedia](https://fr.wikipedia.org/wiki/Hyperlien)

And here is the corresponding markup:

```
> A hypertext link or hyperlink allows you to click on it to go to another part of the page, another page or another site considered relevant by the author.
> 
> Source : [Wikipedia](https://fr.wikipedia.org/wiki/Hyperlien)
```

- A quotation can be nested within another quotation by using two closing square brackets.

> A hyperlink allows you to click on it to go to another part of the page, another page or another site deemed relevant by the author. 
> 
>> Source: [Wikipedia](https://fr.wikipedia.org/wiki/Hyperlien)

And here is the corresponding markup:

```
> A hypertext link or hyperlink allows you to click on it to go to another part of the page, another page or another site deemed relevant by the author.
> 
>> Source : [Wikipedia](https://fr.wikipedia.org/wiki/Hyperlien)
```

- You can use Markdown syntax inside your quotations, such as titles, italics, bold or hyphens. 

> Hyperlink
> A *hypertext* or __hyperlink__ link allows you to click on it to go to 
> 
> another part of the page, 
> another page or 
> another site considered relevant by the author. 
> 
> Source: [Wikipedia](https://fr.wikipedia.org/wiki/Hyperlien)

And here is the corresponding markup:

```
> ### Hyperlink
> A *hypertext* or __hyperlink__ link takes you to 
> 
> another part of the page, 
> another page or 
> another site considered relevant by the author. 
> 
> Source : [Wikipedia](https://fr.wikipedia.org/wiki/Hyperlien)
```

## Unbreakable space 

Non-breaking spaces are represented by a discrete dot: `-` or an orange rectangle ` `. 

They can be added with the ASCII `&nbsp;` non-breaking space, or by holding down the `Alt` key and typing `0160` or `255`.

## Tables

Tables are created using the following syntax:

- `|` separates columns
- a single line feed separates lines
- the second line defines the column alignment:
  - `:--` aligns column to the left
  - `:-:` aligns column to center
  - `--:` align column right

For example, the syntax:

```markdown
|Name|First name|Date of birth|Place of birth|Eye color|
|:--|:--|:-:|:-:|--:|
|Bianchini|Francesco|3-1-1920|Scandicci|Blue|
|Dupont|Pierre|7-9-1989|Chicoutimi|Green|
|Gianna|Bienfaisant|9-10-2005|Florence|Brown|
```

This gives:

|Name|First name|Date of birth|Place of birth|Eye color|
|:--|:--|:-:|:-:|--:|
|Bianchini|Francesco|3-1-1920|Scandicci|Blue|
|Dupont|Pierre|7-9-1989|Chicoutimi|Green|
|Gianna|Bienfaisant|9-10-2005|Florence|Brown|

## Semantic tagging 

Semantic markup allows you to specify the function of a word, phrase or paragraph.

Stylo allows free semantic markup: each author can define his or her own semantics according to his or her particular needs. This can then be implemented in export templates or custom style sheets (see section [Customize your export](/en/myarticles)).

The markdown syntax for semantic tagging is as follows: `[term to tag]{.category}`.

For example: `We can consider this [rupture]{.concept} emblematic of...` identifies the term `rupture` as a `concept`.

The following markdown text:

```
This is the [basic thesis of the article]{.thesis}.
```

In HTML, this gives:

```html
This is the <span class="thesis">basic thesis of the article</span>
```

To tag an entire paragraph, use the following syntax:

```
::: {.thesis}

My paragraph which contains a thesis of the article.

:::
```

In HTML, this gives:

```html
<div class="these">
  <p>My paragraph which contains a thesis of the article.</p>
</div>
```

The Stylo preview implements the display of the following semantic classes:

- these
- description
- example
- concept
- definition
- question
- epigraphe
- dedicace
- credits
- source

It is possible to tag a text element with several attributes. For example:

```
::: {.infogeo}

[Athens ]{.city id="https://www.wikidata.org/wiki/Q1524" gps="37.58.46N, 23.42.58E"} is the capital of Greece.

:::
```

In HTML, this gives:

```html
<div class="infogeo">
<p><span id="https://www.wikidata.org/wiki/Q1524" class="city" data-gps="37.58.46N, 23.42.58E">Athens</span> is the capital of Greece.</p>
</div>
```

It is also possible to use this semantic markup to structure data in RDFa. Here are two examples:

```
Text author: [John Dewey]{property="dc:creator"}
```

In HTML, this gives:

```html
<p>Text author: <span data-property="dc:creator">John Dewey</span></p>
```

Second example:

```
John Dewey was born on [October 20, 1859]{property="dc:date" content="1859-10-20"}.

```

In HTML, this gives:

```html
<p>John Dewey was born on<span property="dc:date" content="1859-10-20">October 20, 1859.</span></p>
```

## Escape characters

To display a special character that would normally be used for markup in an article written in Markdown, simply add a backslash before the character.

For example:

```
\+ With the addition of the backslash, the plus sign does not become an element of a list.
```

This gives:

\+ With the addition of the slash, the positive sign does not become an element of a list.

---

For further information, you can always consult other guides to Markdown syntax. We welcome any suggestions you may have for additions to our documentation. 

1. <span id="note-1">An inline footnote. <a href="#note-1-b">↩</a></span>
2. <span id="note-2">A footnote with callout and back-link. <a href="#note-2-b">↩</a></span>
