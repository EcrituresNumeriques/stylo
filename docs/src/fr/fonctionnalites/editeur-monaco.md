---
title: "L'éditeur de texte Monaco"
---

L’éditeur de texte utilisé dans Stylo est [Monaco](https://microsoft.github.io/monaco-editor/). Il s’agit du même composant que celui qui est utilisé dans les logiciels VSCode et VSCodium. On le retrouve également dans toute une panoplie d’éditeurs accessibles sur le web.

En utilisant Monaco dans Stylo, plusieurs fonctionnalité d'écriture ont été incorporées :

- Recherche et remplacement (CTRL/Cmd+F et CTRL/Cmd+H) ;
- L’utilisation d'expressions régulières ;
- Comparaison entre différentes versions d’un même document (fonctionnement ligne à ligne) ;
- Autocomplétion pour vos références et votre texte.
 
De plus, en faisant un clic droit dans l’éditeur de texte, vous aurez accès à d'autres options d'édition :

- Changes all occurrences (Ctrl+F2) : permet de sélectionner et modifier toutes les occurrences d’une même sélection ;
- Cut (Ctrl+X) ;
- Commande Palette (F1) : donne accès à l’ensemble des actions (et leurs raccourcis claviers) disponibles avec Monaco.

Pour avoir accès à la Palette de commande directement au travers d’un raccourci clavier, vous pouvez utiliser la touche F1 (simultanément Alt + F1 sur Internet Explorer, et fn + F1 sur clavier Mac).

Aussi, pour transformer une sélection de texte dans votre document Stylo en commentaire MarkDown (qui ne sera donc pas visible à l’export et sur le lien public d’annotation), vous pouvez utiliser le raccourci clavier ctrl + k puis ctrl + c (command pour les claviers Mac).

## Autocomplétion

Une fonction d'autocomplétion est implémentée dans l'éditeur de texte Monaco.
Pour l'instant, l'autcomplétion ne concerne que les références bibliographiques.

Il vous suffit de commencer à écrire `[@` ou simplement `@` pour que l’éditeur de texte vous propose toutes vos références associées à l’article. Si vous souhaitez affiner l’autocomplétion, il suffira d’ajouter la première lettre du nom de l’auteur pour réduire les propositions fournies : `[@b`. Pour que les références bibliographiques soient bien traitées par le logiciel de conversion Pandoc, n'oubliez pas de mettre votre référence entre crochets `[]`.

![Bibliographie-Autocomplétion](/uploads/images/refonte_doc/autocompletion-bib.png)
