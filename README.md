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

- Node.js v14+
- MongoDB
- (optionnel) Pandoc, pour le [service d'export](./export)

# Installation

Pour installer une instance Stylo, suivre la documentation [HOWTO.md](https://github.com/EcrituresNumeriques/stylo/blob/master/HOWTO.md).

# Développement local

L'application se lance en combinant une base de données MongoDB, et des applications Node.js (v14+). Elles s'**installent** ainsi :

```bash
docker-compose pull mongodb-stylo
cp stylo-example.env stylo.env
npm clean-install
```

Puis se **lancent** avec les commandes suivantes :

```bash
docker-compose run --detach --publish='127.0.0.1:27017:27017' mongodb-stylo
sleep 5
npm start
```

L'[application web](./front) tourne sur [`localhost:3000`](http://localhost:3000), l'[API](./graphql) fonctionne sur [`localhost:3030`](http://localhost:3030/) et le [service d'export](./export) sur [`localhost:3060`](http://localhost:3060/).

---

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
