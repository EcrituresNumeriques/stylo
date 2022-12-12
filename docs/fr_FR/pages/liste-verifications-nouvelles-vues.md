# Liste de tâches pour l'édition numérique sur Stylo

Ce document est une liste de tâches à réaliser ou à vérifier pour l'édition d'articles scientifiques avec l'éditeur de texte Stylo pour la production de documents HTML, XML (schéma Érudit) et PDF.
Ce document ne remplace pas la documentation de Stylo, une relecture rapide de cette documentation est conseillée avant l'édition des articles.

## Circuit/ordre des vérifications

1. import des documents dans Stylo par l'équipe éditoriale
2. vérifications diverses (premières tâches, métadonnées, bonnes pratiques, balisages spécifiques) par l'équipe éditoriale, détails ci-dessous
3. export PDF pour vérifications éditoriales par l'équipe éditoriale, chaque article doit être validé
4. l'équipe éditoriale prévient la CRCEN que les tâches ont été effectuées, les contenus et métadonnées ne devraient plus être modifiés
5. vérifications techniques et génération des XMLs par la CRCEN
6. la CRCEN prévient l'équipe éditoriale que les vérifications ont été faites. Si des corrections sont nécessaires retour à l'étape 2
7. envoi des XMLs et des PDFs par la CRCEN à Érudit. **À ce stade plus aucune modification n'est possible**
8. l'équipe éditoriale peut générer les autres formats souhaités (HTML pour le site web)

## Conversion DOCX vers Markdown

L'outil suivant permet de convertir des documents au format DOCX vers le format de balisage léger Markdown :

https://stylo-export.ecrituresnumeriques.ca/importdocx.html

Une fois les documents convertis, il y a un certain nombre de vérifications nécessaires, à réaliser dans Stylo ou dans un éditeur de texte :

- vérifier visuellement que le résultat correspond au fichier de départ
- supprimer les balisages inutiles, exemple : remplacer `_du texte_ _en italique_` par `_du texte en italique_`

**Important** : un balisage lisible permet de réduire les erreurs possibles par la suite, il est donc opportun de _nettoyer_ autant que possible le balisage produit par l'import automatique.


## Premières tâches dans Stylo

- enregistrer une première version : bouton "New Version"
- renseigner les métadonnées, au minimum : Title, Date, Language, Author, Résumés, Mots-clés
- vérifier le rendu de la prévisualisation pour vérifier que le balisage est correct


## Métadonnées

Il faut renseigner un certain nombre de métadonnées pour que les articles soient produits de façon correcte, en plus des métadonnées déjà indiquées ci-dessus :

- indiquer l'affiliation dans le champ ORCID
- vérifier que les mots-clés sont tous les mêmes d'un article à un autre pour un même numéro : il faut absolument éviter les _faux doublons_ comme par exemple `Cinéma québécois` et `Cinéma Québécois`
- idéalement les dates de publication des articles d'un même numéro doivent être les mêmes
- résumé : le résumé doit être un seul bloc de texte (un seul paragraphe), sans mise en forme (pas de gras ni d'italique, pas de note de bas de page, pas de référence bibliographique, pas de saut de ligne)
- Diffusion : indiquer le Publisher (structure qui porte la revue) et le Journal (nom de la revue). Attention si le nom de la revue change il faut modifier chaque article et le champ Journal
- Directors : indiquer les directeurs·rices de la revue
- Dossier : attention le Titre du dossier doit être attribué de la même façon à tous les articles d'un même dossier. Attention aux _faux doublons_ comme `Mauvais genres` et `Mauvais genres ` (espace de trop dans le deuxième). Attention si un article est _hors dossier_ il doit porter la mention `Varia`
- Directeur du dossier : quand un article fait partie d'un dossier, il faut indiquer le ou les directeurs·rices du dossier
- ISSN


## Bonnes pratiques dans Stylo

- ne pas faire de mise en forme avec la sémantique. Par exemple ne pas mettre en gras un texte qui doit être balisé adéquatement, comme `**Un texte qui est un titre, mis en avant avec du gras**` mais plutôt `#### Un texte qui est un titre`
- ne pas utiliser de majuscules ailleurs que pour la première lettre d'un mot, donc éviter absolument `UN TEXTE IMPORTANT`
- espaces insécables : le raccourci `MAJ+Espace` ou `MAJ+CTRL+Espace`
- légende des images : ne pas indiquer le numéro de figure en gras, remplacer `![**Figure 2 :** Légende](https://nouvellesvues.org/figure2.png)` par `![Figure 2 : Légende](https://nouvellesvues.org/figure2.png)`
- images au format PNG
- il faut une ligne vide à chaque fin d'article (par mesure de sécurité)
- pas de saut de ligne dans le texte des notes de bas de page
- après une série des modifications sur un article il est conseillé de _déclarer_ une nouvelle version (mineure ou majeure)


## Balisages spécifiques dans les articles

Les exports XML pour la plateforme Érudit nécessitent certains balisages spécifiques qui sont indiqués ci-après.
Attention, chaque espace a son importance, un balisage doit être respecté de façon très stricte.

### Bibliographie
La bibliographie doit être balisée selon la façon suivante (concrètement cela permet ensuite une transformation adéquate en XML) :

```
## Bibliographie{.unnumbered}

::: {.references}
les références ici
:::
```

### Notice biographique
Les notices biographiques doivent être balisées de la façon suivante :

```
## Notice biographique{.noticebio}
Le texte de la biographie
```


## Générer les exports

Actuellement la page web permettant de générer les exports est la suivante : https://stylo-export.ecrituresnumeriques.ca/exportnouvellesvues.html

Il faut indiquer les informations suivantes :

- nom du fichier exporté : indiquer le nom souhaité, par exemple `nv-21-01`
- version : il s'agit du numéro de version de l'article, disponible en faisant un clic droit sur la dernière version et en copiant le lien. Exemple : `https://stylo.huma-num.fr/article/624767f74b92ae0012f83ce3/version/636d649845ea550012613df0`, c'est la dernière partie de l'URL qui nous intéresse `636d649845ea550012613df0`
- paramètre table des matières : chaque article doit comporter une table des matières, sauf si l'article ne comporte aucun niveau de titre dans le texte


## Modifications nécessaires sur les XMLs produits

Ces modifications sont effectuées par des personnes ayant les connaissances techniques nécessaires, la plupart de ces modifications seront intégrées via différents moyens dans les évolutions du module d'export de Stylo :

- pagination : ajouter le numéro de la dernière page de la version PDF [bientôt implémenté]
- genre : ajouter les genres pour les directeurs et les rédacteurs
- ajouter un identifiant pour l'auteur·rice qui est indiqué aussi dans la notice biographique
- modification des ordseq
- vérifier les numéros de figures et si nécessaire appliquer la transformation suivante : remplacer `<figure>\n            <legende lang="fr">\n               <alinea>Figure (\d+) ` par `<figure>\n            <no>Figure $1</no>\n            <legende lang="fr">\n               <alinea>`
- vérification des identifiants/noms de fichier des images
- vérifier si les mises en forme dans les titres ne posent pas de problème
- vérifier le positionnement de la notice biographique
- ajouter la source des citations lorsque nécessaire
- vérifier si tableau et la conformité avec le balisage XML, et ajouter un titre qui fait sens
- ajouter un `<volume/>` ? Si oui, modifier la feuille XSLT
- ajouter `<nonumero>21</nonumero>` ? Si oui, modifier la feuille XSLT
- vérifier que les articles hors dossier sont indiqués comme tels dans le sommaire

