---
title: "Gestion de la bibliographie"
---

La fonctionnalité bibliographie liste les références bibliographiques que vous avez ajoutées à votre article. Pour ajouter vos références, vous devez cliquer sur *Bibliographie* dans le volet "menu" de droite. L'outil *Gestionnaire de références bibliographiques* s'ouvre alors et vous propose plusieurs possibilités.

## Zotero

Il est possible de synchroniser une bibliographie (une collection ou une sous-collection) en connectant votre compte [Zotero](https://www.zotero.org/) à Stylo (groupes/collections privées ou publiques). C'est l'usage que nous vous recommandons ! 

Il est aussi possible d'importer votre bibliographie à partir d'une collection Zotero depuis une URL.
Cette URL peut être un·e utilisateur·ice, un groupe ou une collection, privée ou publique.

![Bibliographie-Zotero](/uploads/images/refonte_doc/biblio-zotero.png)

Voici la marche à suivre pour synchroniser une collection de votre compte Zotero :

Depuis le Gestionnaire de références bibliographiques, connectez votre compte Zotero avec l'option « Connecter mon compte Zotero ». Une boîte de dialogue s'ouvrira, intitulée « New Private Key », vous demandant de valider la connexion entre Stylo et Zotero.

En activant la liste déroulante, vous pouvez désormais choisir une collection (ou une sous-collection) de votre compte Zotero, dont l'URL s'affichera dans le champs "importer depuis une URL". 

Après avoir sélectionné une collection, vous devrez confirmer votre choix en cliquant sur « Remplacer la bibliographie actuelle par cette collection ».

**Attention** : *Vous ne pouvez pas importer plus d'une collection à la fois. De plus, chaque synchronisation ou import écrase vos données bibliographiques. Si vous utilisez l'option de synchronisation, nous vous conseillons de modifier vos références dans Zotero et de les ré-importer (il n'y a pas de synchronisation automatique), et ainsi de suite, jusqu'à l'obtention du résultat attendu.*

## BibTeX brut 

Il est possible de renseigner votre bibliographie manuellement au format BibTeX. Vos entrées seront validées.

![Bibliographie BibTeX](/uploads/images/refonte_doc/biblio-bibtex.png)

Il est possible de corriger directement le BibTeX. 

Vous pouvez directement [structurer vos références en BibTeX](http://www.andy-roberts.net/writing/latex/bibliographies) ou exporter vos références en BibTeX grâce à votre outil de gestion de bibliographie :

- Voir les turotiels : [Zotero](https://bib.umontreal.ca/en/citer/logiciels-bibliographiques/zotero/installer) et [Mendeley](https://libguides.usask.ca/c.php?g=218034&p=1446316)

*Nous vous suggérons de consulter la section sur le BibTeX dans "Tutoriels" pour plus d'information*

## Intégrer des références dans votre article

L'insertion de références bibliographiques dans le texte en Markdown doit respecter une syntaxe précise, pour être dynamique.

L'intérêt d'intégrer les références bibliographiques au format BibTeX réside dans la possibilité de générer des formats de citation et des bibliographies de manière dynamique à l'export, selon les rendus souhaités.

Dans cette configuration, une syntaxe particulière est nécessaire pour indiquer une référence dans le texte, que l'on nomme une clef de citation, et dont la forme est la suivante : `[@clef-de-citation]`.
Une clef de citation est encadrée par des crochets `[ ]`, puis est appelée avec le symbole `@`.

Ce sont ces clefs qui ensuite seront transformés en rendus spécifiques lors de l'export, selon les normes souhaitées.

Il existe plusieurs méthodes pour écrire rapidement ces clefs de citations dans Stylo :

- Une fonction d'autocomplétion est implémentée dans l'éditeur de texte. Il vous suffit de commencer à écrire `[@` ou simplement `@` pour que l’éditeur de texte vous propose toutes vos références associées à l’article. Si vous souhaitez affiner l’autocomplétion, il suffira d’ajouter la première lettre du nom de l’auteur pour réduire les propositions fournies : `[@b`.

- Vous pouvez aussi cliquer sur l'icône associée à la référence dans le volet de gauche, puis la coller (Ctrl+V) dans le texte à l'endroit souhaité. Elle apparaîtra alors ainsi `[@shirky_here_2008]`. Pour bien comprendre, un clic consiste à "copier" la clé BibTeX de la référence dans le presse-papier. 

![Bibliographie exemple](/uploads/images/refonte_doc/biblio-exemple.png)

Insérer une clé BibTeX dans le corps de texte a deux effets :

1. La clé est remplacée automatiquement par l'appel de citation au bon format dans le corps de texte, par exemple : (Shirky 2008) en format Chicago;
2. La référence bibliographique complète est ajoutée automatiquement en fin de document (prévisualisé ou exporté).

## Utilisation générale

L'intégration de BibTeX dans vos documents Stylo permet de structurer finement et différement vos références bibliographiques, selon le sens qu'elles peuvent avoir dans votre texte et le contexte dans lequel il s'inscrit. Par exemple, est-ce utile d'avoir des personnes citées dans le corps du texte, ou non ? Il existe deux grandes catégories de mises en forme de citations : dans le corps du texte, ou en note de bas de page / de fin de document. 

Voici deux cas de figure pour produire l'appel de citation, selon vos besoins :

**Une référence dans le corps du texte, par exemple avec le style et la norme de référence bibliographique "Chicago Manual of Style 17th edition"** 

- `[@shirky_here_2008]` produira : (Shirky 2008)
- `[@shirky_here_2008, p194]` produira : (Shirky 2008, p194)
- `@shirky_here_2008` produira : Shirky (2008)
- `[-@shirky_here_2008]` produira : (2008)

- Chicago fait sens si vous souhaitez citer l'auteur, l'année et la page entre parenthèses dans le corps du texte :

|Dans l'éditeur | Dans la prévisualisation|
|:--|:--|
|`L’espace réel, celui de notre vie matérielle,`<br/>`et le cyberespace (qui n’est certes`<br/>`pas si complètement virtuel) ne devraient`<br/>`pas faire l’objet d’appellations séparées`<br/>`puisqu’ils s’interpénètrent de plus`<br/>`en plus fermement [@shirky_here_2008, p. 194].` | `L’espace réel, celui de notre vie matérielle,`<br/>`et le cyberespace (qui n’est certes`<br/>` pas si complètement virtuel) ne devraient`<br/>`pas faire l’objet d’appellations séparées`<br/>`puisqu’ils s’interpénètrent de plus`<br/>`en plus fermement (Shirky 2008, 194).`|

- Si le nom de l'auteur apparaît déjà et que vous souhaitez simplement ajouter l'année de publication entre parenthèses :

|Dans l'éditeur | Dans la prévisualisation|
|:--|:--|
|`Clay @shirky_here_2008[p. 194] a suggéré que l’espace réel`<br/>`, celui de notre vie matérielle, et`<br/>`le cyberespace (qui n’est certes pas si complètement`<br/>`virtuel) ne devraient pas faire l’objet`<br/>`d’appellations séparées puisqu’ils s’interpénètrent `<br/>`de plus en plus fermement.` | `Clay Shirky (2008, 194), a suggéré que l’espace réel`<br/>`, celui de notre vie matérielle, et`<br/>`le cyberespace (qui n’est certes pas si complètement`<br/>`virtuel) ne devraient pas faire l’objet`<br/>`d’appellations séparées puisqu’ils s’interpénètrent`<br/>`de plus en plus fermement.`|

- Afin d'éviter la répétition d'un nom, et indiquer seulement l'année, insérez un `-` devant la clé.

|Dans l'éditeur | Dans la prévisualisation|
|:--|:--|
|`Des artistes conceptuels avaient cherché`<br/>`(apparemment sans grand succès ou`<br/>`sans grande conviction si l’on`<br/>`en croit Lucy Lippard [-@lippard_six_1973 ; -@lippard_get_1984])`<br/>`à contourner les règles du marché de l’art.` | `Des artistes conceptuels avaient cherché`<br/>`(apparemment sans grand succès ou`<br/>`sans grande conviction si l’on en croit Lucy Lippard (1973 ; 1984))`<br/>`à contourner les règles du marché de l’art.`|

**Une référence en note de bas de page, par exemple avec le style et la norme de référence bibliographique "University of Bologna - Liberal Arts College (Università di Bologna - Facoltà di Lettere e Filosofia)"** 

- `[@sauretEcrireCommuns2019]` produira une note de bas de page avec ces information : "Nicolas Sauret, Sylvia Fredriksson, « Écrire les communs », _Sens public_, 2019".
- `[@sauretEcrireCommuns2019, 200]` produira une note de bas de page avec les mêmes informations, avec "p. 200" à la fin (ou alors "_Ibid._, p. 200.", si la citation a déjà été faite plus haut).
- `@sauretEcrireCommuns2019` produira : "N. Sauret, S. Fredriksson" dans le corps du texte, renvoyant à une note de bas de page où sera indiqué les mêmes informations bibliographiques que dans le premier cas (ou alors "_Cité._", si déjà cité plus haut).
- `[-@shirky_here_2008]` produira "_Ibid._", comme dans le premier et deuxième cas si la citation a déjà été citée plus haut (cette option avec le `-` est alors moins utile que pour un système de citations dans le corps du texte).

Un tel style en notes de bas de page ou de fin de document a plus de sens si vous souhaitez moins encombrer d'informations bibliographiques le corps du texte lui-même.

**Attention :** il ne faut pas utiliser de syntaxe Markdown en accompagnement d'une citation. Par exemple, il ne faut surtout pas utiliser un balisage de ce type : `[@shirky_here_2008, [lien vers une page web](https://sens-public.org)]`

## Cas particuliers

- Lettres capitales pour les titres en anglais

Les styles bibliographiques en anglais requièrent souvent une capitalisation de chaque mot du titre de la référence. Stylo (et le logiciel de conversion Pandoc mobilisé) vont correctement capitaliser les titres ou non à condition que les références déclarent bien la langue utilisée. 

La langue du document Stylo détermine la langue du style bibliographique par défaut pour toutes les références, sauf pour les références bibliographiques contenant une autre donnée de langue. Par exemple, si la langue déclarée dans les métadonnées du document est `fr`, les références seront traitées comme telles. Si, parmi ces références, l'une est déclarée `en`, alors la capitalisation du titre s'appliquera.

**Attention :** le format Bibtex intègre plusieurs propriétés de langue : `language`, `langid`. Stylo (et Pandoc) ne prend en compte que la propriété `langid`, alors que l'interface de Zotero ne permet de renseigner que la propriété `language` ! Il sera donc nécessaire d'ajouter manuellement la propriété `langid: en`. Pour cela, deux possibilités : 

1. Soit dans Zotero, utiliser [la section Extra](https://www.zotero.org/support/kb/item_types_and_fields#citing_fields_from_extra) qui permet de renseigner des couples `propriété: valeur` supplémentaire, par exemple dans notre cas : `langid: en`. Après synchronisation Zotero/Stylo, la propriété sera bien prise en compte dans Stylo.
2. Soit dans Stylo, ouvrir l'onglet [Bibtex brut] dans le gestionnaire de bibliographie, et ajouter le couple `langid: en` à la référence concernée.   

```bibtex
@book{coleman_coding_2013,
	address = {Princeton},
	title = {Coding freedom: the ethics and aesthetics of hacking},
	isbn = {978-0-691-14460-3},
	shorttitle = {Coding freedom},
	language = {eng},
	langid = {en},
	publisher = {Princeton University Press},
	author = {Coleman, E. Gabriella},
	year = {2013},
}
```

- Pour en savoir plus : [documentation Pandoc | Capitalization in titles](https://pandoc.org/MANUAL.html#capitalization-in-titles)

---

Voici d'autre ressources pour aller plus loin :

- [Qu'est-ce que Zotero ?](http://editorialisation.org/ediwiki/index.php?title=Zotero)
- [Comment installer et utiliser Zotero ?](https://bib.umontreal.ca/citer/logiciels-bibliographiques/zotero/installer)
- [Comment importer rapidement une bibliographie vers Zotero ?](https://bib.umontreal.ca/citer/logiciels-bibliographiques/zotero/installer#h5o-13)
