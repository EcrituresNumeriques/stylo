---
title: "Mémoires et thèses"
---

## Principe

Sur Stylo un mémoire ou une thèse est un type de **corpus** composé de **d'articles** Stylo. 

Pour créer un mémoire ou une thèse au travers de Stylo, il faut donc : 

- Écrire un article Stylo par partie
- Créer un corpus de type `Thèse`

![Corpus de type Thèse](uploads/images/refonte_doc/thesiscorpus.png)

- Rassembler tous les articles qui correspondent à vos parties dans ce corpus
- Les ordonner en les faisant glisser

![ordonner des articles dans un corpus](uploads/images/refonte_doc/classer.gif)

Chaque partie du mémoire ou de la thèse fonctionne donc comme « article » Stylo, c'est-à-dire que :

- Il possède ses propres métadonnées ;
- Il possède sa propre bibliographie ;
- Il peut être partagé en tant que tel (lien public d'annotation, partage pour de la collaboration, etc.) ;  
- C'est au moment de l'export du mémoire ou de la thèse que les différentes parties sont mises ensemble.

## Où remplir les métadonnées ? 

Les métadonnées concernant une partie du mémoire et de la thèse sont à renseigner au niveau de l'**article**. Il existe un formulaire spécial qui repose sur les mêmes clés de métadonnées YAML que l'article, mais il renomme et trie les champs de formulaire pour que pour avoir uniquement des champs pertinents visibles : il s'agit du formulaire « chapitre ». La seule métadonnée importante et la seule à remplir *a minima* est le titre (voir plus bas). 

![métadonnées de chapitre](uploads/images/refonte_doc/titlechap.png)

Les métadonnées globales concernant la thèse (auteur, date, etc.) doivent être renseignées au niveau du **corpus**. Du choix du type « Thèse » découle également un formulaire spécialisé avec des champs pertinents et dédiés à ce type de document.

![métadonnées de corpus](uploads/images/refonte_doc/corpusmetadata.gif)

N'oubliez pas d'*enregistrer* la modale des métadonnées avant de la fermer !

## Niveaux de titre

Comme il est d'usage sur Stylo, le titre de l'article est celui renseigné dans les métadonnées (à ne pas confondre avec le nom du document donné à sa création sur Stylo). Il est donc important de remplir le champ titre *a minima*. Ensuite on commence avec deux croisillons `##` pour la première sous-section à l'intérieur de la partie, puis davantage de croisillons pour des sous-sous-section. 

## Bibliographie

Par défaut la bibliographie générée est celle de l'ensemble des références citées ou présentes dans les différents articles qui composent le mémoire ou la thèse. Le module d'export se charge d'empiler les [fichiers BibTeX](src/fr/tutoriels/syntaxebibtex) de chaque article et de dédoublonner les références au besoin. Elles apparaîtront par ordre alphabétique sous le titre *Bibliographie* à la fin.

Il est également possible de diviser la bibliographie en plusieurs sections. Pour cela, il faut :

1. Pour chaque élément bibliographique en BibTeX, ajouter dans le champ _keyword_ une clef identifiant la section bibliographique. Elle doit être en un mot et sans tiret (par exemple `prim` pour les références primaires et `sec` pour les références secondaires). Cette étape peut être réalisée ou bien dans un gestionnaire de références bibliographiques comme Zotero (voir l'image ci-dessous), ou bien directement sur Stylo en modifiant le BibTeX brut.

![Tags dans Zotero](uploads/images/refonte_doc/zotero.png)

Ce qui donnera dans le BibTeX, en dernière ligne (_keyword_) : 

```bibtex
@article{wevers_visual_2020,
	title = {The visual digital turn: {Using} neural networks to study historical images},
	volume = {35},
	issn = {2055-7671},
	shorttitle = {The visual digital turn},
	url = {https://doi.org/10.1093/llc/fqy085},
	doi = {10.1093/llc/fqy085},
  ...
	keywords = {sec},
}
```

2. Créer un article dont le titre en métadonnée est « Bibliographie » et l'ajouter comme dernier chapitre du corpus.

3. Pour chaque sous-section, ajouter un titre de niveau 2 (`##`) suivi du snippet de code suivant : 

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

### Remerciements

Les remerciements peuvent être injectés directement dans les métadonnées en YAML brut, en attendant que la clef soit rajoutée dans le formulaire : 

```yaml
'@version': '1.0'
abstract: voici l'abstract
ackowledgements: |
  merci Jacques pour ...
  merci Jacqueline pour ...
```

## Exports 

### Version imprimée

L'export PDF du mémoire ou de la thèse se fait via le module d'export à ce lien : <https://export.stylo.huma-num.fr/>

Il utilise un template LaTeX satisfaisant les exigences de la plupart des départements de l'UdeM (nous vous invitons toutefois à bien vérifier cela). Le choix de la police *Old Standard* est peu conventionnel mais permet le traitement des carcatères en grecs ancien. 

Dans le module d'export dédié, voici la marche à suivre : 

1. Sélectionner l'option Thèses/Mémoires ;

2. Donner un titre à l'export et aller chercher l'identifiant du corpus sur la page des corpus (que l'on peut trouver dans le menu à trois points) ;

3. Sélectionner les options : 

- `avec table des matière` pour afficher cette dernière ;
- `avec toutes les citations` pour avoir tous les éléments de votre collection bibliographique dans la biblio finale, même les référence qui ne sont pas citées dans le corps du texte ;
- `avec citations liées` pour avoir un hyperlien créé sur chaque référence citée dans le texte, menant vers la référence bibliographique complet dans la Bibliographie.

### Export en HTML ou en fichiers originaux

L'export en HTML de l'ensemble de votre mémoire ou thèse se fait dans le gestionnaire de corpus sur Stylo. Il vous faut cliquer sur l'icône imprimante 🖨 et sélectionner « HTML » comme format. Cette opération créé une archive ZIP contenant un fichier HTML indépendant par article. 

Vous pouvez aussi faire la même opération avec l'option « fichiers originaux (md, yaml, bib) », qui crée une archive ZIP contenant, pour chaque article, les fichiers sources. Ces derniers peuvent alors être donnés comme fichiers sources (_input_) à un générateur de site statique (tel que Quarto, Jekyll, Hugo, ou encore [le Pressoir](https://ecrinum.gitpages.huma-num.fr/pressoir)), qui peut générer (en _output_) un site web pour votre mémoire ou votre thèse.

## Mise en perspective et avertissement

Stylo peut être un bon compagnon dans la rédaction d'un mémoire ou d'une thèse portée par une démarche d'affranchissement des environnements proprétaires. Le Markdown a l'avantage de la légèreté du balisage, ce qui permet d'écrire en évitant le bruit que peuvent présenter des syntaxes plus verbeuses comme le LaTeX ou le HTML. Stylo facilite également la collaboration avec vos relecteurs·ices et assure le formatage de la bibliographie à partir d'un style choisi. Enfin, ses nombreuses options d'export ouvrent la voie à une publication multiformat.

Cela dit, un mémoire ou une thèse est un document complexe dont les exigences de mise en forme dépassent ce que Stylo et le Markdown peuvent offrir pour la version imprimée finale. L'export PDF d'un corpus thèse, présente ainsi, actuellement, de nombreuses limites. La plus bloquante concerne les numérotations automatique des titres des parties : il n'est pas possible de faire distinguer les titres de mêmes niveaux entre ceux qui doivent être numérotés (chapitre 1, chapitre 2, ...) des autres qui ne devraient pas être numérotés (introduction, conclusion, ...). Pour parvenir à un rendu plus convenable sur ce plan-là, il faut modifier quelque peu le fichier `.tex` en sortie. Il n'est pas possible non plus de créer des parties englobant les « chapitres ». 

En outre, Stylo ne gère pas la création automatique d'indexes et de glossaires^[il est possible d'insérer du code LaTeX dans le Markdown, mais cette syntaxe est lourde. Le template ne prend pas en charge l'impression de ces deux appendices]. Pour ce qui est des critères de présentation, ils varient le plus souvent d'une institution à une autre : l'aménagement des pages liminaires pourrait ne pas convenir selon la quantité d'informations que vous souhaitez y voir figurer. Enfin, il n'est pas possible d'inclure des annexes. 

Pour ces raisons, et même si de potentiels développements futurs pallieront certains de ces manques, nous vous déconseillons de compter directement sur un export PDF en sortie de Stylo pour votre rendu final. En revanche, Stylo génère un fichier `.tex` bien structuré et commenté, qui constitue une bonne base à personnaliser. N'hésitez pas à nous contacter : nous serons ravis de vous accompagner dans la prise en main de LaTeX afin de produire un PDF conforme à vos attentes.
