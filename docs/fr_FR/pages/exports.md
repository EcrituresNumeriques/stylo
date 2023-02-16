# Exports

## Page Export 

La [page export](https://stylo-export.ecrituresnumeriques.ca/) liste les exports personnalisés de Stylo dont : 

- les exports pour les revues qui utilisent Stylo dans leurs chaînes éditoriales : 
     - [Sens public](http://sens-public.org/)
     - [Scriptura](https://www.facebook.com/RevueScriptura/)
     - [Nouvelles Vues](https://nouvellesvues.org/presentation-de-la-revue/)
- les exports selon les Modèles de l'Université de Montréal
- la conversion d'un document du format DOCX vers le format Markdown

## Exports Modèles de l'Université de Montréal 

La page des exports Stylo [Modèles de l'Université de Montréal](https://stylo-export.ecrituresnumeriques.ca/exportudem.html) a été créée pour permettre aux étudiants de l'Université de Montréal de produire leurs rendus directement avec la mise en forme réglementaire. 

Trois modèles sont proposés : 

- Le modèle du Département de Littératures en Langue Française (DLLF)
  -  avec /ou/ sans table des matières (en cours d'implémentation)

- Le modèle du Plan de cours 

<iframe src="http://stylo-doc.ecrituresnumeriques.ca/fr_FR/pages/uploads/pdf/testPlanCours.pdf" title="testPlanCours" width="100%" height="500" allowfullscreen></iframe>

![Ouvrir dans nouvelle page](uploads/pdf/testPlanCours.pdf)


- Le modèle de L'École de bibliothéconomie et des sciences de l'information (EBSI)

<iframe src="http://stylo-doc.ecrituresnumeriques.ca/fr_FR/pages/uploads/pdf/test.pdf" title="testEBSI" width="100%" height="500" allowfullscreen></iframe> 

![Ouvrir dans nouvelle page](uploads/pdf/test.pdf)


### Modèle DLLF
(à venir)

### Modèle Plan de cours

1. Éditer les métadonnées suivantes dans le volet des métadonnées en mode "RAW"

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
2. Enregistrer une Version (majeure ou mineure) puis la sélectionner
3. Sélectionner dans l'url de la version la clef de version (soit les derniers chiffres après "/version/"
4. Copier la clef de version 
5. Dans la page d'export du Plan de cours, coller la clef de version à l'emplacement dédié
6. Puis entrer un nom à l'export, sélectionner le modèle du Plan de cours et cliquer sur "Submit"

### Modèle EBSI 

Pour exporter votre document selon le modèle de l'EBSI, il faut : 

1. Éditer les métadonnées suivantes dans le volet des métadonnées en mode "RAW"

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

2. Enregistrer une Version (majeure ou mineure) puis la sélectionner
3. Sélectionner dans l'url de la version la clef de version (soit les derniers chiffres après "/version/"
4. Copier la clef de version 
5. Dans la page d'export de l'EBSI, coller la clef de version à l'emplacement dédié
6. Puis entrer un nom à l'export, sélectionner le modèle de l'EBSI et cliquer sur "Submit"

**Attention** : n'oubliez pas de rafraichir la page d'export si vous faîtes plusieurs exports à la suite. 
