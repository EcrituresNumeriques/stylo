---
title: Les espaces de travail
---

Les espaces de travail répondent au besoin de partage des articles Stylo entre plusieurs utilisateurs.
Cette implémentation permet de distinguer plusieurs espaces à l'intérieur de Stylo.
Il y a tout d'abord l'espace le plus couramment utilisé, l'espace personnel : c'est dans cet espace que chaque utilisateur arrive par défaut.

L'espace personnel est celui où chacun peut créer et manipuler des articles dans Stylo.
On peut très bien rester uniquement dans cet espace et partager des articles manuellement avec d'autres utilisateurs via la [fonctionnalité de partage](/fr/mesarticles/#partager-un-article).

Toutefois, si un document doit être partagé à plusieurs utilisateurs, il peut être intéressant d'utiliser la fonctionnalité d'espace de travail.

Les espaces de travail ne sont pas des entités à qui un utilisateur pourrait donner un droit de propriété sur un article.
Tous les articles restent associés aux utilisateurs qui les ont créés.
L'espace de travail quant à lui sert juste de passerelle pour partager un ensemble d'articles à plusieurs autres utilisateurs.
Il faut le voir comme un canal particulier pour partager des contenus.

Par exemple, on peut créer un espace de travail pour une revue et ainsi partager les différents articles en cours d'édition.
L'espace de travail en lui-même pourra être nommé "Revue XX" mais les articles qui y seront associés n'appartiendront pas à cet espace de travail.
Chaque article restera attaché au compte utilisateur qui l'a créé.

L'accès à cette fonctionnalité se fait depuis le menu déroulant accessible en cliquant sur le non utilisateur en haut de la page.

<!-- Mettre une image du menu déroulant -->

Ensuite il faut cliquer sur \[Tous les espaces\] pour accéder au gestionnaire des espaces de travail.


## Gérer ses espaces de travail

Le gestionnaire des espaces de travail comporte quatre fonctionnalités :

- la création d'un espace de travail en cliquant sur le bouton correspondant \[Créer un espace de travail\]. Celui-ci ouvre un formulaire composé de trois champs que sont le \[Nom\], la \[Description\] et le choix d'une \[Couleur\].
- la possibilité de quitter un espace de travail. Pour cela il faut cliquer sur le bouton \[Quitter l'espace\]. (_Note : En cliquant sur ce bouton, si les étoiles le souhaitent, vous pourrez vivre une aventure inédite, jusqu'alors inconnue des mémoires humaines..._)
- administrer les membres d'un espace de travail depuis le formulaire \[Gérer les membres\] visible dans les informations de chacun des espaces de travail créé.


<alert-block heading="📢 Attention">

Il n'y a pas de rôle administrateur dans les espaces de travail.
Tous les membres, y compris le créateur de l'espace de travail, sont au même niveau de droit.
Il incombe à chacun la responsabilité de la gestion des informations et des dynamiques collaboratives.

</alert-block> 

## Afficher un espace de travail

Un espace de travail est une configuration qui permet d'afficher uniquement les documents qui y sont liés dans l'interface de Stylo.
Ils sont affichés en lieu et place des articles personnels.

L'affichage des articles ne se passe donc pas dans le gestionnaire des espaces de travail mais dans la page \[Articles\] (en cliquant sur le bouton dans le bandeau noir en haut de la page).

Ensuite, il faut cliquer sur son \[Nom d'utilisateur\] et sélectionner dans le menu déroulant l'espace de travail dans lequel on souhaite travailler.

<!-- Mettre une image de l'espace personnel sur la page article -->

<!-- Mettre une image du menu déroulant et de la sélection des espaces de travail -->

<!-- Mettre une image de l'espace des articles apres selection de l'espace de travail -->


Les articles partagés dans l'espace de travail apparaissent à la place des articles personnels.
Ils sont accessibles avec les mêmes fonctionnalités que dans un espace personnel.

La fonctionnalité [corpus](/fr/corpus) est également disponible dans les espaces de travail.
On distingue alors les corpus personnels des corpus liés à des espaces de travail.

## Associer un article à un espace de travail

La page \[Articles\] change légèrement entre l'espace personnel et l'espace de travail.
Le bouton \[Créer un article\] n'est plus présent dans l'espace de travail.

Comme nous l'avons mentionné, l'espace de travail n'est pas une entité propriétaire des articles qui y sont partagés.
En conséquence, pour associer un article à un espace de travail, il faut retourner dans son espace personnel en cliquant sur son \[Nom d'utilisateur\] dans le bandeau noir en haut de la page, puis sur \[Mon espace\] pour afficher ses articles.

La création d'un article (ou son ajout dans espace de travail) se fait uniquement depuis cette interface.
Une fois l'article créé, il faut ouvrir ses informations en cliquant sur le chevron ![](/uploads/images/plus.png) et cocher la case associée à l'espace de travail dans lequel on souhaite partager l'article.

## Suppression d'un espace de travail

Il n'y a pas de bouton pour supprimer un espace de travail.
Cette tâche s'effectue automatiquement lorsque le dernier membre d'un espace de travail clique sur le bouton \[Quitter l'espace\] dans le gestionnaire d'espaces de travail.

Si le dernier membre d'un espace de travail souhaite le quitter, une fenêtre pop-up s'ouvre pour demander la confirmation de cette action.

Il n'y a que l'instance de partage entre les membres qui est supprimée lorsque le dernier membre a quitté l'espace. 
Étant donné que les articles restent associés à leur créateur, ceux-ci restent disponibles sur l'espace personne de son propriétaire.