# Structurer la bibliographie

La bibliographie liste les références bibliographiques que vous avez ajoutées à votre article. Celles-ci peuvent être ajoutées une par une, ou groupées. 

Pour ajouter vos références, vous devez cliquer sur **[Manage]** dans le volet latéral de gauche, à droite de l’onglet *Bibliography*. L'outil *Bibliography Manager* s'ouvre alors et vous propose plusieurs possibilités :

1. **Zotero** : il vous est possible de synchroniser votre bibliographie à partir d'une collection Zotero en entrant l'url de cette collection.

![Bibliographie-Zotero](uploads/images/BibliographieZotero-V2.png)

3. **Citations** : il vous est possible de renseigner votre bibliographie manuellement sous format BibTeX.

![Bibliographie-Citations](uploads/images/BibliographieCitations-V2.png)

5. **Raw BibTeX** : il est possible de corriger directement le BibTeX.

![Bibliographie-Raw BibTeX](uploads/images/BibliographieRawBibTeX-V2.png)

Vous pouvez directement [structurer vos références en BibTeX](http://www.andy-roberts.net/writing/latex/bibliographies) ou exporter vos références en BibTeX grâce à votre outil de gestion de bibliographie :

- voir tutoriels : <a class="btn btn-info" href="http://archive.sens-public.org/IMG/pdf/Utiliser_Zotero.pdf" role="button">Zotero</a> <a class="btn btn-info" href="https://libguides.usask.ca/c.php?g=218034&p=1446316" role="button">Mendeley</a>

## Synchroniser une collection Zotero

Il est possible de synchroniser les références d'un article avec une collection ou sous-collection de votre compte Zotero ou d'un groupe Zotero (public ou privé). Voici les étapes à suivre :

1. Dans le volet latéral de gauche, à l’onglet *Bibliography*, cliquez sur **[Manage]**;
2. Connectez votre compte Zotero avec l'option "Connect my Zotero Account";
3. Une fenêtre s'ouvre, intitulée "New Private Key", pour vous demander de valider la connexion entre Stylo et Zotero : cliquez sur "Accept Defaults";
4. En activant la liste déroulante, vous pouvez désormais choisir une collection (ou une sous-collection) de votre compte Zotero;
5. Cliquez sur le bouton **[Replace bibliography with this account collection]** afin d'importer les références bibliographiques (celles-ci apparaîtront dans le volet latéral de gauche, sous l'onglet *Bibliography*).

**Voici quelques remarques importantes concernant la synchronisation avec une collection Zotero :**

- Cette fonction permet aussi d'importer des collections provenant de groupes publics ou privés;
- Vous ne pouvez pas importer plus d'une collection;
- Chaque synchronisation ou import écrase vos données bibliographiques. Si vous utilisez l'option de synchronisation, nous vous conseillons de modifier vos références dans Zotero et de les ré-importer, et ainsi de suite jusqu'à l'obtention du résultat attendu;
- Il n'y a pas de synchronisation automatique, vous devez refaire la synchronisation à chaque modification.

## Insérer une référence bibliographique

Pour ajouter une référence à l'article, il suffit de cliquer sur la référence, puis de coller (Ctrl+V) la référence dans le texte à l'endroit souhaité. Elle apparaîtra alors ainsi `[@shirky_here_2008]`. Pour bien comprendre, un clic consiste à "copier" la clé BibTeX de la référence dans le presse-papier. ![Bibliographie exemple](uploads/images/Bibliographie-Exemple-V2.png)

Une fonction d'autocomplétion est également implémentée. Il vous suffit de commencer à écrire `[@` ou simplement `@` pour que l’éditeur de texte vous propose toutes vos références associés à l’article. Si vous souhaitez affiner l’autocomplétion, il suffira d’ajouter la première lettre du nom de l’auteur pour réduire les propositions faites : `[@b`.

![Bibliographie-Autocomplétion](uploads/images/BibliographieAutocompletion-V2.png)

