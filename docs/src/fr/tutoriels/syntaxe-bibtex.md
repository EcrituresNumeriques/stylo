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

À l’intérieur du gestionnaire de références bibliographiques de Stylo, nous avons accès à un mode brut qui nous permet de visualiser et d’éditer les données des références en BibTeX. Il est situé dans le volet de gauche, sous « Bibliographie », « Gestion », puis dans l'onglet « BibTex brut ».

**Attention :** Si vous corrigez manuellement votre BibTex brut dans l'éditeur Stylo, cela ne modifiera pas votre entrée bibliographique dans la collection Zotero associée. Assurez-vous de corriger aussi votre source dans Zotero si vous pensez recharger votre collection.

Exemple de référence en BibTeX :

```

@article{vitali-rosati_marcello_ecrire_2020,
	title = {Écrire les {SHS} en environnement numérique. {L}’éditeur de texte {Stylo}},
	volume = {2020},
	url = {https://intelligibilite-numerique.numerev.com/numeros/n-1-2020/18-ecrire-les-shs-en-environnement-numerique-l-editeur-de-texte-stylo},
	doi = {10.34745/numerev_1697},
	language = {Français},
	number = {1},
	urldate = {2025-03-06},
	journal = {Revue Intelligibilité du numérique},
	author = {{Vitali-Rosati Marcello} and Nicolas, Sauret and Antoine, Fauchié and Margot, Mellet},
	year = {2020},
	note = {Publisher: Revue Intelligibilité du numérique, n°1/2020},
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
