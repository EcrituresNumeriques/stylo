---
title: "Managing your references in BibTeX"
---

BibTeX is the format (.bib) accompanying one of the oldest bibliographic reference management programs of the same name. This format enables bibliographic references to be described, stored and sorted in plain text files. It can be used to create bibliographic reference databases. When a Stylo article is compiled, the tool retrieves the references from the file (.bib) and places them in the appropriate places, both in the text and in the bibliography, according to the bibliographic style selected.

The structure of a BibTeX reference is relatively simple. Its general form looks like this:

```
@document{citation-key,
    required-fields = ,
    [optional-fields] = ,
}
```

Withing Stylo's bibliographic reference manager, we have access to a raw mode that allows us to view and edit reference data in BibTeX. This is a toggle button located in "Bibliography". You can also add a reference directly in BibTeX using the "Add reference" button.

**Warning:** If you manually correct your raw BibTex in the Stylo editor, this will not modify your bibliographic entry in the associated Zotero collection. Make sure you also edit your source in Zotero if you plan to reload your collection.

Example of a reference in BibTeX :

```
@article{sternCrystalsKnowledgeProduction2015,
  title = {Crystals of {{Knowledge Production}}. {{An Intercontinental Conversation}} about {{Open Science}} and the {{Humanities}}},
  author = {Stern, Niels and Gu{\'e}don, Jean-Claude and Jensen, Thomas Wiben},
  year = {2015},
  month = oct,
  journal = {Nordic Perspectives on Open Science},
  volume = {1},
  pages = {1--24},
  issn = {2464-1839},
  doi = {10.7557/11.3619},
  urldate = {2025-01-29},
  abstract = {In this article two scholars engage in a conversation about open access and open science in research communication with a specific focus on the Humanities.~The two scholars have very different points of departure. Whereas Jean-Claude Gued{\'o}n has been a professor of Literature in North-America for many years and part of the open access movements since its beginning, Thomas Wiben Jensen is in the early part of his carreer and fairly new to the concept of open access.~The conversation begins with a focus on the Danish national strategy for open access and this strategy's consquenses for the journal NyS where Thomas Wiben is part of the editorial board. However, the conversation brings the reader on an unexpected journey through the history of science communication and through alternative ways of understanding knowledge production as frozen moments or crystals in the Great Conversation of science.It is the hope of the editor and the contributors that the conversation can lead to a debate about innovative ways of communicating and distributing scientific results.},
  copyright = {Copyright (c) 2015 Niels Stern, Jean-Claude Gu{\'e}don, Thomas Wiben Jensen},
  langid = {english}
}
```

The declaration of this structure comprises several elements.

- The first element is the type of document to be indexed, of which there are 17. A BiTex entry always begins with an asterisk (@), followed by the document type. In this example, it's an article.
- The second element is called the key. In this example, it's this part: `{vitali-rosati_marcello_ecrire_2020,`. This is used to cite the document in the article.
- The third element is the bibliographic field. For example, title, url, athor, etc. Descriptors are used to assign information to declared documents. Depending on the type of document declared, some descriptors are required, while others are optional. BibTeX offers a finite set of descriptors that can be used to fill in the data of a reference. The use of descriptors is not “open” either: in BibTeX, each document type has predetermined, required and optional descriptors.

Here are the 17 document types and their associated bibliographic fields:

|Entry type|Document|Required fields|Optional fields|
|---|---|---|---|
|`@article`|Journal article|author, title, journal, year|language, volume, number, pages, month, note, url|
|`@book`|Book|author ou editor, title, publisher, year|language, edition, series, address, month, volume, number, note, url|
|`@booklet`|Small printed and bound book, without named publisher|title|author, language, howpublished, organization, address, month, year, note, url|
|`@electronic`|Online document or web page|-|author, month, year, title, language, howpublished, organization, address, note, url|
|`@inbook`|Chapter or section of a book, usually untitled|author ou editor, title, publisher, year|language, edition, series, address, month, volume, number, chapter, type, pages, note, url|
|`@incollection`|Part of a book with title|author, title, booktitle, year|language, edition, series, editor, address, publisher, month, volume, number, chapter, type, pages, note, url|
|`@inproceedings`|Presentation at a conference, symposium, etc.|author, title, booktitle, year|intype, language, series, editor, volume, number, organization, address, publisher, month, paper, type, pages, note, url|
|`@proceedings`|Collection of conference proceedings|title, year|editor, language, series, volume, number, organization, address, publisher, month, note, url|
|`@manual`|Technical documentation|title|author, language, edition, howpublished, organization, address, month, year, note, url|
|`@masterthesis`|Master's thesis|author, title, school, year	|language, type, address, month, note, url|
|`@patent`|Patent|nationality, number, year or yearfiled|author, title, language, assignee, address, type, day, dayfiled, month, monthfiled, note, url|
|`@periodical`|Journal or magazine|	title, year|editor, language, series, volume, number, organization, month, note, url|
|`@phdthesis`|PhD thesis|author, title, school, year|language, type, address, month, note, url|
|`@standard`|Published standard|title, organization or institution|author, language, howpublished, type, number, revision, address, month, year, note, url|
|`@techreport`|Technical report|	author, title, insitution, year	|language, howpublished, address, number, type, month, note, url|
|`@unpublished`|Unpublished document|author, title, note|language, month, year, url|
|`@misc`|Any other type of document|-|author, title, language, howpublished, organization, address, pages, month, year, note, url|
