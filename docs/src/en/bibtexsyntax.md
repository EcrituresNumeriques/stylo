---
title: "Writing in BibTeX"
---

BibTeX is the format (`.bib`) accompanying one of the oldest bibliographic reference management programs of the same name.
This format enables bibliographic references to be described, stored and sorted in plain text files.
It can be used to create bibliographic reference databases (as is the case with [Ebib](https://joostkremers.github.io/ebib/), for example).

The structure of a BibTeX reference is relatively simple.
Its general form looks like this:

```bib
@document-type{quote-clef,
    fields-required,
    [optional-fields],
}
```

Within Stylo's bibliographic reference manager, we have access to a raw mode that allows us to view and edit reference data in BibTeX.

![Example reference in BibTeX](/uploads/images/BibliographieRawBibTeX-V2.png)

The declaration of this structure comprises several elements. 
The first element is the type of document to be indexed, of which there are 17 different types.
Next, a set of descriptors are used to assign information to the declared documents.
Depending on the type of document declared, some descriptors are required, while others are optional.
BibTeX offers a finite set of descriptors that can be used to fill in the data of a reference.
The use of descriptors is not "free" either: in BibTeX, each type of document has predetermined, required and optional descriptors.

Many of these are listed in the following table.

Document type | Document concerned | Fields required | Optional fields
--|--|--|--
@article | Review article | author, title, journal, year | language, volume, number, pages, month, note, url
@book |Book | author ou editor, title, publisher, year | language, edition, series, address, month, volume, number, note, url
@booklet | Small printed and bound book, without named publisher | title | author, language, howpublished, organization, address, month, year, note, url
@electronic | Online document or web page | - | author, month, year, title, language, howpublished, organization, address, note, url
@inbook |Chapter or section of a book, usually untitled | author ou editor, title, publisher, year | language, edition, series, address, month, volume, number, chapter, type, pages, note, url
@incollection | Part of book with title | author, title, booktitle, year | language, edition, series, editor, address, publisher, month, volume, number, chapter, type, pages, note, url
@inproceedings | Presentation at a conference, symposium, etc. | author, title, booktitle, year | intype, language, series, editor, volume, number, organization, address, publisher, month, paper, type, pages, note, url
@proceedings | Collection of conference proceedings | title, year | editor, language, series, volume, number, organization, address, publisher, month, note, url
@manual | Technical documentation | title | author, language, edition, howpublished, organization, address, month, year, note, url
@masterthesis | Master's thesis | author, title, school, year | language, type, address, month, note, url
@patent |Patent | nationality, number, year or yearfiled | author, title, language, assignee, address, type, day, dayfiled, month, monthfiled, note, url
@periodical | Review or magazine | title, year | editor, language, series, volume, number, organization, month, note, url
@phdthesis | Phd's thesis | author, title, school, year | language, type, address, month, note, url
@standard | Published standard | title, organization or institution | author, language, howpublished, type, number, revision, address, month, year, note, url
@techreport | Technical report | author, title, insitution, year | language, howpublished, address, number, type, month, note, url
@unpublished | Unpublished document | author, title, note | language, month, year, url
@misc | Other types of document | - | author, title, language, howpublished, organization, address, pages, month, year, note, url