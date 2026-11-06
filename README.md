# Stylo [![Coverage Status](https://coveralls.io/repos/github/EcrituresNumeriques/stylo/badge.svg?branch=master)](https://coveralls.io/github/EcrituresNumeriques/stylo?branch=master) [![Node `front` application](https://github.com/EcrituresNumeriques/stylo/actions/workflows/node-front.yml/badge.svg)](https://github.com/EcrituresNumeriques/stylo/actions/workflows/node-front.yml) [![Node `graphql` application](https://github.com/EcrituresNumeriques/stylo/actions/workflows/node-graphql.yml/badge.svg)](https://github.com/EcrituresNumeriques/stylo/actions/workflows/node-graphql.yml)

Stylo est un éditeur de textes pour articles scientifiques en sciences humaines et sociales.

L'environnement de travail de Stylo intègre une chaîne éditoriale complète basée sur [pandoc](http://pandoc.org/) et outillée des modules suivants :

- un éditeur de métadonnées
- un versionnage
- une gestion de la bibliographie
- différents formats exports : html5, xml (TEI, Erudit), pdf...
- l'annotation
- le partage de document

Stylo est disponible sur [stylo.huma-num.fr](https://stylo.huma-num.fr)

Plus d'informations sur [la documentation](http://stylo-doc.ecrituresnumeriques.ca/).

# Pré-requis

- Node.js v24+
- MongoDB 7

## Sous MacOS

```bash
brew tap mongodb/brew

brew install mongodb-community nvm
brew install --cask docker

nvm install v24 --default
```

# Développement local

L'application se lance en combinant une base de données MongoDB et deux applications Node.js (`front` et `graphql`), gérées comme des [workspaces npm](https://docs.npmjs.com/cli/using-npm/workspaces) depuis la racine du dépôt.

**La première fois que vous installez le projet**, lancez ces commandes à la racine du dépôt (les dépendances de tous les workspaces sont installées en une seule fois) :

```bash
cp stylo-example.env .env
npm clean-install
```

## Sans Docker

Avant un premier lancement, la variable `SE_GRAPHQL_TOKEN` doit être renseignée dans `.env` à l'aide de la valeur produite par cette commande :

```bash
npm run -w graphql generate-service-token --silent
```

Ensuite, ainsi que le reste du temps, démarrez MongoDB (par exemple sous macOS : `brew services start mongodb-community`) puis lancez :

```bash
npm run dev
```

## Avec Docker

Avant un premier lancement, la variable `SE_GRAPHQL_TOKEN` doit être renseignée dans `.env` à l'aide de la valeur produite par cette commande :

```bash
docker compose run -ti --build --rm graphql-stylo npm run generate-service-token --silent
```

Ensuite, ainsi que le reste du temps :

```bash
docker compose up mongodb-stylo export-stylo pandoc-api
npm run dev
```

L'[interface web de Stylo](./front) est alors disponible sur ([`localhost:3000`](http://localhost:3000)).<br>
L'[API GraphQL](./graphql) fonctionne sur [`localhost:3030`](http://localhost:3030/), le service d'export sur [`localhost:3080`](http://localhost:3080/) et l'API Pandoc sur [`localhost:3090`](http://localhost:3090/).

## Gérer les dépendances

Il n'y a qu'un seul fichier `package-lock.json`, à la racine du dépôt.
Pour ajouter ou mettre à jour une dépendance, lancez la commande depuis la racine en précisant le workspace concerné :

```bash
npm install <paquet> -w front
npm install <paquet> -w graphql
```

# Installation

Pour installer une instance Stylo en tant que service à disposition d'utilisateur·ices, veuillez suivre la documentation dédiée dans le fichier [`HOWTO.md`](HOWTO.md).

---

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FEcrituresNumeriques%2Fstylo.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FEcrituresNumeriques%2Fstylo?ref=badge_shield)

## License

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FEcrituresNumeriques%2Fstylo.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FEcrituresNumeriques%2Fstylo?ref=badge_large)
