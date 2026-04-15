---
title: "Mémoires et thèses"
header-includes: |
  <style> 

  .highlight-brush-blue {
  position: relative;
  display: inline;
  white-space: nowrap;
  z-index: 1;}

  .highlight-brush-blue::before {
    content: '';
    position: absolute;
    left: -3px;
    right: -3px;
    top: 10%;
    bottom: 5%;
    background: #88b9bb;
    border-radius: 2px 4px 3px 2px / 3px 2px 4px 3px;
    transform: rotate(-0.4deg) skewX(-1deg);
    z-index: -1;
    clip-path: polygon(
      0% 15%, 3% 5%, 8% 0%, 20% 3%, 35% 1%,
      50% 4%, 65% 0%, 80% 3%, 92% 0%, 100% 8%,
      98% 30%, 100% 55%, 99% 75%, 100% 90%,
      95% 100%, 80% 96%, 65% 100%, 50% 97%,
      35% 100%, 20% 97%, 8% 100%, 2% 92%,
      0% 70%, 1% 45%
    );}

  </style>

---

## Principe et tuto

Un mémoire ou une thèse est un **corpus** composé d'autant de **chapitres** que d'**articles** Stylo. 

Voici les étapes à suivre : 

- Écrire un article Stylo par chapitre
- Créer un corpus type `Thèse`

![Corpus de type Thèse](docs/uploads/images/refonte_doc/thesiscorpus.png)

- Rassembler tous les articles qui correspondent à vos chapitres dans ce corpus
- Les ordonner en les faisant glisser

![ordonner des articles dans un corpus](docs/uploads/images/refonte_doc/classer.gif)

Chaque chapitre ou partie fonctionne donc comme un document Stylo :

- il possède ses propres métadonnées
- il possède sa propre bibliographie
- il peut être partagé en tant que tel (annotation, preview, etc.). C'est au moment de l'export du mémoire que les différentes parties sont éditées ensemble

## Quelques points d'attention pour la rédaction

### Où remplir les métadonnées ? 

Les métadonnées concernant le chapitre sont à renseigner au niveau de l'**article**. Il existe un formulaire spécial qui repose sur les mêmes clés YAML que l'article, mais il renomme et trie les champs de formulaire pour que pour avoir uniquement des champs pertinents visibles. La seule métadonnée importante et la seule à remplir *a minima* est le titre. 

![métadonnées de chapitre](docs/uploads/images/refonte_doc/titlechap.png)

Les métadonnées globales concernant la thèse doivent être renseignées au niveau du **corpus**. Du choix du type "Thèse" découle l'affichage d'un formulaire spécialisé. Ne pas oublier d'*enregistrer*, et non simplement fermer la modale. 

![métadonnées de corpus](docs/uploads/images/refonte_doc/corpusmetadata.gif)

### Niveaux de titre

Comme il est d'usage sur Stylo, le titre principal du chapitre / article est celui renseigné dans les métadonnées. Il est donc important de remplir le champ titre *a minima*. Ensuite on commence avec deux croisillons `##` pour le premier niveau de section à l'intérieur du chapitre. 

### Bibliographie

Par défaut la bibliographie générée est celle de l'ensemble des références citées ou présentes dans les différents articles qui composent le mémoire ou la thèse. Le module d'export se charge d'empiler les fichiers bibtex de chaque article et de dédoublonner si besoin. Les références apparaîtront par ordre alphabétique sous le titre *Bibliographie* à la fin.

Mais il est également possible de diviser la bibliographie en plusieurs sections :

1. Pour chaque item bibliographique, ajouter dans le champ keyword une clé identifiant la section bibliographique. Elle doit être en un mot et sans tiret (par exemple `prim` pour les références primaires et `sec` pour les références secondaires). Cette étape peut être réalisée dans Zotero ou dans le BibTeX brut.

![Tags dans Zotero](docs/uploads/images/refonte_doc/zotero.png)

2. Créer un article dont le titre est "Bibliographie" et l'ajouter comme dernier chapitre du corpus.
3. Pour chaque sous-section, ajouter un titre de niveau 2 (`##`) et le snippet de code suivant : 

```
::: {#refs-<clé-identifiant-cette-section>}
:::
```

Exemple : 

```markdown
## Corpus Primaire

::: {#refs-prim}
:::

## Références secondaires

::: {#refs-sec}
:::
```

<pre>
## Corpus Primaire

