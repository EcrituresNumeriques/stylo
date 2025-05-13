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

Within Stylo's bibliographic reference manager, we have access to a raw mode that allows us to view and edit reference data in BibTeX. It is located in the left-hand pane, under “Bibliography”, “Management”, then in the “BibTex raw” tab.

**Warning:** If you manually correct your raw BibTex in the Stylo editor, this will not modify your bibliographic entry in the associated Zotero collection. Make sure you also edit your source in Zotero if you plan to reload your collection.

Example of a reference in BibTeX :

```
@article{vitali-rosati_marcello_ecrire_2020,
	title = {Écrire les {SHS} en environnement numérique. {L}’éditeur de texte {Stylo}},
	volume = {2020},
	url = {https://intelligibilite-numerique.numerev.com/numeros/n-1-2020/18-ecrire-les-shs-en-environnement-numerique-l-editeur-de-texte-stylo},
	doi = {10.34745/numerev_1697},
	language = {French},
	number = {1},
	urldate = {2025-03-06},
	journal = {Revue Intelligibilité du numérique},
	author = {{Vitali-Rosati Marcello} and Nicolas, Sauret and Antoine, Fauchié and Margot, Mellet},
	year = {2020},
	note = {Publisher: Revue Intelligibilité du numérique, n°1/2020},
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
