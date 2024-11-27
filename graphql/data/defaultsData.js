module.exports = {
  article: {
    title: 'How to Stylo',
    // https://www.zotero.org/groups/2464757/collections/PLXDF42M
    zoteroLink: '2464757/collections/PLXDF42M',
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

![Titre de mon image](https://github.com/ecrituresnumeriques.png)

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

Les références sont ensuite insérées dans le texte grâce à leur _clé bibtex_. Pour récupérer la clé bibtex d'une référence, il suffit de cliquer sur la référence souhaitée dans la liste des référence ci-contre. La clé est alors ajouté à votre presse-papier, il suffit ensuite de la coller dans le texte [@petit_sue-_1999, @pitavy_au_2006].

Pour résumer :

  1. clic sur la référence: copier la clé
  2. coller ou CTRL+V : colle la clé dans le texte où est positionné le curseur [@petit_sue-_1999, @pitavy_au_2006].

Il est également possible d'ajouter une référence ainsi : « Comme le dit @petit_sue-_1999, le pronom réfléchi ... »

La clé peut aussi être accompagnée de précision comme ici [@pitavy_au_2006, pp.230].

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
    /* eslint-disable no-useless-escape */
    bib: `
@book{petit_sue-_1999,
	title = {*{Sue}- en grec ancien: la famille du pronom réfléchi : linguistique grecque et comparaison indo-européenne},
	isbn = {978-90-429-0776-8},
	shorttitle = {*{Sue}- en grec ancien},
	abstract = {Dans la plupart des langues indo-europeennes, la notion de reflexivite est exprimee a traves de differentes formes pronominales qui paraissent pouvoir toutes proceder d'un theme "sue-. L'ouvrage etudie les representants de ce theme en grec ancien, notamment le pronom reflechi du grec archaique, dont Homere fournit un paradigme complet. Ces formes du pronom reflechi se trouvent placees en grec au centre d'une contradiction: d'un point de vue morphologique, elles peuvent apparaitre proches des pronoms personnels, tandis que, par la nature de leur reference, elles leur sont etrangeres et se rapprochent plus des anaphoriques et des demonstratifs. Le present travail s'est efforce de resoudre cette contradiction en etudiant de maniere systematique les convergences et les divergences entre reflechi et pronoms personnels, non seulement en grec archaique, mais aussi de maniere plus generale dans les langues indo-europeennes. Differents criteres sont envisages: accent, structure du theme, formation des adjectifs possessifs, expression du nombre et de la personne. L'ouvrage etudie successivement les donnees de la philologie grecque et celles de la grammaire comparee. Il s'attache a rendre compte des structures etymologiques dans lesquelles apparait le pronom reflechi de l'indo-europeen, mais aussi de la diversite typologique de ses representants dans les langues historiques.},
	language = {fr},
	publisher = {Peeters Publishers},
	author = {Petit, Daniel},
	year = {1999},
	keywords = {Language Arts \& Disciplines / Linguistics / General},
}
@incollection{pitavy_au_2006,
	address = {Saint-Étienne},
	series = {Mémoires / {Centre} {Jean}-{Palerne}},
	title = {Au sujet du pronom sujet: ἐγώ et la liberté du locuteur en grec},
	volume = {numéro hors-série},
	shorttitle = {Au sujet du pronom sujet},
	abstract = {Étudie les emplois du pronom personnel sujet de la première personne en grec, à partir de deux niveaux d'opposition : informationnel (thème vs rhème) et pragmatique (non focalisé vs focalisé) ; dans presque tous les cas, cet emploi correspond au terme fort de chaque opposition (rhème ou focalisé)},
	booktitle = {« Ἐν κοινωνίᾳ πᾶσα φιλία »: mélanges offerts à {Bernard} {Jacquinod}},
	publisher = {Publications de l’Université de Saint-Étienne},
	author = {Pitavy, Jean-Christophe},
	editor = {Breuil, Jean-Luc},
	year = {2006},
	pages = {227--242},
}`,
    metadata: {
      type: 'article',
      '@version': '1.0',
      id: 'SP1711',
      publicationDate: '2024-05-12',
      license: 'CC BY-SA 4.0',
      acknowledgements: '',
      lang: 'fr',
      title: 'Stylo',
      subtitle: 'Un article type',
      abstract: `C'est article est un exemple d'article type édité sur _Stylo_. _Stylo_ est un éditeur d'article scientifique dédié aux sciences humaines.
Vous pouvez éditer cet article pour vous entraîner. Une documentation plus complète est accessible en cliquant sur le lien documentation.`,
      keywords: [
        'édition',
        'bac-à-sable'
      ],
      localizedContent: [
        {
          lang: 'en',
          abstract: '',
          keywords: [
            'publishing',
            'sandbox'
          ]
        }
      ],
      controlledKeywords: [
        {
          idRameau: 'FRBNF13318593',
          label: 'Édition',
          uriRameau: 'http://catalogue.bnf.fr/ark:/12148/cb13318593f'
        }
      ],
      authors: [
        {
          affiliations: '',
          biography: '',
          email: '',
          foaf: '',
          forename: 'Marcello',
          isni: '',
          orcid: '0000-0001-6424-3229',
          surname: 'Vitali-Rosati',
          viaf: '',
          wikidata: ''
        },
        {
          affiliations: '',
          biography: '',
          email: '',
          foaf: '',
          forename: 'Nicolas',
          isni: '',
          orcid: '0000-0001-7516-3427',
          surname: 'Sauret',
          viaf: '',
          wikidata: ''
        }
      ],
      issueDirectors: [],
      reviewers: [],
      translators: [],
      journalDirectors: [],
      issue: {},
      production: {
        issn: '',
        entities: []
      },
      funder: {
        organization: '',
        id: ''
      },
      journal: {}
    }
  }
}
