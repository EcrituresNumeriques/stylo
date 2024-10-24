---
title: "L'éditeur de texte Monaco"
---

L'éditeur de texte, pièce centrale de Stylo, a été remplacé par l'éditeur de texte [Monaco](https://microsoft.github.io/monaco-editor/).
Il s'agit du même composant que celui qui est utilisé dans les logiciels VSCode et VSCodium.
On le retrouve également dans toute une panoplie d'éditeur accessible sur le web.


De nouvelles fonctionnalités sont maintenant disponibles grâce à l'implémentation de ce composant : 

- des fonctions de recherche et de remplacement disponible, via les raccourcis `CTRL/Cmd+F` et `CTRL/Cmd+H` ;
- l'utilisation d'expressions régulières ;
- un comportement plus précis de la fonctionnalité de comparaison entre différentes versions d'un même document (fonctionnement ligne à ligne).

![](/uploads/images/stylo-v2-regex.png)
![](/uploads/images/stylo-v2-diff.png)


Un clic droit dans l'éditeur de texte ouvrira un menu donnant accès à plusieurs options :

- Changes all occurrences (Ctrl+F2) : permet de sélectionner et modifier toutes les occurrences d'une même sélection ;
- Cut ;
- Copy ;
- Commande Palette (F1) : donne accès à l'ensemble des actions (et leurs raccourcis claviers) disponibles dans Monaco, telle que le grossissement des caractères affichés.


## Autocomplétion

Une fonction d'autocomplétion est implémentée dans l'éditeur de texte Monaco.
Pour l'instant, l'autcomplétion ne concerne que les références bibliographiques.
Il vous suffit de commencer à écrire `[@` ou simplement `@` pour que l’éditeur de texte vous propose toutes vos références associées à l’article. Si vous souhaitez affiner l’autocomplétion, il suffira d’ajouter la première lettre du nom de l’auteur pour réduire les propositions fournies : `[@b`.

![Bibliographie-Autocomplétion](/uploads/images/BibliographieAutocompletion-V2.png)