::: {#refs-<span class="highlight-brush-blue">prim</span>}
:::

## Références secondaires

::: {#refs-<span class="highlight-brush-blue">sec</span>}
:::
</pre>

donnant dans le bibtex 

```bibtex
@article{wevers_visual_2020,
	title = {The visual digital turn: {Using} neural networks to study historical images},
	volume = {35},
	issn = {2055-7671},
	shorttitle = {The visual digital turn},
	url = {https://doi.org/10.1093/llc/fqy085},
	doi = {10.1093/llc/fqy085},
  ...
	keywords = {ia},
}
```

<pre>
@article{wevers_visual_2020,
	title = {The visual digital turn: {Using} neural networks to study historical images},
	volume = {35},
	issn = {2055-7671},
	shorttitle = {The visual digital turn},
	url = {https://doi.org/10.1093/llc/fqy085},
	doi = {10.1093/llc/fqy085},
  ...
	<span class="highlight-brush-blue">keywords = {sec},</span>
}
</pre>


<!--Alerte Nicolaserie : tentative de surligner les identifiants, mais si ça marche pas on laisse juste la syntaxe markdown, il suffit d'effacer ce sui ne va pas rester-->


### Remerciements

Les remerciements peuvent être injectées automatiquement dans le template. Un champ sera bientôt disponible dans le formulaire de métadonnées du template. En attendant, il est possible de les ajouter à la main dans le YAML brut. 

```yaml
'@version': '1.0'
abstract: voici l'abstract
ackowledgements: |
  merci Pierre
  merci Paul
  merci Jacques
```

## Exports 

### Version imprimée

L'export PDF du mémoire ou de la thèse se fait via le module d'export : https://export.stylo.huma-num.fr/

Il utilise un template LaTeX satisfaisant les exigences de la plupart des départements de l'UdeM (et nous vous invitons fortement à vérifier). Le choix de la font *Old Standard* est peu conventionnel mis permet d'imprimer les carcatères grecs. 

Voici la marche à suivre : 

1. Sélectionner Thèses/Mémoires
2. Donner un titre à l'export et aller chercher l'identifiant du corpus <!--lien : il existe un tuto pour trouver l'id du corpus ?-->
3. Sélectionner les options

- `avec table des matière` pour afficher cette dernière
- `avec toutes les citations` pour avoir tous les items de votre collection biblio dans la biblio finale, même les référence pas citées
- `avec citations liées` pour avoir un lien sur chaque référence citée vers la bibliographie

### HTML / GSS

L'export de l'ensemble des articles d'un corpus se fait dans le gestionnaire de corpus. Cliquer sur l'icône 🖨 et sélectionner "HTML" comme format. Cette opération crée une archive contenant un fichier HTML indépendant par article. La même opération, en sélectionnant "fichiers originaux (md, yaml, bib)", crée une archive contenant pour chaque article les fichiers sources. Ces derniers s'insèrent alors dans une architecture, qui, grâce à l'usage d'un GSS (Quarto, Jekyll, Hugo), crée un site web. 

## Mise en perspective et avertissement

Stylo peut être un bon compagnons dans la rédaction d'un mémoire ou d'une thèse portée par une démarche d'affranchissement des environnements proprétaires. Markdown a l'avantage de la légèreté du balisage, ce qui permet d'écrire en évitant le bruit que peuvent présenter des syntaxes plus verbeuses comme LaTeX ou HTML. Stylo facilite également la collaboration avec vos relecteur.ices et assure le formatage (stylage) de la bibliographie, utilisant les styles de la bibliothèque Zotero. Enfin, ses nombreuses options d'export ouvrent la voie à une publication multiformat.

Cela dit, un mémoire ou une thèse est un document complexe dont les exigences de mise en forme dépassent ce que Stylo et Markdown peuvent offrir pour la version imprimée finale. L'export PDF d'un corpus thèse, actuellement, présente ainsi de nombreuses limites. La plus bloquante concerne les niveaux de titre : il n'est pas possible de distinguer les titres de mêmes niveaux non numérotés (par exemple introduction ou conclusion), ni de créer des parties englobant les chapitres. Stylo ne gère pas non plus la création automatique d'indexes et de glossaire^[il est possible d'insérer du code LaTeX dans le Markdown, mais cette syntaxe est lourde. Le template ne prend pas en charge l'impression de ces deux appendices]. Les critères de présentation peuvent également varier d'une institution à une autre. L'aménagement des pages liminaires pourrait ne pas convenir selon la quantité d'informations que vous souhaitez y voir figurer. Enfin, il n'est pas possible d'inclure des annexes. 

Pour ces raisons, et même si les développement futur palieront certains de ces manques, nous vous déconseillons de compter sur un export PDF directement en sortie de Stylo pour votre rendu final. En revanche, Stylo génère un fichier `.tex` bien structuré et commenté, qui constitue une bonne base à personnaliser. N'hésitez pas à nous contacter : nous serons ravis de vous accompagner dans la prise en main de LaTeX afin de produire un PDF conforme à vos attentes.