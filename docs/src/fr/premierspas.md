---
title: Pour commencer avec Stylo
---

## Création d'un compte

Afin d'éditer dans Stylo, nous vous recommandons la création d'un compte utilisateur via Huma-Num. Pour créer un compte, rendez-vous sur Stylo : [https://stylo.huma-num.fr](https://stylo.huma-num.fr) et choisissez le type de compte :

![Register](/uploads/images/Login-Huma-Num-V2.PNG)

Si vous possédez déjà un compte Stylo ou Huma-Num, connectez-vous [ici](https://stylo.huma-num.fr).

## Page d'utilisateur

La page d'accueil de votre compte Stylo liste vos articles personnels ainsi que ceux qui ont été partagés avec vous par d'autres utilisateurs de Stylo.

Par défaut, un premier article “How to Stylo” est présent sur la plateforme et détaille chaque étape de la rédaction d’un article. N’hésitez pas à vous y référer si vous souhaitez directement écrire votre article dans Stylo ou si vous avez des questions sur des articles à traitement particulier (illustrations, etc.).

Pour chaque article, plusieurs actions sont possibles :

![](/uploads/images/fonctions-article.png)


|                     Bouton                     |Fonction|
|:----------------------------------------------:|:--|
|    ![Delete](/uploads/images/Delete-V2.png)    | pour supprimer l'article |
| ![Duplicate](/uploads/images/Duplicate-V2.png) | pour dupliquer uniquement la dernière version de l'article|
| ![Send](/uploads/images/send.png) | pour envoyer une copie de l'article et son historique de versions avec un autre usager de Stylo qui s'intitulera ainsi : "[Copy]New article"|
|     ![Share](/uploads/images/Share-V2.png)     | pour partager l'article et son historique de versions avec un autre usager de Stylo |
|      ![Export](/uploads/images/Export.png)      | pour exporter la dernière version de l'article|
|      ![Collaborative editing](/uploads/images/collaborative-editing.png)      | pour ouvrir une session collaborative |
|      ![Edit](/uploads/images/Edit-V2.png)      | pour ouvrir l'article en édition (mode seul)|
|      ![Preview](/uploads/images/Preview-V2.png)      | pour prévisualiser l'article dans une nouvele fenêtre (HTML)|


![Fonctionnalités étendues de gestion des articles](/uploads/images/article-extend-functionnalities.png)

|                     Bouton                     |Fonction|
|:----------------------------------------------:|:--|
|    ![Rename](/uploads/images/Rename-V2.png)    | pour renommer l'article|
|      ![Plus](/uploads/images/Plus-V2.png)      | pour développer d'autres fonctions de l'article :|
|  ![Versions](/uploads/images/Version-V2.PNG)   | pour consulter l'historique des versions enregistrées |
|      ![Tags](/uploads/images/Tag-V2.png)       | pour choisir les tags de l'article |
| ![Ajouter aux espaces de travail](/uploads/images/ajout-dans-espace-de-travail.png) | pour ajouter un article dans un espace de travail |
| ![Ajouter aux corpus](/uploads/images/add-to-corpus.png) | pour ajouter à un corpus |

Note : le nom du document tel que visible sur Stylo ne correspond pas au titre de l'article qui sera généré. Le titre doit être renseigné dans les métadonnées (volet de droite sur la page d'édition) pour apparaître lors de la prévisualisation ou les exports.

**Attention :** supprimer un article est irréversible. Cependant, si l'article est partagé avec un autre usager, même après sa suppression, il restera accessible pour cet utilisateur.

## Comprendre la structure d'un article

Un article dans Stylo est composé à partir de trois éléments distincts :

- un corps de texte ;
- des métadonnées ;
- une bibliographie.

Stylo propose une interface intégrée pour éditer chacun de ces éléments, dont les sources sont accessibles à tout moment via [le module d'export](#export).

## L'interface d'édition

L'interface d'édition d'un article présente plusieurs modules :

  - un **corps de texte** : espace d'édition du corps de texte de l'article ;
  - un **gestionnaire de métadonnées** : espace d'édition des informations concernant l'article (résumé, auteur, mot-clés, date de publication, etc.) ;
  - un **gestionnaire de versions** : espace permettant d'enregistrer et de nommer des versions mineures (*Create Minor*) ou majeures (*Create Major*), d'accéder aux versions successives pour les consulter, les exporter ou les comparer avec d'autres versions ;
  - une **table des matières** : présentant automatiquement le sommaire de l'article, à partir des titres du corps de texte ;
  - un **gestionnaire de bibliographie** : espace d'édition des références (citées ou non dans le corps du texte) ;
  - un outil de **statistiques** : présentant les informations statistiques de l'article (nombre de mots, de caractères, etc.).

![Schéma de l'interface d'édition de Stylo](/uploads/images/SchémaInterface.PNG)

## L'option Share

La fonction **[Share]** permet d'inviter des co-auteur·rice·s à travailler sur le même article. Ces utilisateur·ice·s ont alors accès à tout l'historique. Les versions de l'article se synchronisent pour tous les utilisateurs au fur et à mesure des modifications effectuées sur le document.

**Attention** : partager un article avec un autre utilisateur est possible uniquement en renseignant l'adresse courriel qui a servi à créer son compte utilisateur sur Stylo. 

## Nouvel article

Pour créer un nouvel article, il suffit de cliquer sur le bouton :

![Nouvel article](/uploads/images/CreateNewArticle-V2.PNG)

Vous devez ensuite renseigner le nom du document dans le champ prévu à cet effet

![Nommer un article](/uploads/images/Title-V2.PNG)

et valider l'opération en cliquant une nouvelle fois sur le bouton.

![Valider nouvel article](/uploads/images/CreateThisArticle-V2.PNG)

Lors de cette opération, il vous est également possible de choisir les tags associés à l'article :

![Add Tags](/uploads/images/Tag-Select-V2.PNG)

L’article apparaît désormais dans votre liste d’articles.

Cliquez sur le bouton

![Edit](/uploads/images/Edit-V2.png)

pour accéder à l’environnement d’édition et commencer à éditer votre article.

## Édition

L'environnement d'édition est composé de cinq modules :

- au centre : l'espace d'écriture consacré au corps de texte de l'article ;
- à droite : le bouton **[Metadata]** ouvre l'éditeur de métadonnées ;
- à gauche :
  - l'historique des versions du document (*Versions*) pour naviguer et agir sur les différentes versions enregistrées ;
  - le sommaire (*Table of content*) de l'article liste les titres de niveau 2, 3 et suivants ;
  - la bibliographie (*Bibliography*) liste les références bibliographiques ;
  - les statistiques (*Stats*) offrent quelques données quantitatives sur l'article.

## Écrire en Markdown

L'article dans Stylo doit être écrit en langage Markdown, un langage de balisage simple à prendre en main.

Le langage Markdown permet une syntaxe simple d'usage autant en lecture qu'en écriture. Voici les principales règles d'écriture en Markdown :

- **Titre** : les niveaux de titre (titre de niveau 1 pour le titre de l'article, de niveau 2 pour les titres de section, etc.) sont renseignés avec un `#`, ainsi :
	- `# Titre d'article`, `## Introduction`, etc.

**Attention** : le corps de texte de l'article ne supporte pas les titres de niveau 1, le titre de niveau 1 étant uniquement réservé au champ *Title* dans les métadonnées. Votre titrage dans l'éditeur de texte commencera donc par le niveau 2.

- **Italique** : l'italique se balise dans le texte de deux manières : `_mot_` ou `*mot*`
- **Gras** : le gras se balise dans le texte ainsi : `**mot**`
- **Citation longue** : les citations longues dans le texte sont balisées ainsi : `> citation longue`
- **Note** : une note dans le texte se balise selon qu'elle est avec ou sans appel de note :

avec appel de note :

```
Voici mon texte[^1]

[^1]:Une note de bas de page avec appel et renvoi.
```

sans appel de note :

```
Voici mon texte^[Une note de bas de page inline.]
```

Pour approfondir vos connaissances en syntaxe Markdown, vous pouvez consulter la [page suivante](http://stylo-doc.ecrituresnumeriques.ca/fr/syntaxemarkdown/).

## Versions

![Active](/uploads/images/Nom-Version-V2.PNG)

Une version du document correspond à une sauvegarde de votre travail. Une version contient toujours les trois éléments de l'article : métadonnées, bibliographie, corps de texte. En chargeant une ancienne version, ce sont donc ces trois éléments qui sont mis à jour. 

Votre travail est par défaut automatiquement sauvegardé sur Stylo, mais vous devez créer vous-mêmes les versions. Pour ce faire, vous pouvez donc -- et cela est conseillé -- utiliser la fonction de sauvegarde [New Version] qui permet de générer une nouvelle version du travail.

Pour plus d'informations sur les versions dans Stylo, veuillez vous rendre sur la [page dédiée](/fr/versionner/) à cette fonctionnalité.

## Export

Pour exporter un article, il faut cliquer sur le bouton "Export" depuis la page "Articles" ou depuis la page d'édition de l'article :

![Export](/uploads/images/Download.png)

Le menu d'export permet de choisir le format d'export. Il contient également la possibilité d'intégrer ou non la table des matières.

![Export](/uploads/images/ExportConfig-V2.PNG)

Les formats supportés sont les suivants :

- Fichiers originaux (Markdown, YAML et BibTeX)
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

Les exports sont produits grâce à l'outil de conversion [Pandoc](https://pandoc.org/) sur la base des templates disponibles [ici](https://framagit.org/stylo-editeur/templates-stylo).

Pour davantage d'informations sur l'export Stylo, vous pouvez consulter la [page dédiée](/fr/exports).

## Sommaire

![Sommaire](/uploads/images/Sommaire-V2.PNG)

Le sommaire affiche une liste des titres de niveau 2, 3 et suivants. Ces titres sont cliquables pour accéder rapidement à la partie du texte correspondante.

## Bibliographie

La bibliographie liste les références bibliographiques que vous avez ajoutées. Celles-ci peuvent être ajoutées une par une ou groupées. Pour ajouter vos références, vous devez cliquer sur **[Manage Bibliography]** dans le volet de gauche : l'outil *Bibliographie* s'ouvre alors et vous propose plusieurs possibilités :

- **Zotero** : il vous est possible de synchroniser une bibliographie en connectant Stylo à votre compte Zotero (groupes/collections privées ou publiques) ;
- vous pouvez également indiquer l'URL d'une collection d'un groupe public Zotero ;
- **Citations** : il vous est possible de renseigner votre bibliographie manuellement au format BibTeX ;
- **Raw BibTeX** : il est possible de corriger directement le BibTeX.

Vous pouvez directement [structurer vos références en BibTeX](/fr/syntaxe-bibtex/) ou exporter vos références en BibTeX grâce à votre outil de gestion de bibliographie :

- voir tutoriels : <a class="btn btn-info" href="http://sens-public.org/IMG/pdf/Utiliser_Zotero.pdf" role="button">Zotero</a> <a class="btn btn-info" href="https://libguides.usask.ca/c.php?g=218034&p=1446316" role="button">Mendeley</a>

Pour ajouter une référence à l'article, il suffit de cliquer sur la référence, puis de coller `Ctrl+V` la référence dans le texte à l'endroit souhaité. Ainsi, un clic revient à "copier" la clé de la référence dans le presse-papiers. Il ne reste plus qu'à la coller dans le corps de texte.
Un système d'autocomplétion vous permet aussi d'afficher les références disponibles en tapant `[@` ou `@` suivi ou non des premières lettres de l'identifiant de la référence.

![Bibliographie exemple](/uploads/images/Bibliographie-Exemple-V2.PNG)

Pour davantage d'informations sur la gestion de la bibliographie, vous pouvez consulter la [page suivante](/fr/bibliographie/).

## Métadonnées

![Metadata-Bouton](/uploads/images/Metadata-Bouton-V2.PNG)

![Metadata-Edition](/uploads/images/Metadata-Edition-V2.PNG)

Le bouton [**Metadata**] permet d'ouvrir le volet des métadonnées. Trois modes d'édition sont disponibles :

- **Basic Mode** : permet d'éditer les métadonnées fondamentales : titre, sous-titre, résumés, auteur·e·s et mots-clés ;
- **Editor Mode** : permet d'éditer l'ensemble des métadonnées relatives à une revue savante : identifiant d'un article, informations de dossier, informations sur l'évaluation, catégories et mots-clés de la revue, etc. ;
- **Raw Mode** : espace d'édition pour utilisateur avancé qui permet de modifier les champs d'entrées directement dans la structure du format YAML.

**Important** : afin d'exporter un article, les champs "Title" et "Authors" doivent obligatoirement être renseignés.

**Attention** : dans le volet des métadonnées se trouve la division sur la "Bibliographie" dont l'option *Display* permet de choisir la visualisation de la bibliographie dans son entièreté ("All citations") ou uniquement des références qui ont été citées dans le corps de l'article ("Only used"). 

![Bibliography-Display](/uploads/images/Bibliography-Display-V2.PNG)

## Statistiques

![Statistiques](/uploads/images/Statistiques-V2.PNG)

Le menu *Stats* donne des informations sur :

- le nombre de mots ;
- le nombre de caractères sans la prise en compte des espaces ;
- le nombre de caractères, espaces compris ;
- le nombre de citations.

## Annotation

Il y a deux possibilités d'annotation :

- annoter une version ;
- annoter l'article.

Pour annoter une version, cliquez sur le numéro de la version que vous voulez annoter et ensuite cliquez sur **[Preview]**. Une prévisualisation de l'article en html s'ouvrira avec l'outil d'annotation hypothes.is sur la droite.

![Hypothes.is](/uploads/images/Hypothesis.png)

**Important** : si vous annotez une version, vos annotations ne seront pas visibles sur les autres versions.

Pour annoter l'article, cliquez sur **[Preview (open a new window)]**. Les annotations concerneront l'article. Cependant, puisque la version éditable de votre texte est sujette à des modifications, les annotations pourront ne plus être ancrées aux bonnes parties du texte (qui pourraient avoir été supprimées ou déplacées).
