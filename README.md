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

- Node.js v16+
- MongoDB
- (optionnel) Pandoc, pour le [service d'export](./export)

## Sous MacOS

```bash
brew tap mongodb/brew

brew install pandoc mongodb-community nvm
brew install --cask docker

nvm install v16 --default
```

# Développement local

L'application se lance en combinant une base de données MongoDB, et des applications Node.js (v16+).

**La première fois que vous installez le projet**, lancez ces commandes :

```bash
cp stylo-example.env stylo.env
npm clean-install
```

## Avec Docker

Ensuite, ainsi que le reste du temps :

```bash
docker-compose run --detach --publish='127.0.0.1:27017:27017' mongodb-stylo
npm start
```

## Sans Docker

Ensuite, ainsi que le reste du temps :

```bash
mongod --config /usr/local/etc/mongod.conf --fork
npm start
```

L'[interface web de Stylo](./front) s'ouvre automatiquement dans votre navigateur web au bout de quelques secondes[^1] ([`localhost:3000`](http://localhost:3000)).<br>
L'[API](./graphql) fonctionne sur [`localhost:3030`](http://localhost:3030/) et le [service d'export](./export) sur [`localhost:3060`](http://localhost:3060/).

# Installation

Pour installer une instance Stylo en tant que service à disposition d'utilisateur·ices, veuillez suivre la documentation dédiée dans le fichier [`HOWTO.md`](HOWTO.md).

---

[^1]: ou quelques minutes lors du premier lancement, selon votre bande-bassante.
[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
