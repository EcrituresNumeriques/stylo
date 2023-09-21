---
title: La syntaxe BibTeX
---

BibTeX est le format (`.bib`) qui accompagne l'un des plus anciens programme de gestion des références bibliographiques portant le même nom.
Ce format permet de décrire, de stocker et de trier des références bibliographiques dans des fichiers en texte brut.
Grâce à celui-ci, il est possible de créer des bases de données de références bibliographiques (comme c'est par exemple le cas avec le logiciel [Ebib](https://joostkremers.github.io/ebib/)).

La structure d'une référence en BibTeX est relativement simple.
Sa forme générale ressemble à ceci : 

```bib
@type-d-entree{clef-de-citation,
    champs-requis,
    [champs-optionnels],

}

```

À l'intérieur du gestionnaire de références bibliographiques de Stylo, nous avons accès à un mode brut qui nous permet de visualiser et d'éditer les données des références en BibTeX.

![Exemple référence en BibTeX](docs/uploads/images/BibliographieRawBibTeX-V2.png)

La déclaration de cette structure comprend plusieurs éléments. 
Le premier éléments à indiquer est le type de document que l'on souhaite indexer, il en existe 17 différents.
Ensuite, un ensemble de descripteurs sont employés pour affecter des informations aux documents déclarés.
En fonction du type de document déclaré, certains descripteurs sont requis alors que d'autres sont optionnels.
BibTeX propose un ensemble fini de descripteurs que l'on peut utiliser pour renseigner les données d'une référence.
L'emploi des descripteurs n'est pas non plus "libre", en BibTeX chaque type de document est doté de descripteurs prédéterminés, requis et optionnels.

Nous pouvons en retrouver une bonne partie dans le tableau suivant.

Type d'entrée | Document concerné | Champs requis | Champs optionnels
--|--|--|--
@article | Article de revue | author, title, journal, year | language, volume, number, pages, month, note, url
@book | Livre | author ou editor, title, publisher, year | language, edition, series, address, month, volume, number, note, url
@booklet | Petit livre imprimé et relié, sans éditeur nommé | title | author, language, howpublished, organization, address, month, year, note, url
@electronic | Document en ligne ou page web | - | author, month, year, title, language, howpublished, organization, address, note, url
@inbook | Chapitre ou section d'un livre généralement sans titre | author ou editor, title, publisher, year | language, edition, series, address, month, volume, number, chapter, type, pages, note, url
@incollection | Partie d'un livre avec titre | author, title, booktitle, year | language, edition, series, editor, address, publisher, month, volume, number, chapter, type, pages, note, url
@inproceedings | Communication à une conférence, un colloque, etc. | author, title, booktitle, year | intype, language, series, editor, volume, number, organization, address, publisher, month, paper, type, pages, note, url
@proceedings | Recueil des comptes rendus d'une conférence | title, year | editor, language, series, volume, number, organization, address, publisher, month, note, url
@manual | Documentation technique | title | author, language, edition, howpublished, organization, address, month, year, note, url
@masterthesis | Mémoire de maîtrise | author, title, school, year | language, type, address, month, note, url
@patent | Brevet | nationality, number, year or yearfiled | author, title, language, assignee, address, type, day, dayfiled, month, monthfiled, note, url
@periodical | Revue ou magazine | title, year | editor, language, series, volume, number, organization, month, note, url
@phdthesis | Thèse de doctorat | author, title, school, year | language, type, address, month, note, url
@standard | Norme publiée | title, organization or institution | author, language, howpublished, type, number, revision, address, month, year, note, url
@techreport | Rapport technique | author, title, insitution, year | language, howpublished, address, number, type, month, note, url
@unpublished | Document non publié | author, title, note | language, month, year, url
@misc | Tout autre type de document | - | author, title, language, howpublished, organization, address, pages, month, year, note, url

