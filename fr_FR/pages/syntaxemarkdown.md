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
Une image peut être intégrée à un document rédigé avec le langage de balisage Markdown avec le balisage suivant :

- un point d'exclamation `!` ;
- suivi de crochets `[]` comportant la description de l'image ;
- puis de parenthèses `()` comportant le chemin ou l'adresse de l'image.

Voici une image, en l'occurrence le logo du W3C (World Wide Web Consortium) :

![Logo du W3C composé de la lettre W en bleu, du chiffre 3 en bleu et de la lettre C en noir](https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/W3C_icon.svg/212px-W3C_icon.svg.png)

Et voici le balisage correspondant :

```
![Logo du W3C composé de la lettre W en bleu, du chiffre 3 en bleu et de la lettre C en noir](https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/W3C_icon.svg/212px-W3C_icon.svg.png)
```

## Liens
Les liens se balisent en distinguant :

- le lien, c'est-à-dire le mot ou l'expression indiqué comme un lien, avec des crochets `[]` ;
- et la cible, l'URL de destination, avec des parenthèses `()`.

Voici [un lien vers une page Wikipédia](https://fr.wikipedia.org/wiki/Hyperlien), et les balises correspondantes :

```
[un lien vers une page Wikipédia](https://fr.wikipedia.org/wiki/Hyperlien)
```

## Citations
Une citation peut être indiquée sémantiquement par le biais du balisage suivant : un crochet fermant suivi d'un espace en début de paragraphe `> `.
Voici un exemple de citation :

> Un lien hypertexte ou hyperlien permet en cliquant dessus d'atteindre un autre endroit de la page, une autre page ou un autre site évalué comme pertinent par l'auteur.
> Source : [Wikipédia](https://fr.wikipedia.org/wiki/Hyperlien)

Et voici le balisage correspondant :
```
> Un lien hypertexte ou hyperlien permet en cliquant dessus d'atteindre un autre endroit de la page, une autre page ou un autre site évalué comme pertinent par l'auteur.
> Source : [Wikipédia](https://fr.wikipedia.org/wiki/Hyperlien)
```

## Espace insécable

Les espaces insécables sont représentés par un point médian : `·`. Exemple : `Comment allez-vous·?` Ils peuvent ajoutés avec la commande `Ctrl`+`Shift`+`Espace`.

Il est aussi possible d'utiliser l'espace insécable en ASCII `&nbsp;`.

À noter que si votre source markdown provient de la conversion pandoc docx (ou odt) vers markdown, les espaces insécables seront conservés et présentés dans Stylo sous forme de point médian.

## Balisage sémantique

Le balisage sémantique permet de spécifier la fonction d'un mot, d'une expression ou d'un paragraphe.

Stylo permet un balisage sémantique libre : chaque auteur peut définir ses propres balises en fonction de ses besoins particulier.

Les mots ou les expressions que l'on veut baliser sémantiquement sont entre ```[]``` et suivi par des ```{}``` dans lesquelles on déclare la classe.

Par exemple:

```
Voici la [thèse fondamentale de l'article]{.these}.
```

Donnera en HTML:

```
Voici la <span class="these">thèse fondamentale de l'article</span>
```

Pour baliser un paragraphe entier, on peut utiliser la syntaxe suivante:

```
::: {.these}
Mon paragraphe qui contient une thèse de l'article.
:::
```
Qui donnera en HTML


```
<div class="these">
Mon paragraphe qui contient une thèse de l'article.
</div>
```

La prévisualisation Stylo implémente l'affichage des classes sémantiques suivantes:

- these
- description
- exemple
- epigraphe
- concept
- definition
- dedicace
- question

Il est possible de baliser un élément textuel avec plusieurs attributs. Par exemple:

```
::: {.infogeo}
[Athène]{.ville id="https://www.wikidata.org/wiki/Q1524" gps="37.58.46N, 23.42.58E"} est la capitale de la Grèce.
:::

```
Donnera en HTML:
```
<div class="infogeo">
<p><span id="https://www.wikidata.org/wiki/Q1524" class="ville" data-gps="37.58.46N, 23.42.58E">Athène</span> est la capitale de la Grèce.</p>
</div>
```

## Tableaux

Les tableaux se réalisent avec la syntaxe suivante:

- `|` sépare les colonnes
- un saut de ligne sépare les lignes
- `-` produit des lignes de séparation

Par exemple, la syntaxe:

```
|Nom    |Prénom|Date de naissance|Lieu de naissance|Couleur des yeux|
|------ |---|---|---|---|
|Bianchini|Francesco|3-1-1920|Scandicci|Bleux|
|Dupont|Pierre|7-9-1989|Chicoutimi|Verts|
|Gianna|Bienfaisant|9-10-2005  |Florence|Marrons   |
```

Donnera:

|Nom    |Prénom|Date de naissance|Lieu de naissance|Couleur des yeux|
|------ |---|---|---|---|
|Bianchini|Francesco|3-1-1920|Scandicci|Bleux|
|Dupont|Pierre|7-9-1989|Chicoutimi|Verts|
|Gianna|Bienfaisant|9-10-2005  |Florence|Marrons   |
