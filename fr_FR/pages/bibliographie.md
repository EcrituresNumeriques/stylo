# Gestion de références

Les références bibliographiques sont gérées au format BibTeX. Les références peuvent être générées à partir d'un outils de gestion bibliographique comme Zotero, Endnote ou autre.

Il est également possible de synchroniser les références d'un article avec un sous-dossier (une collection) d'un groupe Zotero public, en renseignant l'identifiant du sous-dossier :

1. dans le panneau de gauche sélectionnez "Bibliography" puis "Manage Bibliography"
2. suivez les indications pour importer votre bibliographie depuis Zotero : indiquez l'identifiant du groupe suivi de `collections` puis de l'identifiant de la sous-collection. Exemple : `322999/collections/5MJ6MP6P`
3. cliquez sur "Save zotero link and fetch"
4. vos références bibliographiques devraient apparaître dans le panneau de gauche sous "Bibliography"

Quelques erreurs fréquentes à éviter : votre groupe doit être public, l'identifiant du groupe et l'identifiant de la sous-collection sont séparés par `/collections/`.

## Cas généraux

1. Si vous souhaitez citer l'auteur + l'année et la page entre parenthèses :

|Affichage dans Atom | Affichage définitif|
|:--|:--|
|`L’espace réel, celui de notre vie matérielle,`<br/>`et le cyberespace (qui n’est certes`<br/>`pas si complètement virtuel) ne devraient`<br/>`pas faire l’objet d’appellations séparées`<br/>`puisqu’ils s’interpénètrent de plus`<br/>`en plus fermement [@shirky_here_2008, p. 194].` | `L’espace réel, celui de notre vie matérielle,`<br/>`et le cyberespace (qui n’est certes`<br/>` pas si complètement virtuel) ne devraient`<br/>`pas faire l’objet d’appellations séparées`<br/>`puisqu’ils s’interpénètrent de plus`<br/>`en plus fermement (Shirky 2008, 194).`|

2. Si le nom de l'auteur apparaît déjà, et que vous souhaitez simplement ajouter l'année de publication entre parenthèses :

|Affichage dans Atom | Affichage définitif|
|:--|:--|
|`Clay @shirky_here_2008[p. 194] a suggéré que l’espace réel`<br/>`, celui de notre vie matérielle, et`<br/>`le cyberespace (qui n’est certes pas si complètement`<br/>`virtuel) ne devraient pas faire l’objet`<br/>`d’appellations séparées puisqu’ils s’interpénètrent `<br/>`de plus en plus fermement.` | `Clay Shirky (2008, 194), a suggéré que l’espace réel`<br/>`, celui de notre vie matérielle, et`<br/>`le cyberespace (qui n’est certes pas si complètement`<br/>`virtuel) ne devraient pas faire l’objet`<br/>`d’appellations séparées puisqu’ils s’interpénètrent`<br/>`de plus en plus fermement.`|

3. Afin d'éviter la répétition d'un nom, et indiquer seulement l'année, faire figurer un `-` devant la clé.


|Affichage dans Atom | Affichage définitif|
|:--|:--|
|`Des artistes conceptuels avaient cherché`<br/>`(apparemment sans grand succès ou`<br/>`sans grande conviction si l’on`<br/>`en croit Lucy Lippard [-@lippard_six_1973 ; -@lippard_get_1984])`<br/>`à contourner les règles du marché de l’art.` | `Des artistes conceptuels avaient cherché`<br/>`(apparemment sans grand succès ou`<br/>`sans grande conviction si l’on en croit Lucy Lippard (1973 ; 1984))`<br/>`à contourner les règles du marché de l’art.`|

## Quelques ressources

- [Qu'est-ce que Zotero ?](http://editorialisation.org/ediwiki/index.php?title=Zotero)
- [Comment installer et utiliser Zotero ?](https://bib.umontreal.ca/citer/logiciels-bibliographiques/zotero/installer)
- [Comment importer rapidement une bibliographie vers Zotero ?](https://bib.umontreal.ca/citer/logiciels-bibliographiques/zotero/installer#h5o-13)
