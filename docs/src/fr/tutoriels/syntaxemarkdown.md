---
title: "Écrire en Markdown"
---

## Niveaux de titres

- Le titre de niveau 1 - à savoir le titre de l’article - doit être renseigné dans les métadonnées.
- Les titres de niveau 2 (titres de section) sont précédés par deux #. Par exemple&nbsp;: ## Introduction.
- Les titres de niveau 3 (sous-section) sont précédés par 3 #. Par exemple&nbsp;: ### Ma sous-section.
- Et ainsi de suite (niveau 4, ####, etc.).

## Paragraphes

Pour créer des paragraphes, il faut laisser une ligne vide entre vos blocs de texte.

## Notes de bas pages

Il y a plusieurs manières d'insérer des notes de bas de page dans votre texte. Les notes peuvent être dans le corps du texte (inline) ou avec appel de note et renvoi en bas de l'article. La première option à l'avantage de ne pas requérir de faire des allers-retours entre le corps du texte et la note elle-même, en bas du document. 

Exemples :

```
Voici mon texte^[Une note de bas de page inline.].
```

rendra :

Voici mon texte<sup><a href="syntaxemarkdown.md#note-1" id="#note-1-b">1</a></sup>.

*Voir la note de bas de page à la fin de l'article.*

Ou alors :

```
Voici mon texte[^2].

[^2]: Une note de bas de page avec appel et renvoi.
```

rendra :

Voici mon texte <sup><a href="syntaxemarkdown.md#note-2" id="#note-2-b">2</a></sup>.

*Voir la note de bas de page à la fin de l'article.*

## Italique et gras 

- L’italique se balise avec des _ ou des * avant et après le mot ou l’expression en italique. Par exemple&nbsp;:

```
Voici un _mot_ en italique
```

Cela donne&nbsp;:

Voici un _mot_ en italique

- Le gras se balise avec deux `__` ou deux `**` avant et après le mot ou l’expression en gras. Par exemple&nbsp;:

```
Voici un **mot** en gras
```

Cela donne&nbsp;:

Voici un **mot** en gras

- Pour utiliser le gras et l'italique en même temps, simplement ajouter trois `*` ou trois `_` avant et après un mot. Il est aussi possible d'utiliser `_**` ou `*__` de chaque côté du mot. 

```
Voici un ***mot*** en gras et italique

Autre _**exemple**_

```

Cela donne&nbsp;:

Voici un ***mot*** en gras et italique

Autre _**exemple**_

## Liste 

Vous pouvez faire des listes à l'aide de tirets `-`, d'un `+`, d'un `*` ou de numéros suivi d'un point `1.`. Pour créer une liste imbriquée dans une autre, il suffit d'ajouter un alinéa avant votre tiret. **Attention**, il faut laisser une ligne vide avant votre liste. 

```
- Voici 
    + une 
    * liste

ou

1. Voici 
2. une 
3. liste
```

Cela donne&nbsp;: 

- Voici 
    + une 
    * liste

ou

1. Voici 
2. une 
3. liste

## Images 

Une image peut être intégrée à un article selon le modèle suivant&nbsp;:

- Un point d’exclamation ! ;
- suivi de crochets [] comportant la description de l’image ;
- et de parenthèses () comportant le chemin ou le lien de l’image.

Voici le balisage&nbsp;:

```
![IMAGE Logo du Markdown](https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Markdown-mark.svg/langfr-130px-Markdown-mark.svg.png)
```

Et cela donne&nbsp;:

![IMAGE Logo du Markdown](/uploads/images/refonte_doc/Markdown-mark.svg.png)

**Attention&nbsp;:** les images doivent être au format PNG (`.png`), ce format est nécessaire pour l’export PDF.

- Pour insérer un lien à une image, il faut ajouter deux crochets `[]` autour du balisage de l'image, suivi d'un lien entre parenthèses. 

```
[![IMAGE Logo du Markdown](https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Markdown-mark.svg/langfr-130px-Markdown-mark.svg.png)](https://fr.wikipedia.org/wiki/Markdown)
```

Cela donne&nbsp;: 

[![IMAGE Logo du Markdown](/uploads/images/refonte_doc/Markdown-mark.svg.png)](https://fr.wikipedia.org/wiki/Markdown)


## Ligne

Pour créer une ligne de séparation, il faut utiliser trois `***`, `---` ou une suite de tirets bas  `_______` sur ligne seule. 

Par exemple&nbsp;:

```
***

---

______________
```

Cela donne&nbsp;: 

***

---

___

## Liens

Les liens se balisent en distinguant&nbsp;:

- le lien, c’est-à-dire le mot ou l’expression indiqué comme un lien, avec des crochets [] ;
- et la cible, l’URL de destination, avec des parenthèses ().

Voici [un lien vers une page Wikipédia](https://fr.wikipedia.org/wiki/Marcello_Vitali-Rosati), et les balises correspondantes&nbsp;:

```
[un lien vers une page Wikipédia](https://fr.wikipedia.org/wiki/Marcello_Vitali-Rosati)
```

Vous pouvez aussi utiliser les crochets `<>`pour insérer une URL. 

```
Le blog de Marcello Vitali-Rosati est le suivant : <https://vitalirosati.com/>
```

Cela donne&nbsp;:

Le blog de Marcello Vitali-Rosati est le suivant&nbsp;: <https://vitalirosati.com/>

## Citations 

- Une citation peut être indiquée sémantiquement par le biais du balisage suivant&nbsp;: un crochet fermant suivi d’un espace en début de paragraphe `> `. Il est aussi possible d'avoir plus d'un paragraphe dans votre citation, il faut simplement ajouter une ligne vide munie d'un crochet fermant. Voici un exemple de citation&nbsp;:

> Un lien hypertexte ou hyperlien permet en cliquant dessus d’atteindre un autre endroit de la page, une autre page ou un autre site évalué comme pertinent par l’auteur·e. 
> 
> Source&nbsp;: [Wikipédia](https://fr.wikipedia.org/wiki/Hyperlien)

Et voici le balisage correspondant&nbsp;:

```
> Un lien hypertexte ou hyperlien permet en cliquant dessus d'atteindre un autre endroit de la page, une autre page ou un autre site évalué comme pertinent par l'auteur.
> 
> Source : [Wikipédia](https://fr.wikipedia.org/wiki/Hyperlien)
```

- Une citation peut être imbriquée à l'intérieur d'une autre citation en utilisant deux crochets fermants.

> Un lien hypertexte ou hyperlien permet en cliquant dessus d’atteindre un autre endroit de la page, une autre page ou un autre site évalué comme pertinent par l’auteur. 
> 
>> Source&nbsp;: [Wikipédia](https://fr.wikipedia.org/wiki/Hyperlien)

Et voici le balisage correspondant&nbsp;:

```
> Un lien hypertexte ou hyperlien permet en cliquant dessus d'atteindre un autre endroit de la page, une autre page ou un autre site évalué comme pertinent par l'auteur.
> 
>> Source : [Wikipédia](https://fr.wikipedia.org/wiki/Hyperlien)
```

- Il est possible d'utiliser de la syntaxe Markdown à l'intérieur de vos citations, tels que les titres, l'italique, le gras ou les tirets. 

> ### Hyperlien
> Un lien *hypertexte* ou __hyperlien__ permet en cliquant dessus d’atteindre 
> 
> - un autre endroit de la page, 
> - une autre page ou 
> - un autre site évalué comme pertinent par l’auteur. 
> 
> Source&nbsp;: [Wikipédia](https://fr.wikipedia.org/wiki/Hyperlien)

Et voici le balisage correspondant&nbsp;:

```
> ### Hyperlien
> Un lien *hypertexte* ou __hyperlien__ permet en cliquant dessus d’atteindre 
> 
> - un autre endroit de la page, 
> - une autre page ou 
> - un autre site évalué comme pertinent par l’auteur. 
> 
> Source : [Wikipédia](https://fr.wikipedia.org/wiki/Hyperlien)
```

## Espace insécable 

Les espaces insécables sont représentés par un point discret&nbsp;: `·` ou un rectangle orangé ` `. 
<!-- Remplacer le rectangle orange par une capture d'écran dans les trois versions -->

Il peuvent être ajoutés avec l’espace insécable en ASCII `&nbsp;` ou en maintenant la touche `Alt` enfoncée et en tapant `0160` ou `255`.

## Tableaux

Les tableaux se réalisent avec la syntaxe suivante:

- `|` sépare les colonnes
- un saut de ligne simple sépare les lignes
- la seconde ligne définit l'alignement de la colonne&nbsp;:
  - `:--` aligne la colonne à gauche
  - `:-:` aligne la colonne au centre
  - `--:` aligne la colonne à droite

Par exemple, la syntaxe&nbsp;:

```markdown
|Nom|Prénom|Date de naissance|Lieu de naissance|Couleur des yeux|
|:--|:--|:-:|:-:|--:|
|Bianchini|Francesco|3-1-1920|Scandicci|Bleux|
|Dupont|Pierre|7-9-1989|Chicoutimi|Verts|
|Gianna|Bienfaisant|9-10-2005|Florence|Marrons|
```

Cela donne&nbsp;:

|Nom|Prénom|Date de naissance|Lieu de naissance|Couleur des yeux|
|:--|:--|:-:|:-:|--:|
|Bianchini|Francesco|3-1-1920|Scandicci|Bleux|
|Dupont|Pierre|7-9-1989|Chicoutimi|Verts|
|Gianna|Bienfaisant|9-10-2005|Florence|Marrons|

## Balisage sémantique 

Le balisage sémantique permet de spécifier la fonction d'un mot, d'une expression ou d'un paragraphe.

Stylo permet un balisage sémantique libre&nbsp;: chaque auteur·e peut définir sa propre sémantique en fonction de ses besoins particuliers. Elle pourra ensuite être implémentée dans les modèles d'export ou les feuilles de style personnalisées (voir la section [Personnaliser son export](/fr/mesarticles)).

La syntaxe markdown de balisage sémantique est la suivante&nbsp;: `[terme à baliser]{.categorie}`.

Par exemple&nbsp;: `On peut considérer cette [rupture]{.concept} emblématique de...` identifie le terme `rupture` comme un `concept`.

Le texte markdown suivant&nbsp;:

```
Voici la [thèse fondamentale de l'article]{.these}.
```

Cela donne en HTML&nbsp;:

```html
Voici la <span class="these">thèse fondamentale de l'article</span>
```

Pour baliser un paragraphe entier, on utilise la syntaxe suivante&nbsp;:

```
::: {.these}

Mon paragraphe qui contient une thèse de l'article.

:::
```

Cela donne en HTML&nbsp;:

```html
<div class="these">
  <p>Mon paragraphe qui contient une thèse de l'article.</p>
</div>
```

La prévisualisation Stylo implémente l'affichage des classes sémantiques suivantes&nbsp;:

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

Il est possible de baliser un élément textuel avec plusieurs attributs. Par exemple&nbsp;:

```
::: {.infogeo}

[Athènes]{.ville id="https://www.wikidata.org/wiki/Q1524" gps="37.58.46N, 23.42.58E"} est la capitale de la Grèce.

:::
```

Cela donne en HTML&nbsp;:

```html
<div class="infogeo">
<p><span id="https://www.wikidata.org/wiki/Q1524" class="ville" data-gps="37.58.46N, 23.42.58E">Athène</span> est la capitale de la Grèce.</p>
</div>
```

Il est également possible d'utiliser ce balisage sémantique pour structurer les données en RDFa, voici deux exemples&nbsp;:

```
Auteur du texte : [John Dewey]{property="dc:creator"}
```

Cela donne en HTML&nbsp;:

```html
<p>Auteur du texte : <span data-property="dc:creator">John Dewey</span></p>
```

Deuxième exemple&nbsp;:

```
John Dewey est né le [20 octobre 1859]{property="dc:date" content="1859-10-20"}.

```

Cela donne en HTML&nbsp;:

```html
<p>John Dewey est né le <span property="dc:date" content="1859-10-20">20 octobre 1859</span></p>
```

## Caractères d'échappement

Afin d'afficher un caractère spécial, qui serait normalement utilisé pour le balisage dans un article écrit en Markdown, il suffit d'ajouter une barre oblique inverse `\` avant le caractère.

Par exemple&nbsp;:

```
\+ Avec l'ajout de la barre oblique, le signe positif ne devient pas un élément d'une liste.
```

Cela donne&nbsp;:

\+ Avec l'ajout de la barre oblique, le signe positif ne devient pas un élément d'une liste.

---

Pour aller plus loin, vous pouvez toujours consulter d'autres guides sur la syntaxe Markdown. Toute suggestion d'ajout à notre documentation est la bienvenue.

1. <span id="note-1">Une note de bas de page inline. <a href="#note-1-b">↩</a></span>
2. <span id="note-2">Une note de bas de page avec appel et renvoi. <a href="#note-2-b">↩</a></span>
