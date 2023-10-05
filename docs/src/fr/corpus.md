---
title: Les corpus
---

La fonctionnalité **Corpus** permet de regrouper un ensemble d'articles Stylo sous un même label.
Elle sert principalement deux objectifs :

- ajouter un niveau d'organisation des articles supplémentaire (en plus des étiquettes) comme dans le cas de l'édition d'un numéro de revue, il devient possible de rattacher tous les articles de ce numéro à un seul corpus, ce qui permet d'obtenir un nouveau niveau hiérarchique dans l'organisation des documents plutôt que de tout avoir sur le seul niveau des étiquettes ;
- regrouper des articles que l'on souhaiterait exporter ensemble (ceci fait suite à l'ancienne fonctionnalité _Book_ aujourd'hui dépréciée).

Les corpus sont implémentés dans l'espace personnel et dans les espaces de travail.
Ainsi un corpus n'appartient pas forcément à un utilisateur unique mais peut également être partagé à l'intérieur d'un espace de travail.
Pour plus de renseignements sur les espaces de travail, voir la [section dédiée](/fr/espace-de-travail).

<alert-block heading="Important">

La page dédiée à la gestion des corpus ne donne pas accès aux articles.
Il n'est pas possible de les modifier depuis cet espace-là.
Le gestionnaire des corpus ne permet que la création, la lecture, la modification ou la suppression de données relatives aux corpus.

</alert-block>

## Créer un corpus

Pour créer un corpus, il faut tout d'abord sur la page de gestion des corpus en cliquant sur le bouton \[Corpus\] dans le bandeau noir en haut de l'interface.

![](/uploads/images/BarreLateraleStyloNoire-V2.PNG)

Ensuite, le bouton \[Créer un corpus\] affiche un formulaire dans une fenêtre pop-up.
Ce formulaire contient deux champs : titre et description.
Le premier (titre) est obligatoire, et le second (description) est optionnel.

![Créer un corpus](/uploads/images/creer-un-corpus.png)

Une fois créé, le corpus apparaît dans le gestionnaire de corpus et offre 4 nouvelles fonctionnalités :

- Éditer le corpus ;
- Supprimer le corpus ;
- Exporter le corpus ;
- Prévisualiser le corpus.

![Interface du gestionnaire de corpus](/uploads/images/interface-gestionnaire-corpus.png)

## Ajouter des articles à un corpus

Pour ajouter des articles à un corpus, il faut retourner sur la page \[Articles\].

De la même façon que pour les étiquettes que l'on associe à un article, il faut ouvrir la fenêtre d'informations de l'article pour pouvoir l'ajouter à un corpus en cochant sur la case du corpus correspondant.

![Ajouter un article dans un corpus](/uploads/images/add-to-corpus.png)

## Ordonner un corpus

Lorsque plusieurs articles Stylo sont reroupés dans un même corpus, il est possible de les ordonner.
Pour ce faire, il faut retourner dans le gestionnaire des corpus en cliquant sur le bouton \[Corpus\] dans le bandeau noir en haut de l'interface.

Puis, en respectant le fonctionnement du gestionnaire des articles, il faut déplier la fenêtre d'informations du corpus et ordonner les articles grâce à un glisser-déposer (maintenir le clic gauche enfoncé et déplacer le curseur pour positionner l'article à la bonne place, puis relâcher).

{% figure "/uploads/gif/corpus.gif", "Gérer son corpus" %}

## Éditer un corpus

![Éditer les informations du corpus](/uploads/images/pictogramme-engrenage.png)

Les informations du corpus (titre et description) peuvent être mises à jour en cliquant sur l'icône d'engrenage d'un corpus (dans le gestionnaire de corpus).

Une fenêtre pop-up contenant un formulaire va s'ouvrir et permettre de modifier les données concernées. 

![Formulaire d'édition des informations du corpus](/uploads/images/formulaire-edition-informations-corpus.png)

## Exporter un corpus

![Exporter un corpus](/uploads/images/Export.png)

L'export d'un corpus se réalise de la même manière que pour un article.

Pour exporter un corpus il faut se rendre sur la page de gestion des corpus et cliquer sur le bouton d'export (icône imprimante).

Note : à la différence des articles, il n'y pas d'accès à la fonctionnalité d'export depuis l'interface d'édition des documents puisque le corpus exporte plusieurs articles en même temps.

Une fenêtre s'ouvre et propose plusieurs options d'export :

- le format à produire :
    - HTML5 ;
    - ZIP ;
    - PDF ;
    - LATEX ;
    - XML (ÉRUDIT) ;
    - ODT ;
    - DOCX ;
    - EPUB ;
    - XML TEI ;
    - ICML.
- des options additionnelles :
    - présence ou non d'une table des matières ;
    - la numérotation ou non des chapitres et sections ;
    - le type de division des contenus.

![Formulaire d'export d'un corpus](/uploads/images/corpus-formulaire-export.png)