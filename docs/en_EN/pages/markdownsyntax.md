# Markdown syntax

---

## Titles

- Level 1 title (the title of the article). This must be completed in the metadata
- Level 2 titles (titles of each section) are preceded by 2 `#`. For example: `## Introduction`
- Level 3 titles (subsections) are preceded by 3 `#`. For example: `### Mon titre de sous-section` 
- And so on (level 4, 4 `#`, etc.). 

## Footnotes

The footnotes can be in the body of the text (inline) or with a footnote number that refers to the bottom of the article.

Examples:

```
Here is my text^[An inline footnote.\].
```

Will give:

Here is my text<sup><a href="syntaxemarkdown.md#note-1" id="#note-1-b">1</a></sup>.

Or:

```
Here is my text[^2].

 [^2]: a footnote with a number and reference.
```

Will give:

Here is my text<sup><a href="syntaxemarkdown.md#note-2" id="#note-2-b">2</a></sup>.


## Italics and bold

- Italics can be created with ```_``` before and after the word or expression in italics. For example:

```
Here is a _word_ in italics. 
```

Will give: 

Here is a *word* in italics. 

- Bold can be created with two ```**``` before and after the word or expression in bold. For example:
```
Here is a **word** in bold. 
```

Will give:

Here is a **word** in bold.


## Images
An image can be integrated into a document written in the Markdown markup language according to the following model:

- An exclamation mark `!` ;
- Followed by square brackets `[]` containing the image description ;
- Then brackets `()` containing the image path or address. 

Here is an image, in this case the logo for W3C (World Wide Web Consortium) :

![Logo du W3C composé de la lettre W en bleu, du chiffre 3 en bleu et de la lettre C en noir](https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/W3C_icon.svg/212px-W3C_icon.svg.png)

And here is the corresponding markdown:

```
![W3C logo containing the letter W in blue, the digit 3 in blue and the letter C in black](https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/W3C_icon.svg/212px-W3C_icon.svg.png)
```

## Links
The links can be created by distinguishing:

- The link, that is, the word or expression indicated as a link, with square brackets `[]`;
- And the target, the destination URL, with brackets `()`.

Here is [a link to a Wikipedia page](https://en.wikipedia.org/wiki/Hyperlink), and the corresponding markers:

```
[a link to a Wikipedia page](https://en.wikipedia.org/wiki/Hyperlink)
```

## Citations
A citation can be semantically indicated using the following markup: a closing square bracket followed by a space at the beginning of a paragraph `> `. Here is a citation example: 

> Clicking on a hypertext or hyperlink allows navigation to another place on the page, another page or website that the author judges relevant.
> Source : [Wikipedia](https://en.wikipedia.org/wiki/Hyperlink)

And here are the corresponding markers:

```
> Clicking on a hypertext or hyperlink allows navigation to another place on the page, another page or website that the author judges relevant.
> Source : [Wikipedia](https://en.wikipedia.org/wiki/Hyperlink)
```

## Unbreakable space

Unbreakable spaces are represented by a midpoint: `·`. Example: `How are you·?` They can be added by typing `Ctrl` + `Shift` + `Space`.

It is also possible to use an unbreakable space in ASCII `&nbsp;`.

Note that if your markdown source comes from the pandoc docx (or odt) conversion to markdown, unbreakable spaces will be conserved and presented in Stylo in the form of a midpoint.

## Semantic Markup

Semantic markup allows specifying the function of a word, an expression or a paragraph.

Stylo allows free semantic markup: each author can define their own semantic structure according to their particular needs. It can then be implemented in export templates or custom style sheets (see the section
[Personalise your export](pages/mesarticles.md).

The markdown syntax for semantic markup is as follows: `[term to markup\] {.category}`.

For example: `We can consider this [rupture]{.concept} emblematic of...` identifies the term `rupture` as a `concept`.

The following markdown text:

```markdown
Here is the [article's fundamental assertion]{.assertion}.
```

gives in HTML:

```html
Here is the <span class="assertion"> article's fundamental assertion</span>
```

To markup an entire paragraph, one uses the following syntax:

```md
::: {.assertion}

My paragraph that contains the article's assertion.

:::
```

Which gives in HTML:

```html
<div class="assertion">
<p> My paragraph that contains the article's assertion.</p>
</div>
```

Stylo preview implements the display of the following semantic classes:

- Assertion
- Description
- Example
- Concept
- Definition
- Epigraph
- Dedication
- Credits
- Source

It is possible to mark up a textual element with many attributes. For
example:

```markdown

::: {.infogeo}

[Athens]{.ville id="https://www.wikidata.org/wiki/Q1524" gps="37.58.46N, 23.42.58E"} is the capital of Greece.

:::
```

gives in HTML:

```html
<div class="infogeo">
<p><span id="https://www.wikidata.org/wiki/Q1524" class="ville" data-gps="37.58.46N, 23.42.58E">Athens</span> is the capital of Greece.</p>
</div>
```

It is also possible to use this semantic markup to structure the data in RDFa, as in these two examples:

```markdown

Text author: [John Dewey]{property="dc:creator"}
```

gives in HTML:

```html

<p>Text author: <span data-property="dc:creator">John Dewey</span></p>
```

Second example:

```markdown

John Dewey is born on [20 October 1859]{property="dc:date"content="1859-10-20"}.

```

Gives in HTML:

```html

<p>John Dewey is born on <span property="dc:date" content="1859-10-20">20 October 1859</span></p>

```

## Tables

Tables are created as follows

- `|` Separates columns
- A single line break separates the links
- A second line defines the column alignment:
  - `:--` aligns column to the right
  - `:-:` aligns column to the centre
  - `--:` aligns column to the left

For example, the syntax:

```markdown
|Surname|First name|Birth date|Birthplace|Eye colour|
|:--|:--|:-:|:-:|--:|
|Bianchini|Francesco|3-1-1920|Scandicci|Blue|
|Dupont|Pierre|7-9-1989|Chicoutimi|Green|
|Gianna|Bienfaisant|9-10-2005|Florence|Brown|
```

Gives:

|Surname|First name|Birth date|Birthplace|Eye colour|
|:------ |:---|:-:|:-:|---:|
|Bianchini|Francesco|3-1-1920|Scandicci|Blue|
|Dupont|Pierre|7-9-1989|Chicoutimi|Green|
|Gianna|Bienfaisant|9-10-2005|Florence|Brown|

1. <span id="note-1">A footnote with a number and reference. <a href="syntaxemarkdown.md#note-1-b">â†©</a></span>
2. <span id="note-2">An inline footnote.<a href="syntaxemarkdown.md#note-2-b">â†©</a></span>
