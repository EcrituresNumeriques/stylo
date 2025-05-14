---
title: "Mémoires et thèses"
---

Stylo permet de créer des documents plus complexes que de simples articles, tels que des mémoires ou des thèses ; cette fonctionnalité s'appelle **Corpus thèse**.

**Attention : cette option n'est pas encore pleinement fonctionnelle, nous vous recommandons de patienter jusqu'aux prochaines mises à jour avant de l'utiliser comme rendu final.**

## Principes de base

Un mémoire est constitué d'un ou plusieurs documents Stylo mis bout à bout.

- Ces documents peuvent être les chapitres ou les parties du mémoire.
- Ils sont rassemblés dans un mémoire à l'aide d'une même étiquette _[tag]_, qui doit être associée à chaque document Stylo.
- Chaque chapitre ou partie fonctionne donc comme un document Stylo :
  - il possède ses propres métadonnées et sa propre bibliographie.
  - il peut être partagé en tant que tel (annotation, preview, etc.). C'est au moment de l'export du mémoire que les différentes parties sont éditées ensemble.
- Les métadonnées du mémoire sont celles du premier document.

**Les documents à l'intérieur d'un mémoire sont classés par ordre alphabétique, la solution la plus simple pour maîtriser l'ordre est de placer un numéro au début du nom de chaque document concerné (notez que le nom du document ne doit pas être confondu avec le titre du document renseigné dans les métadonnées).**

## Quelques particularités

### Niveaux de titre

Votre mémoire ou thèse peut être structuré en parties et chapitres ou en chapitres seuls. Les titres de **partie** doivent être des **titres de niveau 1** (exemple: `# Première Partie : mon titre de partie`) et les titres de **chapitre** seront alors des **titres de niveau 2**. Dans le cas d'un mémoire structuré en chapitres seuls, les titres de **chapitre** seront des **titres de niveau 1** (exemple: `# mon titre de chapitre`)

Au moment de l'export, vous pourrez déclarer l'organisation de votre mémoire :

1. **En parties et chapitres**
2. **En chapitres seuls**

### Bibliographie

Par défaut la bibliographie générée est celle de l'ensemble des références citées ou présentes dans les différents articles qui composent le mémoire.

Mais il est également possible de structurer cette bibliographie : dans un mémoire ou une thèse, la bibliographie est souvent divisée en différentes sections. Stylo permet de créer une bibliographie organisée en sous-sections. Voici les deux étapes à suivre :

1. Dans les métadonnées du mémoire, il faut déclarer les différentes sections de la bibliographie. Pour cela, passez les métadonnées en mode YAML.

![YAML](/uploads/images/refonte_doc/YAML.png)

Puis à la fin, avant `---`, ajoutez les lignes suivantes :

```yaml
subbiblio:
  - key: pratique
    title: Pratique littéraire
  - key: theorie
    title: Théorie
```

La structure est la suivante :
- `key` est la « clé de section », autrement dit une étiquette qui sera utilisée à l'étape suivante.
- `title` sera votre titre de section de bibliographie, tel qu'il sera affiché dans le mémoire.

2. Pour chacune des références bibliographiques concernées, ajoutez dans le champ `keywords` la clé de section (par exemple `pratique` ou `theorie`). Cette étape peut être faite dans Zotero ou bien dans Stylo directement, en éditant le BibTeX.

### Métadonnées du mémoire

_Dans une prochaine version, l'interface « Thèses » proposera un éditeur de métadonnées pour les métadonnées du mémoire ou de la thèse._

Dans cette version de Stylo les métadonnées du mémoire seront celles du premier document déclaré. Les autres métadonnées seront ignorées. **Les sous-divisions de la bibliographie** doivent donc être déclarées dans le premier document du mémoire.

## Export

L'export du mémoire se fait à travers un template LaTeX dédié. Il correspond au template de mémoire et de thèse de l'Université de Montréal. Vous pouvez le faire via [cette page Stylo dédiée aux exports](https://export.stylo.huma-num.fr/).

D'autres templates (modèles) seront disponibles à l'avenir.

Plusieurs options sont disponibles :

1. Format du document exporté
2. Style bibliographique
3. Table des matières
4. Numérotation (ou non) des sections et chapitres
5. Structure du mémoire : en parties et chapitres, ou en chapitres seuls

Pour personnaliser l'export en PDF, il est possible d'insérer du code LaTeX dans les contenus Markdown (hors métadonnées).
