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

### Métadonnées d’une page de documentation 

<details>
<summary>Pour une page</summary>

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

<details>
<summary>Pour une section (arborescence) au complet</summary>

Les métadonnées peuvent alors être définies à la racine du répertoire, dans un fichier JSON du même nom. Par exemple, pour définir une métadonnée par défaut pour tous les fichiers dans le dossier `src/`, on y créera un fichier `src.json`.

- `siteTitle`&nbsp;: titre principal
- `lang`&nbsp;: langue par défaut
- `description`&nbsp;: description sommaire pour les moteurs de recherche
- `rights`&nbsp;: droits et licence des contenus
- `sectionTitle`&nbsp;: titre principal (court!)
- `menu`&nbsp;: représentation en JSON des éléments qui apparaîtront dans le menu latéral (pour voir un exemple, regarder la source)

```json
{
  "layout": "docs",
  "useSideMenu": true,
  "version": "3.0.0",
  
  "siteTitle": "Titre principal",
  "lang": "fr|en|...",
  "description": "",
  "rights": "Certains droits réservés...",
  
  "sectionTitle": "Docs v3",

  "menu": [
    {
      "label": "Projet",
      "children": [
        {
          "label": "À propos",
          "url": "/fr/about"
        }
      ]
    }
  ]
}
```
</details>

### Rédaction

<details>
<summary>Intertitres</summary>

Bien séparer les sections du contenu avec des intertitres, en commençant par des intertitres de niveau 2 (`##` en markdown), puis de niveau 3 (`###`), etc.. Le titre de niveau 1 est réservé au titre du document, généré à partir de la métadonnée `title`.
</details>

<details>
<summary>&lt;alert-block&gt;</summary>

Ce bloc permet d’afficher graphiquement un message important, selon les besoins. Plusieurs `type`s sont possibles&nbsp;:

- (vide, par défaut)
- `neutral`
- `success`
- `warning`
- `danger`

```html
<alert-block>

  **Contenu** (avec style par défaut)

</alert-block>
```

```html
<alert-block
  type="success"
  heading="Hourra!"
>

  Vous avez réussi! <a href="/">Retourner à l’accueil</a>.

</alert-block>;
```
</details>

### Fichiers statiques (images, etc.)

Les fichiers statiques, tels que des images, peuvent être placés dans le dossier `uploads/` figurant à la racine de la documentation. Tous les fichiers de ce répertoire seront copiés tels quels et doivent être référencés avec un chemin absolu (avec une barre oblique `/` au début). Par exemple&nbsp;: `/uploads/images/<mon-fichier.ext>`.

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
