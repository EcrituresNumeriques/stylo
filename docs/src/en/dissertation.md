---
title: Dissertations and theses
---

Stylo can be used to create more complex documents than articles, such as dissertations or theses, this feature is called **Corpus**.

**Warning: this option is not fully functional, we recommend that you wait for future updates before using it as a final rendering.**

## General principles

> A dissertation is made up of one or more Stylo documents put together.

- These documents can be chapters or parts of the dissertation.
- They are gathered together in a dissertation using the same _[tag]_ label, which must be associated with each Stylo document.
- Each chapter or part operates as a Stylo document:
  - it has its own metadata and bibliography.
  - it can be shared as such (annotation, preview, etc.). It is at the time of exporting the dissertation that the different parts are edited together.
- The metadata of the complete dissertation are those of the first document.

**The documents in a dissertation are classified in alphabetical order. The simplest solution to control the order is to place a number at the beginning of the name of each document concerned (the name of the document must not be confused with the title of the document entered in the metadata).**

## Special characteristics

### Title levels

Your dissertation or thesis can be structured into parts and chapters or chapters only.  The **part** titles must be **level 1 titles** (example: `# Part 1: my part title`) and the **chapter** titles will then be **level 2 titles**. In the case of a dissertation structured in chapters only, the **chapter** titles will be **level 1 titles** (example: `# my chapter title`)

At the time of export, you will be able to declare the organization of your dissertation:

1. **In parts and chapters**
2. **In chapters**


### Bibliography
By default, the bibliography generated is composed of all the references cited or present in the various articles that make up the dissertation.

But it is also possible to structure this bibliography: in a dissertation or a thesis, the bibliography is often divided into different sections. Stylo allows you to create a bibliography organized in sub-sections. Here are the two steps to follow:

1. In the metadata of the dissertation, you must declare the different sections of the bibliography. To do this, switch the metadata to raw mode

![Rawmode](/uploads/images/alpha_rawmode.png)

Then at the end, before `---`, add the following lines:

```yaml
subbiblio:
  - key: pratique
    title: Pratique littéraire
  - key: theorie
    title: Théorie
```

The structure is as follows:
- `key`  is the “section key”, or in other words a tag that will be used in the next step.
- `title` will be your bibliography section title, as it will be displayed in the thesis.

2. For each of the relevant bibliographic references, add in the `keywords` field the section key (for example `practice` or `theory`). This step can be done either in Zotero or in Stylo by editing the bibtex directly

### Dissertation metadata
_In a future version, the “My Books” interface will offer a metadata editor for thesis metadata._

In this version of Stylo the metadata of the dissertation will be those of the first declared document. The other metadata is ignored. **The subdivisions of the bibliography** must therefore be declared in the first document of the dissertation.

### Export
The export of the thesis is done through a dedicated LaTeX template. It corresponds to the thesis template of the University of Montreal.

More templates will be available soon.

Several options are available:

1. Exported document format
2. Bibliographic style
3. Table of contents
4. Numbering (or not) of sections and chapters
5. Structure of the dissertation: in parts and chapters, or in chapters only

### Customize the pdf export
It is possible to insert LaTeX code in the Markdown content (excluding metadata).
