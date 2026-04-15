---
title: "Memoirs and Theses"
header-includes: |
  <style> 

  .highlight-brush-blue {
  position: relative;
  display: inline;
  white-space: nowrap;
  z-index: 1;}

  .highlight-brush-blue::before {
    content: '';
    position: absolute;
    left: -3px;
    right: -3px;
    top: 10%;
    bottom: 5%;
    background: #88b9bb;
    border-radius: 2px 4px 3px 2px / 3px 2px 4px 3px;
    transform: rotate(-0.4deg) skewX(-1deg);
    z-index: -1;
    clip-path: polygon(
      0% 15%, 3% 5%, 8% 0%, 20% 3%, 35% 1%,
      50% 4%, 65% 0%, 80% 3%, 92% 0%, 100% 8%,
      98% 30%, 100% 55%, 99% 75%, 100% 90%,
      95% 100%, 80% 96%, 65% 100%, 50% 97%,
      35% 100%, 20% 97%, 8% 100%, 2% 92%,
      0% 70%, 1% 45%
    );}

  </style>

---

## Overview and Tutorial

A memoir or thesis is a **corpus** made up of as many **chapters** as there are **Stylo articles**.

Here are the steps to follow:

- Write one Stylo article per chapter
- Create a corpus of type `Thesis`

![Thesis-type corpus](docs/uploads/images/refonte_doc/thesiscorpus.png)

- Gather all the articles corresponding to your chapters into this corpus
- Order them by dragging them

![Ordering articles in a corpus](docs/uploads/images/refonte_doc/classer.gif)

Each chapter or section therefore works like a Stylo document:

- it has its own metadata
- it has its own bibliography
- it can be shared as such (annotation, preview, etc.). It is at the point of exporting the memoir that the different parts are compiled together

## A Few Things to Keep in Mind When Writing

### Where to fill in the metadata?

Metadata relating to the chapter should be entered at the **article** level. A special form is available that uses the same YAML keys as the article, but renames and sorts the form fields so that only relevant fields are visible. The only important metadata, and the only one that must be filled in *at minimum*, is the title.

![Chapter metadata](docs/uploads/images/refonte_doc/titlechap.png)

Global metadata for the thesis should be entered at the **corpus** level. Selecting the "Thesis" type will display a specialised form. Don't forget to *save*, rather than simply closing the modal.

![Corpus metadata](docs/uploads/images/refonte_doc/corpusmetadata.gif)

### Heading levels

As is standard in Stylo, the main title of the chapter/article is the one entered in the metadata. It is therefore important to fill in the title field *at minimum*. After that, use two hash symbols `##` for the first level of section within the chapter.

### Bibliography

By default, the generated bibliography includes all references cited or present across the various articles making up the memoir or thesis. The export module stacks the BibTeX files from each article and removes duplicates as needed. References will appear in alphabetical order under the heading *Bibliography* at the end.

It is also possible to divide the bibliography into multiple sections:

1. For each bibliographic item, add a keyword in the keyword field to identify the bibliography section. It must be a single word with no hyphens (for example `prim` for primary references and `sec` for secondary references). This step can be done in Zotero or in the raw BibTeX.

![Tags in Zotero](docs/uploads/images/refonte_doc/zotero.png)

2. Create an article titled "Bibliography" and add it as the last chapter of the corpus.
3. For each subsection, add a level-2 heading (`##`) and the following code snippet:

```
::: {#refs-<section-identifier-key>}
:::
```

Example:

```markdown
## Primary Corpus

::: {#refs-prim}
:::

## Secondary References

::: {#refs-sec}
:::
```

<pre>
## Primary Corpus

::: {#refs-<span class="highlight-brush-blue">prim</span>}
:::

## Secondary References

::: {#refs-<span class="highlight-brush-blue">sec</span>}
:::
</pre>

which corresponds to the following BibTeX:

```bibtex
@article{wevers_visual_2020,
	title = {The visual digital turn: {Using} neural networks to study historical images},
	volume = {35},
	issn = {2055-7671},
	shorttitle = {The visual digital turn},
	url = {https://doi.org/10.1093/llc/fqy085},
	doi = {10.1093/llc/fqy085},
  ...
	keywords = {sec},
}
```

<pre>
@article{wevers_visual_2020,
	title = {The visual digital turn: {Using} neural networks to study historical images},
	volume = {35},
	issn = {2055-7671},
	shorttitle = {The visual digital turn},
	url = {https://doi.org/10.1093/llc/fqy085},
	doi = {10.1093/llc/fqy085},
  ...
	<span class="highlight-brush-blue">keywords = {sec},</span>
}
</pre>

### Acknowledgements

Acknowledgements can be injected automatically into the template. A dedicated field will soon be available in the template's metadata form. In the meantime, they can be added manually in the raw YAML.

```yaml
'@version': '1.0'
abstract: here is the abstract
ackowledgements: |
  thanks to Pierre
  thanks to Paul
  thanks to Jacques
```

## Exports

### Print Version

The PDF export of the memoir or thesis is done via the export module: https://export.stylo.huma-num.fr/

It uses a LaTeX template that meets the requirements of most UdeM departments (and we strongly encourage you to verify this). The choice of the *Old Standard* font is unconventional but allows Greek characters to be printed.

Here are the steps:

1. Select Theses/Memoirs
2. Give the export a title and look up the corpus identifier <!--link: is there a tutorial for finding the corpus ID?-->
3. Select the options

- `with table of contents` to display the table of contents
- `with all citations` to include all items from your bibliography collection in the final bibliography, even references not cited in the text
- `with linked citations` to add a link on each cited reference pointing to the bibliography

### HTML / SSG

Exporting all articles from a corpus is done in the corpus manager. Click the 🖨 icon and select "HTML" as the format. This creates an archive containing one standalone HTML file per article. The same operation, selecting "original files (md, yaml, bib)", creates an archive containing the source files for each article. These can then be inserted into a structure that, using an SSG (Quarto, Jekyll, Hugo), generates a website.

## Context and Caveats

Stylo can be a good companion for writing a memoir or thesis as part of an approach that seeks independence from proprietary environments. Markdown has the advantage of being lightweight in its markup, which allows you to write while avoiding the noise that more verbose syntaxes like LaTeX or HTML can introduce. Stylo also facilitates collaboration with your reviewers and handles the formatting (styling) of the bibliography, using styles from the Zotero library. Finally, its many export options open the door to multi-format publication.

That said, a memoir or thesis is a complex document whose formatting requirements go beyond what Stylo and Markdown can offer for the final printed version. The PDF export of a thesis corpus currently has a number of limitations. The most significant concerns heading levels: it is not possible to distinguish headings of the same level that are unnumbered (such as introductions or conclusions), nor to create parts that encompass chapters. Stylo also does not handle the automatic creation of indexes and glossaries^[it is possible to insert LaTeX code in the Markdown, but this syntax is cumbersome. The template does not support the printing of these two appendices]. Presentation criteria may also vary from one institution to another. The layout of the preliminary pages may not suit the amount of information you wish to include there. Finally, it is not possible to include appendices.

For these reasons, and even if future developments will address some of these shortcomings, we advise against relying on a PDF export directly from Stylo for your final submission. However, Stylo does generate a well-structured and commented `.tex` file, which makes a good customisable starting point. Feel free to contact us: we would be happy to help you get started with LaTeX in order to produce a PDF that meets your expectations.