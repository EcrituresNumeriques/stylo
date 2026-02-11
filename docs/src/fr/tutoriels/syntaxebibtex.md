---
title: "Gérer ses références bibliographiques en BibTeX"
---

BibTeX est le format (.bib) qui accompagne l’un des plus anciens programme de gestion des références bibliographiques portant le même nom. Ce format permet de décrire, de stocker et de trier des références bibliographiques dans des fichiers en texte brut. Grâce à celui-ci, il est possible de créer des bases de données de références bibliographiques. Lors de la compilation d'un article Stylo, l'outil récupère les références du fichier (.bib) et les place aux endroits adéquats, tant dans le texte que dans la bibliographie, en fonction du style bibliographique sélectionné.

La structure d’une référence en BibTeX est relativement simple. Sa forme générale ressemble à ceci :

```
@document{clé-de-citation,
    champs-requis = ,
    [champs-optionnels] = ,
}
```

À l’intérieur du gestionnaire de références bibliographiques de Stylo, nous avons accès à un mode brut qui nous permet de visualiser et d’éditer les données des références en BibTeX. Il s'agit d'un bouton à bascule situé dans « Bibliographie ». Vous pouvez aussi ajouter une référence directement en BibTeX au travers du bouton « Ajouter une référence ».

**Attention :** Si vous corrigez manuellement votre BibTex brut dans l'éditeur Stylo, cela ne modifiera pas votre entrée bibliographique dans la collection Zotero associée. Assurez-vous de corriger aussi votre source dans Zotero si vous pensez recharger votre collection.

Exemple de référence en BibTeX :

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

La déclaration de cette structure comprend plusieurs éléments.

- Le premier éléments à indiquer est le type de document que l’on souhaite indexer, il en existe 17. Une entrée en BiTex commence toujours avec un arobas (@), suivi du type de document. Dans cet exemple, c'est un article.
- Le deuxième élément se nomme la clé. Dans cet exemple, c'est cette partie : `{vitali-rosati_marcello_ecrire_2020,`. Cela sert à à citer le document dans l'article.
- Le troisième élément est le champ bibliographique. Par exemple, title, url, athor, etc. Des descripteurs sont employés pour affecter des informations aux documents déclarés. En fonction du type de document déclaré, certains descripteurs sont requis, alors que d’autres sont optionnels. BibTeX propose un ensemble fini de descripteurs que l’on peut utiliser pour renseigner les données d’une référence. L’emploi des descripteurs n’est pas non plus « libre », en BibTeX chaque type de document est doté de descripteurs prédéterminés, requis et optionnels.

Voici les 17 types de documents et les champs bibliographiques associés :

|Entrée|Type de document|Champs requis|Champs optionnels|
|---|---|---|---|
|`@article`|Article de revue|author, title, journal, year|language, volume, number, pages, month, note, url|
|`@book`|Livre|author ou editor, title, publisher, year|language, edition, series, address, month, volume, number, note, url|
|`@booklet`|Petit livre imprimé et relié, sans éditeur nommé|title|author, language, howpublished, organization, address, month, year, note, url|
|`@electronic`|Document en ligne ou page web|-|author, month, year, title, language, howpublished, organization, address, note, url|
|`@inbook`|Chapitre ou section d’un livre généralement sans titre|author ou editor, title, publisher, year|language, edition, series, address, month, volume, number, chapter, type, pages, note, url|
|`@incollection`|Partie d’un livre avec titre|author, title, booktitle, year|language, edition, series, editor, address, publisher, month, volume, number, chapter, type, pages, note, url|
|`@inproceedings`|Communication à une conférence, un colloque, etc.|author, title, booktitle, year|intype, language, series, editor, volume, number, organization, address, publisher, month, paper, type, pages, note, url|
|`@proceedings`|Recueil des comptes rendus d’une conférence|title, year|editor, language, series, volume, number, organization, address, publisher, month, note, url|
|`@manual`|Documentation technique|title|author, language, edition, howpublished, organization, address, month, year, note, url|
|`@masterthesis`|Mémoire de maîtrise|author, title, school, year|language, type, address, month, note, url|
|`@patent`|Brevet|nationality, number, year or yearfiled|author, title, language, assignee, address, type, day, dayfiled, month, monthfiled, note, url|
|`@periodical`|Revue ou magazine|title, year|editor, language, series, volume, number, organization, month, note, url|
|`@phdthesis`|Thèse de doctorat|author, title, school, year|language, type, address, month, note, url|
|`@standard`|Norme publiée|title, organization or institution|author, language, howpublished, type, number, revision, address, month, year, note, url|
|`@techreport`|Rapport technique|author, title, insitution, year	|language, howpublished, address, number, type, month, note, url|
|`@unpublished`|Document non publié|author, title, note|language, month, year, url|
|`@misc`|Tout autre type de document|-|author, title, language, howpublished, organization, address, pages, month, year, note, url|
