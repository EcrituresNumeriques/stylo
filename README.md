# Stylo

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

- Node.js v18+
- MongoDB
- (optionnel) Pandoc, pour le [service d'export](./export)

## Sous MacOS

```bash
brew tap mongodb/brew

brew install pandoc mongodb-community nvm
brew install --cask docker

nvm install v18 --default
```

# Développement local

L'application se lance en combinant une base de données MongoDB, et des applications Node.js (v18+).

**La première fois que vous installez le projet**, lancez ces commandes :

```bash
cp stylo-example.env stylo.env
npm clean-install
npm --prefix front clean-install
npm --prefix export clean-install
npm --prefix graphql clean-install
```

## Avec Docker

Ensuite, ainsi que le reste du temps :

```bash
docker-compose run --detach --publish='127.0.0.1:27017:27017' mongodb-stylo
npm run dev
```

## Sans Docker

Ensuite, ainsi que le reste du temps :

```bash
mongod --config /usr/local/etc/mongod.conf --fork
npm run dev
```

L'[interface web de Stylo](./front) est alors disponible sur ([`localhost:3000`](http://localhost:3000)).<br>
L'[API](./graphql) fonctionne sur [`localhost:3030`](http://localhost:3030/) et le [service d'export](./export) sur [`localhost:3060`](http://localhost:3060/).

# Installation

Pour installer une instance Stylo en tant que service à disposition d'utilisateur·ices, veuillez suivre la documentation dédiée dans le fichier [`HOWTO.md`](HOWTO.md).

---

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
