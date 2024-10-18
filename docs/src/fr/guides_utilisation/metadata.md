---
title: "Gérer ses métadonnées"
---

Comme nous l'avons vu précédemment, les métadonnées des documents créés dans Stylo sont sérialisées en YAML.
Il s'agit d'un format de texte brut permettant de décrire explicitement des données selon le principe de [clef : valeur].
Pour plus d'informations à ce sujet, voir la [section concernée](/fr/syntaxe-yaml).

Les métadonnées de chaque article sont visibles depuis l'interface d'édition, dans le volet à droite de l'interface.

![Metadata-Bouton](/uploads/images/Metadata-Bouton-V2.PNG)

![Metadata-Edition](/uploads/images/Metadata-Edition-V2.PNG)

Le bouton [Metadata] permet d'ouvrir le volet des métadonnées. Trois modes d'édition sont disponibles :

1. **Basic Mode** : permet d'éditer les métadonnées fondamentales : titre, sous-titre, résumés, auteur·e·s et mots-clés ;
2. **Editor Mode** : permet d'éditer l'ensemble des métadonnées relatives à une revue savante : identifiant d'un article, informations de dossier, informations sur l'évaluation, catégories et mots-clés de la revue, etc. ;
3. **Raw Mode** : espace d'édition pour utilisateur avancé qui permet de modifier les champs d'entrées directement dans la structure du format YAML.

**Important** : afin d'exporter un article, les champs "Title" et "Authors" doivent obligatoirement être renseignés.

**Attention** : dans le volet des métadonnées se trouve la division sur la "Bibliographie" dont l'option *Display* permet de choisir la visualisation de la bibliographie dans son entièreté ("All citations") ou uniquement des références qui ont été citées dans le corps de l'article ("Only used"). 

![Bibliography-Display](/uploads/images/Bibliography-Display-V2.PNG)