Insérer une clé BibTeX dans le corps de texte a deux effets :

1. La clé est remplacée automatiquement par l'appel de citation au bon format dans le corps de texte, par exemple : (Shirky 2008);
2. La référence bibliographique complète est ajoutée automatiquement en fin de document.

## Cas généraux

La syntaxe Markdown permet de structurer finement vos références bibliographiques. En fonction des besoins, voici différents cas de figure pour produire l'appel de citation :
- `[@shirky_here_2008]` produira : (Shirky 2008)
- `[@shirky_here_2008, p194]` produira : (Shirky 2008, p194)
- `@shirky_here_2008` produira : Shirky (2008)
- `[-@shirky_here_2008]` produira : (2008)

Par exemple :

- Si vous souhaitez citer l'auteur + l'année et la page entre parenthèses :

|Dans l'éditeur | Dans la preview|
|:--|:--|
|`L’espace réel, celui de notre vie matérielle,`<br/>`et le cyberespace (qui n’est certes`<br/>`pas si complètement virtuel) ne devraient`<br/>`pas faire l’objet d’appellations séparées`<br/>`puisqu’ils s’interpénètrent de plus`<br/>`en plus fermement [@shirky_here_2008, p. 194].` | `L’espace réel, celui de notre vie matérielle,`<br/>`et le cyberespace (qui n’est certes`<br/>` pas si complètement virtuel) ne devraient`<br/>`pas faire l’objet d’appellations séparées`<br/>`puisqu’ils s’interpénètrent de plus`<br/>`en plus fermement (Shirky 2008, 194).`|

- Si le nom de l'auteur apparaît déjà et que vous souhaitez simplement ajouter l'année de publication entre parenthèses :

|Dans l'éditeur | Dans la preview|
|:--|:--|
|`Clay @shirky_here_2008[p. 194] a suggéré que l’espace réel`<br/>`, celui de notre vie matérielle, et`<br/>`le cyberespace (qui n’est certes pas si complètement`<br/>`virtuel) ne devraient pas faire l’objet`<br/>`d’appellations séparées puisqu’ils s’interpénètrent `<br/>`de plus en plus fermement.` | `Clay Shirky (2008, 194), a suggéré que l’espace réel`<br/>`, celui de notre vie matérielle, et`<br/>`le cyberespace (qui n’est certes pas si complètement`<br/>`virtuel) ne devraient pas faire l’objet`<br/>`d’appellations séparées puisqu’ils s’interpénètrent`<br/>`de plus en plus fermement.`|

- Afin d'éviter la répétition d'un nom, et indiquer seulement l'année, insérer un `-` devant la clé.

|Dans l'éditeur | Dans la preview|
|:--|:--|
|`Des artistes conceptuels avaient cherché`<br/>`(apparemment sans grand succès ou`<br/>`sans grande conviction si l’on`<br/>`en croit Lucy Lippard [-@lippard_six_1973 ; -@lippard_get_1984])`<br/>`à contourner les règles du marché de l’art.` | `Des artistes conceptuels avaient cherché`<br/>`(apparemment sans grand succès ou`<br/>`sans grande conviction si l’on en croit Lucy Lippard (1973 ; 1984))`<br/>`à contourner les règles du marché de l’art.`|

**Attention :** il ne faut pas utiliser de syntaxe Markdown en accompagnement d'une citation. Par exemple, il ne faut surtout pas utiliser un balisage de ce type : `[@shirky_here_2008, [lien vers une page web](https://sens-public.org)]`

## Quelques ressources

- [Qu'est-ce que Zotero ?](http://editorialisation.org/ediwiki/index.php?title=Zotero)
- [Comment installer et utiliser Zotero ?](https://bib.umontreal.ca/citer/logiciels-bibliographiques/zotero/installer)
- [Comment importer rapidement une bibliographie vers Zotero ?](https://bib.umontreal.ca/citer/logiciels-bibliographiques/zotero/installer#h5o-13)
