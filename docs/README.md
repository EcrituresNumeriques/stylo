# Documentation de Stylo

Ce dépôt rassemble les pages de la documentation de l'éditeur de texte sémantique _Stylo_ : [https://stylo-doc.ecrituresnumeriques.ca](https://stylo-doc.ecrituresnumeriques.ca).

Pour accéder à _Stylo_ : [stylo.huma-num.fr](https://stylo.huma-num.fr)

Les pages de cette documentation sont générées avec [Eleventy](https://www.11ty.dev/), un générateur de site statique écrit en JavaScript.

## Pour contribuer à la documentation

Les contenus sont rédigés dans des fichiers markdown dans `src/`;
la documentation de chaque langue se trouve dans le sous-dossier respectif (`fr/`, `en/`).

```
├── _site/               # fichiers du site construit (auto-générés)
├── netlify.toml         # fichier de configuration Netlify
├── package.json         # spécifications du projet NodeJS
├── src/                 # toutes les sources
│   ├── _includes  # fichiers modèles (HTML, CSS, dispositions, composants ...)
│   ├── en/
│   ├── en_EN/     # redirection vers /en
│   ├── fr/
│   ├── fr_FR/     # redirection vers /fr
│   ├── index.html # redirection vers /fr (par défaut)
│   └── src.json   # les fichiers JSON contiennent les données d’un arbre
└── uploads/             # fichiers statiques, qui seront copiés tels quels dans la destination
```

<details>
<summary>Métadonnées d’une page de documentation</summary>

- `title` : le titre doit figurer dans les métadonnées (préambule `front-matter`)
- `date` : on voudra généralement afficher la date de dernière modification. Avec Eleventy, qui est en mesure de récupérer la date du dernier commit du fichier (ou de lire sa date de création), il s’agit d’utiliser la valeur `"Last Modified"`. Il est aussi possible d’insérer une date fixe manuellement, ex. `2023-05-01`.
- `isHome` : s’il s’agit de la page d’accueil, on ajoutera la propriété `isHome` avec la valeur booléenne `true`.
- `useSideMenu` : pour masquer la barre latérale sur la page, on peut insérer la valeur booléenne `false`.

Exemple :
```yaml
---
title: "Titre de la page"
date: Last Modified
---
```
</details>

## Pour contribuer au site (avec installation locale)

Prérequis :

* [NodeJS](https://nodejs.org/fr) (environnement de programmation JavaScript)
* `npm` ou [`pnpm`](https://pnpm.io/) (gestionnaire de dépendances pour NodeJS)
* Un terminal (interface en ligne de commande)

Installer les dépendances (listées dans le fichier `package.json`) :

```shell
npm install # (ou pnpm)
```

Pour lancer un serveur de développement en local à l’adresse http://localhost:8080 :

```shell
npm start
```

Pour construire le site dans le dossier `_site` :

```shell
npm build
```
