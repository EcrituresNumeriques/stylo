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

Dentro del gestor de referencias bibliográficas de Stylo, tenemos acceso a un modo raw que nos permite ver y editar los datos de las referencias en BibTeX. Se encuentra en el panel de la izquierda, en 'Bibliografía', 'Gestión', y luego en la pestaña 'BibTex en bruto'.

**Advertencia:** Si corrige manualmente su BibTex sin procesar en el editor Stylo, esto no cambiará su entrada bibliográfica en la colección Zotero asociada. Asegúrese de corregir también su fuente en Zotero si piensa recargar su colección.

Ejemplo de una referencia en BibTeX :

```

@article{vitali-rosati_marcello_ecrire_2020,
	title = {Écrire les {SHS} en environnement numérique. {L}’éditeur de texte {Stylo}},
	volume = {2020},
	url = {https://intelligibilite-numerique.numerev.com/numeros/n-1-2020/18-ecrire-les-shs-en-environnement-numerique-l-editeur-de-texte-stylo},
	doi = {10.34745/numerev_1697},
	language = {francés},
	number = {1},
	urldate = {2025-03-06},
	journal = {Revue Intelligibilité du numérique},
	author = {{Vitali-Rosati Marcello} and Nicolas, Sauret and Antoine, Fauchié and Margot, Mellet},
	year = {20},
	note = {Editorial: Revue Intelligibilité du numérique, n°1/2020},
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
