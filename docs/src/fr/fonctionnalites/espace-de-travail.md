---
title: "Les espaces de travail"
---

Les espaces de travail répondent au besoin de partage des articles Stylo entre plusieurs utilisateurs·ices.
Cette implémentation permet de distinguer plusieurs espaces à l'intérieur de Stylo.
Il y a tout d'abord l'espace le plus couramment utilisé, l'espace personnel : c'est dans cet espace que chaque utilisateur·ice arrive par défaut lorsqu'il ou elle se connecte.

L'espace personnel est celui où chacun·e peut créer et manipuler des articles dans Stylo.
On peut très bien rester uniquement dans cet espace et partager des articles manuellement avec d'autres utilisateurs·ices via la fonctionnalité de partage.

Toutefois, si un document doit être partagé à plusieurs utilisateurs·ices, il peut être intéressant d'utiliser la fonctionnalité d'espace de travail.

Les espaces de travail ne sont pas des entités à qui un·e utilisateur·ice pourrait donner un droit de propriété sur un article.
Tous les articles restent associés aux utilisateurs·ices qui les ont créés.
L'espace de travail quant à lui sert juste de passerelle pour partager un ensemble d'articles à plusieurs autres utilisateurs·ices.
Il faut le voir comme un canal particulier pour partager des contenus.

Par exemple, on peut créer un espace de travail pour une revue et ainsi partager les différents articles en cours d'édition.
L'espace de travail en lui-même pourra être nommé « Revue XX » mais les articles qui y seront associés n'appartiendront pas à cet espace de travail.
Chaque article restera attaché au compte utilisateur qui l'a créé.

L'accès aux différents espaces de travail se fait depuis le menu déroulant \[Espaces de travail\], sur la barre horizontale en haut de la page.

![Menu pour accéder aux espaces de travail](/uploads/images/refonte_doc/MenuWorkspace.png)

Ensuite il faut cliquer sur \[Tous les espaces\] pour accéder au gestionnaire des espaces de travail.

## Gérer ses espaces de travail

Le gestionnaire des espaces de travail comporte trois fonctionnalités :

- la création d'un espace de travail en cliquant sur le bouton correspondant \[Créer un espace de travail\]. Celui-ci ouvre un formulaire composé de trois champs que sont le \[Nom\], la \[Description\] et le choix d'une \[Couleur\].
- la possibilité de quitter un espace de travail. Pour cela il faut cliquer sur le bouton \[Quitter l'espace\]. (_Note : En cliquant sur ce bouton, si les étoiles le souhaitent, vous pourrez vivre une aventure inédite, jusqu'alors inconnue des mémoires humaines..._)
- administrer les membres d'un espace de travail depuis le formulaire \[Gérer les membres\] visible dans les informations de chacun des espaces de travail créé.

**Attention :** *Il n'y a pas de rôle administrateur dans les espaces de travail. Tous les membres, y compris le·la créateur·rice de l'espace de travail, sont au même niveau de droit. Il incombe à chacun·e la responsabilité de la gestion des informations et des dynamiques collaboratives.*

</alert-block>

{% figure "/uploads/gif/espace-de-travail.gif", "Création d'un espace de travail" %}

{% figure "/uploads/gif/ajout-utilisateur-workspace.gif", "Ajouter un·e utilisateur·ice Stylo à l'espace de travail" %}

## Afficher un espace de travail

Un espace de travail est une configuration qui permet d'afficher uniquement les documents qui y sont liés dans l'interface de Stylo.
Ils sont affichés en lieu et place des articles personnels.

Pour afficher les articles d'un espace de travail, il faut simplement cliquer dessus, dans le menu déroulant.

Les articles partagés dans l'espace de travail apparaissent à la place des articles personnels.
Ils sont accessibles avec les mêmes fonctionnalités que dans un espace personnel.

La fonctionnalité [corpus](/fr/corpus) est également disponible dans les espaces de travail.
On distingue alors les corpus personnels des corpus liés à des espaces de travail.

## Suppression d'un espace de travail

Il n'y a pas de bouton pour supprimer un espace de travail.
Cette tâche s'effectue automatiquement lorsque le dernier membre d'un espace de travail clique sur le bouton \[Quitter l'espace\] dans le gestionnaire d'espaces de travail.

Si le dernier membre d'un espace de travail souhaite le quitter, une fenêtre pop-up s'ouvre pour demander la confirmation de cette action.

Il n'y a que l'instance de partage entre les membres qui est supprimée lorsque le dernier membre a quitté l'espace.
Étant donné que les articles restent associés à leurs créateurs·rices, ceux-ci restent disponibles sur leur espace personnel.
