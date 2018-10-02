# Syntaxe markdown

## Titres

- Le titre de niveau 1 - à savoir le titre de l'article - doit être renseigné dans les métadonnées
- Les titres de niveau 2 (titres de section) sont précédés par 2 ```#```. Par exemple: ```## Introduction```
- Les titres de niveau 3 (sous-section) sont précédés par 3 ```#```. Par exemple: ```### Mon titre de sous-section```
- Et ainsi de suite (niveau 4, 4 ```#```, etc.)

## Les notes

Les notes peuvent être dans le corps du texte (inline) ou avec appel de note et renvoi en bas de l'article.

Exemples:

```
Voici mon texte^[une note de bas de page inline.]
```

Donnera:

Voici mon texte^[une note de bas de page inline.]

Ou alors:

```
Voici mon texte[^1]

[^1]:Une note de bas de page avec appel et renvoi
```
Donnera:


Voici mon texte[^1]

[^1]:Une note de bas de page avec appel et renvoi

## Italiques et gras

- L'italique se balise avec des ```_``` avant et après le mot ou l'expression en italique. Par exemple:
```
Voici un _mot_ en italique
```

Donnerai:

Voici un _mot_ en italique


- Le gras se balise avec deux ```**``` avant et après le mot ou l'expression en italique. Par exemple:
```
Voici un **mot** en gras
```

Donnera:

Voici un **mot** en gras


## Images

## Liens
Les liens se balisent en distinguant :

- le lien, c'est-à-dire le mot ou l'expression indiqué comme un lien, avec des crochets `[]` ;
- et la cible, l'URL de destination, avec des parenthèses `()`.

Voici [un lien vers une page Wikipédia](https://fr.wikipedia.org/wiki/Hyperlien), et les balises correspondantes :

```
[un lien vers une page Wikipédia](https://fr.wikipedia.org/wiki/Hyperlien)
```

## Citations


## Balisage sémantique

Les mots ou les expressions que l'on veut baliser sémantiquement sont entre ```[]``` et suivi par des ```{}``` dans lesquelles on déclare la classe.

Par exemple:

```
Voici la [thèse fondamentale de l'article]{.these}.
```

Donnera en HTML:

```
Voici la <span class="these">thèse fondamentale de l'article</span>
```
