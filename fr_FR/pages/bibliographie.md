# Gestion de références

Les références bibliographiques sont gérées au format bibtex. Les références peuvent être générées à partir d'un outils de gestion bibliographique comme Zotero, Endnote ou autre.

Il est également possible de synchroniser les références d'un article avec un sous-dossier (une collection) d'un groupe Zotero public, en renseignant simplement l'identifiant du sous-dossier.

## Cas généraux

1. Si vous souhaitez citer l'auteur + l'année et la page entre parenthèses :

Affichage dans Atom | Affichage définitif
:--|:--
`L’espace réel, celui de notre vie matérielle, et le cyberespace `<br/>`(qui n’est certes pas si complètement virtuel) ne `<br/>` devraient pas faire l’objet d’appellations séparées puisqu’ils `<br/>` s’interpénètrent de plus en plus fermement [@shirky_here_2008, p. 194].` | `L’espace réel, celui de notre vie matérielle, et le cyberespace  `<br/>`(qui n’est certes pas si complètement virtuel) ne `<br/>`devraient pas faire l’objet d’appellations séparées puisqu’ils `<br/>`s’interpénètrent de plus en plus fermement (Shirky 2008, 194).`

2. Si le nom de l'auteur apparaît déjà, et que vous souhaitez simplement ajouter l'année de publication entre parenthèses :

Affichage dans Atom | Affichage définitif
:--|:--
`Clay @shirky_here_2008[p. 194] a suggéré que l’espace réel, celui de notre vie matérielle,  `<br/>`et le cyberespace (qui n’est certes pas si complètement virtuel) ne devraient pas  `<br/>`faire l’objet d’appellations séparées puisqu’ils s’interpénètrent  `<br/>`de plus en plus fermement.` | `Clay Shirky (2008, 194), a suggéré que l’espace réel, celui de notre vie matérielle,  `<br/>`et le cyberespace (qui n’est certes pas si complètement virtuel) ne devraient pas  `<br/>`faire l’objet d’appellations séparées puisqu’ils s’interpénètrent  `<br/>`de plus en plus fermement.`

3. Afin d'éviter la répétition d'un nom, et indiquer seulement l'année, faire figurer un `-` devant la clé.


Affichage dans Atom | Affichage définitif
:--|:--
`Des artistes conceptuels avaient cherché (apparemment sans grand succès  `<br/>`ou sans grande conviction si l’on en croit Lucy Lippard [-@lippard_six_1973 ; -@lippard_get_1984])  `<br/>`à contourner les règles du marché de l’art.` | `Des artistes conceptuels avaient cherché (apparemment sans grand succès  `<br/>`ou sans grande conviction si l’on en croit Lucy Lippard (1973 ; 1984)) à contourner les règles  `<br/>`du marché de l’art.`

## Quelques ressources

- [Qu'est-ce que Zotéro ?](http://editorialisation.org/ediwiki/index.php?title=Zotero)
- [Comment installer et utiliser Zotéro ?](http://www.bib.umontreal.ca/lgb/Zotero/tutoriel/1-installer-zotero.htm)
- [Comment importer rapidement une bibliographie vers Zotéro ?](http://www.youtube.com/watch?v=S-f3J9LOqdQ)
