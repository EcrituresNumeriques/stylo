---
title: Dissertations and theses
---

Stylo lets you create documents more complex than simple articles, such as dissertations or theses; this feature is called **Corpus**.

**Please note: this option is not yet fully functional, and we recommend that you wait for future updates before using it as a final rendering.**

## Basics

A dissertation is made up of one or more Pen documents placed end-to-end.

- These documents may be chapters or parts of the brief.
- They are grouped together in a brief using the same _[tag]_, which must be associated with each Pen document.
- Each chapter or part therefore functions as a Stylo document:
 - it has its own metadata and bibliography.
  - it can be shared as such (annotation, preview, etc.). It is when the dissertation is exported that the different parts are edited together.
- Dissertation metadata is that of the first document.

**Documents within a dissertation are arranged in alphabetical order; the easiest way to control the order is to place a number at the beginning of the name of each document concerned (note that the document name must not be confused with the document title entered in the metadata).**

## Some special features

### Title levels

Your dissertation or thesis may be structured in parts and chapters, or in chapters only. **Part** titles must be **level 1 titles** (example: `# Part 1: my part title`) and **chapter** titles must be **level 2 titles**. In the case of a thesis structured in chapters only, **chapter** titles will be **level 1 titles** (example: `# my chapter title`).

When exporting, you can declare the organization of your dissertation:

1. **In parts and chapters**
2. **In chapters only**

### Bibliography

By default, the bibliography generated is that of all the references cited or present in the various articles that make up the dissertation.

But it is also possible to structure this bibliography: in a dissertation or thesis, the bibliography is often divided into different sections. Stylo allows you to create a bibliography organized into subsections. Here are the two steps to follow:

1. In the dissertation metadata, declare the different sections of the bibliography. To do this, set the metadata to YAML mode.

![YAML](/uploads/images/refonte_doc/YAML.png)

Then at the end, before `---`, add the following lines:

```yaml
subbiblio:
 - key: pratique
 title: Pratique littéraire
 - key: theorie
 title: Théorie
```

The structure is as follows:
- `key` is the “section key”, in other words a label that will be used in the next step.
- `title` will be your bibliography section title, as it will be displayed in the dissertation.

2. For each bibliographic reference concerned, add in the `keywords` field the section key (e.g. `practice` or `theory`). This can be done either in Zotero or in Stylo directly, by editing the BibTeX.

### Dissertation metadata

_In a future version, the “Thesis” interface will feature a metadata editor for dissertation metadata._

In this version of Stylo, dissertation metadata will be that of the first document declared. Other metadata will be ignored. **Subdivisions of the bibliography** must therefore be declared in the first document of the dissertation.

## Export

The dissertation is exported using a dedicated LaTeX template. It corresponds to the Université de Montréal dissertation and thesis template. You can do this via [this page dedicated to exports](https://export.stylo.huma-num.fr/).

Other templates will be available in the near future.

Several options are available:

1. Format of exported document
2. Bibliographic style
3. Table of contents
4. Numbering (or not) of sections and chapters
5. Structure of dissertation: in parts and chapters, or in chapters alone

To customize the PDF export, it is possible to insert LaTeX code into Markdown content (excluding metadata).
