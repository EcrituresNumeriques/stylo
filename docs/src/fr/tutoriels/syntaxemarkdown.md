---
title: "Syntaxe Markdown"
---

## Titres

- Le titre de niveau 1 - à savoir le titre de l'article - doit être renseigné dans les métadonnées.
- Les titres de niveau 2 (titres de section) sont précédés par 2 `#`. Par exemple : `## Introduction`.
- Les titres de niveau 3 (sous-section) sont précédés par 3 `#`. Par exemple : `### Mon titre de sous-section`.
- Et ainsi de suite (niveau 4, 4 `#`, etc.).

## Les notes

Les notes peuvent être dans le corps du texte (inline) ou avec appel de note et renvoi en bas de l'article.

Exemples :

```
Voici mon texte^[Une note de bas de page inline.].
```

rendra :

Voici mon texte<sup><a href="syntaxemarkdown.md#note-1" id="#note-1-b">1</a></sup>.


Ou alors :

```
Voici mon texte[^2].

[^2]: Une note de bas de page avec appel et renvoi.
```

rendra :

Voici mon texte <sup><a href="syntaxemarkdown.md#note-2" id="#note-2-b">2</a></sup>.


## Italiques et gras

- L'italique se balise avec des `_` avant et après le mot ou l'expression en italique. Par exemple :

```
Voici un _mot_ en italique
```

donnera :

Voici un _mot_ en italique


- Le gras se balise avec deux `**` avant et après le mot ou l'expression en italique. Par exemple :
```
Voici un **mot** en gras
```

donnera :

Voici un **mot** en gras


## Images
Une image peut être intégrée à un document rédigé avec le langage de balisage Markdown selon le modèle suivant :

- un point d'exclamation `!` ;
- suivi de crochets `[]` comportant la description de l'image ;
- puis de parenthèses `()` comportant le chemin ou l'adresse de l'image.

Voici une image, en l'occurrence le logo du W3C (World Wide Web Consortium) :

![Logo du W3C composé de la lettre W en bleu, du chiffre 3 en bleu et de la lettre C en noir](https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/W3C_icon.svg/212px-W3C_icon.svg.png)

Et voici le balisage correspondant :

```
![Logo du W3C composé de la lettre W en bleu, du chiffre 3 en bleu et de la lettre C en noir](https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/W3C_icon.svg/212px-W3C_icon.svg.png)
```

**Attention :** les images doivent être au format PNG (`.png`), ce format est nécessaire pour l'export PDF.

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

Les espaces insécables sont représentés par un point discret : `·`. Exemple : `Comment allez-vous·?` Ils peuvent être ajoutés avec la commande `Ctrl`+`Shift`+`Espace`.

Il est aussi possible d'utiliser l'espace insécable en ASCII `&nbsp;`.

À noter que si votre source markdown provient de la conversion Pandoc DOCX (ou ODT) vers Markdown, les espaces insécables seront conservés et présentés dans Stylo sous forme de point médian.

## Balisage sémantique

Le balisage sémantique permet de spécifier la fonction d'un mot, d'une expression ou d'un paragraphe.

Stylo permet un balisage sémantique libre : chaque auteur·e peut définir sa propre sémantique en fonction de ses besoins particuliers. Elle pourra ensuite être implémentée dans les templates d'export ou les feuilles de style personnalisées (voir la section [Personnaliser son export](/fr/mesarticles)).

La syntaxe markdown de balisage sémantique est la suivante : `[terme à baliser]{.categorie}`.

Par exemple : `On peut considérer cette [rupture]{.concept} emblématique de...` identifie le terme `rupture` comme un `concept`.

Le texte markdown suivant :

```markdown
Voici la [thèse fondamentale de l'article]{.these}.
```

donnera en HTML :

```html
Voici la <span class="these">thèse fondamentale de l'article</span>
```

Pour baliser un paragraphe entier, on utilise la syntaxe suivante :

```md
::: {.these}

Mon paragraphe qui contient une thèse de l'article.

:::
```

donnera en HTML :

```html
<div class="these">
  <p>Mon paragraphe qui contient une thèse de l'article.</p>
</div>
```

La prévisualisation Stylo implémente l'affichage des classes sémantiques suivantes :

- these
- description
- exemple
- concept
- definition
- question
- epigraphe
- dedicace
- credits
- source

Il est possible de baliser un élément textuel avec plusieurs attributs. Par exemple :

```markdown
::: {.infogeo}

[Athènes]{.ville id="https://www.wikidata.org/wiki/Q1524" gps="37.58.46N, 23.42.58E"} est la capitale de la Grèce.

:::
```

donnera en HTML :

```html
<div class="infogeo">
<p><span id="https://www.wikidata.org/wiki/Q1524" class="ville" data-gps="37.58.46N, 23.42.58E">Athène</span> est la capitale de la Grèce.</p>
</div>
```

Il est également possible d'utiliser ce balisage sémantique pour structurer les données en RDFa, voici deux exemples :

```markdown
Auteur du texte : [John Dewey]{property="dc:creator"}
```

donnera en HTML :

```html
<p>Auteur du texte : <span data-property="dc:creator">John Dewey</span></p>
```

Deuxième exemple :

```markdown
John Dewey est né le [20 octobre 1859]{property="dc:date" content="1859-10-20"}.

```

donnera en HTML :

```html
<p>John Dewey est né le <span property="dc:date" content="1859-10-20">20 octobre 1859</span></p>

```

## Tableaux

Les tableaux se réalisent avec la syntaxe suivante:

- `|` sépare les colonnes
- un saut de ligne simple sépare les lignes
- la seconde ligne définit l'alignement de la colonne :
  - `:--` aligne la colonne à gauche
  - `:-:` aligne la colonne au centre
  - `--:` aligne la colonne à droite

Par exemple, la syntaxe :

```markdown
|Nom|Prénom|Date de naissance|Lieu de naissance|Couleur des yeux|
|:--|:--|:-:|:-:|--:|
|Bianchini|Francesco|3-1-1920|Scandicci|Bleux|
|Dupont|Pierre|7-9-1989|Chicoutimi|Verts|
|Gianna|Bienfaisant|9-10-2005|Florence|Marrons|
```

donnera :

| Nom        | Prénom      | Date de naissance | Lieu de naissance | Couleur des yeux |
|:-----------|:------------|:-----------------:|:-----------------:|-----------------:|
| Bianchini  | Francesco   |     3-1-1920      |    Scandicci      |            Bleux |
| Dupont     | Pierre      |     7-9-1989      |    Chicoutimi     |            Verts |
| Gianna     | Bienfaisant |     9-10-2005     |     Florence      |          Marrons |

1. <span id="note-1">Une note de bas de page avec appel et renvoi. <a href="#note-1-b">↩</a></span>
2. <span id="note-2">Une note de bas de page inline. <a href="#note-2-b">↩</a></span>
