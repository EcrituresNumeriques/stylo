---
title: "Referencias sus citas en BibTeX"
---

BibTeX es el formato (.bib) que acompaña a uno de los programas de gestión de referencias bibliográficas más antiguos del mismo nombre. Este formato permite describir, almacenar y ordenar referencias bibliográficas en archivos de texto sin formato. Puede utilizarse para crear bases de datos de referencias bibliográficas. Cuando se compila un artículo Stylo, la herramienta recupera las referencias del archivo (.bib) y las coloca en los lugares adecuados, tanto en el texto como en la bibliografía, en función del estilo bibliográfico seleccionado.

La estructura de una referencia en BibTeX es relativamente sencilla. Su forma general es la siguiente

```
@documento{citation-key,
    campos obligatorios = ,
    [campos opcionales] = ,
}
```

Dentro del gestor de referencias bibliográficas de Stylo, renemos acceso a un modo sin procesar que nos permite ver y editar datos de referencia en BibTeX. Este botón se encuentra en "Bibliografía". También puede agregar una referencia directamente en BibTeX con el botón "Añadir referencia".

**Advertencia:** Si corrige manualmente su BibTex sin procesar en el editor Stylo, esto no cambiará su entrada bibliográfica en la colección Zotero asociada. Asegúrese de corregir también su fuente en Zotero si piensa recargar su colección.

Ejemplo de una referencia en BibTeX :

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

La declaración de esta estructura incluye varios elementos.

- El primer elemento es el tipo de documento que se desea indexar, de los cuales hay 17. Una entrada BiTex comienza siempre con un asterisco (@), seguido del tipo de documento. En este ejemplo, se trata de un artículo.
- El segundo elemento se denomina clave. En este ejemplo, es esta parte: `{vitali-rosati_marcello_ecrire_2020,`. Se utiliza para citar el documento en el artículo.
- El tercer elemento es el campo bibliográfico. Por ejemplo, título, url, athor, etc. Los descriptores se utilizan para asignar información a los documentos declarados. Dependiendo del tipo de documento declarado, algunos descriptores son obligatorios, mientras que otros son opcionales. BibTeX ofrece un conjunto finito de descriptores que pueden utilizarse para rellenar los datos de una referencia. El uso de descriptores tampoco es «libre»; en BibTeX cada tipo de documento tiene descriptores predeterminados, obligatorios y opcionales.

He aquí los 17 tipos de documento y sus campos bibliográficos asociados:

|Introducir|Tipo de documento|Campos obligatorios|Campos opcionales|
|---|---|---|---|
|`@article`|Artículo de revista|author, title, journal, year|language, volume, number, pages, month, note, url|
|`@book`|Libro|author ou editor, title, publisher, year|language, edition, series, address, month, volume, number, note, url|
|`@booklet`|Pequeño libro impreso y encuadernado, sin nombre de editor|title|author, language, howpublished, organization, address, month, year, note, url|
|`@electronic`|Documento en línea o página web|-|author, month, year, title, language, howpublished, organization, address, note, url|
|`@inbook`|Capítulo o sección de un libro, normalmente sin título|author ou editor, title, publisher, year|language, edition, series, address, month, volume, number, chapter, type, pages, note, url|
|`@incollection`|Parte de un libro con título|author, title, booktitle, year|language, edition, series, editor, address, publisher, month, volume, number, chapter, type, pages, note, url|
|`@inproceedings`|Presentación en una conferencia o simposio|author, title, booktitle, year|intype, language, series, editor, volume, number, organization, address, publisher, month, paper, type, pages, note, url|
|`@proceedings`|Colección de actas de conferencias|title, year|editor, language, series, volume, number, organization, address, publisher, month, note, url|
|`@manual`|Documentación técnica|title|author, language, edition, howpublished, organization, address, month, year, note, url|
|`@masterthesis`|Tesis de máster|author, title, school, year	|language, type, address, month, note, url|
|`@patent`|Patente|nationality, number, year or yearfiled|author, title, language, assignee, address, type, day, dayfiled, month, monthfiled, note, url|
|`@periodical`|Revista|	title, year|editor, language, series, volume, number, organization, month, note, url|
|`@phdthesis`|Tesis doctoral|author, title, school, year|language, type, address, month, note, url|
|`@standard`|Norma publicada|title, organization or institution|author, language, howpublished, type, number, revision, address, month, year, note, url|
|`@techreport`|Informe técnico|	author, title, insitution, year	|language, howpublished, address, number, type, month, note, url|
|`@unpublished`|Documento inédito|author, title, note|language, month, year, url|
|`@misc`|Cualquier otro tipo de documento|-|author, title, language, howpublished, organization, address, pages, month, year, note, url|
