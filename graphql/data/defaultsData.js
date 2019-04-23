module.exports = {
  yaml:`---
id_sp: ''
bibliography: ''
title: ''
title_f: ''
subtitle: ''
subtitle_f: ''
year: ''
month: ''
day: ''
date: ''
url_article_sp: ''
publisher: Département des littératures de langue française
prod: Sens Public
prodnum: Sens Public
diffnum: Érudit
rights: >-
  Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC
  BY-NC-SA 4.0)
issnnum: 2104-3272
journal: Sens public
director:
  - forname: Marcello
    surname: Vitali-Rosati
    gender: male
    orcid: 0000-0001-6424-3229
    viaf: ''
    foaf: ''
    isni: ''
abstract: []
authors: []
dossier:
  - title: ''
    id: ''
redacteurDossier: []
typeArticle: []
translator:
  - forname: ''
    surname: ''
lang: fr
orig_lang: ''
translations:
  - lang: ''
    titre: ''
    url: ''
articleslies:
  - url: ''
    titre: ''
    auteur: ''
reviewers: []
keyword_fr_f: ''
keyword_en_f: ''
keyword_fr: ''
keyword_en: ''
controlledKeywords: []
link-citations: true
nocite: ''
---`,
  title:'New article',
  sommaire:'',
  md:'',
  message:'Genesis',
  article: {
      title:'How to Stylo',
      sommaire:`## Introduction
## Les titres
### Titres de niveau 3
## Syntaxe minimale
### Gras et italique
### Commentaire
### Images
### Listes
## Appareil critique
### Notes à bas de page
### Les références
### Les citations
## Versions et export
### Métadonnées
### Preview et annotation
### Export
## Bibliographie`,
      md: `## Introduction

Stylo est un éditeur de texte scientifique. Pour faire vos premiers pas sur Stylo, commencez par éditer cet article.

Stylo utilise le format *markdown* pour baliser et styler le texte. Cet article présente la syntaxe de base du markdown, et une documentation plus complète [est accessible ici](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet).

Vous pouvez visualiser l'article à tout moment en cliquant sur le bouton **Preview** dans le menu de gauche.

## Les titres

Les titres de niveaux 2 doivent être balisés avec 2 \`#\` (\`##\`) et non un seul, car le titre de niveau 1 correspond au titre de l'article, déclaré dans les métadonnées.

### Titres de niveau 3

Les titres de niveaux 3 doivent être balisés avec 3 \`#\` et ainsi de suite.

Un saut de ligne correspond au début d'un nouveau paragraphe.

## Syntaxe minimale

### Gras et italique

Voici du texte en *italique*. Voici du texte en **gras**.

### Commentaire

La ligne ci-dessous n'apparaitra pas dans le document final.

<!-- Cette ligne sera traitée comme un commentaire, elle n'apparaitra pas dans le document final -->

### Images

On peut insérer des images:

![Titre de mon image](https://avatars2.githubusercontent.com/u/16691667?s=200&v=4)

Notez que le «Titre de mon image» sera pris en compte comme légende de l'image dans l'article.

### Listes

Les listes non numérotées:

- item
- item
- item

Les listes numérotées:

1. item
2. item
3. item

L'ordre des chiffres n'est pas important:

1. item
2. item
4. item
3. item

Cette liste sera automatiquement ordonnée de 1 à 4.

## Appareil critique

### Notes de bas de page

Un appel de note de bas de page se fait ainsi[^1].  Par ailleurs, la note peut être déclarée n'importe où dans le document[^2], en fin de document ou juste en dessous par exemple[^3].

[^3]: Une note déclarée "n'importe où", ici, juste en dessous du paragraphe correspondant.

Le label de la note peut être ce que vous voulez : il peut être indifféremment un chiffre ou une suite de caractères[^notePage].

Une note de bas de page peut aussi être écrite dans le corps du texte, en sortant l'accent circonflexe des crochets^[Ceci est une note de bas de page inline. Elle peut être aussi longue que vous voulez, elle sera transformée comme les autres en note de bas de page].

### Les références

Un article scientifique utilise des références. Vous pouvez soit importer un fichier [bibtex](http://www.bib.umontreal.ca/lgb/BibTeX/default.htm) généré par votre logiciel de gestion bibliographique (conseillé), ou bien créer manuellement les références au format bibtex.

Les références sont ensuite insérées dans le texte grâce à leur _clé bibtex_. Pour récupérer la clé bibtex d'une référence, il suffit de cliquer sur la référence souhaitée dans la liste des référence ci-contre. La clé est alors ajouté à votre presse-papier, il suffit ensuite de la coller dans le texte [@goody_raison_1979].

Pour résumer :

  1. clic sur la référence: copier la clé
  2. coller ou CTRL+V : colle la clé dans le texte où est positionné le curseur [@goody_raison_1979].

Il est également possible d'ajouter une référence ainsi : « Comme le dit @goody_raison_1979, le geste ... »

La clé peut aussi être accompagnée de précision comme ici [@goody_raison_1979, pp.115].

Les références citées se retrouveront ensuite à la fin du texte dans la section \`## Bibliographie\`

### Les citations

Une citation dans le corps du texte est indiquée par guillemets « Stat rosa pristina nomine, nomina nuda tenemus ». Une citation plus longue peut être indiquée ainsi :

> Stat rosa pristina nomine, nomina nuda tenemus.
>
> la citation se poursuit avec un second paragraphe.

## Versions et export

### Métadonnées

Les métadonnées de l'article s'éditent dans le menu en haut à droite. Vous pouvez y indiquer le titre, sous-titre, le nom de l'auteur et son identifiant de l'Orcid[^orcid], le résumé et les mot-clés de l'article. Pour les éditeurs de revue, une série plus complète de métadonnées est également disponible.

[^orcid]: L'identifiant Orcid permettra de récupérer automatiquement l'affiliation et la biographie de l'auteur.

### Preview et annotation

Chaque version de votre texte peut être prévisualisée et annotée avec l'outil d'annotation Hypothes.is. Pour accéder à la preview, cliquez sur le bouton **Preview**. Pour accéder à la version html annotable, cliquez sur le bouton **Anotate**. Vous pouvez alors partager ces urls de preview et d'annotation. Chaque url est relative à la version du document.

### Export

Plusieurs types d'exports sont disponibles :

- XML Erudit : exporte un fichier xml compatible avec le schéma Erudit
- Zip : comprend les trois sources de l'article : yaml (métadonnées), bibtex (bibliographie), md (corps de texte)
- ...

## Annotations sémantiques

Il est possible de structurer sémantiquement votre texte avec des simples balises.

Il y a deux types d'annotation sémantiques:

1. Des annotations qui concernent un ou plusieurs mots dans le même paragraphe
2. Des annotations qui concernent plusieurs paragraphes

### Annotation dans un paragraphe

La syntaxe:

[Voici la thèse de l'article]{.these}

Produira en HTML:

<span class="these">Voici la thèse de l'article</span>

Dans la preview vous pouvez visualiser les classes:

- these
- definition
- exemple
- concept
- epigraphe
- dedicace
- note

### Annotation de plusieurs paragraphes

La syntaxe:


::: {.maclasse}

Ici un paragraphe.

Ici un autre paragraphe.

:::

Produira en HTML:

\`\`\`html

<div class="maclasse">
  <p>Ici un paragraphe.</p>
  <p>Ici un autre paragraphe.</p>
</div>

\`\`\`
Pour plus d'informations, consultez la documentation.

## Bibliographie

<!-- La bibliographie apparaîtra automatiquement en fin d'article, à cet endroit -->


[^1]: La note se trouve ensuite à la fin du texte.
[^2]: Voici une note déclarée en fin de document
[^notePage]: Voici une note avec un label textuel.
`,
      bib: `
@book{goody_raison_1979,
  series = {Le sens commun},
  title = {La {Raison} graphique. {La} domestication de la pensée sauvage.},
  publisher = {Les Editions de Minuit},
  author = {Goody, Jack},
  year = {1979},
}`,
      yaml: `---
title_f: Stylo
title: Stylo
subtitle_f: Un article type
subtitle: Un article type
authors:
  - forname: Marcello
    surname: Vitali-Rosati
    orcid: 0000-0001-6424-3229
    viaf: ''
    foaf: ''
    isni: ''
    wikidata: ''
  - forname: Nicolas
    surname: Sauret
    orcid: 0000-0001-7516-3427
    viaf: ''
    foaf: ''
    isni: ''
    wikidata: ''
date: 2018/05/29
year: '2018'
month: '05'
day: '29'
abstract:
  - lang: fr
    text: >-
      C'est article est un exemple d'article type édité sur Stylo. Stylo est un
      éditeur d'article scientifique dédié aux sciences humaines.

      Vous pouvez éditer cet article pour vous entraîner. Une documentation plus
      complète est accessible en cliquant sur le lien documentation.
    text_f: >-
      C'est article est un exemple d'article type édité sur _Stylo_. _Stylo_ est
      un éditeur d'article scientifique dédié aux sciences humaines. 

      Vous pouvez éditer cet article pour vous entraîner. Une documentation plus
      complète est accessible en cliquant sur le lien documentation.
keywords:
  - lang: fr
    list: 'édition, bac-à-sable'
    list_f: 'édition, bac-à-sable'
  - lang: en
    list: 'publishing, sandbox'
    list_f: 'publishing, sandbox'
lang: fr
typeArticle:
  - Essai
bibliography: SP1234.bib
link-citations: true
nocite: '*'
id_sp: SP1234
controlledKeywords:
  - label: Édition
    uriRameau: 'http://catalogue.bnf.fr/ark:/12148/cb13318593f'
    idRameau: FRBNF13318593
---`
  }


}
