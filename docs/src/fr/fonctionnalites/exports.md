---
title: "Exports"
---

## Exporter un article

Pour exporter un article, il faut cliquer sur le bouton "Export" depuis la page "Articles" ou depuis la page d'édition de l'article :

![Export](/uploads/images/Download.png)

Le menu d'export permet de choisir le format d'export. Il contient également l'option d'intégrer ou non une table des matières.

![Export](/uploads/images/ExportConfig-V2.PNG)

Les formats supportés sont les suivants :

- Fichiers originaux (markdown, yaml et bibtex)
- HTML5
- LaTeX
- PDF
- ODT (LibreOffice)
- DOCX (Microsoft Word)
- ICML (InDesign)
- XML-TEI
- XML-Erudit
- XML-TEI Commons Publishing (Métopes et OpenEdition)

Il est possible de choisir parmi plusieurs styles bibliographiques : certains intègrent la référence dans le texte (par exemple Chicago, qui insère la référence dans le corps du texte entre parenthèses), d'autres ajoutent une note avec la référence.

Le module d'export se charge de mettre en forme les références, d'ajouter ou d'enlever les espaces, d'insérer des "Ibid." en accord avec le style, etc.

Les exports sont produits grâce à l'outil de conversion [Pandoc](https://pandoc.org/) sur la base des [templates `stylo-export`](https://gitlab.huma-num.fr/ecrinum/stylo/stylo-export/-/tree/main/templates/generique).

L'export permet aussi de télécharger les fichiers source de Stylo (.md, .bib, .yaml) et les médias insérés dans l'article s'il y en a.

{% figure "/uploads/gif/exporter-un-article.gif", "Exporter un article" %}

## Personnaliser son export

À partir des fichiers source, il est possible de produire des exports personnalisés (mise en page, graphismes, métadonnées) en s'appuyant sur les fonctionnalités de l'outil de conversion [Pandoc](https://pandoc.org/).

Pour plus d'informations sur l'emploi des templates, voir ce [tutoriel](https://gitlab.huma-num.fr/ecrinum/manuels/tutoriel-markdown-pandoc).

## Page Export

La version actuelle du module d'export de Stylo ([https://export.stylo.huma-num.fr/](https://export.stylo.huma-num.fr/)) propose un export générique et un export pour une intégration dans la chaîne d'édition de Métopes (schéma XML-TEI Commons Publishing pour Métopes ou OpenEdition).

La version _legacy_ de l'export de Stylo ([https://stylo-export.ecrituresnumeriques.ca](https://stylo-export.ecrituresnumeriques.ca/)) liste d'autres exports personnalisés de Stylo dont :

- les exports pour les revues qui utilisent Stylo dans leurs chaînes éditoriales :
  - [Sens public](http://sens-public.org/)
  - [Scriptura](https://www.facebook.com/RevueScriptura/)
  - [Nouvelles Vues](https://nouvellesvues.org/presentation-de-la-revue/)
- les exports selon les Modèles de l'Université de Montréal;
- la conversion d'un document du format DOCX vers le format Markdown.

## Les exports spéciaux

### Exports modèles de l'Université de Montréal

La page des exports Stylo [Modèles de l'Université de Montréal](https://stylo-export.ecrituresnumeriques.ca/exportudem.html) a été créée pour permettre aux étudiant.es de l'Université de Montréal de produire leurs rendus directement avec la mise en forme réglementaire.

Trois modèles sont proposés :

- Le modèle du Département des littératures de langue française (DLLF)
  -  avec /ou/ sans table des matières (en cours d'implémentation)

- Le modèle du Plan de cours

<iframe src="http://stylo-doc.ecrituresnumeriques.ca/uploads/pdf/testPlanCours.pdf" title="testPlanCours" width="100%" height="500" allowfullscreen></iframe>

- Le modèle de L'École de bibliothéconomie et des sciences de l'information (EBSI)

<iframe src="http://stylo-doc.ecrituresnumeriques.ca/uploads/pdf/test.pdf" title="testEBSI" width="100%" height="500" allowfullscreen></iframe>

#### Modèle DLLF
(à venir)

#### Modèle Plan de cours

1. Éditer les métadonnées suivantes dans le volet des métadonnées en mode "RAW" :

```
---
abstract:
  - lang: en
    text_f: This is my abstract.
  - lang: fr
    text_f: C'est mon joli résumé.
authors:
  - forname: Margot
    surname: Mellet
cours:
  - id: Sigle
    title: Titre du cours
date: '2021-09-08'
day: '05'
lang: fr
link-citations: true
month: avril
nocite: '@*'
session: Été
subtitle_f: Sous-titre
teachers:
  - email: margot.mellet@umontreal.ca
    forname: Margot
    surname: Mellet
title_f: Titre
typeTravail: TP2
year: '2021'
---
```
2. Enregistrer une version (majeure ou mineure), puis la sélectionner;
3. Sélectionner dans l'url de la version la clef de version (soit les derniers chiffres après "/version/");
4. Copier la clef de version;
5. Dans la page d'export du Plan de cours, coller la clef de version à l'emplacement dédié;
6. Puis attribuer un nom à l'export, sélectionner le modèle du Plan de cours et cliquer sur "Submit".

#### Modèle EBSI

Pour exporter votre document selon le modèle de l'EBSI, il faut :

1. Éditer les métadonnées suivantes dans le volet des métadonnées en mode "RAW" :

```
---
authors:
  - forname: "Auteur1-Prénom"
    surname: "Auteur1-Nom"
    matricule: "Auteur1-matricule"
  - forname: "Auteur2-Prénom"
    surname: "Auteur2-Nom"
    matricule: "Auteur2-matricule"
date: 2021/03/05
year: '2021'
month: 'avril'
session: 'Été'
day: '05'
cours:
  - id: Sigle
    title: Titre du cours
teachers:
  - forname: Prénom
    surname: Nom
lang: fr
link-citations: true
nocite: '@*'
subtitle: Sous-titre
subtitle_f: Sous-titre
title: Titre
title_f: Titre
typeTravail: TP2
---
```

2. Enregistrer une version (majeure ou mineure), puis la sélectionner;
3. Sélectionner dans l'url de la version la clef de version (soit les derniers chiffres après "/version/");
4. Copier la clef de version;
5. Dans la page d'export de l'EBSI, coller la clef de version à l'emplacement dédié;
6. Puis attribuer un nom à l'export, sélectionner le modèle de l'EBSI et cliquer sur "Submit".

**Attention** : n'oubliez pas de rafraîchir la page d'export si vous faites plusieurs exports consécutifs.
